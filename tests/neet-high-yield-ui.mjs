import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import * as core from '../neet-high-yield-core.mjs';
// Minimal DOM harness executes the real UI handlers; no Firebase calls or browser dependencies.
class Node{
 constructor(attrs=''){this.children=[];this.dataset={};this.value='';this.hidden=false;this.attrs=attrs;for(const m of attrs.matchAll(/([\w-]+)="([^"]*)"/g)){if(m[1]==='id')this.id=m[2];if(m[1]==='value')this.value=m[2];if(m[1].startsWith('data-'))this.dataset[m[1].slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=m[2];}}
 set innerHTML(v){this.html=v;this.children=[...v.matchAll(/<([a-z]+)\b([^>]*)>/g)].map(m=>new Node(m[2]));for(const n of this.children){if(n.id==='hySize')n.value='20';}}
 get innerHTML(){return this.html||'';}set textContent(v){this.innerHTML=String(v);}get textContent(){return this.innerHTML;}
 querySelector(s){return this.querySelectorAll(s)[0]||null;}
 querySelectorAll(s){let matches=[];for(const n of this.children){if(s[0]==='#'?n.id===s.slice(1):n.attrs.includes(s.slice(1,-1)))matches.push(n);matches.push(...n.querySelectorAll(s));}return matches;}
 scrollIntoView(){}
}
const host=new Node(),data=new Map(),listeners=new Map();let fail=false,hold=null;
const ctx={...core,e:core.escapeHtml,console,Date,Map,Set,JSON,Number,Boolean,Error,document:{getElementById:id=>id==='high-yield'?host:null},CustomEvent:class{constructor(type,o){this.type=type;this.detail=o.detail;}},localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},fetch:async url=>{if(hold)return hold;if(fail)return {ok:false};return {ok:true,json:async()=>JSON.parse(fs.readFileSync(url.split('?')[0],'utf8'))};}};
ctx.window=ctx;ctx.addEventListener=(name,fn)=>{const a=listeners.get(name)||[];a.push(fn);listeners.set(name,a);};ctx.dispatchEvent=ev=>{for(const fn of listeners.get(ev.type)||[])fn(ev);};
vm.runInNewContext(fs.readFileSync('student-storage.js','utf8'),ctx);const storage=ctx.ScrutinyStudentStorage;
let source=fs.readFileSync('neet-high-yield.js','utf8').replace(/^import .*;\n/gm,'');source+='\nwindow.hyTest={get session(){return session;},get pack(){return pack;},get progress(){return progress;},loadSubject,renderLibrary,reset};';vm.runInNewContext("(function(){"+source+"})();",ctx);
const flush=async()=>{for(let i=0;i<6;i++)await new Promise(r=>setImmediate(r));};
function context(uid,course='neet'){storage.setUser(uid?{uid}:null);ctx.__scrutinyStudentContext={uid,activeCourse:course};ctx.dispatchEvent({type:'scrutiny:dashboard-context'});}
function click(selector){const b=host.querySelector(selector);assert.ok(b,selector);b.onclick();}
context('student-A');await flush();assert.equal(ctx.hyTest.pack.subject,'biology');assert.equal(host.querySelectorAll('[data-hy-chapter]').length,32);
click('[data-hy-chapter]');assert.equal(ctx.hyTest.session.questions.length,20);const q=ctx.hyTest.session.questions[0];click('[data-hy-answer]');assert.ok(ctx.hyTest.progress.attempts[q.id]);click('#hyBookmark');assert.equal(ctx.hyTest.progress.bookmarks[q.id].saved,true);click('#hyNext');assert.equal(ctx.hyTest.session.index,1);click('#hyFinish');assert.match(host.querySelector('#hyBody').innerHTML,/SESSION ANALYSIS/);click('#hySaved');assert.match(host.querySelector('#hyBody').innerHTML,/Bookmarks/);
// Bookmark list can reopen the saved question and remove it.
const card=host.querySelectorAll('[data-hy-chapter]').find(n=>n.dataset.hyChapter===ctx.hyTest.pack.chapters[0].id);card.onclick();assert.equal(ctx.hyTest.session.questions.length,1);assert.equal(ctx.hyTest.session.questions[0].id,q.id);click('#hyBookmark');assert.equal(ctx.hyTest.progress.bookmarks[q.id].saved,false);click('#hyBack');
// Practised entries are set aside; unattempted/skipped entries remain fresh.
host.querySelectorAll('[data-hy-view]').find(n=>n.dataset.hyView==='new').onclick();host.querySelector('#hySize').value='all';click('[data-hy-chapter]');assert.equal(ctx.hyTest.session.questions.length,core.chapterCounts(ctx.hyTest.pack,ctx.hyTest.pack.chapters[0],core.emptyProgress()).total-1);click('#hyBack');
// Subject switching and chapter search use the real handlers.
host.querySelectorAll('[data-hy-subject]').find(n=>n.dataset.hySubject==='chemistry').onclick();await flush();assert.equal(ctx.hyTest.pack.subject,'chemistry');assert.equal(host.querySelectorAll('[data-hy-chapter]').length,21);host.querySelector('#hySearch').oninput({target:{value:'kinetics'}});assert.equal(host.querySelectorAll('[data-hy-chapter]').length,1);click('[data-hy-chapter]');click('#hyBack');
host.querySelectorAll('[data-hy-subject]').find(n=>n.dataset.hySubject==='physics').onclick();await flush();assert.equal(ctx.hyTest.pack.subject,'physics');assert.equal(host.querySelectorAll('[data-hy-chapter]').length,29);
// Identity changes clear the previous student's session and state.
context('student-B');await flush();assert.equal(Object.keys(ctx.hyTest.progress.attempts).length,0);assert.equal(Object.keys(ctx.hyTest.progress.bookmarks).length,0);context('student-A');await flush();assert.equal(Object.keys(ctx.hyTest.progress.attempts).length,1);context(null);await flush();assert.equal(ctx.hyTest.session,null);assert.match(host.querySelector('#hyBody').textContent,/Sign in/);
context('student-A','class12');await flush();assert.equal(ctx.hyTest.pack,null);assert.match(host.querySelector('#hyBody').textContent,/Sign in/);
// A delayed subject load must never repopulate the UI after logout.
let resolve;hold=new Promise(r=>resolve=r);ctx.__scrutinyStudentContext={uid:'student-A',activeCourse:'neet'};storage.setUser({uid:'student-A'});vm.runInNewContext("(function(){"+source+"})();",ctx);context(null);resolve({ok:true,json:async()=>JSON.parse(fs.readFileSync('data/neet/high-yield/biology.json','utf8'))});await flush();assert.equal(ctx.hyTest.pack,null);assert.match(host.querySelector('#hyBody').textContent,/Sign in/);hold=null;
// A network failure renders a working Retry button.
const retryHost=new Node(),retryListeners=new Map();const retryCtx={...ctx,document:{getElementById:()=>retryHost},__scrutinyStudentContext:{uid:'student-A',activeCourse:'neet'},addEventListener(){}};
storage.setUser({uid:'student-A'});retryCtx.window=retryCtx;fail=true;vm.runInNewContext('(function(){'+source+'})();',retryCtx);await flush();assert.ok(retryHost.querySelector('#hyRetry'));fail=false;retryHost.querySelector('#hyRetry').onclick();await flush();assert.equal(retryCtx.hyTest.pack.subject,'biology');assert.equal(retryHost.querySelectorAll('[data-hy-chapter]').length,32);
console.log('PASS: real UI handlers — 3 subjects, chapter search, full chapter practice, answers, navigation, results, bookmark review/removal, skipped questions, account changes, logout, stale-load protection and network retry.');
