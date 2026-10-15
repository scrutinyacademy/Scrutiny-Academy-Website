import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {expandChapter,semanticSignature,numericalTemplates} from '../neet-ug-expansion.mjs';
import {RELEASE,questionsForChapter,emptyProgress,readProgress,filterQuestions,recordAnswer,toggleBookmark,summarize,chapterCounts,questionVisual} from '../neet-high-yield-core.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const catalog=read('data/neet/high-yield/catalog.json'),ids=new Set(),signatures=new Set();let total=0,diagrams=0,chapters=0,numerical=0;
for(const subject of ['biology','chemistry','physics']){
 const pack=read(`data/neet/high-yield/${subject}.json`),old=read(`data/neet/${subject}.json`),existing=read(`data/neet/expansion/${subject}.json`);
 assert.equal(pack.release,RELEASE);assert.equal(pack.subject,subject);
 const prior=[...old.chapters.flatMap(c=>c.mcqs),...existing.chapters.flatMap(c=>expandChapter(c,subject))],oldIds=new Set(prior.map(q=>q.id)),oldSignatures=new Set(prior.map(semanticSignature));
 let count=0;
 for(const ch of pack.chapters){
  const qs=questionsForChapter(pack,ch.id);assert.deepEqual(qs,questionsForChapter(pack,ch.id));
  assert.equal(chapterCounts(pack,ch,emptyProgress()).total,qs.length);chapters++;
  for(const [index,q] of qs.entries()){
   assert.ok(q.id.startsWith('NEET-HY-V1-'));assert.ok(!oldIds.has(q.id)&&!ids.has(q.id));ids.add(q.id);
   const sig=semanticSignature(q);assert.ok(!oldSignatures.has(sig)&&!signatures.has(sig),q.id);signatures.add(sig);
   assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.answer>=0&&q.answer<4);assert.ok(q.explanation&&q.references.length);assert.ok(!q.verified);
   if(q.expansionKind==='match'){const right=q.table.rows.map(r=>r[1].replace(/^\d+\. /,''));const code=q.associations.map((r,i)=>`${'ABCD'[i]}–${right.indexOf(r.correct)+1}`).join(', ');assert.equal(q.options[q.answer],code);assert.match(questionVisual(q),/<table>/);}
   if(q.expansionKind==='statements'){const m=ch.specs[index][2];assert.equal(q.options[q.answer],m===3?'Both I and II are correct':m===1?'Only I is correct':m===2?'Only II is correct':'Neither I nor II is correct');}
   if(q.expansionKind==='association'){const spec=ch.specs[index],row=ch.rows[spec[1][spec[2]]];assert.equal(q.options[q.answer],`${row.label}: ${row.correct}`);assert.equal(q.questionType,'Single correct');}
   if(q.expansionKind==='numerical'){numerical++;const spec=ch.specs[index],t=numericalTemplates[ch.id][spec[1]],v=t.calc(spec[2]);assert.ok(v>0&&Number.isFinite(v));assert.equal(q.options[q.answer],Number(v.toPrecision(5)).toString()+(t.unit?' '+t.unit:''));}
   if(q.visualAsset){diagrams++;assert.ok(fs.existsSync(q.visualAsset));assert.match(questionVisual(q),/<img/);assert.ok(q.visualAlt);}
  }
  count+=qs.length;
 }
 assert.equal(count,subject==='biology'?57500:28750);assert.equal(count,catalog.subjects[subject].added);total+=count;
 console.log(`${subject}: ${count} unique additions across ${pack.chapters.length} chapters/units`);
}
assert.equal(total,115000);assert.equal(chapters,82);assert.equal(diagrams,12);assert.equal(ids.size,115000);assert.equal(signatures.size,115000);assert.ok(numerical>2400);
const pack=read('data/neet/high-yield/physics.json'),qs=questionsForChapter(pack,pack.chapters[0].id);let p=emptyProgress();
p=recordAnswer(p,qs[0],qs[0].answer,1);p=recordAnswer(p,qs[1],(qs[1].answer+1)%4,2);p=toggleBookmark(p,qs[0].id,3);
assert.equal(filterQuestions(qs,p,'new').length,qs.length-2);assert.equal(filterQuestions(qs,p,'practised').length,2);assert.equal(filterQuestions(qs,p,'incorrect').length,1);assert.equal(filterQuestions(qs,p,'bookmarks')[0].id,qs[0].id);
const counts=chapterCounts(pack,pack.chapters[0],p);assert.equal(counts.practised,2);assert.equal(counts.bookmarks,1);assert.equal(counts.incorrect,1);
p=toggleBookmark(p,qs[0].id,4);assert.equal(filterQuestions(qs,p,'bookmarks').length,0);
assert.deepEqual(summarize(qs.slice(0,3),{[qs[0].id]:qs[0].answer,[qs[1].id]:(qs[1].answer+1)%4}),{attempted:2,correct:1,incorrect:1,score:3,accuracy:50});
assert.throws(()=>recordAnswer(p,qs[0],9),/Invalid answer/);
assert.equal(readProgress({getItem:()=>'{'}).version,1);assert.match(questionVisual({table:{headers:['<script>'],rows:[['<img onerror=x>']]}}),/&lt;script&gt;/);assert.doesNotMatch(questionVisual({visualAsset:'https://unknown/x.svg'}),/<img/);
// Run the actual account-scoped storage with two student identities and reloads.
const data=new Map(),listeners=new Map(),ctx={window:null,CustomEvent:class{constructor(type,o){this.type=type;this.detail=o.detail;}},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}};ctx.window=ctx;ctx.dispatchEvent=()=>{};vm.runInNewContext(fs.readFileSync('student-storage.js','utf8'),ctx);const st=ctx.ScrutinyStudentStorage;
st.setUser({uid:'A'});st.setItem('neet_high_yield_v1',JSON.stringify(p));assert.equal(Object.keys(readProgress(st).attempts).length,2);st.setUser({uid:'B'});assert.equal(Object.keys(readProgress(st).attempts).length,0);st.setUser({uid:'A'});assert.equal(Object.keys(readProgress(st).attempts).length,2);st.setUser(null);assert.equal(Object.keys(readProgress(st).attempts).length,0);
const html=fs.readFileSync('preview-v2.html','utf8'),gate=fs.readFileSync('app-gate.js','utf8');assert.match(html,/id="high-yield"/);assert.match(html,/neet-high-yield.js\?v=7/);assert.match(gate,/sections: \["neet", "high-yield", "neet-mcq-progress", "ranker"/);assert.ok(html.indexOf('id="neet"')<html.indexOf('id="high-yield"'));
console.log(`PASS: ${total} stable unique questions distinct from all 42,650 existing questions; ${numerical} numericals; tables; ${diagrams} diagram questions; progress, filters, scoring, bookmark removal, reload and account isolation.`);
