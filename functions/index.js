const crypto = require("node:crypto");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { defineSecret } = require("firebase-functions/params");
const { HttpsError, onCall, onRequest } = require("firebase-functions/v2/https");

initializeApp();

const db = getFirestore();
const REGION = "asia-south1";
const CURRENCY = "INR";
const SENDER_EMAIL = "scrutinyacademy@gmail.com";
const FOUNDER_EMAIL_SIGNATURE = "Parmod Sharma\nFounder, Scrutiny Academy";
const RAZORPAY_KEY_ID = defineSecret("RAZORPAY_KEY_ID");
const RAZORPAY_KEY_SECRET = defineSecret("RAZORPAY_KEY_SECRET");
const RAZORPAY_WEBHOOK_SECRET = defineSecret("RAZORPAY_WEBHOOK_SECRET");
const GMAIL_APP_PASSWORD = defineSecret("GMAIL_APP_PASSWORD");

const COURSE_CATALOG = Object.freeze({
  class10: { name: "Class 10 SSC", price: 99, features: ["Chapter-wise lectures", "Comprehensive notes", "Revision sheets", "Flashcards", "Chapter-wise MCQs"] },
  class11: { name: "Class 11", price: 149, features: ["Revision sheets", "VSAQ question banks", "SAQ question banks", "LAQ question banks"] },
  class12: { name: "Class 12", price: 149, features: ["Revision sheets", "VSAQ question banks", "SAQ question banks", "LAQ question banks"] },
  neet: { name: "NEET UG", price: 99, features: ["NCERT-focused Physics, Chemistry and Biology MCQs", "Previous-year questions", "NCERT search and revision tools", "Tests, progress tracking and mistake notebook"] },
});

function courseFor(courseId) {
  const course = COURSE_CATALOG[courseId];
  if (!course) throw new HttpsError("invalid-argument", "Choose a valid Scrutiny Academy course.");
  return { id: courseId, ...course, amountPaise: course.price * 100 };
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

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function invoiceNumber(paymentId) {
  return `SA-${new Date().getUTCFullYear()}-${String(paymentId).replace(/[^a-z0-9]/gi, "").slice(-12).toUpperCase()}`;
}

function purchasePayload(invoice) {
  return {
    invoiceId: invoice.invoiceId,
    invoiceNumber: invoice.invoiceNumber,
    studentName: invoice.studentName,
    courseId: invoice.courseId,
    courseName: invoice.courseName,
    features: invoice.features,
    amount: invoice.amount,
    currency: invoice.currency,
    paymentId: invoice.paymentId,
    paymentStatus: "Successful",
  };
}

async function razorpayRequest(path, options = {}) {
  const auth = Buffer.from(`${RAZORPAY_KEY_ID.value()}:${RAZORPAY_KEY_SECRET.value()}`).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...options,
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Razorpay request failed", response.status, body.error?.code);
    throw new HttpsError("internal", "The payment service is temporarily unavailable.");
  }
  return body;
}

function createInvoicePdf(invoice) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48, info: { Title: `Invoice ${invoice.invoiceNumber}`, Author: "Scrutiny Academy" } });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.fillColor("#102a56").fontSize(22).font("Helvetica-Bold").text("SCRUTINY ACADEMY");
    doc.fontSize(10).font("Helvetica").fillColor("#526176").text("Your success is our mission.");
    doc.moveDown(2).fillColor("#111827").fontSize(20).font("Helvetica-Bold").text("PAYMENT INVOICE");
    doc.moveDown().fontSize(10).font("Helvetica");
    const rows = [
      ["Invoice number", invoice.invoiceNumber],
      ["Student", invoice.studentName],
      ["Registered email", invoice.studentEmail],
      ["Course", invoice.courseName],
      ["Amount paid", `INR ${invoice.amount}`],
      ["Payment ID", invoice.paymentId],
      ["Order ID", invoice.orderId],
      ["Payment status", "Successful"],
      ["Payment date", invoice.paymentDate],
    ];
    rows.forEach(([label, value], index) => {
      const y = doc.y;
      if (index % 2 === 0) doc.rect(48, y - 5, 499, 24).fill("#f4f7fb").fillColor("#111827");
      doc.font("Helvetica-Bold").text(label, 58, y, { width: 145 });
      doc.font("Helvetica").text(String(value), 210, y, { width: 325 });
      doc.y = y + 24;
    });
    doc.moveDown(2).font("Helvetica-Bold").fillColor("#102a56").text("Course access confirmed");
    doc.font("Helvetica").fillColor("#111827").text(`Only the purchased ${invoice.courseName} course has been unlocked for this account.`);
    doc.moveDown(3).font("Helvetica-Bold").text("From the Founder of Scrutiny Academy");
    doc.font("Helvetica").text(FOUNDER_EMAIL_SIGNATURE);
    doc.moveDown(2).fontSize(9).fillColor("#6b7280").text(`Support: ${SENDER_EMAIL}`);
    doc.end();
  });
}

