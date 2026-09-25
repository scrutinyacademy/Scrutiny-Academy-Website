#!/usr/bin/env node
"use strict";

const crypto = require("node:crypto");
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const { initializeApp, applicationDefault } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || "scrutiny-academy";
const SENDER_EMAIL = "scrutinyacademy@gmail.com";
const FOUNDER_SIGNATURE = "Parmod Sharma\nFounder, Scrutiny Academy";
const COURSES = {
  class10: { name: "Class 10 SSC Complete Course 2027", features: ["Chapter-wise lectures", "Comprehensive notes", "Revision sheets", "Flashcards", "Chapter-wise MCQs"] },
  class11: { name: "Class 11 Board Booster 2027", features: ["Revision sheets", "VSAQ question banks", "SAQ question banks", "LAQ question banks"] },
  class12: { name: "Class 12 Board Booster 2027", features: ["Revision sheets", "VSAQ question banks", "SAQ question banks", "LAQ question banks"] },
  neet: { name: "NEET-UG Target Course", features: ["NCERT-focused Physics, Chemistry and Biology MCQs", "Previous-year questions", "NCERT search and revision tools", "Tests, progress tracking and mistake notebook"] },
  mbbs: { name: "MBBS Complete Learning Course", features: ["Phase-wise MBBS subjects", "Clinical learning and revision resources", "Question practice and assessments", "Bookmarks, progress tracking and revision tools", "Lifetime course access"] },
};

const args = new Set(process.argv.slice(2));
const sendMode = args.has("--send");
const confirmArg = process.argv.find((arg) => arg.startsWith("--confirm-emails="));
const confirmedEmailCount = confirmArg ? Number(confirmArg.split("=")[1]) : null;

initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
const auth = getAuth();
const db = getFirestore();

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function emailShell(title, content) {
  return `<!doctype html><html><body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#172033"><div style="max-width:680px;margin:0 auto;padding:26px 14px"><div style="background:#102a56;color:white;padding:22px;border-radius:16px 16px 0 0"><div style="font-size:21px;font-weight:800">SCRUTINY ACADEMY</div><div style="font-size:12px;opacity:.8">YOUR SUCCESS IS OUR MISSION</div></div><div style="background:white;padding:28px;border-radius:0 0 16px 16px"><h1 style="font-size:24px;color:#102a56;margin-top:0">${title}</h1>${content}<div style="margin-top:28px;padding-top:18px;border-top:1px solid #dbe3ef"><strong>From the Founder of Scrutiny Academy</strong><br>${escapeHtml(FOUNDER_SIGNATURE).replace(/\n/g, "<br>")}</div></div></div></body></html>`;
}

function registrationEmail(name) {
  return emailShell("Welcome to the Scrutiny Family! 🎓❤️", `
    <p>Dear ${escapeHtml(name)},</p>
    <p>Thank you for registering with Scrutiny Academy and choosing us to be part of your learning journey.</p>
    <p>At Scrutiny Academy, our mission is simple: quality education should be accessible, affordable and effective for every student.</p>
    <p>You can now sign in, explore our courses and choose the learning path that is right for you. Course access is unlocked only after the corresponding payment is successfully verified.</p>
    <p><strong>Keep learning. Keep improving. Keep believing in yourself.</strong></p>
    <p><strong>Your success is our mission.</strong></p>`);
}

function purchaseEmail(invoice) {
  const features = invoice.features.map((item) => `<li style="margin:7px 0">${escapeHtml(item)}</li>`).join("");
  return emailShell("Thank You for Joining Scrutiny Academy! 🎓❤️", `
    <p><strong>Payment Successful</strong></p><h2>Welcome to the Scrutiny Family! 🎉</h2>
    <p>Dear ${escapeHtml(invoice.studentName)},</p>
    <p>Thank you for trusting Scrutiny Academy and choosing us to be part of your learning journey.</p>
    <p>Your decision to invest in your education is something we truly value. Your purchased course is available in your account.</p>
    <div style="margin:24px 0;padding:20px;background:#f4f7fb;border-left:4px solid #138a4b;border-radius:10px"><div style="font-size:12px;font-weight:800;color:#138a4b">ENROLLMENT CONFIRMED</div><h2>${escapeHtml(invoice.courseName)} is unlocked.</h2><ul>${features}</ul><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px;border-top:1px solid #dbe3ef"><strong>Student</strong></td><td style="padding:8px;border-top:1px solid #dbe3ef">${escapeHtml(invoice.studentName)}</td></tr><tr><td style="padding:8px;border-top:1px solid #dbe3ef"><strong>Course</strong></td><td style="padding:8px;border-top:1px solid #dbe3ef">${escapeHtml(invoice.courseName)}</td></tr><tr><td style="padding:8px;border-top:1px solid #dbe3ef"><strong>Amount paid</strong></td><td style="padding:8px;border-top:1px solid #dbe3ef">₹${invoice.amount}</td></tr><tr><td style="padding:8px;border-top:1px solid #dbe3ef"><strong>Payment ID</strong></td><td style="padding:8px;border-top:1px solid #dbe3ef">${escapeHtml(invoice.paymentId)}</td></tr><tr><td style="padding:8px;border-top:1px solid #dbe3ef"><strong>Payment status</strong></td><td style="padding:8px;border-top:1px solid #dbe3ef;color:#138a4b"><strong>Successful</strong></td></tr></table></div>
    <p><strong>Your success is our mission.</strong></p>`);
}

