const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const listeners = new Map();
const nodes = new Map();
const data = new Map([['scrutiny_v2_progress', JSON.stringify({sessions:[{id:'founder'}]})]]);
let tick;
let now = Date.parse('2028-05-07T13:59:02+05:30');
const realDate = Date;
class TestDate extends realDate { static now() { return now; } }
const context = vm.createContext({
 console, URLSearchParams, Map, Set, Date:TestDate,
 location:{search:''}, navigator:{},
 localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},
 CustomEvent:class {constructor(type, options={}) {this.type=type;this.detail=options.detail;}},
 document:{documentElement:{dataset:{course:'neet'}},getElementById:id=>nodes.get(id)||null,head:{appendChild:e=>nodes.set(e.id,e)},
 createElement:()=>({setAttribute(){},querySelectorAll(){return this.units ||= Array.from({length:4},()=>({textContent:''}));},remove(){nodes.delete(this.id);}})},
 setInterval:fn=>{tick=fn;return 1;},clearInterval:()=>{tick=null;},setTimeout:fn=>{context.pendingTimer=fn;return 1;},clearTimeout:()=>{context.pendingTimer=null;},
});
context.window=context;
context.addEventListener=(name,cb)=>{const list=listeners.get(name)||[];list.push(cb);listeners.set(name,list);};
context.dispatchEvent=event=>{for(const cb of listeners.get(event.type)||[])cb(event);};
const run = file => vm.runInContext(fs.readFileSync(file,'utf8'),context);
run('student-storage.js');
const storage=context.ScrutinyStudentStorage;
assert.equal(storage.getItem('scrutiny_v2_progress'),null);
storage.setItem('scrutiny_v2_progress','unauthed');
assert.equal(data.size,1);
for(const id of ['pAttempts','pCorrect','pAccuracy','pSessions','recentSessions','quizDialog','rankerDnaSummary'])nodes.set(id,{open:false});
let core=fs.readFileSync('v2-core.js','utf8').replace('  init();\n})();','  window.coreTest = { getProgress, saveSession, renderProgress };\n})();');
vm.runInContext(core,context);
storage.setUser({uid:'founder'});
assert.equal(context.coreTest.getProgress().sessions.length,0,'shared legacy history is not imported');
context.coreTest.saveSession({id:'a',courseId:'neet',attempted:10,correct:7,total:10,title:'Founder test',accuracy:70});
context.coreTest.renderProgress();
assert.equal(nodes.get('pAttempts').textContent,10);
storage.setUser({uid:'student-B'});
assert.equal(nodes.get('pAttempts').textContent,0,'switching immediately clears displayed progress');
assert.equal(context.coreTest.getProgress().sessions.length,0);
context.coreTest.saveSession({id:'b',courseId:'neet',attempted:5,correct:5,total:5,title:'B test',accuracy:100});
storage.setUser({uid:'founder'});
assert.equal(context.coreTest.getProgress().sessions[0].id,'a');
storage.setUser(null);
assert.equal(nodes.get('pSessions').textContent,0);
assert.equal(storage.getItem('scrutiny_v2_progress'),null);
// Execute the actual cloud merge and debounce code with controlled delayed reads.
let resolver;
const writes=[];
context.getDoc=()=>new Promise(resolve=>resolver=resolve);
context.doc=(_db,_collection,uid)=>uid;
context.setDoc=async(ref,payload)=>writes.push({ref,payload});
context.serverTimestamp=()=>0;
context.getApps=()=>[{}];context.getApp=()=>({});context.getFirestore=()=>({});
let cloud=fs.readFileSync('learning-tools.js','utf8').replace(/^import[\s\S]*?;\n/gm,'');
cloud=cloud.replace('bindInterface();\nrenderTools();\nstartCloudSync();','');
cloud+='\nwindow.cloudTest={pullCloud,scheduleCloudSync,setCurrent:(u,ready=false)=>{currentUser=u;cloudReady=ready;}};';
vm.runInContext(cloud,context);
(async()=>{
 storage.setUser({uid:'founder'});context.cloudTest.setCurrent({uid:'founder'});
 const pending=context.cloudTest.pullCloud({}, {uid:'founder'}, storage.generation);
 storage.setUser({uid:'student-B'});context.cloudTest.setCurrent({uid:'student-B'});
 resolver({exists:()=>true,data:()=>({sessions:[{id:'late-founder'}]})});await pending;
 assert.equal(writes.length,0,'late cloud response cannot write to the next account');
 assert.equal(context.coreTest.getProgress().sessions[0].id,'b');
 context.cloudTest.setCurrent({uid:'student-B'},true);context.cloudTest.scheduleCloudSync();
 const staleTimer=context.pendingTimer;
 storage.setUser({uid:'founder'});context.cloudTest.setCurrent({uid:'founder'});
 await staleTimer();assert.equal(writes.length,0,'queued sync cannot cross accounts');
 const ownPull=context.cloudTest.pullCloud({}, {uid:'founder'}, storage.generation);
 resolver({exists:()=>true,data:()=>({sessions:[{id:'cloud-a',completedAt:'2028-01-01'}],mistakes:[],bookmarks:[]})});await ownPull;
 assert.equal(writes[0].ref,'founder');
 assert.equal(context.coreTest.getProgress().sessions.length,2,'own local and cloud sessions merge');
 nodes.set('platformLogout',{before:e=>{nodes.set(e.id,e);context.timerBeforeLogout=true;}});
 run('neet-countdown.js');
 context.dispatchEvent(new context.CustomEvent('scrutiny:dashboard-context',{detail:{activeCourse:'neet',availableCourses:['neet']}}));
 const timer=nodes.get('neet2028Countdown');assert.ok(timer);assert.ok(context.timerBeforeLogout);
 assert.deepEqual(Array.from(timer.units,x=>x.textContent),['00','00','00','58']);
 now+=1000;tick();assert.equal(timer.units[3].textContent,'57','seconds tick');
 context.dispatchEvent(new context.CustomEvent('scrutiny:dashboard-context',{detail:{activeCourse:'class10',availableCourses:['neet','class10']}}));
 assert.equal(nodes.has('neet2028Countdown'),false,'countdown is scoped to NEET portal');
 console.log('PASS: legacy isolation, account switching, logout, cloud merge, delayed reads, queued writes, countdown placement and ticking');
})().catch(error=>{console.error(error);process.exitCode=1;});