function emailShell(title, content) {
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#172033"><div style="max-width:680px;margin:0 auto;padding:26px 14px"><div style="background:#102a56;color:white;padding:22px;border-radius:16px 16px 0 0"><div style="font-size:21px;font-weight:800">SCRUTINY ACADEMY</div><div style="font-size:12px;opacity:.8">YOUR SUCCESS IS OUR MISSION</div></div><div style="background:white;padding:28px;border-radius:0 0 16px 16px"><h1 style="font-size:24px;color:#102a56;margin-top:0">${title}</h1>${content}<div style="margin-top:28px;padding-top:18px;border-top:1px solid #dbe3ef"><strong>From the Founder of Scrutiny Academy</strong><br>${escapeHtml(FOUNDER_EMAIL_SIGNATURE).replace(/\n/g, "<br>")}</div></div></div></body></html>`;
}

function confirmationEmail(invoice) {
  const features = invoice.features.map((item) => `<li style="margin:7px 0">${escapeHtml(item)}</li>`).join("");
  return emailShell("Thank You for Joining Scrutiny Academy! 🎓❤️", `
    <p><strong>Payment Successful</strong></p><h2>Welcome to the Scrutiny Family! 🎉</h2>
    <p>Dear ${escapeHtml(invoice.studentName)},</p>
    <p>Thank you for trusting Scrutiny Academy and choosing us to be part of your learning journey.</p>
    <p>Your decision to invest in your education is something we truly value. Whether you’re preparing for your board examinations, NEET UG or strengthening your concepts, we’re here to help you learn with confidence.</p>
    <p>At Scrutiny Academy, our mission is simple: quality education should be accessible, affordable and effective for every student.</p>
    <p>Your course is now unlocked. Explore your study materials, practise regularly and make every day count.</p>
    <p>Remember, your dreams are important to us, and we’re excited to be part of your journey towards achieving them.</p>
    <p><strong>Keep learning. Keep improving. Keep believing in yourself.</strong></p>
    <div style="margin:24px 0;padding:20px;background:#f4f7fb;border-left:4px solid #138a4b;border-radius:10px"><div style="font-size:12px;font-weight:800;color:#138a4b">ENROLLMENT CONFIRMED</div><h2>Congratulations! Your ${escapeHtml(invoice.courseName)} course is unlocked.</h2><p>Here’s everything included in your course:</p><ul>${features}</ul><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px;border-top:1px solid #dbe3ef"><strong>Student</strong></td><td style="padding:8px;border-top:1px solid #dbe3ef">${escapeHtml(invoice.studentName)}</td></tr><tr><td style="padding:8px;border-top:1px solid #dbe3ef"><strong>Course</strong></td><td style="padding:8px;border-top:1px solid #dbe3ef">${escapeHtml(invoice.courseName)}</td></tr><tr><td style="padding:8px;border-top:1px solid #dbe3ef"><strong>Amount paid</strong></td><td style="padding:8px;border-top:1px solid #dbe3ef">₹${invoice.amount}</td></tr><tr><td style="padding:8px;border-top:1px solid #dbe3ef"><strong>Payment ID</strong></td><td style="padding:8px;border-top:1px solid #dbe3ef">${escapeHtml(invoice.paymentId)}</td></tr><tr><td style="padding:8px;border-top:1px solid #dbe3ef"><strong>Payment status</strong></td><td style="padding:8px;border-top:1px solid #dbe3ef;color:#138a4b"><strong>Successful</strong></td></tr></table></div>
    <p><strong>Your success is our mission.</strong></p>`);
}

