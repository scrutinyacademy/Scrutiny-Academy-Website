import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
class Node{
 constructor(attrs=''){this.children=[];this.dataset={};this.value='';this.hidden=false;this.attrs=attrs;for(const m of attrs.matchAll(/([\w-]+)="([^"]*)"/g)){if(m[1]==='id')this.id=m[2];if(m[1]==='value')this.value=m[2];if(m[1].startsWith('data-'))this.dataset[m[1].slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=m[2];}}
 set innerHTML(v){this.html=v;this.children=[...v.matchAll(/<([a-z]+)\b([^>]*)>/g)].map(m=>new Node(m[2]));for(const n of this.children){if(n.id==='hySize')n.value='20';}}
 get innerHTML(){return this.html||'';}set textContent(v){this.innerHTML=String(v);}get textContent(){return this.innerHTML;}
 querySelector(s){return this.querySelectorAll(s)[0]||null;}
 querySelectorAll(s){let matches=[];for(const n of this.children){if(s[0]==='#'?n.id===s.slice(1):n.attrs.includes(s.slice(1,-1)))matches.push(n);matches.push(...n.querySelectorAll(s));}return matches;}
 scrollIntoView(){}
}

const host=new Node(),listeners={};
const context={console,Image:class{},document:{getElementById:()=>host,querySelectorAll:()=>[]},fetch:async()=>({ok:true,json:async()=>JSON.parse(fs.readFileSync('data/neet/diagrams/catalog.json'))}),__scrutinyStudentContext:{uid:'test',activeCourse:'neet'},addEventListener:(n,fn)=>listeners[n]=fn};context.window=context;
vm.runInNewContext(fs.readFileSync('neet-diagrams.js','utf8'),context);
await new Promise(r=>setImmediate(r));
const click=s=>host.querySelector(s).onclick();const change=(s,value)=>host.querySelector(s).onchange({target:{value}});
assert.match(host.innerHTML,/Diagrams &amp; Tables/);assert.equal(host.hidden,false);assert.match(host.querySelector('#dvContent').innerHTML,/Figure 1.1/);
click('#dvNext');assert.match(host.querySelector('#dvContent').innerHTML,/Organisms with their Taxonomic/);click('#dvPrevious');assert.match(host.querySelector('#dvContent').innerHTML,/Figure 1.1/);
change('#dvKind','table');assert.match(host.querySelector('#dvContent').innerHTML,/Organisms with their Taxonomic/);change('#dvChapter','plant-kingdom');assert.match(host.querySelector('#dvContent').innerHTML,/Divisions of Algae/);
host.querySelectorAll('[data-dv-subject]').find(n=>n.dataset.dvSubject==='physics').onclick();assert.match(host.querySelector('#dvContent').innerHTML,/No tables/);change('#dvKind','all');change('#dvJump','29');assert.match(host.querySelector('#dvContent').innerHTML,/30 of 30/);assert.match(host.querySelector('#dvContent').innerHTML,/id="dvNext" disabled/);
context.__scrutinyStudentContext={uid:'test',activeCourse:'class12'};listeners['scrutiny:dashboard-context']();assert.equal(host.hidden,true);assert.equal(host.innerHTML,'');
context.__scrutinyStudentContext={uid:'test',activeCourse:'neet'};listeners['scrutiny:dashboard-context']();assert.equal(host.hidden,false);
const cat=JSON.parse(fs.readFileSync('data/neet/diagrams/catalog.json'));assert.equal(cat.chapters.length,22);assert.equal(cat.chapters.flatMap(c=>c.items).length,231);for(const c of cat.chapters)for(const i of c.items){assert.ok(fs.existsSync(i.image));assert.ok(i.width>100&&i.height>100);}
console.log('PASS: subject/chapter/type selection, previous/next, final item, direct jump, empty tables, course switching and 231 crop assets.');
