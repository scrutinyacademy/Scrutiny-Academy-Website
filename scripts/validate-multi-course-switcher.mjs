import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { COURSE_CATALOG, entitledCourses } from '../course-catalog.js';

const root=path.resolve(import.meta.dirname,'..');
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const studentHtml=read('student.html');
const studentJs=read('student.js');
const paymentJs=read('payment.js');
const paymentHtml=read('payment.html');
const backend=read('functions/index.js');
const courseIds=Object.keys(COURSE_CATALOG);

assert.deepEqual(courseIds,['class8','class10','class11','class12','neet','jee','mbbs']);
assert.ok(studentHtml.includes('id="courseSwitchMenu"'));
assert.ok(studentHtml.includes('id="courseSwitchList"'));
assert.ok(studentJs.includes('Object.entries(COURSE_CATALOG)'),'Switcher must render every catalog course');
assert.ok(studentJs.includes('payment.html?course=${id}'),'Locked courses must open their selected payment flow');
assert.ok(studentJs.includes('data-switch-course'),'Owned courses must remain switchable');
assert.ok(paymentHtml.includes('id="successDashboardLink"'));
assert.ok(paymentJs.includes('student.html?course='),'Payment success must return to the newly purchased course');
assert.ok(backend.includes('new FieldPath("courseEntitlements", courseId)'),'Backend must merge a course-specific entitlement');
assert.ok(backend.includes('FieldValue.arrayUnion(courseId)'),'Backend must preserve earlier enrolments');

const multi=entitledCourses({courseEntitlements:{neet:{status:'active'},class11:{status:'active'},mbbs:{status:'pending'}}});
assert.deepEqual(multi.sort(),['class11','neet']);
console.log('Validated seven-course discovery, locked-course payment routes, multi-entitlement preservation, and same-account post-payment switching.');
