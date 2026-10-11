export const EMPTY_PROGRESS = () => ({uid:'',schemaVersion:2,completedModules:[],flashcards:{},bookmarks:[],attempts:[],mistakes:[],studyPlan:{dailyMinutes:60},updatedAt:null});
export function migrateProgress(raw, questions) {
  const p={...EMPTY_PROGRESS(),...raw,schemaVersion:2};
  p.mistakes=[...new Set((p.mistakes||[]).map(x=>typeof x==='number'?questions[x]?.id:x).filter(x=>questions.some(q=>q.id===x)))];
  p.flashcards=Object.fromEntries(Object.entries(p.flashcards||{}).map(([id,s])=>[id,typeof s==='string'?{rating:s,dueAt:0,intervalDays:0,reviews:0}:s]));
  return p;
}
export function scoreAnswers(answers,total) {
  const attempted=answers.filter(a=>a.choice!==null).length,correct=answers.filter(a=>a.correct).length;
  return {attempted,correct,incorrect:attempted-correct,unattempted:total-attempted,score:correct*4-(attempted-correct),accuracy:attempted?Math.round(correct/attempted*100):0};
}
export function scheduleCard(previous,rating,now=Date.now()) {
  const days=rating==='difficult'?0:Math.min(30,Math.max(1,(previous?.intervalDays||0)*2||1));
  return {rating,intervalDays:days,dueAt:now+(days?days*86400000:600000),reviews:(previous?.reviews||0)+1};
}
export function analyse(attempts) {
  const quizzes=attempts.filter(a=>a.kind!=='case'),topics={};let total=0,correct=0,seconds=0,timed=0;
  for(const a of quizzes){total+=a.attempted||0;correct+=a.correct||0;for(const [topic,v] of Object.entries(a.byTopic||{})){const t=topics[topic]??={attempted:0,correct:0,seconds:0,timed:0};t.attempted+=v.attempted||0;t.correct+=v.correct||0;t.seconds+=v.seconds||0;t.timed+=v.timed||0;}for(const x of a.answers||[]){if(x.choice!==null&&Number.isFinite(x.seconds)){seconds+=x.seconds;timed++;}}}
  return {total,correct,accuracy:total?Math.round(correct/total*100):0,averageSeconds:timed?Math.round(seconds/timed):null,topics,quizzes};
}
