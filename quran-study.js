import {esc} from './arabic-shared.js?v=4';
import {load,update} from './arabic-progress.js';
import {surahs,pdfPages} from './quran-index.js';
import {studies} from './quran-study-data.js';
const sourceFor=page=>{const volume=page<=350?1:page<=700?2:3;return {url:`assets/quran/Holy-Quran-English-${volume}.pdf`,localPage:page-(volume-1)*350,volume};};
const clamp=n=>Math.max(1,Math.min(pdfPages,Math.trunc(Number(n))||1));
export function quranStudy(host){
 const resume=/^pdf:(\d+)$/.exec(load().resume);
 let page=resume?clamp(resume[1]):17,active=studies[0];
 host.classList.add('quran-space');
 host.innerHTML=`<div class="quran-heading"><span class="eyebrow">READ · UNDERSTAND · PRACTISE · REFLECT</span><h2>Your Quran study space</h2><p>Explore the complete Arabic and English edition, then study six short Surahs one step at a time.</p><div class="quran-stats"><span>114 Surahs</span><span>6 guided studies</span><span>30 quiz questions</span></div></div><nav class="quran-tabs" aria-label="Quran study sections"><a href="#quranReader">Read the Quran</a><a href="#quranLessons">Guided studies</a><a href="#quranRevision">Revision quiz</a></nav><details class="quran-source"><summary>About this edition and the learning notes</summary><p>Arabic text and English translation by Maulawi Sher Ali, Islam International Publications Ltd., 2021. This Ahmadiyya Muslim Jama’at edition includes alternative translations and commentary by Mirza Tahir Ahmad. Translation and commentary reflect this edition’s perspective.</p><p>Its verse numbering includes Bismillah as verse 1 in most chapters, so numbers can differ from other editions. Navigation below uses PDF pages, which differ from printed page numbers. Some short chapters share a page.</p><p>All 1,028 pages of the supplied edition are preserved across three reading volumes, including its introductory material and appendices. Vocabulary glosses, summaries and quizzes are Scrutiny Academy study aids, not a replacement translation or tafsir. Hinglish cues approximate pronunciation; learn recitation with a qualified teacher. No recitation assessment or audio is provided here.</p></details><section id="quranReader"><span class="eyebrow">01 · READ AT YOUR PACE</span><h3>The complete Quran · Arabic &amp; English</h3><div class="quran-controls"><label>Find a Surah<input id="quranSearch" type="search" placeholder="Name or number, e.g. 112" autocomplete="off"></label><label>Surah<select id="quranSurah"></select></label><form id="quranPageForm"><label>PDF page (1–${pdfPages})<input id="quranPage" type="number" min="1" max="${pdfPages}" value="${page}" required></label><button type="submit">Go to page</button></form></div><p id="quranSearchStatus" role="status"></p><div class="actions"><button id="quranPrev" type="button">← Previous page</button><button id="quranNext" type="button">Next page →</button><button id="quranBookmark" type="button">Bookmark page</button></div><p id="quranPageStatus" role="status"></p><div id="quranFrameHost" class="quran-frame-host"><p>Open the reader when you are ready. The edition is divided into three reading volumes; only the selected volume loads (about 6–7 MB).</p><button type="button" id="quranLoad">Load Quran reader</button></div><p class="quran-fallback">For the best phone reading experience, <a id="quranOpen" target="_blank" rel="noopener">open this page in the PDF reader ↗</a>. If your browser opens the beginning of a volume, enter the local volume page shown above.</p><details><summary>Your reading bookmarks</summary><div id="quranBookmarks" class="actions"></div></details><p class="fine-print">Reading position, bookmarks and study progress save on this device under your course account. Use the account sync option above to sync them.</p></section><section id="quranLessons"><span class="eyebrow">02 · LEARN WITH UNDERSTANDING</span><h3>Six small beginnings. A steady habit.</h3><p>Choose a study. Read its source, explore the words, recall the meaning, then check your understanding.</p><div class="quran-study-grid">${studies.map(s=>`<button type="button" class="quran-study-card" data-study="${s.id}" aria-pressed="false"><small>SURAH ${s.surah}</small><strong>${esc(s.title)}</strong><span>${esc(s.focus)}</span><small data-study-state="${s.id}"></small></button>`).join('')}</div><article id="quranStudyPanel" class="quran-study-panel" aria-live="polite"></article></section><section id="quranRevision"><span class="eyebrow">03 · PRACTISE &amp; STRENGTHEN</span><h3>Check what you understand</h3><p>Each study has five questions with explanations. The mixed challenge brings all 30 together. Scores track understanding, not recitation proficiency.</p><div class="actions"><button type="button" id="quranMixed">Start 30-question challenge</button><button type="button" id="quranMistakes">Revise Quran mistakes</button></div><p id="quranScoreSummary"></p><div id="quranQuiz" class="quran-quiz" aria-live="polite"><p>Open a guided study or start the mixed challenge.</p></div></section>`;
 const $=id=>host.querySelector('#'+id);
 function choices(query=''){
  const q=query.trim().toLowerCase().replace(/[^a-z0-9]/g,'');
  const matches=surahs.filter(s=>!q||String(s.number)===q||s.name.toLowerCase().replace(/[^a-z0-9]/g,'').includes(q)||([108].includes(s.number)&&'alkawthar'.includes(q)));
  $('quranSurah').innerHTML=matches.map(s=>`<option value="${s.number}">${s.number}. ${esc(s.name)} · PDF ${s.page}</option>`).join('');
  $('quranSurah').disabled=!matches.length;
  $('quranSearchStatus').textContent=matches.length?`${matches.length} Surah${matches.length===1?'':'s'} found. Select one to read.`:'No matching Surah. Try a number from 1 to 114 or part of the name.';
  if(!q){const current=surahs.filter(s=>s.page<=page).at(-1);$('quranSurah').value=String(current?.number||1);}
 }
 let readerLoaded=false;
 function renderPage(){
  update(p=>p.resume=`pdf:${page}`);
  $('quranPage').value=page;
  $('quranPrev').disabled=page===1;$('quranNext').disabled=page===pdfPages;
  const destination=sourceFor(page);
  $('quranPageStatus').textContent=`Source PDF page ${page} of ${pdfPages} · Volume ${destination.volume}, page ${destination.localPage} · Your reading position is saved.`;
  const source=sourceFor(page);
  $('quranOpen').href=`${source.url}#page=${source.localPage}`;
  // Recreate the embedded document when navigating; native PDF viewers may ignore fragment-only src changes.
  if(readerLoaded){const frame=document.createElement('iframe');frame.id='quranPdf';frame.title=`Holy Quran, Arabic and English, PDF page ${page}`;frame.src=`${source.url}?p=${page}#page=${source.localPage}&view=FitH`; $('quranFrameHost').replaceChildren(frame);}
  const key=`quran-page-${page}`;
  $('quranBookmark').textContent=load().bookmarks.includes(key)?'Remove page bookmark':'Bookmark this page';
  $('quranBookmarks').innerHTML=load().bookmarks.filter(b=>/^quran-page-\d+$/.test(b)).map(b=>`<button type="button" data-page="${Number(b.slice(11))}">PDF ${Number(b.slice(11))}</button>`).join('')||'<p>No Quran page bookmarks yet.</p>';
  $('quranBookmarks').querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>go(b.dataset.page));
 }
 function go(n){page=clamp(n);$('quranSearch').value='';choices();renderPage();}
 $('quranSearch').oninput=e=>choices(e.target.value);
 $('quranSurah').onchange=e=>{const s=surahs.find(s=>s.number===Number(e.target.value));if(s)go(s.page);};
 $('quranPageForm').onsubmit=e=>{e.preventDefault();go($('quranPage').value);};
 $('quranPrev').onclick=()=>go(page-1);$('quranNext').onclick=()=>go(page+1);
 $('quranLoad').onclick=()=>{readerLoaded=true;renderPage();};
 $('quranBookmark').onclick=()=>{const key=`quran-page-${page}`;update(p=>{p.bookmarks=p.bookmarks.includes(key)?p.bookmarks.filter(b=>b!==key):[key,...p.bookmarks];});renderPage();};
 function refreshProgress(){
  const state=load();
  studies.forEach(s=>{host.querySelector(`[data-study-state="${s.id}"]`).textContent=`${state.completed.includes('quran-study-'+s.id)?'✓ Studied':'Ready to explore'}${state.scores['quran-'+s.id]!==undefined?' · Quiz '+state.scores['quran-'+s.id]+'%':''}`;});
  $('quranScoreSummary').textContent=`${studies.filter(s=>state.completed.includes('quran-study-'+s.id)).length} of 6 studies marked studied${state.scores['quran-mixed']!==undefined?' · Last mixed challenge: '+state.scores['quran-mixed']+'%':''}.`;
 }
 function study(s){
  active=s;const source=surahs.find(x=>x.number===s.surah);
  host.querySelectorAll('[data-study]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.study===s.id)));
  $('quranStudyPanel').innerHTML=`<span class="eyebrow">SURAH ${s.surah} · FIVE QUESTIONS</span><h3>${esc(s.title)}</h3><p>${esc(s.summary)}</p><button type="button" id="quranReadStudy">Read source · PDF page ${source.page}</button><h4>Your learning steps</h4><ol>${s.steps.map(t=>`<li>${esc(t)}</li>`).join('')}</ol><h4>Discover the words</h4><p>Try to recall the meaning before opening each card. Word forms and meaning can change with context.</p><div class="quran-word-grid">${s.words.map(([ar,h,en,hi])=>`<details class="quran-word"><summary><span lang="ar" dir="rtl">${esc(ar)}</span><small>${esc(h)} · reveal meaning</small></summary><p>${esc(en)}<br><span lang="hi">${esc(hi)}</span></p></details>`).join('')}</div><details class="quran-reflect"><summary>Pause &amp; reflect</summary><p>Without looking, explain this chapter’s main theme in one sentence. Then compare your explanation with the complete source. Your reflection is personal; it is separate from the translated text.</p></details><div class="actions"><button type="button" id="quranStudyQuiz">Take the 5-question quiz</button><button type="button" id="quranStudied"></button></div>`;
  const label=()=>$('quranStudied').textContent=load().completed.includes('quran-study-'+s.id)?'✓ Studied · undo':'Mark this study as studied';label();
  $('quranReadStudy').onclick=()=>{go(source.page);$('quranReader').scrollIntoView({behavior:'smooth'});};
  $('quranStudied').onclick=()=>{const key='quran-study-'+s.id;update(p=>{p.completed=p.completed.includes(key)?p.completed.filter(x=>x!==key):[...p.completed,key];});label();refreshProgress();};
  $('quranStudyQuiz').onclick=()=>begin(s.questions,'quran-'+s.id);
 }
 function begin(questions,key){
  if(!questions.length){$('quranQuiz').innerHTML='<p>No Quran mistakes to revise yet. Take a study quiz to build your revision list.</p>';$('quranRevision').scrollIntoView({behavior:'smooth'});return;}
  let queue=[...questions],i=0,correct=0,wrong=[];
  function question(){
   const q=queue[i],options=[...q.options];for(let n=options.length-1;n>0;n--){const j=Math.floor(Math.random()*(n+1));[options[n],options[j]]=[options[j],options[n]];}$('quranQuiz').innerHTML=`<p class="eyebrow">QUESTION ${i+1} OF ${queue.length}</p><progress max="${queue.length}" value="${i}" aria-label="Quiz progress"></progress><h4 tabindex="-1" id="quranQuestion">${esc(q.question)}</h4><div class="quran-answers">${options.map((o,n)=>`<button type="button" data-answer="${n}">${esc(o)}</button>`).join('')}</div><div id="quranFeedback" role="status"></div>`;
   $('quranQuestion').focus({preventScroll:true});
   $('quranQuiz').querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{
    const ok=options[Number(b.dataset.answer)]===q.answer;if(ok)correct++;else wrong.push(q);
    update(p=>{p.mistakes=p.mistakes.filter(id=>id!==q.id);if(!ok)p.mistakes.push(q.id);});
    $('quranQuiz').querySelectorAll('[data-answer]').forEach(x=>{x.disabled=true;if(options[Number(x.dataset.answer)]===q.answer)x.classList.add('correct');});
    $('quranFeedback').innerHTML=`<p><strong>${ok?'Correct.':'Let’s revise.'}</strong> ${esc(q.explanation)}</p>${ok?'':`<p>Answer: ${esc(q.answer)}</p>`}<button type="button" id="quranQuizNext">${i+1===queue.length?'See results':'Next question →'}</button>`;
    $('quranQuizNext').onclick=()=>{i++;i<queue.length?question():results();};
   });
  }
  function results(){
   const score=Math.round(correct/queue.length*100);update(p=>p.scores[key]=score);refreshProgress();
   $('quranQuiz').innerHTML=`<h4 tabindex="-1" id="quranResult">${score}% · ${correct} of ${queue.length} correct</h4><p>${wrong.length?'Review the explanations and try your missed questions again.':'Well done. Return to the source and explain the theme in your own words.'}</p>${wrong.length?'<button type="button" id="quranRetry">Retry missed questions</button>':''}<button type="button" id="quranRestart">Restart this quiz</button><p class="fine-print">This score reflects this understanding quiz. It does not certify memorisation or recitation.</p>`;
   $('quranResult').focus({preventScroll:true});
   if(wrong.length)$('quranRetry').onclick=()=>begin(wrong,'quran-revision');
   $('quranRestart').onclick=()=>begin(questions,key);
  }
  question();$('quranRevision').scrollIntoView({behavior:'smooth'});
 }
 host.querySelectorAll('[data-study]').forEach(b=>b.onclick=()=>study(studies.find(s=>s.id===b.dataset.study)));
 $('quranMixed').onclick=()=>begin(studies.flatMap(s=>s.questions),'quran-mixed');
 $('quranMistakes').onclick=()=>begin(studies.flatMap(s=>s.questions).filter(q=>load().mistakes.includes(q.id)),'quran-revision');
 choices();renderPage();study(active);refreshProgress();
}
