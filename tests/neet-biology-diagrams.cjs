const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const manifest=JSON.parse(fs.readFileSync('data/neet/diagrams/class11-biology.json','utf8'));
assert.equal(manifest.chapters.length,19);assert.equal(manifest.items.length,160);assert.equal(new Set(manifest.items.map(i=>i.id)).size,160);
for(const item of manifest.items){assert(fs.statSync(item.src).size>1000,item.src);assert(item.width>100&&item.height>100);assert(item.page>=1&&item.page<=252);}
for(const chapter of manifest.chapters)assert(manifest.items.some(i=>i.chapter===chapter.number));
assert.equal(manifest.items.filter(i=>i.reference==='Figure 10.2').length,2,'both pages of mitosis must survive');
const nodes=new Map(),events=new Map();
class Node {constructor(id){this.id=id;this.value='';this.hidden=false;this.handlers={};nodes.set(id,this)}setAttribute(k,v){this[k]=v}addEventListener(k,f){this.handlers[k]=f}showModal(){this.open=true}close(){this.open=false}click(){this.handlers.click?.({target:this})}closest(){return this}}
for(const id of ['chapterSearch','chapterList','chapterSelect','visualSearch','chapterNumber','chapterTitle','chapterSummary','viewer','emptyState','emptyMessage','visualSelect','visualList','visualImage','visualKind','visualTitle','sourceNote','position','previousButton','nextButton','zoomTitle','zoomImage','zoomDialog','openZoom','zoomButton','closeZoom','resetFilters','retryLoad','loadError','libraryCount'])new Node(id);
const filters=['all','diagram','table'].map(type=>{const n=new Node(type);n.dataset={filter:type};return n});
let fetched=0;
const ctx={console,Number,String,Set,Image:class{},document:{getElementById:id=>nodes.get(id),querySelectorAll:selector=>selector==='[data-filter]'?filters:[],addEventListener:(k,v)=>events.set(k,v)},history:{replaceState(){}},location:{hash:''},fetch:async()=>{fetched++;return{ok:true,json:async()=>manifest}}};ctx.window=ctx;ctx.addEventListener=(k,v)=>events.set(k,v);
vm.runInNewContext(fs.readFileSync('neet-biology-diagrams.js','utf8'),ctx);
assert.equal(fetched,0,'wait for authenticated NEET context');ctx.__scrutinyStudentContext={activeCourse:'neet'};events.get('scrutiny:dashboard-context')();
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{await tick();assert.equal(nodes.get('position').textContent,'1 of 2');assert(nodes.get('previousButton').disabled);nodes.get('nextButton').click();assert.equal(nodes.get('position').textContent,'2 of 2');assert(nodes.get('nextButton').disabled);assert.match(nodes.get('visualTitle').textContent,/TABLE/);
nodes.get('previousButton').click();assert.equal(nodes.get('position').textContent,'1 of 2');
for(const c of manifest.chapters){nodes.get('chapterSelect').handlers.change({target:{value:String(c.number)}});filters[0].click();const count=manifest.items.filter(i=>i.chapter===c.number).length;assert.equal(nodes.get('position').textContent,`1 of ${count}`);for(let i=1;i<count;i++)nodes.get('nextButton').click();assert.equal(nodes.get('position').textContent,`${count} of ${count}`);assert(nodes.get('nextButton').disabled);}
nodes.get('chapterSelect').handlers.change({target:{value:'8'}});filters[2].click();assert(nodes.get('viewer').hidden);assert(!nodes.get('emptyState').hidden);assert.match(nodes.get('emptyMessage').textContent,/no numbered tables/);nodes.get('resetFilters').click();assert(!nodes.get('viewer').hidden);
nodes.get('visualSearch').handlers.input({target:{value:'mitochondrion'}});assert.equal(nodes.get('position').textContent,'1 of 1');assert.match(nodes.get('visualTitle').textContent,/mitochondrion/);nodes.get('openZoom').click();assert(nodes.get('zoomDialog').open);assert.equal(nodes.get('zoomImage').src,nodes.get('visualImage').src);nodes.get('closeZoom').click();assert(!nodes.get('zoomDialog').open);
nodes.get('visualSearch').handlers.input({target:{value:'no match xxxx'}});assert(!nodes.get('emptyState').hidden);nodes.get('resetFilters').click();assert(!nodes.get('viewer').hidden);
console.log('PASS: 160 unique crops, 19 chapters, auth wait, complete Previous/Next traversal, both mitosis pages, table filters, empty states, caption search, zoom and reset.');})().catch(e=>{console.error(e);process.exitCode=1});
