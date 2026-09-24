const crypto = require("node:crypto");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue, FieldPath } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const {
  HttpsError,
  onCall,
  onRequest,
} = require("firebase-functions/v2/https");

initializeApp();

const db = getFirestore();
const REGION = "asia-south1";
const CURRENCY = "INR";
const NEET_PROMO_END_MS = Date.parse("2026-10-05T18:29:59.999Z");
const COURSES = {
  class10: { name: "Class 10 SSC Complete Course 2027", price: 99, validityCode: "CLASS10_BOARD_2027", validityLabel: "Until the 2027 Class 10 board examinations conclude" },
  class11: { name: "Class 11 Board Booster 2027", price: 149, validityCode: "CLASS11_EXAM_2027", validityLabel: "Until the 2027 Class 11 annual examinations conclude" },
  class12: { name: "Class 12 Board Booster 2027", price: 149, validityCode: "CLASS12_BOARD_2027", validityLabel: "Until the 2027 Class 12 board examinations conclude" },
  neet: { name: "NEET-UG Target Course", price: 499 },
};
const RAZORPAY_KEY_ID = defineSecret("RAZORPAY_KEY_ID");
const RAZORPAY_KEY_SECRET = defineSecret("RAZORPAY_KEY_SECRET");
const RAZORPAY_WEBHOOK_SECRET = defineSecret("RAZORPAY_WEBHOOK_SECRET");

function coursePrice(courseId, now = Date.now()) {
  if (!COURSES[courseId]) return null;
  return courseId === "neet" && now <= NEET_PROMO_END_MS ? 99 : COURSES[courseId].price;
}

function courseValidity(courseId, neetExamYear) {
  if (courseId === "neet") {
    if (!["2027", "2028"].includes(String(neetExamYear))) return null;
    return { code: `NEET_${neetExamYear}`, label: `Until the NEET-UG ${neetExamYear} examination` };
  }
  const course = COURSES[courseId];
  return course ? { code: course.validityCode, label: course.validityLabel } : null;
}

function paymentRequestId(uid, courseId) {
  return `${uid}_${courseId}`;
}

function secureEqual(actual, expected) {
  const a = Buffer.from(actual || "", "utf8");
  const b = Buffer.from(expected || "", "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function hmacHex(secret, payload) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function paymentSignature(orderId, paymentId) {
  return hmacHex(RAZORPAY_KEY_SECRET.value(), `${orderId}|${paymentId}`);
}

async function razorpayRequest(path, options = {}) {
  const auth = Buffer.from(
    `${RAZORPAY_KEY_ID.value()}:${RAZORPAY_KEY_SECRET.value()}`,
  ).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Razorpay request failed", response.status, body.error?.code);
    throw new HttpsError(
      "internal",
      "The payment service is temporarily unavailable.",
    );
  }
  return body;
}