function invoiceEmail(invoice) {
  return emailShell(`Your Scrutiny Academy Invoice — ${escapeHtml(invoice.courseName)}`, `<p>Dear ${escapeHtml(invoice.studentName)},</p><p>Thank you for your successful payment of <strong>₹${invoice.amount}</strong> for <strong>${escapeHtml(invoice.courseName)}</strong>.</p><p>Your PDF invoice <strong>${escapeHtml(invoice.invoiceNumber)}</strong> is attached to this email and has also been saved in your student account.</p><p>Payment ID: ${escapeHtml(invoice.paymentId)}</p>`);
}

function mailTransport() {
  return nodemailer.createTransport({ service: "gmail", auth: { user: SENDER_EMAIL, pass: GMAIL_APP_PASSWORD.value() } });
}

async function sendPurchaseEmails(invoice, pdfBuffer) {
  const ref = db.doc(`students/${invoice.uid}/invoices/${invoice.invoiceId}`);
  const claimed = await db.runTransaction(async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists || ["sending", "sent"].includes(snap.data().emailStatus)) return false;
    transaction.update(ref, { emailStatus: "sending", emailAttemptedAt: FieldValue.serverTimestamp() });
    return true;
  });
  if (!claimed) return;
  try {
    const transport = mailTransport();
    await transport.sendMail({ from: `"Scrutiny Academy" <${SENDER_EMAIL}>`, to: invoice.studentEmail, subject: `Welcome to Scrutiny Academy — ${invoice.courseName} Unlocked`, html: confirmationEmail(invoice) });
    await transport.sendMail({ from: `"Scrutiny Academy" <${SENDER_EMAIL}>`, to: invoice.studentEmail, subject: `Invoice ${invoice.invoiceNumber} — ${invoice.courseName}`, html: invoiceEmail(invoice), attachments: [{ filename: `${invoice.invoiceNumber}.pdf`, content: pdfBuffer, contentType: "application/pdf" }] });
    await ref.update({ emailStatus: "sent", confirmationEmailSentAt: FieldValue.serverTimestamp(), invoiceEmailSentAt: FieldValue.serverTimestamp() });
  } catch (error) {
    console.error("Purchase email delivery failed", invoice.invoiceId, error?.code || error?.message);
    await ref.update({ emailStatus: "failed", emailError: String(error?.code || "delivery_failed").slice(0, 100), emailFailedAt: FieldValue.serverTimestamp() });
  }
}

