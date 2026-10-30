import assert from 'node:assert/strict';
import {freshProgress,safeProgress,keyFor,questionKey,moduleScore,recordAnswer,dueQuestions,mistakes,recommend,sampleQuestions,validateCourse} from '../cbse-core.mjs';
import {LABS,numericalProblem} from '../cbse-labs.mjs';
const questions=Array.from({length:5},(_,i)=>({id:`q${i}`,prompt:`Question ${i}`,options:['a','b','c','d'],answer:i%4,hint:'A hint',explanation:'A reason',difficulty:'Easy'}));
const module={id:'fractions',questions},key=keyFor(7,'mathematics',module.id),items=[{module,key}],p=freshProgress(),now=100000;
assert.equal(moduleScore(module,key,p).mastered,false);
p.studied[key]=now;assert.equal(moduleScore(module,key,p).mastered,false,'reading cannot award mastery');
questions.forEach(q=>recordAnswer(p,key,q,q.answer,now));
assert.equal(moduleScore(module,key,p).mastered,true);assert.equal(dueQuestions(items,p,now).length,0);
assert.equal(dueQuestions(items,p,now+86400000).length,5);
recordAnswer(p,key,questions[0],3,now+86400000);assert.equal(mistakes(items,p).length,1);
assert.equal(moduleScore(module,key,p).percent,80);assert.equal(moduleScore(module,key,p).mastered,true);
recordAnswer(p,key,questions[1],0,now+86400000);assert.equal(moduleScore(module,key,p).mastered,false);
recordAnswer(p,key,questions[0],0,now+86400000);assert.equal(mistakes(items,p).length,1,'correct retry clears the current mistake');
assert.equal(moduleScore(module,keyFor(8,'mathematics',module.id),p).attempted,0,'grades never mix');
assert.equal(moduleScore(module,keyFor(7,'science',module.id),p).attempted,0,'subjects never mix');
assert.equal(p.reviews[questionKey(key,'q0')].streak,1,'a mistake resets spacing');
recordAnswer(p,key,questions[0],0,now+2*86400000);assert.equal(p.reviews[questionKey(key,'q0')].due,now+5*86400000);
const recovered=safeProgress(JSON.stringify(p));assert.deepEqual(recovered.answers,p.answers);
assert.equal(safeProgress('{broken').sessions.length,0);assert.equal(safeProgress('null').version,1);
assert.equal(safeProgress(JSON.stringify({version:1,notes:[],minutes:800})).minutes,30);
assert.equal(sampleQuestions(questions,100).length,5,'never pad a test with duplicate questions');
assert.equal(new Set(sampleQuestions(questions,3).map(q=>q.id)).size,3);
assert.ok(recommend(items,p));assert.ok(validateCourse({grade:13,subjects:[]}).length);
for(let grade=7;grade<=12;grade++){
  for(let seed=0;seed<50;seed++){const n=numericalProblem(grade,seed);assert.ok(Number.isFinite(n.answer));assert.ok(n.explanation);}
  const lab=LABS[grade];for(const value of [lab.min,lab.value,lab.max]){const r=lab.render(value);assert.ok(!r.text.includes('NaN'));assert.ok(r.drawing.includes('<'));}
}
assert.equal(numericalProblem(12,1).answer,6);
console.log('CBSE core: grading, spacing, recovery, scope isolation, test sampling and six interactive models passed.');
