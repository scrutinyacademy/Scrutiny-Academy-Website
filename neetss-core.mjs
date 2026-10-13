export const EMPTY_PROGRESS = () => ({uid:'',schemaVersion:3,completedModules:[],flashcards:{},bookmarks:[],attempts:[],mistakes:[],studyPlan:{dailyMinutes:60,examDate:'2026-12-11',weeklyGoal:140,presetDays:90,dutySchedule:'regular',preferredTime:'Morning',weakDomain:''},practiceSession:null,examSession:null,readingChecklist:{},errorTags:{},reportIds:[],updatedAt:null});
export function migrateProgress(raw, questions) {
  const defaults=EMPTY_PROGRESS(),p={...defaults,...raw,studyPlan:{...defaults.studyPlan,...raw.studyPlan},schemaVersion:3};
  p.mistakes=[...new Set((p.mistakes||[]).map(x=>typeof x==='number'?questions[x]?.id:x).filter(x=>questions.some(q=>q.id===x)))];
  p.flashcards=Object.fromEntries(Object.entries(p.flashcards||{}).map(([id,s])=>[id,typeof s==='string'?{rating:s,dueAt:0,intervalDays:0,reviews:0}:s]));
  return p;
}
export function scoreAnswers(answers,total) {
  const attempted=answers.filter(a=>a.choice!==null).length,correct=answers.filter(a=>a.correct).length;
  return {attempted,correct,incorrect:attempted-correct,unattempted:total-attempted,score:correct*4-(attempted-correct),accuracy:attempted?Math.round(correct/attempted*100):0};
}
export function scheduleCard(previous,rating,now=Date.now()) {
  const days=(rating==='difficult'||rating==='forgot')?0:Math.min(30,Math.max(1,(previous?.intervalDays||0)*2||1));
  return {...previous,rating,intervalDays:days,dueAt:now+(days?days*86400000:600000),reviews:(previous?.reviews||0)+1};
}
export function analyse(attempts) {
  const quizzes=attempts.filter(a=>a.kind!=='case'),topics={};let total=0,correct=0,seconds=0,timed=0;
  for(const a of quizzes){total+=a.attempted||0;correct+=a.correct||0;for(const [topic,v] of Object.entries(a.byTopic||{})){const t=topics[topic]??={attempted:0,correct:0,seconds:0,timed:0};t.attempted+=v.attempted||0;t.correct+=v.correct||0;t.seconds+=v.seconds||0;t.timed+=v.timed||0;}for(const x of a.answers||[]){if(x.choice!==null&&Number.isFinite(x.seconds)){seconds+=x.seconds;timed++;}}}
  return {total,correct,accuracy:total?Math.round(correct/total*100):0,averageSeconds:timed?Math.round(seconds/timed):null,topics,quizzes};
}

export function buildAdaptiveQueue(questions, mistakes, topicSignals, limit=12) {
  const mistakeSet=new Set(mistakes||[]),difficulty={Hard:0,Medium:1,Easy:2};
  return [...questions].sort((a,b)=>{
    const am=mistakeSet.has(a.id)?0:1,bm=mistakeSet.has(b.id)?0:1;
    if(am!==bm)return am-bm;
    const aa=topicSignals?.[a.topic],ba=topicSignals?.[b.topic];
    const ar=aa?.attempted?aa.correct/aa.attempted:-1,br=ba?.attempted?ba.correct/ba.attempted:-1;
    if(ar!==br)return ar-br;
    return (difficulty[a.difficulty]??3)-(difficulty[b.difficulty]??3)||a.id.localeCompare(b.id);
  }).slice(0,Math.max(1,limit));
}

export function buildStudyPlan({modules,completedModules=[],mistakes=[],dueCards=0,topicSignals={},dailyMinutes=60,examDate,weakDomain,now=Date.now()}) {
  const target=new Date(`${examDate}T23:59:59`).getTime(),days=Math.max(0,Math.ceil((target-now)/86400000));
  const next=modules.find(m=>m.chapter===weakDomain&&!completedModules.includes(m.id))||modules.find(m=>!completedModules.includes(m.id));
  const weak=Object.entries(topicSignals).filter(([,v])=>v.attempted>=2).sort((a,b)=>(a[1].correct/a[1].attempted)-(b[1].correct/b[1].attempted))[0]?.[0];
  const minutes=Math.max(30,Number(dailyMinutes)||60),tasks=[];
  if(next)tasks.push({kind:'Learn',title:next.title,minutes:Math.max(15,Math.round(minutes*.4))});
  if(dueCards)tasks.push({kind:'Recall',title:`Review ${Math.min(dueCards,20)} due flashcards`,minutes:Math.max(10,Math.round(minutes*.2))});
  tasks.push({kind:'Practice',title:mistakes.length?`Resolve ${Math.min(mistakes.length,12)} saved mistakes`:`Focused MCQs${weak?` · ${weak}`:''}`,minutes:Math.max(15,minutes-tasks.reduce((n,t)=>n+t.minutes,0))});
  return {daysRemaining:days,targetPassed:target<now,tasks:tasks.slice(0,3),weakTopic:weak||null};
}

export const grandTestEligibility=(questionCount,confirmedPattern=false)=>({eligible:questionCount>=150&&confirmedPattern,questionCount,required:150,confirmedPattern});
