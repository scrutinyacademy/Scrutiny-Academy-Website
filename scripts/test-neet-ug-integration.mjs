import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import * as engine from '../neet-ug-expansion.mjs';
const root=path.resolve(import.meta.dirname,'..');
const raw=fs.readFileSync(path.join(root,'v2-core.js'),'utf8');
const code=raw.replace('import("./neet-ug-expansion.mjs?v=20261014")','importExpansion()').replace(/  init\(\);\s*\}\)\(\);\s*$/, 'window.__test = {load, state};\n})();');
const counts=new Map();
const context={window:{addEventListener(){}},URLSearchParams,location:{search:''},importExpansion:async()=>engine,
 fetch:async url=>{const file=url.split('?')[0];counts.set(file,(counts.get(file)||0)+1);const data=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));return {ok:true,json:async()=>data};}};
vm.runInNewContext(code,context);
const load=context.window.__test.load;
const [one,two]=await Promise.all([load('data/neet/biology.json'),load('data/neet/biology.json')]);
assert.equal(one,two);assert.equal(counts.get('data/neet/biology.json'),1);assert.equal(counts.get('data/neet/expansion/biology.json'),1);
assert.equal(one.chapters.flatMap(c=>c.mcqs).length,18700);
assert.equal((await load('data/neet/physics.json')).chapters.flatMap(c=>c.mcqs).length,13550);
assert.equal((await load('data/neet/chemistry.json')).chapters.flatMap(c=>c.mcqs).length,10400);
// Saved matching-table rendering, including escaping table cells.
const tools=fs.readFileSync(path.join(root,'learning-tools.js'),'utf8');
const functionText=tools.slice(tools.indexOf('function compactQuestion('),tools.indexOf('function captureMistakes('))+tools.slice(tools.indexOf('function questionTable('),tools.indexOf('function renderTools('));
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toolContext={esc:escape,stableId:q=>q.id,activeCourseId:()=> 'neet',referenceText:()=>''};
vm.runInNewContext(functionText+';globalThis.test={compactQuestion,questionTable,questionCard};',toolContext);
const match=one.chapters[0].mcqs.find(q=>q.expansionKind==='match');
const saved=toolContext.test.compactQuestion({...match,correctIndex:match.answer});
assert.deepEqual(JSON.parse(JSON.stringify(saved.table)),match.table);
assert.match(toolContext.test.questionCard(saved),/List I/);
assert.match(toolContext.test.questionTable({table:{headers:['<script>'],rows:[['<img onerror=alert(1)>']]}}),/&lt;script&gt;/);
assert.match(raw,/table: q\.table \|\| null/);
// Failed pack fetches remain visible and retryable, rather than caching a partial bank.
const failures={...context,window:{addEventListener(){}},fetch:async url=>url.includes('expansion')?{ok:false}:{ok:true,json:async()=>JSON.parse(fs.readFileSync(path.join(root,url),'utf8'))}};
vm.runInNewContext(code,failures);
await assert.rejects(failures.window.__test.load('data/neet/physics.json'),/could not load/);
failures.fetch=context.fetch;
assert.equal((await failures.window.__test.load('data/neet/physics.json')).chapters.flatMap(c=>c.mcqs).length,13550);
console.log('PASS: portal loaders, concurrent requests, 42,650 live MCQs, saved matching tables, HTML escaping, and retry after failed pack fetch.');
