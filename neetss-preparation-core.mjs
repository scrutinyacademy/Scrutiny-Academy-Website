export const PLAN_DAYS=[180,120,90,60,30,7];
export const ERROR_TYPES=['Knowledge gap','Interpretation','Careless error','Guessing'];
export function indiaDay(time=Date.now()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(time);}
export function seededShuffle(items,seed){let h=2166136261;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}const out=[...items];for(let i=out.length-1;i>0;i--){h^=h<<13;h^=h>>>17;h^=h<<5;const j=(h>>>0)%(i+1);[out[i],out[j]]=[out[j],out[i]];}return out;}
export function answeredIds(attempts=[]){return new Set(attempts.filter(a=>a.kind!=='case').flatMap(a=>(a.answers||[]).filter(x=>x.choice!==null).map(x=>x.id)));}
export function practiceSet(questions,progress,{topic='',difficulty='',type='',mode='all',limit=0,seed='practice'}={}){
 const seen=answeredIds(progress.attempts),mistakes=new Set(progress.mistakes||[]),bookmarks=new Set(progress.bookmarks||[]);
 const selected=questions.filter(q=>(!topic||q.topic===topic)&&(!difficulty||q.difficulty===difficulty)&&(!type||q.type===type)&&(mode!=='unattempted'||!seen.has(q.id))&&(mode!=='incorrect'||mistakes.has(q.id))&&(mode!=='bookmarked'||bookmarks.has(`question:${q.id}`)));
 return limit?seededShuffle(selected,seed).slice(0,limit):selected;
}
export function balancedPaper(questions,seed,count=150){const buckets=new Map();for(const q of seededShuffle(questions,seed)){if(!buckets.has(q.topic))buckets.set(q.topic,[]);buckets.get(q.topic).push(q);}const result=[];while(result.length<count&&buckets.size){for(const [topic,qs] of buckets){if(result.length>=count)break;result.push(qs.shift());if(!qs.length)buckets.delete(topic);}}return seededShuffle(result,`${seed}-order`);}
export function newExam(questions,seed,now=Date.now()){
 const paper=balancedPaper(questions,seed);if(paper.length!==150)throw new Error('At least 150 distinct questions are required.');
 return {seed,questionIds:paper.map(q=>q.id),startedAt:now,section:0,index:0,answers:paper.map(q=>({id:q.id,topic:q.topic,choice:null,seconds:0,confidence:'Unsure',flagged:false})),finished:false};
}
export function examClock(session,now=Date.now()){
 const elapsed=Math.max(0,now-session.startedAt),section=Math.min(3,Math.floor(elapsed/3000000));
 return {section,expired:section===3,remainingSeconds:section===3?0:Math.ceil(((section+1)*3000000-elapsed)/1000)};
}
export function advanceExam(session,now=Date.now()){
 const clock=examClock(session,now);if(session.finished)return session;
 const next={...session,section:clock.section,finished:clock.expired};if(next.section!==session.section)next.index=Math.min(next.section*50,149);return next;
}
export function examCanVisit(session,index,now=Date.now()){const c=examClock(session,now);return !session.finished&&!c.expired&&Number.isInteger(index)&&index>=c.section*50&&index<(c.section+1)*50;}
export function recordExamAnswer(session,index,choice,confidence,seconds,now=Date.now()){
 if(!examCanVisit(session,index,now))return session;if(choice!==null&&(!Number.isInteger(choice)||choice<0||choice>3))return session;
 const answers=session.answers.map((a,i)=>i===index?{...a,choice,confidence:['Guess','Unsure','Confident'].includes(confidence)?confidence:'Unsure',seconds:a.seconds+Math.max(0,Number(seconds)||0)}:a);
 return {...session,answers};
}
export function markedExamAnswers(session,questions){const byId=new Map(questions.map(q=>[q.id,q]));return session.answers.map(a=>({...a,correct:a.choice!==null&&a.choice===byId.get(a.id)?.a}));}
export function preparationPhase(days){return days<=7?'Final revision':days<=30?'Tests and revision':days<=60?'Mixed practice and revision':'Foundation and topic practice';}
export function readinessSignal(progress,content){const answers=progress.attempts.filter(a=>a.kind!=='case').flatMap(a=>a.answers||[]).filter(a=>a.choice!==null),unique=new Set(answers.map(a=>a.id)).size,completed=new Set(progress.completedModules).size,reviewed=content.cards.filter(c=>progress.flashcards[c.id]?.rating==='known').length,accuracy=answers.length?answers.filter(a=>a.correct).length/answers.length:0;
 const score=Math.round(40*Math.min(1,completed/Math.max(1,content.modules.length))+40*accuracy+20*reviewed/Math.max(1,content.cards.length));return {score:answers.length>=30&&unique>=20?score:null,answers:answers.length,unique,completed,reviewed,accuracy:Math.round(accuracy*100)};}
export function weeklySignal(progress,now=Date.now()){const start=now-7*86400000;return progress.attempts.filter(a=>a.kind!=='case'&&new Date(a.date).getTime()>=start).reduce((n,a)=>n+(a.attempted||0),0);}
export function resumeValid(session,questions){if(!session||session.finished)return false;const ids=new Set(questions.map(q=>q.id));return Array.isArray(session.questionIds)&&session.questionIds.length===150&&new Set(session.questionIds).size===150&&session.questionIds.every(id=>ids.has(id))&&Array.isArray(session.answers)&&session.answers.length===150&&session.answers.every((a,i)=>a.id===session.questionIds[i])&&Number.isFinite(session.startedAt);}
