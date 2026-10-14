import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {expandChapter, semanticSignature, numericalTemplates} from '../neet-ug-expansion.mjs';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function extract(file,start,end,name){const s=read(file);return vm.runInNewContext(s.slice(s.indexOf(start),s.indexOf(end))+`;${name}`,{}, {timeout:5000});}
const bio12=extract('scripts/build-complete-neet-biology.mjs','const banks =','const currentIds','banks');
const chem12=extract('scripts/build-neet-biology-chemistry-250.mjs','const class12ConceptText =','function parseConcepts','class12ConceptText');
const phy11=extract('scripts/build-class11-physics-bank.mjs','const C =','function fmt','chapters');
const chem11=extract('scripts/build-class11-chemistry-bank.mjs','const C =','const Q =','chapters');
const phy12=extract('scripts/add-neet-physics-mcqs.mjs','const ref=','function fmt','chapters');
const extra=JSON.parse(read('data/neet/expansion/supplemental-concepts.json'));
const bios=['living-world','biological-classification','plant-kingdom','animal-kingdom','morphology-flowering-plants','anatomy-flowering-plants','structural-organisation-animals','cell-sourced','biomolecules-sourced','division-sourced'];
const triple=text=>text.trim().split('\n').map(l=>{const [label,correct,explanation]=l.split('|');return {label,correct,explanation};});
function sourceRows(subject,ch){
 if(subject==='biology'){
  if(ch.classLevel===11&&Number(ch.id.split('-').at(-1))<=10){
   return read(`scripts/biology-concepts/${bios[Number(ch.id.split('-').at(-1))-1]}.txt`).split('\n').filter(l=>l.trim()&&!l.startsWith('#')).map(l=>{const [label,correct,a,b,c,explanation]=l.split('|');return {label,correct,wrong:[a,b,c],explanation};});
  }
  return triple(bio12[ch.id]);
 }
 if(subject==='chemistry'&&ch.classLevel===12)return triple(chem12[ch.id]);
 const src=(subject==='physics'?(ch.classLevel===11?phy11:phy12):chem11).find(c=>c.id===ch.id);
 if(src.subtopics)return src.subtopics.flatMap(s=>s.items.map(x=>({label:x.term,correct:x.truth,wrong:[x.misconception],explanation:x.truth,section:s.sections})));
 return src.concepts.map(x=>({label:x.term,correct:x.definition,wrong:[x.false1,x.false2,x.false3],explanation:x.definition,section:x.section}));
}
function hash(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
function rng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed>>>8;};}
const counts={biology:17496,physics:8746,chemistry:8746};
const report={release:'2026-10-15-high-yield-v2',added:35000,kind:'Original NCERT-mapped practice variants',syllabusReference:'https://neet.nta.nic.in/document/syllabus-for-neet-ug-2026-examination/',subjects:{}};
for(const subject of Object.keys(counts)){
 const base=JSON.parse(read(`data/neet/${subject}.json`));
 const chapters=[...base.chapters.map(ch=>({id:ch.id,name:ch.name,classLevel:ch.classLevel,rows:sourceRows(subject,ch)})),...(extra[subject]||[])];
 const target=Math.floor(counts[subject]/chapters.length),remainder=counts[subject]%chapters.length;
 const pack={version:1,release:report.release,subject,chapters:[]};
 const previous=JSON.parse(read(`data/neet/expansion/${subject}.json`));
 const seen=new Set([...base.chapters.flatMap(c=>c.mcqs),...previous.chapters.flatMap(c=>expandChapter(c,subject))].map(semanticSignature));
 for(const [ci,ch] of chapters.entries()){
  const limit=target+(ci<remainder?1:0), random=rng(hash(ch.id+'high-yield-v1'));
  ch.rows=ch.rows.filter(r=>r.label&&r.correct&&r.explanation).map((r,i)=>({...r,key:`${ch.id}:concept:${i+1}`}));
  ch.specs=[];
  const existing=base.chapters.find(c=>c.id===ch.id);
  const semantic=new Set((existing?.mcqs||[]).map(semanticSignature));
  // Each spec contains a distinct selection of scientific content, not merely a new option order.
  const contentSets=new Set();
  let attempts=0;
  while(ch.specs.length<limit){
   if(++attempts>limit*500)throw Error(`Cannot create enough distinct content in ${ch.id}`);
   const index=ch.specs.length,kind=index%3;
   const falseRows=ch.rows.map((r,i)=>r.wrong?.length?i:-1).filter(i=>i>=0);
   let spec;
   const numericals=numericalTemplates[ch.id]||[];
   if(numericals.length&&kind===0){
    const template=index%numericals.length;
    const values=numericals[template].values(random);
    spec=['numerical',template,values,index%4];
   }else if(kind===1&&falseRows.length>=2){
    const a=falseRows[random()%falseRows.length],b=falseRows[random()%falseRows.length];
    if(a===b)continue;
    const truth=random()%4;
    spec=['statements',[a,b].sort((a,b)=>a-b),truth,index%4];
   }else{
    const n=kind===2?4:3,selected=[];
    for(let k=0;k<100&&selected.length<n;k++){
     const r=random()%ch.rows.length;
     if(!selected.some(i=>i===r||ch.rows[i].correct.toLowerCase()===ch.rows[r].correct.toLowerCase()||ch.rows[i].label.toLowerCase()===ch.rows[r].label.toLowerCase()))selected.push(r);
    }
    if(selected.length<n)continue;
    spec=['match',selected.sort((a,b)=>a-b),index%24,index%4];
   }
   const key=JSON.stringify(spec.slice(0,-1).slice(0,spec[0]==='match'?2:3));
   if(contentSets.has(key)){
    // A small numerical domain can run out: add a different concept combination instead.
    if(spec[0]!=='numerical')continue;
    const selected=new Set();while(selected.size<4)selected.add(random()%ch.rows.length);
    spec=['match',[...selected].sort((a,b)=>a-b),index%24,index%4];
    if(new Set(spec[1].map(i=>ch.rows[i].correct)).size!==4)continue;
   }
   let question=expandChapter({...ch,specs:[spec]},subject,index+1)[0];
   let signature=semanticSignature(question);
   if((semantic.has(signature)||seen.has(signature))&&spec[0]==='numerical'){
    const selected=new Set();while(selected.size<4)selected.add(random()%ch.rows.length);
    spec=['match',[...selected].sort((a,b)=>a-b),index%24,index%4];
    if(new Set(spec[1].map(i=>ch.rows[i].correct)).size!==4)continue;
    question=expandChapter({...ch,specs:[spec]},subject,index+1)[0];signature=semanticSignature(question);
   }
   if(semantic.has(signature)||seen.has(signature))continue;
   contentSets.add(JSON.stringify(spec.slice(0,-1).slice(0,spec[0]==='match'?2:3)));semantic.add(signature);seen.add(signature);ch.specs.push(spec);
  }
  pack.chapters.push(ch);
 }
 const file=`data/neet/high-yield/${subject}.json`;
 fs.writeFileSync(path.join(root,file),JSON.stringify(pack)+'\n');
 const diagrams=JSON.parse(read('data/neet/high-yield/diagram-questions.json'))[subject];
 pack.diagrams=diagrams;fs.writeFileSync(path.join(root,file),JSON.stringify(pack)+'\n');
 const qs=[...pack.chapters.flatMap(ch=>expandChapter(ch,subject)),...diagrams];
 const types={};for(const q of qs)types[q.questionType]=(types[q.questionType]||0)+1;
 report.subjects[subject]={added:qs.length,previous:base.chapters.reduce((n,c)=>n+c.mcqs.length,0)+previous.chapters.reduce((n,c)=>n+c.specs.length,0),chapters:chapters.length,types};
}
fs.writeFileSync(path.join(root,'data/neet/high-yield/catalog.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
