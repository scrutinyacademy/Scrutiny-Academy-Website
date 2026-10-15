import assert from 'node:assert/strict';
import fs from 'node:fs';
const pages=['class6-cbse.html','class6-mathematics.html','class8-ssc.html','class10-board.html','class10-lectures.html','mission600.html','mission600-dpp.html','mission600-submit.html','jee.html','jee-rigid-body-free.html','preview-v2.html','ncert-quest.html','neet-kota-biology.html','neet-ranker-free.html','physics-formulas.html','sa1-booster.html','sa1-booster-maths.html','sa1-booster-physical-science.html','sa1-booster-biology.html','sa1-booster-social.html','sa1-booster-model-papers.html','sa1-booster-model-papers-maths-social.html'];
for(const page of pages){const html=fs.readFileSync(new URL(`../${page}`,import.meta.url),'utf8');assert.equal((html.match(/course-section-nav\.js\?v=\d+/g)||[]).length,1,`${page} must load the shared navigator exactly once`);}
const js=fs.readFileSync(new URL('../course-section-nav.js',import.meta.url),'utf8'),css=fs.readFileSync(new URL('../course-section-nav.css',import.meta.url),'utf8'),neetss=fs.readFileSync(new URL('../neetss-surgery.html',import.meta.url),'utf8');
for(const batch of ['Class 6 CBSE','Class 8 Telangana SSC','Class 10 SSC','Class 10 SA-1 Booster','NEET-UG','IIT-JEE','Learning Portal'])assert.ok(js.includes(batch),`missing mapping ${batch}`);
for(const feature of ['aria-expanded','aria-hidden','scrollIntoView','history.back','Escape','getComputedStyle'])assert.ok(js.includes(feature),`missing navigation feature ${feature}`);
assert.ok(css.includes('safe-area-inset-bottom'));assert.ok(css.includes('@media(max-width:480px)'));assert.ok(css.includes('@media print'));
assert.ok(neetss.includes('id="courseSidebar"'),'NEET-SS must retain its protected course-specific sidebar');
console.log(`PASS: shared course-aware sidebar is installed once on ${pages.length} student pages; NEET-SS retains its secure 14-section sidebar.`);
