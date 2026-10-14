import {expandChapter} from './neet-ug-expansion.mjs?v=20261014';
export const RELEASE='2026-10-15-high-yield-v1';
export function questionsForChapter(pack,id){
 const ch=pack.chapters.find(c=>c.id===id);if(!ch)return [];
 return [...expandChapter(ch,pack.subject).map(q=>({...q,id:q.id.replace('NEET-UG-15K-','NEET-HY-V1-'),expansionRelease:RELEASE})),...(pack.diagrams||[]).filter(q=>q.chapterId===id).map(q=>({...q,subject:pack.subject,chapter:ch.name,classLevel:ch.classLevel}))];
}
export function emptyProgress(){return {version:1,attempts:{},bookmarks:{}};}
export function readProgress(storage){try{const p=JSON.parse(storage.getItem('neet_high_yield_v1'));return p?.version===1&&p.attempts&&p.bookmarks?p:emptyProgress();}catch{return emptyProgress();}}
export function filterQuestions(qs,progress,view){return qs.filter(q=>view==='practised'?Boolean(progress.attempts[q.id]):view==='bookmarks'?Boolean(progress.bookmarks[q.id]?.saved):view==='incorrect'?progress.attempts[q.id]?.correct===false:!progress.attempts[q.id]);}
export function recordAnswer(progress,q,selected,now=Date.now()){
 if(!Number.isInteger(selected)||selected<0||selected>=q.options.length)throw Error('Invalid answer');
 return {...progress,attempts:{...progress.attempts,[q.id]:{selected,correct:selected===q.answer,at:now}}};
}
export function toggleBookmark(progress,id,now=Date.now()){return {...progress,bookmarks:{...progress.bookmarks,[id]:{saved:!progress.bookmarks[id]?.saved,at:now}}};}
export function summarize(questions,answers){const attempted=questions.filter(q=>Number.isInteger(answers[q.id])).length,correct=questions.filter(q=>answers[q.id]===q.answer).length;return {attempted,correct,incorrect:attempted-correct,score:correct*4-(attempted-correct),accuracy:attempted?Math.round(correct/attempted*100):0};}
export function chapterCounts(pack,ch,progress){const ids=[...ch.specs.map((_,i)=>`NEET-HY-V1-${ch.id}-${String(i+1).padStart(4,'0')}`),...(pack.diagrams||[]).filter(q=>q.chapterId===ch.id).map(q=>q.id)];return {total:ids.length,practised:ids.filter(id=>progress.attempts[id]).length,bookmarks:ids.filter(id=>progress.bookmarks[id]?.saved).length,incorrect:ids.filter(id=>progress.attempts[id]?.correct===false).length};}
export const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function questionVisual(q){const e=escapeHtml;let html='';if(q.table?.headers?.length&&q.table?.rows?.length)html+=`<div class="hy-table-scroll"><table><caption>${e(q.table.caption||'Question data')}</caption><thead><tr>${q.table.headers.map(h=>`<th scope="col">${e(h)}</th>`).join('')}</tr></thead><tbody>${q.table.rows.map(r=>`<tr>${r.map(c=>`<td>${e(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;if(q.visualAsset&&/^assets\/high-yield\/[a-z-]+\.svg$/.test(q.visualAsset))html+=`<figure><img src="${e(q.visualAsset)}" alt="${e(q.visualAlt||q.topic)}"><figcaption>Original NCERT-mapped schematic · not to scale</figcaption></figure>`;return html;}
