import assert from 'node:assert/strict';
import fs from 'node:fs';
import { COURSE_CATALOG, currentCoursePrice } from '../course-catalog.js';

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const index = read('index.html');
const auth = read('auth.js');
const payment = read('payment.js');
const course = read('neetss-surgery.html');
const backend = read('functions/index.js');
const rules = read('firestore.rules');
const workflow = read('.github/workflows/deploy-neetss.yml');

assert.equal(currentCoursePrice('neetss', true), 999);
assert.equal(currentCoursePrice('neetss', false), 1999);
assert.equal(COURSE_CATALOG.neetss.fullPrice, 8999);
assert.equal(COURSE_CATALOG.neetss.inviteOnly, undefined);
assert.ok(index.includes('first 100 successful paid enrolments'));
assert.ok(index.includes('Early Bird Price ₹1,999'));
assert.ok(index.includes('Full Course Price <s>₹8,999</s>'));
assert.ok(course.includes('FOUNDING STUDENTS OFFER'));
assert.ok(course.includes('<strong>₹999</strong>'));
assert.ok(course.includes('<strong>₹1,999</strong>'));
assert.ok(course.includes('<s>₹8,999</s>'));
assert.ok(auth.includes('location.replace(`payment.html?${paymentQuery}`)'));
assert.ok(!auth.includes('complimentary NEET-SS access request'));
assert.ok(payment.includes('createRazorpayOrder'));
assert.ok(payment.includes('verifyRazorpayPayment'));
assert.ok(payment.includes('neetssFoundingOfferActive'));
assert.ok(backend.includes('NEETSS_FOUNDING_LIMIT = 100'));
assert.ok(backend.includes('where("courseId", "==", "neetss")'));
assert.ok(backend.includes('offerPrice: 999'));
assert.ok(backend.includes('regularPrice: 1999'));
assert.ok(backend.includes('fullPrice: 8999'));
assert.ok(rules.includes("request.resource.data.accessPrice in [999,1999]"));
for (const name of ['getStudentOfferStatus', 'createRazorpayOrder', 'verifyRazorpayPayment', 'syncRazorpayPayment', 'razorpayWebhook']) {
  assert.ok(workflow.includes(`functions:${name}`), `deployment workflow missing ${name}`);
}

console.log('PASS: NEET-SS ₹999 founding offer, ₹1,999 early-bird tier, ₹8,999 display price, Razorpay flow and deployment targets.');
