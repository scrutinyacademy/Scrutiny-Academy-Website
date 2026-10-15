const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map(),listeners=new Map(),data=new Map();
class Node{
 constructor(id){this.id=id;this.children=[];this.handlers={};this.style={setProperty:(k,v)=>{this[k]=v}};this.classList={add(){}};if(id)nodes.set(id,this);}
 set innerHTML(value){this.html=value;for(const m of value.matchAll(/id="([^"]+)"/g)) new Node(m[1]);}
 get innerHTML(){return this.html||'';}
 append(node){if(node.parentElement)node.parentElement.children=node.parentElement.children.filter(n=>n!==node);this.children.push(node);node.parentElement=this;}
 before(){}removeAttribute(){}setAttribute(k,v){this[k]=v;if(k==='id')nodes.set(v,this);}
 addEventListener(k,fn){this.handlers[k]=fn;}dispatchEvent(e){this.lastEvent=e;}
 querySelector(selector){return this.selectors?.[selector]||null;}querySelectorAll(){return this.list||[];}
 closest(selector){return this.closestMap?.[selector]||null;}
}
const home=new Node('home'),copy=new Node(),actions=new Node();home.selectors={'h1':new Node(),'.hero-copy > p':new Node(),'.hero-actions a':new Node(),'.hero-copy > .eyebrow':new Node(),'.hero-actions':actions};
const practiceHead=new Node();new Node('neet').list=[new Node(),practiceHead];new Node('metricChapters');new Node('neetSubject');const header=new Node(),navLink=new Node();
const ctx={console,Date,Intl,Number,Boolean,Map,Set,JSON,Error,MutationObserver:class{observe(){}},CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},Event:class{constructor(type){this.type=type;}},document:{documentElement:{style:{setProperty(){}}},getElementById:id=>nodes.get(id),createElement:()=>new Node(),querySelector:s=>s==='.header-session-actions'?header:navLink},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},location:{},fetch:async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('data/neet/mcq-inventory.json','utf8'))})};
ctx.window=ctx;ctx.addEventListener=(type,fn)=>{if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn)};ctx.dispatchEvent=event=>{for(const fn of listeners.get(event.type)||[])fn(event)};
vm.runInNewContext(fs.readFileSync('student-storage.js','utf8'),ctx);vm.runInNewContext(fs.readFileSync('neet-dashboard.js','utf8'),ctx);
assert.equal(nodes.has('ndTotal'),false,'dashboard must wait for authentication');
function context(uid,course='neet'){ctx.ScrutinyStudentStorage.setUser({uid});ctx.__scrutinyStudentContext={uid,activeCourse:course};ctx.dispatchEvent({type:'scrutiny:dashboard-context'});}
(async()=>{
context('student-A','mbbs');assert.equal(nodes.has('ndTotal'),false,'other courses retain their UI');
context('student-A');await new Promise(r=>setImmediate(r));
const inventory=JSON.parse(fs.readFileSync('data/neet/mcq-inventory.json','utf8'));
assert.equal(nodes.get('ndTotal').textContent,inventory.totalPublishedMcqs.toLocaleString('en-IN'));
assert.equal(nodes.get('ndHighYield').textContent,inventory.sections.highYield.toLocaleString('en-IN'));
assert.equal(nodes.get('nd-biology-count').textContent,inventory.bySubject.biology.total.toLocaleString('en-IN')+' MCQs');
assert.equal(nodes.get('ndChapterMetric').children[0].id,'metricChapters','existing live chapter metric retained');
assert.equal(nodes.get('neetChapterPractice'),practiceHead,'chapter links target real practice heading');
ctx.dispatchEvent({type:'scrutiny:neet-dashboard-stats',detail:{total:{attempted:20,correct:14,incorrect:6}}});
assert.equal(nodes.get('ndAccuracy').textContent,'70%');assert.equal(nodes.get('ndIncorrect').textContent,'6');
const checkbox={dataset:{task:'0'},checked:true};home.handlers.change({target:{closest:()=>checkbox}});
assert.match(nodes.get('ndMissionTasks').innerHTML,/data-task="0" checked/);
const button={dataset:{ndSubject:'physics'}};home.handlers.click({target:{closest:()=>button}});assert.equal(nodes.get('neetSubject').value,'physics');assert.equal(ctx.location.hash,'neetChapterPractice');
context('student-B');assert.doesNotMatch(nodes.get('ndMissionTasks').innerHTML,/data-task="0" checked/);assert.equal(nodes.get('ndPractised').textContent,'—');
context('student-A');assert.match(nodes.get('ndMissionTasks').innerHTML,/data-task="0" checked/);
ctx.dispatchEvent({type:'scrutiny:neet-dashboard-stats',detail:{total:{attempted:0,correct:0,incorrect:0}}});assert.equal(nodes.get('ndAccuracy').textContent,'—','empty record must not fabricate accuracy');
console.log('PASS: authenticated NEET-only mounting, real inventory, metric preservation, subject selection, accuracy, daily missions and account isolation.');
})().catch(error=>{console.error(error);process.exitCode=1});
