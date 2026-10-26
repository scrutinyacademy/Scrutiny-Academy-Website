import assert from 'node:assert/strict';
import {studies} from '../quran-study-data.js';
import {surahs,pdfPages} from '../quran-index.js';
assert.equal(pdfPages,1028);
assert.deepEqual(surahs.map(s=>s.number),Array.from({length:114},(_,i)=>i+1));
assert.ok(surahs.every((s,i)=>s.page>=17&&s.page<=957&&(!i||s.page>=surahs[i-1].page)));
assert.equal(studies.length,6);
assert.equal(studies.flatMap(s=>s.questions).length,30);
const ids=new Set();
for(const s of studies){
 assert.ok(surahs.some(c=>c.number===s.surah));assert.equal(s.questions.length,5);assert.equal(s.words.length,3);
 for(const q of s.questions){assert.ok(!ids.has(q.id));ids.add(q.id);assert.equal(new Set(q.options).size,q.options.length);assert.ok(q.options.includes(q.answer));assert.ok(q.explanation.length>20);}
}
console.log('PASS: 114 ordered Surah destinations, all 1028 source pages, six guided studies and 30 unique explained questions');
