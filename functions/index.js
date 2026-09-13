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

function hmacHex(secret, payload) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function paymentSignature(orderId, paymentId) {
  return hmacHex(RAZORPAY_KEY_SECRET.value(), `${orderId}|${paymentId}`);
}

async function razorpayRequest(path, options = {}) {
  const auth = Buffer.from(`${RAZORPAY_KEY_ID.value()}:${RAZORPAY_KEY_SECRET.value()}`).toString('base64');
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

  await db.runTransaction(async transaction => {
    const paymentRequest = await transaction.get(requestRef);
    if (!paymentRequest.exists || paymentRequest.data().orderId !== orderId) {
      throw new HttpsError('failed-precondition', 'This payment order is not linked to this student account.');
    }
    if (paymentRequest.data().status === 'paid') return;

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
      paidAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});

    transaction.set(requestRef, {
      status: 'paid',
      paymentId,
      verifiedAt: FieldValue.serverTimestamp(),
      verificationSource: source,
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true});
  });
}

async function findUidForOrder(orderId) {
  const snap = await db.collection('paymentRequests').where('orderId', '==', orderId).limit(1).get();
  return snap.empty ? null : snap.docs[0].id;
}

exports.createRazorpayOrder = onCall({
  region: REGION,
  secrets: [RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET],
  enforceAppCheck: false,
}, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in before paying.');

  const uid = request.auth.uid;
  const studentRef = db.doc(`students/${uid}`);
  const requestRef = db.doc(`paymentRequests/${uid}`);
  const [student, existingRequest] = await Promise.all([studentRef.get(), requestRef.get()]);

  if (!student.exists) throw new HttpsError('failed-precondition', 'Student profile not found.');
  if (student.data().accessStatus === 'active') {
    throw new HttpsError('already-exists', 'Your access is already active.');
  }

  if (existingRequest.exists) {
    const existing = existingRequest.data();
    if (existing.status === 'paid') {
      return {active: true};
    }
    if (typeof existing.orderId === 'string' && existing.orderId.startsWith('order_') &&
        existing.amountPaise === PRICE_PAISE && existing.currency === CURRENCY) {
      return {
        keyId: RAZORPAY_KEY_ID.value(),
        orderId: existing.orderId,
        amount: PRICE_PAISE,
        currency: CURRENCY,
      };
    }
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

  await Promise.all([
    requestRef.set({
      uid,
      provider: 'razorpay',
      orderId: order.id,
      amount: PRICE_RUPEES,
      amountPaise: PRICE_PAISE,
      currency: CURRENCY,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }),
    studentRef.set({
      paymentStatus: 'created',
      updatedAt: FieldValue.serverTimestamp(),
    }, {merge: true}),
  ]);

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
}, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in before verifying payment.');
  const {razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature} = request.data || {};
  if (![orderId, paymentId, signature].every(value => typeof value === 'string' && value)) {
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

exports.syncRazorpayPayment = onCall({
  region: REGION,
  secrets: [RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET],
  enforceAppCheck: false,
}, async request => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in before checking payment.');

  const uid = request.auth.uid;
  const paymentRequest = await db.doc(`paymentRequests/${uid}`).get();
  if (!paymentRequest.exists) return {active: false};
  if (paymentRequest.data().status === 'paid') return {active: true};

  const orderId = paymentRequest.data().orderId;
  if (typeof orderId !== 'string' || !orderId.startsWith('order_')) return {active: false};

  const payments = await razorpayRequest(`/orders/${encodeURIComponent(orderId)}/payments`);
  const capturedPayment = payments.items?.find(payment =>
    payment.order_id === orderId &&
    payment.amount === PRICE_PAISE &&
    payment.currency === CURRENCY &&
    payment.status === 'captured');
  if (!capturedPayment) return {active: false};

  await activateStudent({uid, orderId, paymentId: capturedPayment.id, source: 'reconciliation'});
  return {active: true};
});

exports.razorpayWebhook = onRequest({
  region: REGION,
  secrets: [RAZORPAY_WEBHOOK_SECRET],
}, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const signature = req.get('x-razorpay-signature') || '';
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
  const expected = hmacHex(RAZORPAY_WEBHOOK_SECRET.value(), rawBody);
  if (!secureEqual(signature, expected)) {
    res.status(401).send('Invalid signature');
    return;
  }

  try {
    const event = req.body?.event;
    const payment = req.body?.payload?.payment?.entity;
    if (event === 'payment.captured' && payment &&
        payment.amount === PRICE_PAISE && payment.currency === CURRENCY &&
        typeof payment.order_id === 'string') {
      const uid = await findUidForOrder(payment.order_id);
      if (uid) {
        await activateStudent({
          uid,
          orderId: payment.order_id,
          paymentId: payment.id,
          source: 'webhook',
        });
      }
    }
    res.status(200).send('ok');
  } catch (error) {
    console.error('Razorpay webhook processing failed', error);
    res.status(500).send('Webhook processing failed');
  }
});
