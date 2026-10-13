import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {expandChapter,mergeExpansion,semanticSignature,numericalTemplates} from '../neet-ug-expansion.mjs';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const catalog=read('data/neet/expansion/catalog.json');
const ids=new Set(),signatures=new Set(),positions=[0,0,0,0];
let total=0,numerical=0;
for(const subject of ['biology','physics','chemistry']){
 const pack=read(`data/neet/expansion/${subject}.json`),base=read(`data/neet/${subject}.json`),merged=mergeExpansion(base,pack);
 assert.equal(pack.subject,subject);
 const added=pack.chapters.flatMap(ch=>expandChapter(ch,subject));
 assert.equal(added.length,subject==='biology'?7500:3750);
 assert.equal(merged.chapters.length,catalog.subjects[subject].chapters);
 assert.equal(merged.chapters.flatMap(c=>c.mcqs).length,catalog.subjects[subject].previous+added.length);
 // All old questions and IDs remain byte-for-byte unchanged after loading additions.
 for(const ch of base.chapters){const live=merged.chapters.find(c=>c.id===ch.id);assert.deepEqual(live.mcqs.slice(0,ch.mcqs.length),ch.mcqs);}
 assert.deepEqual(pack.chapters.flatMap(ch=>expandChapter(ch,subject)),added,'Repeat loads must preserve identity and content');
 const oldIds=new Set(base.chapters.flatMap(c=>c.mcqs.map(q=>q.id)));
 const oldSignatures=new Set(base.chapters.flatMap(c=>c.mcqs.map(semanticSignature)));
 for(const ch of pack.chapters){
  const qs=expandChapter(ch,subject);
  for(const [i,q] of qs.entries()){
   assert.ok(!ids.has(q.id)&&!oldIds.has(q.id),q.id);ids.add(q.id);
   const sig=semanticSignature(q);assert.ok(!oldSignatures.has(sig),`Existing content repeated: ${q.id}`);assert.ok(!signatures.has(sig),`Repeated content: ${q.id}`);signatures.add(sig);
   assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4,q.id);
   assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4,q.id);
   assert.ok(q.question&&q.explanation&&q.references.length,q.id);
   assert.ok(!q.verified,'Do not claim expert verification from automated generation');
   positions[q.answer]++;
   if(q.expansionKind==='match'){
    const right=q.table.rows.map(r=>r[1].replace(/^\d+\. /,''));
    const code=q.associations.map((r,j)=>`${'ABCD'[j]}–${right.indexOf(r.correct)+1}`).join(', ');
    assert.equal(q.options[q.answer],code,q.id);
    assert.ok(q.table.rows.every(r=>r.length===2));
   }else if(q.expansionKind==='statements'){
    const mask=ch.specs[i][2];
    const expected=mask===3?'Both I and II are correct':mask===1?'Only I is correct':mask===2?'Only II is correct':'Neither I nor II is correct';
    assert.equal(q.options[q.answer],expected,q.id);
   }else{
    numerical++;
    const spec=ch.specs[i],t=numericalTemplates[ch.id][spec[1]],value=t.calc(spec[2]);
    assert.ok(Number.isFinite(value)&&value>0,q.id);
    assert.equal(q.options[q.answer],Number(value.toPrecision(5)).toString()+(t.unit?' '+t.unit:''),q.id);
   }
  }
 }
 total+=added.length;
 console.log(`${subject}: +${added.length}; live total ${merged.chapters.flatMap(c=>c.mcqs).length}; ${merged.chapters.length} chapters/units`);
}
assert.equal(total,15000);assert.equal(ids.size,15000);assert.equal(signatures.size,15000);
assert.ok(numerical>1300);assert.ok(Math.max(...positions)-Math.min(...positions)<100);
// Independent hand-calculated cases exercise units, sign conventions and core formulae.
const val=(id,inputs)=>numericalTemplates[id][0].calc(inputs);
assert.equal(val('neet-physics-11-2',[4,3,5]),19);
assert.equal(val('neet-physics-12-1',[2,3,.3]),.6);
assert.equal(val('neet-physics-12-2',[10,20]),.002);
assert.equal(val('neet-physics-12-6',[100,.002,.1]),2);
assert.equal(val('neet-physics-12-9',[10,2]),20);
assert.equal(val('neet-chemistry-11-5',[500,200]),300);
assert.equal(val('neet-chemistry-12-2',[193000,63.5]),63.5);
assert.ok(Math.abs(val('neet-chemistry-12-3',[Math.LN2/100])-100)<1e-10);
const core=fs.readFileSync(path.join(root,'v2-core.js'),'utf8');assert.match(core,/engine\.mergeExpansion\(d, await response\.json\(\)\)/);
assert.throws(()=>mergeExpansion({subject:'Physics',chapters:[]},{subject:'biology',version:1,chapters:[]}),/mismatch/);
console.log(`PASS: ${total} stable, content-distinct additions; ${numerical} numerical problems; balanced answer positions ${positions.join('/')}; existing bank preserved.`);