async function activateStudent({ uid, orderId, paymentId, source }) {
  const linkedRequest = await findPaymentRequestForOrder(orderId);
  if (!linkedRequest || linkedRequest.data().uid !== uid) {
    throw new HttpsError("failed-precondition", "This payment order is not linked to this student account.");
  }
  const requestRef = linkedRequest.ref;
  const studentRef = db.doc(`students/${uid}`);

  await db.runTransaction(async (transaction) => {
    const paymentRequest = await transaction.get(requestRef);
    if (!paymentRequest.exists || paymentRequest.data().orderId !== orderId) {
      throw new HttpsError(
        "failed-precondition",
        "This payment order is not linked to this student account.",
      );
    }
    if (paymentRequest.data().status === "paid") return;

    const requestData = paymentRequest.data();
    const courseId = requestData.courseId;
    const validity = courseValidity(courseId, requestData.neetExamYear);
    if (!COURSES[courseId] || !validity) {
      throw new HttpsError("failed-precondition", "The purchased course details are invalid.");
    }
    if (courseId === "neet" && requestData.amount === 99 && Date.now() > NEET_PROMO_END_MS) {
      throw new HttpsError("failed-precondition", "The NEET introductory offer has ended. Create a new ₹499 order.");
    }

    transaction.update(
      studentRef,
      "accessStatus", "active",
      "accessPrice", requestData.amount,
      "paymentStatus", "verified",
      "purchasedCourse", courseId,
      "activeCourse", courseId,
      "enrolledCourses", FieldValue.arrayUnion(courseId),
      "payment", {
          provider: "razorpay",
          orderId,
          paymentId,
          amount: requestData.amount,
          courseId,
          verifiedAt: FieldValue.serverTimestamp(),
          verificationSource: source,
        },
      new FieldPath("courseEntitlements", courseId), {
        status: "active",
        courseId,
        courseName: COURSES[courseId].name,
        neetExamYear: requestData.neetExamYear || null,
        validityCode: validity.code,
        validityLabel: validity.label,
        pricePaid: requestData.amount,
        activatedAt: FieldValue.serverTimestamp(),
      },
      "paidAt", FieldValue.serverTimestamp(),
      "updatedAt", FieldValue.serverTimestamp(),
    );

    transaction.set(
      requestRef,
      {
        status: "paid",
        paymentId,
        verifiedAt: FieldValue.serverTimestamp(),
        verificationSource: source,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });
}

async function findPaymentRequestForOrder(orderId) {
  const snap = await db
    .collection("paymentRequests")
    .where("orderId", "==", orderId)
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0];
}

exports.createRazorpayOrder = onCall(
  {
    region: REGION,
    secrets: [RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET],
    enforceAppCheck: false,
  },
  async (request) => {
    if (!request.auth)
      throw new HttpsError("unauthenticated", "Sign in before paying.");
    if (request.auth.token.email_verified !== true) {
      throw new HttpsError(
        "failed-precondition",
        "Verify your email address before starting payment.",
      );
    }

    const uid = request.auth.uid;
    const studentRef = db.doc(`students/${uid}`);
    const student = await studentRef.get();

    if (!student.exists)
      throw new HttpsError("failed-precondition", "Student profile not found.");
    const profile = student.data();
    const requestedCourse = request.data?.courseId;
    const courseId = COURSES[requestedCourse] ? requestedCourse : profile.requestedCourse || profile.activeCourse;
    const course = COURSES[courseId];
    const neetExamYear = courseId === "neet" ? String(request.data?.neetExamYear || profile.neetExamYear || "") : null;
    const validity = courseValidity(courseId, neetExamYear);
    const priceRupees = coursePrice(courseId);
    if (!course || !validity || !priceRupees) {
      throw new HttpsError("failed-precondition", "Choose a valid course and examination year before paying.");
    }
    const legacyOwnedCourse = profile.purchasedCourse || profile.requestedCourse || profile.activeCourse;
    if (profile.courseEntitlements?.[courseId]?.status === "active" || (profile.accessStatus === "active" && legacyOwnedCourse === courseId)) {
      return { active: true, courseId };
    }
    const pricePaise = priceRupees * 100;
    const requestRef = db.doc(`paymentRequests/${paymentRequestId(uid, courseId)}`);
    const existingRequest = await requestRef.get();

    if (existingRequest.exists) {
      const existing = existingRequest.data();
      if (existing.status === "paid") {
        return { active: true };
      }
      if (
        typeof existing.orderId === "string" &&
        existing.orderId.startsWith("order_") &&
        existing.courseId === courseId &&
        existing.neetExamYear === neetExamYear &&
        existing.amountPaise === pricePaise &&
        existing.currency === CURRENCY
      ) {
        return {
          keyId: RAZORPAY_KEY_ID.value(),
          orderId: existing.orderId,
          amount: pricePaise,
          currency: CURRENCY,
          courseId,
          courseName: course.name,
        };
      }
    }

    const order = await razorpayRequest("/orders", {
      method: "POST",
      body: JSON.stringify({
        amount: pricePaise,
        currency: CURRENCY,
        receipt: `sa_${uid.slice(0, 12)}_${Date.now()}`,
        notes: { firebase_uid: uid, course_id: courseId, exam_year: neetExamYear || "board" },
      }),
    });

    await Promise.all([
      requestRef.set({
        uid,
        provider: "razorpay",
        orderId: order.id,
        courseId,
        courseName: course.name,
        neetExamYear,
        validityCode: validity.code,
        amount: priceRupees,
        amountPaise: pricePaise,
        currency: CURRENCY,
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }),
      studentRef.set(
        {
          paymentStatus: "created",
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      ),
    ]);

    return {
      keyId: RAZORPAY_KEY_ID.value(),
      orderId: order.id,
      amount: pricePaise,
      currency: CURRENCY,
      courseId,
      courseName: course.name,
    };
  },
);

exports.verifyRazorpayPayment = onCall(
  {
    region: REGION,
    secrets: [RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET],
    enforceAppCheck: false,
  },
  async (request) => {
    if (!request.auth)
      throw new HttpsError(
        "unauthenticated",
        "Sign in before verifying payment.",
      );
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = request.data || {};
    if (
      ![orderId, paymentId, signature].every(
        (value) => typeof value === "string" && value,
      )
    ) {
      throw new HttpsError(
        "invalid-argument",
        "Payment verification details are incomplete.",
      );
    }

    if (!secureEqual(signature, paymentSignature(orderId, paymentId))) {
      throw new HttpsError(
        "permission-denied",
        "The payment signature is invalid.",
      );
    }

    const paymentRequest = await findPaymentRequestForOrder(orderId);
    if (!paymentRequest || paymentRequest.data().uid !== request.auth.uid) {
      throw new HttpsError("failed-precondition", "This order is not linked to your student account.");
    }
    const expectedAmount = paymentRequest.data().amountPaise;
    const payment = await razorpayRequest(
      `/payments/${encodeURIComponent(paymentId)}`,
    );
    if (
      payment.order_id !== orderId ||
      payment.amount !== expectedAmount ||
      payment.currency !== CURRENCY ||
      payment.status !== "captured"
    ) {
      throw new HttpsError(
        "failed-precondition",
        "The payment has not been captured yet.",
      );
    }

    await activateStudent({
      uid: request.auth.uid,
      orderId,
      paymentId,
      source: "checkout",
    });
    return { active: true };
  },
);

exports.syncRazorpayPayment = onCall(
  {
    region: REGION,
    secrets: [RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET],
    enforceAppCheck: false,
  },
  async (request) => {
    if (!request.auth)
      throw new HttpsError(
        "unauthenticated",
        "Sign in before checking payment.",
      );

    const uid = request.auth.uid;
    const courseId = request.data?.courseId;
    if (!COURSES[courseId]) throw new HttpsError("invalid-argument", "Choose a valid course.");
    const paymentRequest = await db.doc(`paymentRequests/${paymentRequestId(uid, courseId)}`).get();
    if (!paymentRequest.exists) return { active: false };
    if (paymentRequest.data().status === "paid") return { active: true };

    const orderId = paymentRequest.data().orderId;
    if (typeof orderId !== "string" || !orderId.startsWith("order_"))
      return { active: false };

    const expectedAmount = paymentRequest.data().amountPaise;
    const payments = await razorpayRequest(
      `/orders/${encodeURIComponent(orderId)}/payments`,
    );
    const capturedPayment = payments.items?.find(
      (payment) =>
        payment.order_id === orderId &&
        payment.amount === expectedAmount &&
        payment.currency === CURRENCY &&
        payment.status === "captured",
    );
    if (!capturedPayment) return { active: false };

    await activateStudent({
      uid,
      orderId,
      paymentId: capturedPayment.id,
      source: "reconciliation",
    });
    return { active: true };
  },
);

exports.razorpayWebhook = onRequest(
  {
    region: REGION,
    secrets: [RAZORPAY_WEBHOOK_SECRET],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const signature = req.get("x-razorpay-signature") || "";
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
    const expected = hmacHex(RAZORPAY_WEBHOOK_SECRET.value(), rawBody);
    if (!secureEqual(signature, expected)) {
      res.status(401).send("Invalid signature");
      return;
    }

    try {
      const event = req.body?.event;
      const payment = req.body?.payload?.payment?.entity;
      if (event === "payment.captured" && payment && payment.currency === CURRENCY && typeof payment.order_id === "string") {
        const linked = await findPaymentRequestForOrder(payment.order_id);
        if (linked) {
          const uid = linked.data().uid;
          if (linked.data().amountPaise === payment.amount) {
            await activateStudent({ uid, orderId: payment.order_id, paymentId: payment.id, source: "webhook" });
          }
        }
      }
      res.status(200).send("ok");
    } catch (error) {
      console.error("Razorpay webhook processing failed", error);
      res.status(500).send("Webhook processing failed");
    }
  },
);
