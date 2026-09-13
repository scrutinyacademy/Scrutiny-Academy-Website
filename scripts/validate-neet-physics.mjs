import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=path.resolve(import.meta.dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'data/neet/physics.json'),'utf8'));
const targets=[
 ['neet-physics-12-1','Electric Charges and Fields',44,'ELECTRIC CHARGES AND FIELDS(1).pdf'],
 ['neet-physics-12-2','Electrostatic Potential and Capacitance',36,'ELECTROSTATIC POTENTIAL AND CAPACITANCE(1).pdf'],
 ['neet-physics-12-3','Current Electricity',26,'CURRENT ELECTRICITY(1).pdf'],
 ['neet-physics-12-4','Moving Charges and Magnetism',29,'MOVING CHARGES AND MAGENETISM(1).pdf'],
 ['neet-physics-12-5','Magnetism and Matter',18,'MAGNETISM AND MATTER(1).pdf'],
 ['neet-physics-12-6','Electromagnetic Induction',23,'Electromagnetic Induction(1).pdf'],
 ['neet-physics-12-7','Alternating Current',24,'Alternating Current(1).pdf'],
 ['neet-physics-12-8','Electromagnetic Waves',14,'Electromagnetic Waves(1).pdf'],
 ['neet-physics-12-9','Ray Optics and Optical Instruments',34,'Ray Optics and Optical Instruments.pdf'],
 ['neet-physics-12-10','Wave Optics',19,'Wave Optics.pdf'],
 ['neet-physics-12-11','Dual Nature of Radiation and Matter',16,'Dual Nature of Radiation and Matter.pdf'],
 ['neet-physics-12-12','Atoms',16,'ATOMS.pdf'],
 ['neet-physics-12-13','Nuclei',17,'NUCLEI.pdf'],
 ['neet-physics-12-14','Semiconductor Electronics: Materials, Devices and Simple Circuits',21,'Semiconductor Electronics Materials Devices and Simple Circuits.pdf']
];
const ids=new Set(),exact=new Map(),near=new Map();let total=0;
const norm=s=>s.toLowerCase().replace(/[−-]?\d+(?:\.\d+)?(?:\s*[×x]\s*10[^ ,.;)]*)?/g,'#').replace(/\s+/g,' ').trim();
for(const [id,name,pages,pdf] of targets){
 const ch=data.chapters.find(c=>c.id===id);assert.ok(ch,`Missing chapter ${name}`);assert.equal(ch.name,name);assert.equal(ch.classLevel,12);assert.equal(ch.mcqs.length,180,`${name} count`);total+=ch.mcqs.length;
 const diff={Easy:0,Moderate:0,Difficult:0},types=new Set();
 for(const [index,q] of ch.mcqs.entries()){
  assert.equal(q.questionNumber,index+1,`${name} sequence`);assert.ok(!ids.has(q.id),`Duplicate id ${q.id}`);ids.add(q.id);
  assert.ok(q.question?.trim(),`Missing question ${q.id}`);assert.equal(q.options?.length,4,`Options ${q.id}`);assert.equal(new Set(q.options.map(x=>x.trim())).size,4,`Duplicate options ${q.id}`);
  assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4,`Answer ${q.id}`);assert.ok(q.explanation?.trim(),`Explanation ${q.id}`);assert.ok(q.topic&&q.subtopic&&q.questionType,`Metadata ${q.id}`);assert.ok(q.ncertBasis?.trim(),`NCERT basis ${q.id}`);
  assert.equal(q.references?.length,1,`Reference count ${q.id}`);const r=q.references[0];assert.equal(r.pdfFilename,pdf,`PDF ${q.id}`);assert.ok(r.pdfPage>=1&&r.pdfPage<=pages,`PDF page ${q.id}: ${r.pdfPage}`);assert.ok(r.printedPage&&r.section&&r.paragraphContext,`Reference detail ${q.id}`);
  assert.ok(diff[q.difficulty]!==undefined,`Difficulty ${q.id}`);diff[q.difficulty]++;types.add(q.questionType);
  const e=q.question.toLowerCase().replace(/\s+/g,' ').trim();assert.ok(!exact.has(e),`Exact duplicate ${q.id} / ${exact.get(e)}`);exact.set(e,q.id);
  const n=norm(q.question);const list=near.get(n)||[];list.push(q.id);near.set(n,list);
  if(q.image){assert.ok(fs.existsSync(path.join(root,q.image.src)),`Missing image ${q.image.src}`);assert.ok(q.image.alt&&q.image.caption,`Image metadata ${q.id}`);}
  if(q.table){assert.ok(q.table.headers.length>=2&&q.table.rows.length>=2,`Table ${q.id}`);for(const row of q.table.rows)assert.equal(row.length,q.table.headers.length,`Table shape ${q.id}`);}
  if(q.questionType==='Numerical'){assert.ok(q.formulaUsed&&q.calculation&&q.finalAnswer&&q.unit!==undefined,`Numerical detail ${q.id}`);assert.equal(q.options[q.answer],q.finalAnswer,`Numerical key ${q.id}`);}
 }
 assert.deepEqual(diff,{Easy:45,Moderate:90,Difficult:45},`${name} difficulty distribution`);
 assert.ok(types.has('Numerical')&&types.has('Assertion–Reason')&&types.has('Statement I/II')&&types.has('Data/table reasoning'),`${name} type coverage`);
 if(Number(id.split('-').at(-1))>=9) assert.ok(types.has('Match-the-column'),`${name} match-the-column coverage`);
 console.log(`${name}: 180 valid · Easy 45 / Moderate 90 / Difficult 45 · ${types.size} types`);
}
assert.equal(total,2520);assert.equal(ids.size,2520);
const nearGroups=[...near.values()].filter(v=>v.length>2);assert.equal(nearGroups.length,0,`Excessive near-duplicate groups: ${JSON.stringify(nearGroups.slice(0,5))}`);
console.log(`TOTAL: ${total} valid questions · ${ids.size} unique ids · 0 exact duplicates · ${nearGroups.length} excessive near-duplicate groups`);
