import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const manifest=read('data/manifest.json');
const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'data/prebundled_data.js'),'utf8'),context);
const bundle=JSON.parse(JSON.stringify(context.window.SCRUTINY_DATA));
assert.deepEqual(manifest,bundle.manifest);
const expected={class11:{botany:14,zoology:8,physics:14,chemistry:10},class12:{botany:14,zoology:8,physics:16,chemistry:13}};
const neet=[];
let biologyMcqs=0;
for(const cat of manifest.categories) for(const sub of cat.subjects){
  const data=read(sub.file);assert.deepEqual(data,bundle[cat.id][sub.id],`Stale bundle: ${sub.file}`);
  if(expected[cat.id]) assert.equal(data.chapters.length,expected[cat.id][sub.id]);
  assert.equal(new Set(data.chapters.map(c=>c.id)).size,data.chapters.length);
  for(const ch of data.chapters){
    if(cat.id==='neet') assert.ok([11,12].includes(ch.classLevel));
    for(const q of ch.mcqs || []){
      assert.ok(q.options?.length>=2 && Number.isInteger(q.answer) && q.answer>=0 && q.answer<q.options.length,`Invalid MCQ: ${q.id}`);
      if(cat.id==='neet') {
        neet.push(q.id);
        if(sub.id==='biology') biologyMcqs++;
        assert.equal(q.options.length,4,`NEET MCQ must have four options: ${q.id}`);
        assert.ok(q.explanation?.trim(),`Missing explanation: ${q.id}`);
      }
    }
  }
}
assert.equal(biologyMcqs,180);assert.equal(neet.length,223);assert.equal(new Set(neet).size,223);
assert.equal(bundle.class11.botany.source.academicYear,'2026-2027');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
 const ref=match[1];if(/^(https?:|mailto:|tel:|upi:)/.test(ref))continue;
 assert.ok(fs.existsSync(path.join(root,ref)),`Missing asset: ${ref}`);
}
console.log('Validated 97 board chapters, 180 Biology MCQs, 223 unique NEET MCQs, manifest/bundle parity and local HTML assets.');
