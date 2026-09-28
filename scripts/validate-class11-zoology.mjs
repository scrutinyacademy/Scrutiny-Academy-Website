import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const data=JSON.parse(fs.readFileSync(new URL('data/class11/zoology.json',root),'utf8'));
const html=fs.readFileSync(new URL('preview-v2.html',root),'utf8');
const js=fs.readFileSync(new URL('v2-core.js',root),'utf8');
const dashboard=fs.readFileSync(new URL('student.js',root),'utf8');
const expected=['Diversity of the Living World','Structural Organisation in Animals','Animal Diversity–I: Invertebrate Phyla','Animal Diversity–II: Phylum Chordata','Locomotion and Reproduction in Protozoa','Biology and Human Welfare','Type Study of Periplaneta americana','Ecology and Environment'];
const fail=[];
if(data.chapters.length!==8) fail.push(`expected 8 units, found ${data.chapters.length}`);
data.chapters.forEach((c,i)=>{
  if(c.name!==expected[i]) fail.push(`unit ${i+1} title mismatch`);
  for(const [kind,count] of [['vsaq',15],['saq',10],['laq',5]]) if(c[kind]?.length!==count) fail.push(`${c.name}: ${kind}=${c[kind]?.length}`);
  for(const item of [...c.vsaq,...c.saq,...c.laq]) if(!item.question||!item.answer||!item.keyPoints) fail.push(`${c.name}: incomplete ${item.id}`);
});
const all=data.chapters.flatMap(c=>[...c.vsaq,...c.saq,...c.laq]);
if(new Set(all.map(q=>q.question)).size!==all.length) fail.push('duplicate question text');
if(!html.includes('data-subject="zoology"')) fail.push('Zoology subject tab missing');
if(!js.includes('["botany", "zoology", "physics"]')) fail.push('direct Zoology route missing');
if(!dashboard.includes('Zoology Answer Bank')) fail.push('dashboard Zoology action missing');
const diagrams=[...new Set(all.map(q=>q.diagram).filter(Boolean))];
for(const d of diagrams) if(!fs.existsSync(new URL(d,root))) fail.push(`missing diagram ${d}`);
console.log(`Validated ${data.chapters.length} units, ${all.length} answers (${data.chapters.reduce((n,c)=>n+c.vsaq.length,0)} VSAQ, ${data.chapters.reduce((n,c)=>n+c.saq.length,0)} SAQ, ${data.chapters.reduce((n,c)=>n+c.laq.length,0)} LAQ), and ${diagrams.length} labelled diagrams.`);
if(fail.length){console.error(fail.join('\n'));process.exit(1);}
