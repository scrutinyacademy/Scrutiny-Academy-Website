import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const data=read('data/neet/biology.json');
const offsets={cell:84,biomolecules:103,division:119};
const sources=Object.fromEntries(Object.keys(offsets).map(s=>[s,read(`data/sources/${s}.json`)]));
let checked=0;
for(const n of [8,9,10]) {
  const ch=data.chapters.find(c=>c.id===`neet-biology-11-${n}`);
  assert.equal(ch.mcqs.length,180);
  const counts={};
  for(const q of ch.mcqs) {
    counts[q.questionType]=(counts[q.questionType]||0)+1;
    assert.ok(q.references.length,`Missing references: ${q.id}`);
    assert.equal(q.options.length,4);
    assert.equal(new Set(q.options).size,4);
    assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
    for(const ref of q.references) {
      const s=sources[ref.source];assert.ok(s);
      assert.equal(ref.printedPage,ref.pdfPage+offsets[ref.source]);
      const block=s.pages[ref.pdfPage-1].paragraphs.find(b=>b.paragraph===ref.paragraph);
      assert.ok(block,`Missing paragraph: ${q.id}`);
      assert.equal(block.lineStart,ref.lineStart);assert.equal(block.lineEnd,ref.lineEnd);
      assert.equal(block.lines.length,ref.lineEnd-ref.lineStart+1);
    }
    if(q.table) {
      assert.equal(q.questionType,'table');
      assert.equal(q.table.headers.length,2);assert.equal(q.table.rows.length,3);
      // Independently resolve the mapping using the authored concept catalogue.
      const rows=fs.readFileSync(path.join(root,`scripts/biology-concepts/${ch.questionBank.sourceId}-sourced.txt`),'utf8').split('\n').filter(l=>l&&!l.startsWith('#')).map(l=>l.split('|'));
      const answers=new Map(rows.map(r=>[r[0],r[1]]));
      const listII=q.table.rows.map(r=>r[1].slice(3));
      const map=q.table.rows.map((r,i)=>`${'ABC'[i]}–${listII.indexOf(answers.get(r[0].slice(3)))+1}`).join(', ');
      assert.equal(q.options[q.answer],map,`Wrong table key: ${q.id}`);
      assert.ok(!map.includes('–0'));
    }
    if(q.questionType==='concept') {
      const rows=fs.readFileSync(path.join(root,`scripts/biology-concepts/${ch.questionBank.sourceId}-sourced.txt`),'utf8').split('\n').filter(l=>l&&!l.startsWith('#')).map(l=>l.split('|'));
      const row=rows.find(r=>q.question===`Select the correct entry: ${r[0]}.`);
      assert.equal(q.options[q.answer],row[1],`Wrong concept key: ${q.id}`);
    }
    if(q.questionType==='statement') {
      const rows=fs.readFileSync(path.join(root,`scripts/biology-concepts/${ch.questionBank.sourceId}-sourced.txt`),'utf8').split('\n').filter(l=>l&&!l.startsWith('#')).map(l=>l.split('|'));
      const values=new Map(rows.map(r=>[r[0],r[1]]));
      const matches=[...q.question.matchAll(/“([^”]+)” is correctly associated with “([^”]+)”/g)];
      assert.equal(matches.length,2);
      const [a,b]=matches.map(m=>values.get(m[1])===m[2]);
      assert.equal(q.options[q.answer],a?(b?'Both I and II are correct':'Only I is correct'):(b?'Only II is correct':'Neither I nor II is correct'));
    }
    if(q.image) {
      assert.equal(q.questionType,'image');assert.ok(q.image.alt);
      const img=fs.readFileSync(path.join(root,q.image.src));
      assert.equal(img[0],255);assert.equal(img[1],216);assert.ok(img.length>1000);
      assert.ok(sources[q.image.source].pages[q.image.pdfPage-1]);
      const rows=fs.readFileSync(path.join(root,`scripts/biology-concepts/${ch.questionBank.sourceId}-images.txt`),'utf8').split('\n').filter(l=>l&&!l.startsWith('#')).map(l=>l.split('|'));
      assert.equal(q.options[q.answer],rows.find(r=>r[0]===q.question)[1]);
    }
    checked++;
  }
  assert.deepEqual(counts,{concept:90,table:45,statement:30,image:15});
  assert.deepEqual(counts,ch.questionBank.counts);
}
console.log(`Validated ${checked} questions, all answer mappings, source locators, 135 tables and 45 image questions.`);
