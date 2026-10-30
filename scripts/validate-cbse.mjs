import fs from 'node:fs';
import {GRADES,validateCourse} from '../cbse-core.mjs';
let totalModules=0,totalQuestions=0;
const inventory=[];
for(const grade of GRADES){const course=JSON.parse(fs.readFileSync(`data/cbse/class${grade}.json`,'utf8'));
  const errors=validateCourse(course);if(course.grade!==grade)errors.push('File grade mismatch');
  if(errors.length)throw new Error(errors.join('\n'));
  const modules=course.subjects.reduce((n,s)=>n+s.modules.length,0),questions=course.subjects.reduce((n,s)=>n+s.modules.reduce((x,m)=>x+m.questions.length,0),0);
  totalModules+=modules;totalQuestions+=questions;
  inventory.push({grade,subjects:course.subjects.length,modules,questions});
}
const html=fs.readFileSync('cbse.html','utf8');for(const path of ['cbse.js','cbse-account.js','cbse.css'])if(!html.includes(path)||!fs.existsSync(path))throw new Error(`Missing asset ${path}`);
for(const grade of GRADES)if(!fs.readFileSync('index.html','utf8').includes(`cbse.html?class=${grade}`))throw new Error(`Class ${grade} homepage link missing`);
console.table(inventory);console.log(`Validated ${totalModules} original topic modules and ${totalQuestions} MCQs. This is partial supplementary coverage, not a full syllabus.`);
