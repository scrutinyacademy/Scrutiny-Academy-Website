import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/class11/chemistry.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'preview-v2.html'),'utf8');
const js=fs.readFileSync(path.join(root,'v2-core.js'),'utf8');
const dashboard=fs.readFileSync(path.join(root,'student.js'),'utf8');
const css=fs.readFileSync(path.join(root,'v2.css'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const bundle=fs.readFileSync(path.join(root,'data/prebundled_data.js'),'utf8');
const expected=['Atomic Structure','Classification of Elements and Periodicity in Properties','Chemical Bonding and Molecular Structure','States of Matter: Gases and Liquids','Stoichiometry','Thermodynamics','Chemical Equilibrium and Acids–Bases','Hydrogen and its Compounds','The s-Block Elements','The p-Block Elements – Group 13','The p-Block Elements – Group 14','Environmental Chemistry','Organic Chemistry – Basic Principles, Techniques and Hydrocarbons'];
const fail=[];
if(data.chapters.length!==13) fail.push(`expected 13 chapters, found ${data.chapters.length}`);
data.chapters.forEach((chapter,index)=>{
  if(chapter.name!==expected[index]) fail.push(`chapter ${index+1} mismatch: ${chapter.name}`);
  for(const [kind,count] of [['vsaq',10],['saq',5],['laq',3]]) if(chapter[kind]?.length!==count) fail.push(`${chapter.name}: ${kind}=${chapter[kind]?.length}`);
  if(!chapter.examAnalysis?.approach||!chapter.examAnalysis?.sourceNote) fail.push(`${chapter.name}: missing exam analysis`);
  for(const item of [...chapter.vsaq,...chapter.saq,...chapter.laq]) {
    if(!item.id||!item.question||!item.answer||!item.keyPoints||!item.marks||!item.priority) fail.push(`${chapter.name}: incomplete ${item.id||'item'}`);
    if(item.answer?.length<120) fail.push(`${item.id}: answer too short`);
  }
});
const all=data.chapters.flatMap(c=>[...c.vsaq,...c.saq,...c.laq]);
if(new Set(all.map(q=>q.id)).size!==all.length) fail.push('duplicate question IDs');
if(new Set(all.map(q=>q.question)).size!==all.length) fail.push('duplicate question text');
if(!html.includes('data-subject="chemistry"')) fail.push('Chemistry subject tab missing');
if(!js.includes('["botany", "zoology", "physics", "chemistry"]')) fail.push('direct Chemistry route missing');
if(!dashboard.includes('Chemistry Answer Bank')) fail.push('dashboard Chemistry action missing');
if(!css.includes('data-board-subject="chemistry"')) fail.push('premium Chemistry theme missing');
if(!sw.includes('v25-class11-chemistry-bank')) fail.push('Chemistry cache version missing');
if(!bundle.includes('class11-chemistry-13')) fail.push('offline bundle missing complete Chemistry bank');
const diagrams=[...new Set(all.map(q=>q.diagram).filter(Boolean))];
for(const diagram of diagrams) {
  const p=path.join(root,diagram);
  if(!fs.existsSync(p)) fail.push(`missing diagram ${diagram}`);
  else {
    const svg=fs.readFileSync(p,'utf8');
    if(!svg.startsWith('<svg')||!svg.includes('<title')) fail.push(`invalid accessible SVG ${diagram}`);
  }
}
const totals={vsaq:data.chapters.reduce((n,c)=>n+c.vsaq.length,0),saq:data.chapters.reduce((n,c)=>n+c.saq.length,0),laq:data.chapters.reduce((n,c)=>n+c.laq.length,0)};
console.log(`Validated ${data.chapters.length} chapters, ${all.length} answers (${totals.vsaq} VSAQ, ${totals.saq} SAQ, ${totals.laq} LAQ), and ${diagrams.length} attached diagrams.`);
if(fail.length){console.error(fail.join('\n'));process.exit(1);}
