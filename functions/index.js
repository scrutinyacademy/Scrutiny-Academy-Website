const crypto = require('node:crypto');
const {initializeApp} = require('firebase-admin/app');
const {getFirestore, FieldValue} = require('firebase-admin/firestore');
const {defineSecret} = require('firebase-functions/params');
const {HttpsError, onCall, onRequest} = require('firebase-functions/v2/https');

initializeApp();

const db = getFirestore();
const REGION = 'asia-south1';
const PRICE_RUPEES = 59;
const PRICE_PAISE = PRICE_RUPEES * 100;
const CURRENCY = 'INR';
const RAZORPAY_KEY_ID = defineSecret('RAZORPAY_KEY_ID');
const RAZORPAY_KEY_SECRET = defineSecret('RAZORPAY_KEY_SECRET');
const RAZORPAY_WEBHOOK_SECRET = defineSecret('RAZORPAY_WEBHOOK_SECRET');

function secureEqual(actual, expected) {
  const a = Buffer.from(actual || '', 'utf8');
  const b = Buffer.from(expected || '', 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function paymentSignature(orderId, paymentId) {
  return crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET.value())
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
}

async function razorpayRequest(path, options = {}) {
  const auth = Buffer.from(
      `${RAZORPAY_KEY_ID.value()}:${RAZORPAY_KEY_SECRET.value()}`,
  ).toString('base64');
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('Razorpay request failed', response.status, body.error?.code);
    throw new HttpsError('internal', 'The payment service is temporarily unavailable.');
  }
  return body;
}

async function activateStudent({uid, orderId, paymentId, source}) {
  const requestRef = db.doc(`paymentRequests/${uid}`);
  const studentRef = db.doc(`students/${uid}`);

  await db.runTransaction(async (transaction) => {
    const request = await transaction.get(requestRef);
    if (!request.exists || request.data().orderId !== orderId) {
      throw new HttpsError('failed-precondition', 'This payment order is not linked to your account.');
    }
    if (request.data().status === 'paid') return;

    transaction.set(studentRef, {
      accessStatus: 'active',
      accessPrice: PRICE_RUPEES,
      paymentStatus: 'verified',
      payment: {
        provider: 'razorpay',
        orderId,
        paymentId,
        amount: PRICE_RUPEES,
        verifiedAt: FieldValue.serverTimestamp(),
        verificationSource: source,
      },
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});
    transaction.set(requestRef, {
      status: 'paid',
      paymentId,
      verifiedAt: FieldValue.serverTimestamp(),
      verificationSource: source,
    }, {merge: true});
  });
}

exports.createRazorpayOrder = onCall({
  region: REGION,
  secrets: [RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET],
  enforceAppCheck: false,
}, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in before paying.');

  const uid = request.auth.uid;
  const student = await db.doc(`students/${uid}`).get();
  if (!student.exists) throw new HttpsError('failed-precondition', 'Student profile not found.');
  if (student.data().accessStatus === 'active') {
    throw new HttpsError('already-exists', 'Your access is already active.');
  }

  const order = await razorpayRequest('/orders', {
    method: 'POST',
    body: JSON.stringify({
      amount: PRICE_PAISE,
      currency: CURRENCY,
      receipt: `sa_${uid.slice(0, 12)}_${Date.now()}`,
      notes: {firebase_uid: uid, product: 'scrutiny_academy_access'},
    }),
  });

  await db.doc(`paymentRequests/${uid}`).set({
    uid,
    provider: 'razorpay',
    orderId: order.id,
    amount: PRICE_RUPEES,
    amountPaise: PRICE_PAISE,
    currency: CURRENCY,
    status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return {
    keyId: RAZORPAY_KEY_ID.value(),
    orderId: order.id,
    amount: PRICE_PAISE,
    currency: CURRENCY,
  };
});

exports.verifyRazorpayPayment = onCall({
  region: REGION,
  secrets: [RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET],
  enforceAppCheck: false,
}, async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in before verifying payment.');
  const {razorpay_order_id: orderId, razorpay_payment_id: paymentId,
    razorpay_signature: signature} = request.data || {};
  if (![orderId, paymentId, signature].every((value) => typeof value === 'string' && value)) {
    throw new HttpsError('invalid-argument', 'Payment verification details are incomplete.');
  }

  if (!secureEqual(signature, paymentSignature(orderId, paymentId))) {
    throw new HttpsError('permission-denied', 'The payment signature is invalid.');
  }

  const payment = await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`);
  if (payment.order_id !== orderId || payment.amount !== PRICE_PAISE ||
      payment.currency !== CURRENCY || payment.status !== 'captured') {
    throw new HttpsError('failed-precondition', 'The payment has not been captured yet.');
  }

  await activateStudent({uid: request.auth.uid, orderId, paymentId, source: 'checkout'});
  return {active: true};
});

exports.razorpayWebhook = onRequest({
  region: REGION,
  secrets: [RAZORPAY_WEBHOOK_SECRET],
}, async (request, response) => {
  if (request.method !== 'POST') {
    response.status(405).send('Method not allowed');
    return;
  }
  const signature = request.get('x-razorpay-signature') || '';
  const expected = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET.value())
      .update(request.rawBody)
      .digest('hex');
  if (!secureEqual(signature, expected)) {
    response.status(401).send('Invalid signature');
    return;
  }

  const event = request.body;
  if (event.event !== 'payment.captured' && event.event !== 'order.paid') {
    response.status(200).send('Ignored');
    return;
  }
  const payment = event.payload?.payment?.entity;
  const order = event.payload?.order?.entity;
  const uid = payment?.notes?.firebase_uid || order?.notes?.firebase_uid;
  const orderId = payment?.order_id || order?.id;
  if (!uid || !orderId || !payment?.id || payment.amount !== PRICE_PAISE ||
      payment.currency !== CURRENCY || payment.status !== 'captured') {
    response.status(200).send('Ignored');
    return;
  }

  try {
    await activateStudent({uid, orderId, paymentId: payment.id, source: 'webhook'});
    response.status(200).send('OK');
  } catch (error) {
    console.error('Webhook activation failed', error);
    response.status(500).send('Retry');
  }
});