async function activateStudent({ uid, orderId, paymentId, source }) {
  const requestQuery = await db.collection("paymentRequests").where("orderId", "==", orderId).limit(1).get();
  if (requestQuery.empty) throw new HttpsError("failed-precondition", "This payment order is not linked to a student account.");
  const requestRef = requestQuery.docs[0].ref;
  const requestData = requestQuery.docs[0].data();
  if (requestData.uid !== uid) throw new HttpsError("permission-denied", "This payment belongs to another student account.");
  const course = courseFor(requestData.courseId);
  const studentRef = db.doc(`students/${uid}`);
  const studentSnap = await studentRef.get();
  if (!studentSnap.exists) throw new HttpsError("failed-precondition", "Student profile not found.");
  const student = studentSnap.data();
  const invoiceId = paymentId;
  const invoiceRef = db.doc(`students/${uid}/invoices/${invoiceId}`);
  const now = new Date();
  const invoice = {
    invoiceId,
    invoiceNumber: invoiceNumber(paymentId),
    uid,
    studentName: student.name || "Student",
    studentEmail: student.email || "",
    courseId: course.id,
    courseName: course.name,
    features: course.features,
    amount: course.price,
    currency: CURRENCY,
    paymentId,
    orderId,
    paymentStatus: "Successful",
    paymentDate: now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }),
  };
  const pdfBuffer = await createInvoicePdf(invoice);
  let newlyActivated = false;

  await db.runTransaction(async (transaction) => {
    const [paymentRequest, currentStudent] = await Promise.all([transaction.get(requestRef), transaction.get(studentRef)]);
    if (!paymentRequest.exists || paymentRequest.data().orderId !== orderId || paymentRequest.data().uid !== uid) throw new HttpsError("failed-precondition", "Payment order ownership changed during verification.");
    if (paymentRequest.data().status === "paid") return;
    if (!currentStudent.exists) throw new HttpsError("failed-precondition", "Student profile not found.");
    const profile = currentStudent.data();
    const entitlements = { ...(profile.courseEntitlements || {}), [course.id]: { status: "active", courseId: course.id, paymentId, orderId, amount: course.price, activatedAt: now.toISOString() } };
    const enrolledCourses = Object.entries(entitlements).filter(([, value]) => value?.status === "active").map(([id]) => id).filter((id) => COURSE_CATALOG[id]);
    transaction.set(studentRef, { accessStatus: "active", activeCourse: course.id, enrolledCourses, courseEntitlements: entitlements, accessPrice: course.price, paymentStatus: "verified", payment: { provider: "razorpay", orderId, paymentId, courseId: course.id, amount: course.price, verifiedAt: FieldValue.serverTimestamp(), verificationSource: source }, paidAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    transaction.set(requestRef, { status: "paid", paymentId, invoiceId, verifiedAt: FieldValue.serverTimestamp(), verificationSource: source, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    transaction.set(invoiceRef, { ...invoice, pdfBase64: pdfBuffer.toString("base64"), emailStatus: "pending", createdAt: FieldValue.serverTimestamp() });
    newlyActivated = true;
  });

  const stored = await invoiceRef.get();
  const finalInvoice = stored.exists ? stored.data() : invoice;
  if (newlyActivated) await sendPurchaseEmails(finalInvoice, pdfBuffer);
  return purchasePayload(finalInvoice);
}

async function findUidForOrder(orderId) {
  const snap = await db.collection("paymentRequests").where("orderId", "==", orderId).limit(1).get();
  return snap.empty ? null : snap.docs[0].data().uid;
}

exports.createRazorpayOrder = onCall({ region: REGION, secrets: [RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET], enforceAppCheck: false }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in before paying.");
  if (request.auth.token.email_verified !== true) throw new HttpsError("failed-precondition", "Verify your email address before starting payment.");
  const course = courseFor(request.data?.courseId);
  const uid = request.auth.uid;
  const studentRef = db.doc(`students/${uid}`);
  const requestRef = db.doc(`paymentRequests/${uid}_${course.id}`);
  const [student, existingRequest] = await Promise.all([studentRef.get(), requestRef.get()]);
  if (!student.exists) throw new HttpsError("failed-precondition", "Student profile not found.");
  if (student.data().courseEntitlements?.[course.id]?.status === "active") return { active: true };
  if (existingRequest.exists) {
    const existing = existingRequest.data();
    if (existing.status === "paid") return { active: true };
    if (typeof existing.orderId === "string" && existing.orderId.startsWith("order_") && existing.amountPaise === course.amountPaise && existing.currency === CURRENCY) return { keyId: RAZORPAY_KEY_ID.value(), orderId: existing.orderId, amount: course.amountPaise, currency: CURRENCY, courseId: course.id };
  }
  const order = await razorpayRequest("/orders", { method: "POST", body: JSON.stringify({ amount: course.amountPaise, currency: CURRENCY, receipt: `sa_${uid.slice(0, 8)}_${course.id}_${Date.now()}`, notes: { firebase_uid: uid, course_id: course.id, course_name: course.name } }) });
  await Promise.all([
    requestRef.set({ uid, provider: "razorpay", orderId: order.id, courseId: course.id, courseName: course.name, amount: course.price, amountPaise: course.amountPaise, currency: CURRENCY, status: "pending", createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }),
    studentRef.set({ activeCourse: course.id, accessPrice: course.price, paymentStatus: "created", updatedAt: FieldValue.serverTimestamp() }, { merge: true }),
  ]);
  return { keyId: RAZORPAY_KEY_ID.value(), orderId: order.id, amount: course.amountPaise, currency: CURRENCY, courseId: course.id };
});

exports.verifyRazorpayPayment = onCall({ region: REGION, secrets: [RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, GMAIL_APP_PASSWORD], enforceAppCheck: false }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in before verifying payment.");
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature, courseId } = request.data || {};
  const course = courseFor(courseId);
  if (![orderId, paymentId, signature].every((value) => typeof value === "string" && value)) throw new HttpsError("invalid-argument", "Payment verification details are incomplete.");
  if (!secureEqual(signature, paymentSignature(orderId, paymentId))) throw new HttpsError("permission-denied", "The payment signature is invalid.");
  const payment = await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`);
  if (payment.order_id !== orderId || payment.amount !== course.amountPaise || payment.currency !== CURRENCY || payment.status !== "captured") throw new HttpsError("failed-precondition", "The payment has not been captured for the selected course.");
  const purchase = await activateStudent({ uid: request.auth.uid, orderId, paymentId, source: "checkout" });
  return { active: true, purchase };
});

exports.syncRazorpayPayment = onCall({ region: REGION, secrets: [RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, GMAIL_APP_PASSWORD], enforceAppCheck: false }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in before checking payment.");
  const course = courseFor(request.data?.courseId);
  const uid = request.auth.uid;
  const paymentRequest = await db.doc(`paymentRequests/${uid}_${course.id}`).get();
  if (!paymentRequest.exists) return { active: false };
  if (paymentRequest.data().status === "paid") {
    const invoice = await db.doc(`students/${uid}/invoices/${paymentRequest.data().invoiceId}`).get();
    return { active: true, purchase: invoice.exists ? purchasePayload(invoice.data()) : null };
  }
  const orderId = paymentRequest.data().orderId;
  if (typeof orderId !== "string" || !orderId.startsWith("order_")) return { active: false };
  const payments = await razorpayRequest(`/orders/${encodeURIComponent(orderId)}/payments`);
  const captured = payments.items?.find((payment) => payment.order_id === orderId && payment.amount === course.amountPaise && payment.currency === CURRENCY && payment.status === "captured");
  if (!captured) return { active: false };
  const purchase = await activateStudent({ uid, orderId, paymentId: captured.id, source: "reconciliation" });
  return { active: true, purchase };
});

exports.razorpayWebhook = onRequest({ region: REGION, secrets: [RAZORPAY_WEBHOOK_SECRET, GMAIL_APP_PASSWORD] }, async (req, res) => {
  if (req.method !== "POST") { res.status(405).send("Method Not Allowed"); return; }
  const signature = req.get("x-razorpay-signature") || "";
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
  if (!secureEqual(signature, hmacHex(RAZORPAY_WEBHOOK_SECRET.value(), rawBody))) { res.status(401).send("Invalid signature"); return; }
  try {
    const event = req.body?.event;
    const payment = req.body?.payload?.payment?.entity;
    if (event === "payment.captured" && payment && payment.currency === CURRENCY && typeof payment.order_id === "string") {
      const uid = await findUidForOrder(payment.order_id);
      if (uid) await activateStudent({ uid, orderId: payment.order_id, paymentId: payment.id, source: "webhook" });
    }
    res.status(200).send("ok");
  } catch (error) {
    console.error("Razorpay webhook processing failed", error);
    res.status(500).send("Webhook processing failed");
  }
});
