export const GRADES = [7, 8, 9, 10, 11, 12];
export function freshProgress() { return {version:1, studied:{}, answers:{}, notes:{}, bookmarks:[], reviews:{}, sessions:[], minutes:30, last:null}; }
export function safeProgress(raw) {
  try { const p=JSON.parse(raw); if(!p || p.version!==1) return freshProgress();
    const clean=freshProgress();
    for(const k of ['studied','answers','notes','reviews']) if(p[k] && typeof p[k]==='object' && !Array.isArray(p[k])) clean[k]=p[k];
    clean.bookmarks=Array.isArray(p.bookmarks)?p.bookmarks.filter(x=>typeof x==='string'):[];
    clean.sessions=Array.isArray(p.sessions)?p.sessions.filter(x=>x && Number.isFinite(x.correct)&&Number.isFinite(x.total)).slice(-100):[];
    clean.minutes=[15,30,60].includes(p.minutes)?p.minutes:30;clean.last=p.last && typeof p.last==='object'?p.last:null;return clean;
  } catch {return freshProgress();}
}
export function keyFor(grade, subject, module) { return `${grade}/${subject}/${module}`; }
export function questionKey(key, id) { return `${key}/${id}`; }
export function moduleScore(module,key,progress) {
  const tried=module.questions.filter(q=>progress.answers[questionKey(key,q.id)]);
  const correct=tried.filter(q=>progress.answers[questionKey(key,q.id)].correct).length;
  return {attempted:tried.length,correct,total:module.questions.length,percent:tried.length?Math.round(correct/tried.length*100):0,
    mastered:tried.length===module.questions.length&&tried.length>=3&&correct/tried.length>=0.8};
}
export function recordAnswer(progress,key,question,index,now=Date.now()) {
  const id=questionKey(key,question.id),correct=index===question.answer,previous=progress.answers[id];
  const streak=correct?Math.min(3,(previous?.correct?previous.streak||0:0)+1):0;
  progress.answers[id]={index,correct,streak,at:now};
  progress.reviews[id]={key,id:question.id,due:now+([1,1,3,7][streak])*86400000,streak};
  return correct;
}
export function dueQuestions(modules,progress,now=Date.now()) {
  return modules.flatMap(({module,key})=>module.questions.filter(q=>{const r=progress.reviews[questionKey(key,q.id)];return r&&r.due<=now;}).map(q=>({...q,key,moduleTitle:module.title}))).sort((a,b)=>progress.reviews[questionKey(a.key,a.id)].due-progress.reviews[questionKey(b.key,b.id)].due);
}
export function mistakes(modules,progress) {return modules.flatMap(({module,key})=>module.questions.filter(q=>progress.answers[questionKey(key,q.id)]?.correct===false).map(q=>({...q,key,moduleTitle:module.title})));}
export function recommend(modules,progress) {
  return [...modules].sort((a,b)=>{const x=moduleScore(a.module,a.key,progress),y=moduleScore(b.module,b.key,progress);
    return Number(x.mastered)-Number(y.mastered)||(x.attempted?x.percent:50)-(y.attempted?y.percent:50);})[0];
}
export function sampleQuestions(items,count=10,random=Math.random) {
  const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy.slice(0,count);
}
export function validateCourse(course) {
  const errors=[],ids=new Set();if(!GRADES.includes(course.grade)) errors.push('Invalid grade');
  if(!Array.isArray(course.subjects)||!course.subjects.length)return ['Missing subjects'];
  const subjects=new Set();for(const s of course.subjects){if(subjects.has(s.id))errors.push(`Duplicate subject ${s.id}`);subjects.add(s.id);
    if(!s.modules?.length)errors.push(`${s.id}: no modules`);
    for(const m of s.modules||[]){const k=keyFor(course.grade,s.id,m.id);if(ids.has(k))errors.push(`Duplicate ${k}`);ids.add(k);
      if(!m.title||!m.goal||m.concepts?.length<2||!m.example?.steps?.length||!m.example?.answer||!m.activity?.prompt||!m.activity?.check||!m.writing?.points?.length||!m.revision?.length)errors.push(`${k}: incomplete lesson`);
      if(m.questions?.length<3)errors.push(`${k}: fewer than three questions`);
      for(const q of m.questions||[]){const qk=questionKey(k,q.id);if(ids.has(qk))errors.push(`Duplicate ${qk}`);ids.add(qk);
        if(!q.prompt||q.options?.length!==4||new Set(q.options).size!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.hint||!q.explanation||!['Easy','Medium','Hard'].includes(q.difficulty))errors.push(`${qk}: malformed question`);}
    }
  }return errors;
}
