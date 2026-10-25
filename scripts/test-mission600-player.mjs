import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root = new URL('../',import.meta.url);
const read = path => fs.readFileSync(new URL(path,root),'utf8');
const catalog=JSON.parse(read('data/mission600/catalog.json'));
function fixture(id, stale=false) {
  const nodes=new Map();
  const node=id=>{if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',hidden:false,disabled:false,value:'all',style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},querySelectorAll(){return []},scrollIntoView(){},insertAdjacentHTML(_where,html){this.innerHTML+=html}});return nodes.get(id);};
  const store=new Map();
  const ctx={URLSearchParams,console,Map,Set,Date,Intl,JSON,Number,String,Math,encodeURIComponent,
    location:{search:`?dpp=${id}`,origin:'http://test',hash:''},history:{length:1},
    document:{getElementById:node,querySelectorAll:()=>[],querySelector:()=>({offsetTop:0}),documentElement:{classList:{remove(){}}},referrer:''},
    localStorage:{getItem:key=>store.get(key)??null,setItem:(key,value)=>store.set(key,value)},
    fetch:async path=>{const data=JSON.parse(read(path));if(stale&&path.includes('/dpps/'))data[id].contentVersion='old';return {ok:true,json:async()=>data};},
  };
  ctx.window={scrollTo(){}};
  return {ctx:vm.createContext(ctx),nodes,node,store};
}
const player=read('mission600-dpp.js').replace(/initialize\(\)\.catch[\s\S]*$/,'');
for(const item of catalog.dpps){
  const f=fixture(item.id);vm.runInContext(player,f.ctx);
  await vm.runInContext('loadDpp()',f.ctx);
  assert.equal(vm.runInContext('dpp.questions.length',f.ctx),30);
  vm.runInContext('dpp.questions.forEach((q,i)=>state.answers[i]=q.answer)',f.ctx);
  const result=vm.runInContext('analyseAttempt()',f.ctx);
  assert.equal(result.correct,30);assert.equal(result.accuracy,100);
  vm.runInContext('submitDpp()',f.ctx);
  assert.match(f.node('dppResult').innerHTML,/30 \/ 30/);
  assert.match(f.node('dppResult').innerHTML,/Review every answer/);
  assert.equal(JSON.parse(f.store.get('mission600DppAttempts')).length,1);
  vm.runInContext('submitDpp()',f.ctx);
  assert.equal(JSON.parse(f.store.get('mission600DppAttempts')).length,1);
}
const navigation=fixture(catalog.dpps[0].id);vm.runInContext(player,navigation.ctx);
await vm.runInContext('initialize()',navigation.ctx);
assert.match(navigation.node('dppMeta').textContent,/30 MCQs/);
for(let step=0;step<29;step++)navigation.node('nextQuestion').onclick();
assert.equal(navigation.node('progressText').textContent,'Question 30 of 30');
assert.equal(navigation.node('nextQuestion').disabled,true);
navigation.node('previousQuestion').onclick();
assert.equal(navigation.node('progressText').textContent,'Question 29 of 30');
const f=fixture(catalog.dpps[0].id);vm.runInContext(player,f.ctx);await vm.runInContext('loadDpp()',f.ctx);
vm.runInContext('state.answers[0]=dpp.questions[0].answer;state.answers[1]=(dpp.questions[1].answer+1)%4',f.ctx);
const mixed=vm.runInContext('analyseAttempt()',f.ctx);
assert.equal(mixed.correct,1);assert.equal(mixed.wrong,1);assert.equal(mixed.unanswered,28);assert.equal(mixed.accuracy,3);
assert.equal(vm.runInContext(`escapeHtml('<script>')`,f.ctx),'&lt;script&gt;');
const stale=fixture(catalog.dpps[0].id,true);vm.runInContext(player,stale.ctx);await assert.rejects(vm.runInContext('loadDpp()',stale.ctx),/being updated/);
const missing=fixture('missing');vm.runInContext(player,missing.ctx);await assert.rejects(vm.runInContext('loadDpp()',missing.ctx),/not found/);
const portal=read('mission600.js').replace(/^import .*;\n/gm,'').replace(/const app = initializeApp[\s\S]*$/,'');
const pf=fixture('');vm.runInContext(portal,pf.ctx);await vm.runInContext('loadCatalog()',pf.ctx);
pf.node('dppSearch').value='';
vm.runInContext('resolveCurrentWeek();setupFilters();renderDpps()',pf.ctx);
assert.equal((pf.node('dppStore').innerHTML.match(/data-dpp-action=/g)||[]).length,171);
pf.node('dppSubject').value='biology';pf.node('dppDifficulty').value='Hard';pf.node('dppWeek').value='2';pf.node('dppSearch').value='';
vm.runInContext('renderDpps()',pf.ctx);assert.equal((pf.node('dppStore').innerHTML.match(/data-dpp-action=/g)||[]).length,3);
pf.node('dppSearch').value='Nutrition';vm.runInContext('renderDpps()',pf.ctx);assert.equal((pf.node('dppStore').innerHTML.match(/data-dpp-action=/g)||[]).length,1);
pf.node('dppSearch').value='no such chapter';vm.runInContext('renderDpps()',pf.ctx);assert.match(pf.node('dppStore').innerHTML,/No DPP matches/);
vm.runInContext('renderCalendar()',pf.ctx);assert.equal((pf.node('calendarContent').innerHTML.match(/mission600-dpp.html\?dpp=/g)||[]).length,171);
vm.runInContext(`renderCalendar('calendar')`,pf.ctx);assert.equal((pf.node('calendarContent').innerHTML.match(/mission600-dpp.html\?dpp=/g)||[]).length,171);
console.log('PASS: all 171 player loads and perfect-score submissions; mixed answers, duplicate submission, missing/stale content, filters and 171 calendar links in both views. DOM is simulated; this is not a browser rendering test.');
