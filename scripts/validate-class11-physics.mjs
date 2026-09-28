import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const data=JSON.parse(fs.readFileSync(new URL('data/class11/physics.json',root),'utf8'));
const html=fs.readFileSync(new URL('preview-v2.html',root),'utf8');
const js=fs.readFileSync(new URL('v2-core.js',root),'utf8');
const dashboard=fs.readFileSync(new URL('student.js',root),'utf8');
const sw=fs.readFileSync(new URL('sw.js',root),'utf8');
const expected=['Physical World and Measurement','Motion along a Straight Line','Motion in a Plane','Laws of Motion','Work, Energy and Power','System of Particles and Rotational Motion','Oscillations','Gravitation','Mechanical Properties of Solids','Mechanical Properties of Fluids','Thermal Properties of Matter','Thermodynamics','Kinetic Theory','Physics of Emerging Technologies'];
const fail=[];
if(data.chapters.length!==14) fail.push(`expected 14 units, found ${data.chapters.length}`);
data.chapters.forEach((chapter,index)=>{
  if(chapter.name!==expected[index]) fail.push(`unit ${index+1} title mismatch: ${chapter.name}`);
  for(const [kind,count] of [['vsaq',10],['saq',5],['laq',3]]) if(chapter[kind]?.length!==count) fail.push(`${chapter.name}: ${kind}=${chapter[kind]?.length}`);
  for(const item of [...chapter.vsaq,...chapter.saq,...chapter.laq]) if(!item.question||!item.answer||!item.keyPoints) fail.push(`${chapter.name}: incomplete ${item.id}`);
});
const all=data.chapters.flatMap(c=>[...c.vsaq,...c.saq,...c.laq]);
if(new Set(all.map(q=>q.id)).size!==all.length) fail.push('duplicate question IDs');
if(new Set(all.map(q=>q.question)).size!==all.length) fail.push('duplicate question text');
if(!html.includes('data-subject="physics"')) fail.push('Physics subject tab missing');
if(!js.includes('["botany", "zoology", "physics", "chemistry"]')) fail.push('direct Physics route missing');
if(!dashboard.includes('Physics Answer Bank')) fail.push('dashboard Physics action missing');
if(!sw.includes('./data/class11/physics.json')) fail.push('Physics offline data missing');
const diagrams=[...new Set(all.map(q=>q.diagram).filter(Boolean))];
for(const diagram of diagrams) if(!fs.existsSync(new URL(diagram,root))) fail.push(`missing diagram ${diagram}`);
console.log(`Validated ${data.chapters.length} units, ${all.length} answers (${data.chapters.reduce((n,c)=>n+c.vsaq.length,0)} VSAQ, ${data.chapters.reduce((n,c)=>n+c.saq.length,0)} SAQ, ${data.chapters.reduce((n,c)=>n+c.laq.length,0)} LAQ), and ${diagrams.length} attached diagrams.`);
if(fail.length){console.error(fail.join('\n'));process.exit(1);}
