const crypto = require("node:crypto");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const { HttpsError, onCall, onRequest } = require("firebase-functions/v2/https");

const db = getFirestore();
const REGION = "asia-south1";
const CURRENCY = "INR";
const MINIMUM_ORDER_PAISE = 100;
const EXPECTED_DPP_COUNT = 171;
const EXPECTED_TEST_COUNT = 34;
const COMBINED_DISCOUNT_PERCENT = 10;
const COMBINED_DISCOUNT_CAP_PAISE = 10000;
const RAZORPAY_KEY_ID = defineSecret("RAZORPAY_KEY_ID");
const RAZORPAY_KEY_SECRET = defineSecret("RAZORPAY_KEY_SECRET");
const RAZORPAY_WEBHOOK_SECRET = defineSecret("RAZORPAY_WEBHOOK_SECRET");

function secureEqual(actual, expected) {
  const a = Buffer.from(actual || "", "utf8");
  const b = Buffer.from(expected || "", "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function hmacHex(secret, value) { return crypto.createHmac("sha256", secret).update(value).digest("hex"); }
function entitlementId(uid, resourceId) { return `${uid}_${resourceId}`; }
function assertAuthenticated(request) { if (!request.auth) throw new HttpsError("unauthenticated", "Sign in to continue."); }
function validClientRequestId(value) { return typeof value === "string" && /^[A-Za-z0-9_-]{10,80}$/.test(value); }

async function razorpayRequest(path, options = {}) {
  const authorization = Buffer.from(`${RAZORPAY_KEY_ID.value()}:${RAZORPAY_KEY_SECRET.value()}`).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1${path}`, { ...options, headers: { Authorization: `Basic ${authorization}`, "Content-Type": "application/json", ...(options.headers || {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new HttpsError("failed-precondition", body?.error?.description || "Payment gateway request failed.");
  return body;
}

function calculateOrder(resources, combinedBundleEligible = false) {
  const dpps = resources.filter((item) => item.kind === "dpp");
  const other = resources.filter((item) => item.kind !== "dpp");
  const dppSubtotalPaise = dpps.reduce((sum, item) => sum + item.pricePaise, 0);
  const nonDppSubtotalPaise = other.reduce((sum, item) => sum + item.pricePaise, 0);
  const subtotalPaise = dppSubtotalPaise + nonDppSubtotalPaise;
  const discountPercentage = combinedBundleEligible ? COMBINED_DISCOUNT_PERCENT : 0;
  const discountPaise = combinedBundleEligible ? Math.min(Math.floor((subtotalPaise * discountPercentage + 50) / 100), COMBINED_DISCOUNT_CAP_PAISE) : 0;
  return { subtotalPaise, dppSubtotalPaise, nonDppSubtotalPaise, dppCount: dpps.length, testCount: other.length, discountPercentage, discountPaise, combinedBundleDiscountApplied: combinedBundleEligible, totalPaise: subtotalPaise - discountPaise };
}

async function requireClass10(uid) {
  const snap = await db.doc(`students/${uid}`).get();
  if (!snap.exists) throw new HttpsError("failed-precondition", "Student profile not found.");
  const profile = snap.data();
  const entitled = profile.courseEntitlements?.class10?.status === "active" || (profile.accessStatus === "active" && [profile.purchasedCourse, profile.requestedCourse, profile.activeCourse].includes("class10"));
  if (!entitled) throw new HttpsError("permission-denied", "An active Class 10 course is required.");
  return profile;
}

async function validatedResources(uid, resourceIds) {
  if (!Array.isArray(resourceIds) || resourceIds.length < 1 || resourceIds.length > 250) throw new HttpsError("invalid-argument", "Choose between 1 and 250 resources.");
  const unique = [...new Set(resourceIds.map(String))];
  if (unique.length !== resourceIds.length || unique.some((id) => !/^SA-(DPP|M600)-[A-Z0-9-]+$/.test(id))) throw new HttpsError("invalid-argument", "Resource selection is invalid.");
  const refs = unique.map((id) => db.doc(`${id.startsWith("SA-DPP-") ? "mission600DPPs" : "mission600Tests"}/${id}`));
  const entitlementRefs = unique.map((id) => db.doc(`mission600Entitlements/${entitlementId(uid, id)}`));
  const [resourceSnaps, entitlementSnaps] = await Promise.all([db.getAll(...refs), db.getAll(...entitlementRefs)]);
  const alreadyOwned = new Set(entitlementSnaps.filter((snap) => snap.exists && snap.data().status === "active").map((snap) => snap.data().resourceId));
  const resources = resourceSnaps.filter((snap) => snap.exists).map((snap) => ({ ...snap.data(), id: snap.id, kind: snap.id.startsWith("SA-DPP-") ? "dpp" : "test" })).filter((item) => !alreadyOwned.has(item.id));
  if (resources.length !== unique.filter((id) => !alreadyOwned.has(id)).length) throw new HttpsError("failed-precondition", "One or more resources are unavailable.");
  if (resources.some((item) => item.status !== "published" || item.contentComplete !== true || item.purchaseEnabled !== true || !Number.isInteger(item.pricePaise))) throw new HttpsError("failed-precondition", "One or more resources are not ready for purchase.");
  return { resources, alreadyOwned: [...alreadyOwned] };
}

async function qualifiesForCompleteCombination(uid, resources) {
  const [dppSnapshot, testSnapshot, entitlementSnapshot] = await Promise.all([
    db.collection("mission600DPPs").get(),
    db.collection("mission600Tests").get(),
    db.collection("mission600Entitlements").where("uid", "==", uid).get(),
  ]);
  if (dppSnapshot.size !== EXPECTED_DPP_COUNT || testSnapshot.size !== EXPECTED_TEST_COUNT) return false;
  const ready = (snapshot) => snapshot.docs.every((doc) => {
    const item = doc.data();
    return item.status === "published" && item.contentComplete === true && item.purchaseEnabled === true && Number.isInteger(item.pricePaise);
  });
  if (!ready(dppSnapshot) || !ready(testSnapshot)) return false;
  const owned = new Set(entitlementSnapshot.docs.filter((doc) => doc.data().status === "active").map((doc) => doc.data().resourceId));
  const selected = new Set(resources.map((item) => item.id));
  return [...dppSnapshot.docs, ...testSnapshot.docs].every((doc) => owned.has(doc.id) || selected.has(doc.id));
}

async function fulfillOrder(orderId, paymentId, source) {
  const orderRef = db.doc(`mission600CartOrders/${orderId}`);
  await db.runTransaction(async (transaction) => {
    const orderSnap = await transaction.get(orderRef);
    if (!orderSnap.exists) throw new HttpsError("not-found", "Mission 600 order was not found.");
    const order = orderSnap.data();
    if (order.status === "paid") return;
    if (order.status !== "pending") throw new HttpsError("failed-precondition", "This order cannot be fulfilled.");
    for (const resource of order.resources) {
      const id = entitlementId(order.uid, resource.id);
      transaction.set(db.doc(`mission600Entitlements/${id}`), { uid: order.uid, resourceId: resource.id, kind: resource.kind, status: "active", orderId, paymentId, grantedAt: FieldValue.serverTimestamp() }, { merge: false });
    }
    transaction.set(db.doc(`mission600Purchases/${orderId}`), { uid: order.uid, orderId, paymentId, resources: order.resources, pricing: order.pricing, currency: CURRENCY, status: "paid", verificationSource: source, paidAt: FieldValue.serverTimestamp() });
    transaction.update(orderRef, { status: "paid", paymentId, verificationSource: source, paidAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() });
  });
}

exports.createMission600Order = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  assertAuthenticated(request);
  await requireClass10(request.auth.uid);
  throw new HttpsError("failed-precondition", "Mission 600 checkout is disabled. Published Mission 600 resources are included with active Class 10 batch access.");
});

exports.verifyMission600Payment = onCall({ region: REGION, secrets: [RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET], enforceAppCheck: true }, async (request) => {
  assertAuthenticated(request);
  const { orderId, razorpay_order_id: gatewayOrderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = request.data || {};
  if (![orderId, gatewayOrderId, paymentId, signature].every((value) => typeof value === "string" && value)) throw new HttpsError("invalid-argument", "Payment verification data is incomplete.");
  const orderSnap = await db.doc(`mission600CartOrders/${orderId}`).get();
  if (!orderSnap.exists || orderSnap.data().uid !== request.auth.uid || orderSnap.data().razorpayOrderId !== gatewayOrderId) throw new HttpsError("failed-precondition", "This order is not linked to your account.");
  const expectedSignature = hmacHex(RAZORPAY_KEY_SECRET.value(), `${gatewayOrderId}|${paymentId}`);
  if (!secureEqual(signature, expectedSignature)) throw new HttpsError("permission-denied", "Payment signature is invalid.");
  const payment = await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`);
  if (payment.order_id !== gatewayOrderId || payment.amount !== orderSnap.data().pricing.totalPaise || payment.currency !== CURRENCY || payment.status !== "captured") throw new HttpsError("failed-precondition", "The expected payment has not been captured.");
  await fulfillOrder(orderId, paymentId, "checkout");
  return { active: true, orderId, resourceIds: orderSnap.data().resourceIds };
});