function invoiceEmail(invoice) {
  return emailShell(`Your Scrutiny Academy Invoice — ${escapeHtml(invoice.courseName)}`, `<p>Dear ${escapeHtml(invoice.studentName)},</p><p>Thank you for your successful payment of <strong>₹${invoice.amount}</strong> for <strong>${escapeHtml(invoice.courseName)}</strong>.</p><p>Your PDF invoice <strong>${escapeHtml(invoice.invoiceNumber)}</strong> is attached and has also been saved in your student account.</p><p>Payment ID: ${escapeHtml(invoice.paymentId)}</p>`);
}

function invoiceNumber(paymentId, paymentCreatedAt) {
  const year = paymentCreatedAt ? new Date(paymentCreatedAt * 1000).getUTCFullYear() : new Date().getUTCFullYear();
  return `SA-${year}-${String(paymentId).replace(/[^a-z0-9]/gi, "").slice(-12).toUpperCase()}`;
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
      ["Invoice number", invoice.invoiceNumber], ["Student", invoice.studentName],
      ["Registered email", invoice.studentEmail], ["Course", invoice.courseName],
      ["Amount paid", `INR ${invoice.amount}`], ["Payment ID", invoice.paymentId],
      ["Order ID", invoice.orderId], ["Payment status", "Successful"],
      ["Payment date", invoice.paymentDate],
    ];
    rows.forEach(([label, value], index) => {
      const y = doc.y;
      if (index % 2 === 0) doc.rect(48, y - 5, 499, 24).fill("#f4f7fb").fillColor("#111827");
      doc.font("Helvetica-Bold").text(label, 58, y, { width: 145 });
      doc.font("Helvetica").text(String(value || "—"), 210, y, { width: 325 });
      doc.y = y + 24;
    });
    doc.moveDown(2).font("Helvetica-Bold").fillColor("#102a56").text("Course access confirmed");
    doc.font("Helvetica").fillColor("#111827").text(`Only the purchased ${invoice.courseName} course is unlocked for this account.`);
    doc.moveDown(3).font("Helvetica-Bold").text("From the Founder of Scrutiny Academy");
    doc.font("Helvetica").text(FOUNDER_SIGNATURE);
    doc.moveDown(2).fontSize(9).fillColor("#6b7280").text(`Support: ${SENDER_EMAIL}`);
    doc.end();
  });
}

async function listAuthUsers() {
  const users = [];
  let pageToken;
  do {
    const page = await auth.listUsers(1000, pageToken);
    users.push(...page.users);
    pageToken = page.pageToken;
  } while (pageToken);
  return users;
}

async function razorpay(path) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required.");
  const response = await fetch(`https://api.razorpay.com/v1${path}`, { headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}` } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Razorpay verification failed (${response.status}, ${body.error?.code || "unknown"}).`);
  return body;
}

async function capturedPaymentFor(record) {
  if (record.paymentId) {
    const payment = await razorpay(`/payments/${encodeURIComponent(record.paymentId)}`);
    return payment.status === "captured" ? payment : null;
  }
  if (record.orderId) {
    const payments = await razorpay(`/orders/${encodeURIComponent(record.orderId)}/payments`);
    return payments.items?.find((payment) => payment.status === "captured") || null;
  }
  return null;
}

function paymentCandidates(studentDocs, requestDocs) {
  const candidates = [];
  requestDocs.forEach((doc) => {
    const data = doc.data();
    if (data.uid && (data.paymentId || data.orderId)) candidates.push({ ...data, source: `paymentRequests/${doc.id}` });
  });
  studentDocs.forEach((doc) => {
    const data = doc.data();
    if (data.payment?.paymentId || data.payment?.orderId) {
      candidates.push({ uid: doc.id, ...data.payment, courseId: data.payment.courseId || data.purchasedCourse || data.activeCourse, source: `students/${doc.id}` });
    }
  });
  const unique = new Map();
  candidates.forEach((item) => unique.set(item.paymentId || `${item.orderId}:${item.uid}:${item.courseId || "unknown"}`, item));
  return [...unique.values()];
}

