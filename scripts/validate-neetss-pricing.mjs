import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {arabicMonthlyPrice, COURSE_CATALOG, currentCoursePrice, subscriptionPrice, class6Price, entitledCourses} from '../course-catalog.js';
const rates={arabic:399,class6:69,class8:395,class10:495,class11:745,class12:745,neet:495,jee:2495,mbbs:3995,neetss:8999};
for(const [id,rate] of Object.entries(rates)) {
 assert.equal(currentCoursePrice(id),rate);
 for(const months of [1,3,6]) {
  const expected=Math.round(rate*months*(months===6?.8:months===3?.9:1)*100)/100;
  assert.equal(subscriptionPrice(id,months).total,expected);
 }
}
assert.equal(class6Price(['science'],3).total,186.3);
assert.equal(class6Price(['science','mathematics'],6).total,662.4);
const expired={accessStatus:'active',purchasedCourse:'neet',enrolledCourses:['neet'],courseEntitlements:{neet:{status:'active',expiresAt:'2020-01-01'}}};
assert.deepEqual(entitledCourses(expired),[]);
assert.deepEqual(entitledCourses({courseEntitlements:{neet:{status:'active'}}}),['neet']);
const backend=fs.readFileSync(new URL('../functions/index.js',import.meta.url),'utf8');
const snippet=backend.slice(backend.indexOf('function addUtcMonths('),backend.indexOf('\nfunction courseValidity'));
const context=vm.createContext({COURSES:Object.fromEntries(Object.entries(COURSE_CATALOG).map(([id,c])=>[id,{regularPrice:c.regularPrice,fullPrice:c.fullPrice}])),CLASS6_SUBJECT_PRICE:69, arabicMonthlyPrice, validClass6Subjects:x=>x,HttpsError:Error, timestampDate:x=>new Date(x)});
vm.runInContext(snippet,context);
for(const [id,rate] of Object.entries(rates)) for(const months of [1,3,6]) {
 const result=await context.coursePrice(id,{subscriptionMonths:months,class6Months:months,class6Subjects:['science']});
 assert.equal(result.rupees,subscriptionPrice(id,months).total);
}
assert.equal(context.addUtcMonths(new Date('2026-01-31T12:00:00Z'),1).toISOString(),'2026-02-28T23:59:59.999Z');
assert.throws(()=>context.subscriptionDuration(12));
console.log('PASS: nine course rates, all term discounts, backend/frontend price parity, expiry, legacy access and month-end dates.');

assert.equal(arabicMonthlyPrice({requestedCourse:'class10'}),299);
assert.equal(arabicMonthlyPrice({requestedCourse:'arabic'}),399);
for(const months of [1,3,6]) {
 const profile={requestedCourse:'class10'};
 assert.equal((await context.coursePrice('arabic',{subscriptionMonths:months,profile})).rupees,subscriptionPrice('arabic',months,profile).total);
}
assert.equal(subscriptionPrice('arabic',3,{requestedCourse:'class10'}).total,807.3);
assert.equal(subscriptionPrice('arabic',6,{requestedCourse:'class10'}).total,1435.2);
assert.equal(subscriptionPrice('arabic',6,{requestedCourse:'arabic'}).total,1915.2);
const gate=backend.slice(backend.indexOf('exports.getArabicCourseContent'));
assert.ok(gate.includes('request.auth'));
assert.ok(gate.includes('activeEntitlement(snapshot.data().courseEntitlements?.arabic)'));
assert.ok(backend.includes('subscriptionMonths, profile }'));
assert.ok(fs.readFileSync(new URL('../_config.yml',import.meta.url),'utf8').includes('data/arabic'));
const fixtures=JSON.parse(fs.readFileSync(new URL('../data/arabic/alphabet.json',import.meta.url),'utf8'));
assert.equal(fixtures.length,28);
console.log('PASS: Arabic new/existing account rates, discounts, server eligibility and authenticated content gate.');