exports.mission600RazorpayWebhook = onRequest({ region: REGION, secrets: [RAZORPAY_WEBHOOK_SECRET] }, async (request, response) => {
  if (request.method !== "POST") { response.status(405).send("Method Not Allowed"); return; }
  const signature = request.get("x-razorpay-signature") || "";
  const rawBody = request.rawBody || Buffer.from(JSON.stringify(request.body || {}));
  if (!secureEqual(signature, hmacHex(RAZORPAY_WEBHOOK_SECRET.value(), rawBody))) { response.status(401).send("Invalid signature"); return; }
  try {
    const payment = request.body?.payload?.payment?.entity;
    if (request.body?.event === "payment.captured" && payment?.order_id && payment.currency === CURRENCY) {
      const query = await db.collection("mission600CartOrders").where("razorpayOrderId", "==", payment.order_id).limit(1).get();
      if (!query.empty) {
        const doc = query.docs[0], order = doc.data();
        if (order.pricing.totalPaise === payment.amount) await fulfillOrder(doc.id, payment.id, "webhook");
      }
    }
    response.status(200).send("ok");
  } catch (error) { console.error("Mission 600 webhook failed", error); response.status(500).send("Webhook processing failed"); }
});

exports._test = { calculateOrder, entitlementId, MINIMUM_ORDER_PAISE };