function deliveryId(prefix, value) {
  return `${prefix}_${crypto.createHash("sha256").update(value).digest("hex").slice(0, 32)}`;
}

async function main() {
  if (sendMode && (!process.env.GMAIL_APP_PASSWORD || confirmedEmailCount === null)) {
    throw new Error("Send mode requires GMAIL_APP_PASSWORD and --confirm-emails=<dry-run total>.");
  }

  const [users, studentsSnap, requestsSnap, deliveriesSnap] = await Promise.all([
    listAuthUsers(), db.collection("students").get(), db.collection("paymentRequests").get(), db.collection("emailDeliveries").get(),
  ]);
  const studentDocs = studentsSnap.docs;
  const studentByUid = new Map(studentDocs.map((doc) => [doc.id, doc.data()]));
  const userByUid = new Map(users.map((user) => [user.uid, user]));
  const delivered = new Set(deliveriesSnap.docs.filter((doc) => doc.data().status === "sent").map((doc) => doc.id));
  const candidates = paymentCandidates(studentDocs, requestsSnap.docs);
  const verifiedByPaymentId = new Map();
  const manualReview = [];

  for (const record of candidates) {
    try {
      const payment = await capturedPaymentFor(record);
      if (!payment) {
        manualReview.push({ uid: record.uid, source: record.source, reason: "No captured Razorpay payment" });
        continue;
      }
      if (payment.currency !== "INR") {
        manualReview.push({ uid: record.uid, source: record.source, reason: "Payment currency is not INR" });
        continue;
      }
      if (record.orderId && payment.order_id !== record.orderId) {
        manualReview.push({ uid: record.uid, source: record.source, reason: "Payment/order mismatch" });
        continue;
      }
      const expectedPaise = Number(record.amountPaise || (record.amount ? Number(record.amount) * 100 : 0));
      if (expectedPaise && Number(payment.amount) !== expectedPaise) {
        manualReview.push({ uid: record.uid, source: record.source, reason: "Payment amount mismatch" });
        continue;
      }
      if (payment.notes?.firebase_uid && payment.notes.firebase_uid !== record.uid) {
        manualReview.push({ uid: record.uid, source: record.source, reason: "Payment/student mismatch" });
        continue;
      }
      const student = studentByUid.get(record.uid) || {};
      const user = userByUid.get(record.uid);
      const notedCourseId = payment.notes?.course_id;
      if (record.courseId && notedCourseId && record.courseId !== notedCourseId) {
        manualReview.push({ uid: record.uid, source: record.source, reason: "Payment/course mismatch" });
        continue;
      }
      const courseId = record.courseId || notedCourseId || student.purchasedCourse || student.activeCourse;
      if (!user?.email || user.disabled || !COURSES[courseId]) {
        manualReview.push({ uid: record.uid, source: record.source, reason: !user?.email ? "No registered Auth email" : user.disabled ? "Account disabled" : "Unknown course" });
        continue;
      }
      if (student.email && student.email.toLowerCase() !== user.email.toLowerCase()) {
        manualReview.push({ uid: record.uid, source: record.source, reason: "Auth/profile email mismatch" });
        continue;
      }
      verifiedByPaymentId.set(payment.id, { record, payment, student, user, courseId });
    } catch (error) {
      manualReview.push({ uid: record.uid, source: record.source, reason: error.message });
    }
  }

  const verifiedPurchases = [...verifiedByPaymentId.values()];

  const paidUids = new Set(verifiedPurchases.map((item) => item.user.uid));
  const registrationPlans = users.filter((user) => user.email && !user.disabled && user.email.toLowerCase() !== SENDER_EMAIL && !paidUids.has(user.uid)).map((user) => ({
    user,
    student: studentByUid.get(user.uid) || {},
    deliveryRef: db.doc(`emailDeliveries/${deliveryId("registration", user.uid)}`),
  })).filter((plan) => !delivered.has(plan.deliveryRef.id));

  const purchasePlans = [];
  for (const item of verifiedPurchases) {
    const invoiceRef = db.doc(`students/${item.user.uid}/invoices/${item.payment.id}`);
    const existing = await invoiceRef.get();
    if (existing.exists && existing.data().emailStatus === "sent") continue;
    purchasePlans.push({ ...item, invoiceRef, existing });
  }

  const totalEmails = registrationPlans.length + (purchasePlans.length * 2);
  console.log(JSON.stringify({
    mode: sendMode ? "SEND" : "DRY_RUN",
    registeredAuthAccounts: users.length,
    registrationWelcomeRecipients: registrationPlans.length,
    verifiedPastPurchases: verifiedPurchases.length,
    purchaseInvoiceRecipients: purchasePlans.length,
    totalEmailsPlanned: totalEmails,
    manualReviewCount: manualReview.length,
    manualReview,
  }, null, 2));

  if (!sendMode) {
    console.log(`\nDry run only. To send exactly this plan, rerun with --send --confirm-emails=${totalEmails}`);
    return;
  }
  if (confirmedEmailCount !== totalEmails) throw new Error(`Recipient plan changed: confirmed ${confirmedEmailCount}, current total ${totalEmails}. Run a new dry run.`);
  if (totalEmails > 400) throw new Error(`Planned total ${totalEmails} exceeds the 400-email safety limit for one Gmail batch.`);

  const transport = nodemailer.createTransport({ service: "gmail", auth: { user: SENDER_EMAIL, pass: process.env.GMAIL_APP_PASSWORD } });
  await transport.verify();
  let sent = 0;
  let failed = 0;

  for (const plan of registrationPlans) {
    const name = plan.student.name || plan.user.displayName || "Student";
    try {
      await plan.deliveryRef.set({ type: "registration_welcome", uid: plan.user.uid, recipientEmail: plan.user.email, status: "sending", attemptedAt: FieldValue.serverTimestamp() }, { merge: true });
      await transport.sendMail({ from: `"Scrutiny Academy" <${SENDER_EMAIL}>`, to: plan.user.email, subject: "Welcome to Scrutiny Academy 🎓", html: registrationEmail(name) });
      await plan.deliveryRef.update({ status: "sent", sentAt: FieldValue.serverTimestamp() });
      sent += 1;
    } catch (error) {
      failed += 1;
      await plan.deliveryRef.set({ status: "failed", error: String(error.code || error.message).slice(0, 120), failedAt: FieldValue.serverTimestamp() }, { merge: true });
    }
  }

  for (const plan of purchasePlans) {
    const course = COURSES[plan.courseId];
    const invoice = {
      invoiceId: plan.payment.id,
      invoiceNumber: invoiceNumber(plan.payment.id, plan.payment.created_at),
      uid: plan.user.uid,
      studentName: plan.student.name || plan.user.displayName || "Student",
      studentEmail: plan.user.email,
      courseId: plan.courseId,
      courseName: course.name,
      features: course.features,
      amount: Number(plan.payment.amount || 0) / 100,
      currency: plan.payment.currency || "INR",
      paymentId: plan.payment.id,
      orderId: plan.payment.order_id || plan.record.orderId || "",
      paymentStatus: "Successful",
      paymentDate: new Date((plan.payment.created_at || Math.floor(Date.now() / 1000)) * 1000).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }),
    };
    const pdf = await createInvoicePdf(invoice);
    try {
      await plan.invoiceRef.set({ ...invoice, pdfBase64: pdf.toString("base64"), emailStatus: "sending", emailAttemptedAt: FieldValue.serverTimestamp(), createdAt: plan.existing.exists ? plan.existing.data().createdAt || FieldValue.serverTimestamp() : FieldValue.serverTimestamp() }, { merge: true });
      await transport.sendMail({ from: `"Scrutiny Academy" <${SENDER_EMAIL}>`, to: invoice.studentEmail, subject: `Welcome to Scrutiny Academy — ${invoice.courseName} Unlocked`, html: purchaseEmail(invoice) });
      await transport.sendMail({ from: `"Scrutiny Academy" <${SENDER_EMAIL}>`, to: invoice.studentEmail, subject: `Invoice ${invoice.invoiceNumber} — ${invoice.courseName}`, html: invoiceEmail(invoice), attachments: [{ filename: `${invoice.invoiceNumber}.pdf`, content: pdf, contentType: "application/pdf" }] });
      await plan.invoiceRef.update({ emailStatus: "sent", confirmationEmailSentAt: FieldValue.serverTimestamp(), invoiceEmailSentAt: FieldValue.serverTimestamp() });
      sent += 2;
    } catch (error) {
      failed += 1;
      await plan.invoiceRef.set({ emailStatus: "failed", emailError: String(error.code || error.message).slice(0, 120), emailFailedAt: FieldValue.serverTimestamp() }, { merge: true });
    }
  }

  console.log(JSON.stringify({ completed: true, emailsSent: sent, deliveryFailures: failed, manualReviewCount: manualReview.length }, null, 2));
  if (failed) process.exitCode = 2;
}

main().catch((error) => {
  console.error("Backfill failed:", error.message);
  process.exitCode = 1;
});
