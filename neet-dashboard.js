/* NEET landing dashboard. Content, scoring and authentication stay in their existing modules. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const icons = {
    book:'<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1Zm0 0v14"/>',
    sheet:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m12 12 9-9M17 3h4v4"/>',
    trophy:'<path d="M7 3h10v6a5 5 0 0 1-10 0zm0 2H3v3a4 4 0 0 0 5 4M17 5h4v3a4 4 0 0 1-5 4M12 14v6m-5 1h10"/>',
    chart:'<path d="M4 21V11h4v10m4 0V7h4v14m4 0V3M3 6l6-3 5 1 6-3"/>',
    cards:'<rect x="6" y="6" width="14" height="15" rx="2"/><path d="M16 3H5a2 2 0 0 0-2 2v11m7-5h6m-6 4h4"/>',
    atom:'<ellipse cx="12" cy="12" rx="10" ry="4"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/><circle cx="12" cy="12" r="1"/>',
    leaf:'<path d="M20 3C5 3 2 8 5 15s16 5 15-12ZM4 21 16 8"/>',
    flask:'<path d="M9 3h6m-5 0v7L4 20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1l-6-10V3M7 16h10"/>',
    bolt:'<path d="m14 2-10 12h7l-1 8 10-12h-7z"/>',
    game:'<path d="M7 7h10c4 0 6 13 3 13-2 0-3-5-5-5H9c-2 0-3 5-5 5C1 20 3 7 7 7Zm0 3v5m-2-2h5m6-2h.01m3 3h.01"/>',
    bookmark:'<path d="M6 3h12v19l-6-5-6 5z"/>'
  };
  const icon = (name,tone='blue') => `<span class="nd-icon nd-${tone}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${icons[name] || icons.sheet}</svg></span>`;
  const format = n => Number(n || 0).toLocaleString('en-IN');
  let mounted = false, inventory, latestPractice;
  const tasks = [ ['Study 1 chapter (any subject)','#neetChapterPractice'], ['Solve 50 MCQs','#high-yield'], ['Revise 20 flashcards','#flashcards'], ['Take a short quiz (10 Qs)','#neetChapterPractice'], ["Review today’s mistakes",'#mcqMistakeReview'] ];
  function permitted(){ const c=window.__scrutinyStudentContext; return c?.activeCourse==='neet' && c.uid && c.uid===window.ScrutinyStudentStorage?.uid; }
  function day(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
  function taskState(){ try{return JSON.parse(window.ScrutinyStudentStorage.getItem('scrutiny_neet_mission_'+day())) || [];}catch{return [];}}
  function renderTasks(){
    if(!mounted) return;
    const saved=permitted()?taskState():[];
    $('ndMissionTasks').innerHTML=tasks.map(([label,href],i)=>`<div class="nd-task"><input type="checkbox" id="ndTask${i}" data-task="${i}" ${saved.includes(i)?'checked':''} aria-label="Mark ${label.replaceAll('"','&quot;')} complete"><a href="${href}">${label}<span aria-hidden="true">›</span></a></div>`).join('');
    $('ndMissionCount').textContent=`${saved.length} of 5 completed · daily self-check`;
  }
  function practice(detail){
    latestPractice=detail;
    if(!mounted || !permitted()) return;
    const total=detail?.total;
    if(!total) return;
    $('ndPractised').textContent=format(total.attempted);
    $('ndCorrect').textContent=format(total.correct);
    $('ndIncorrect').textContent=format(total.incorrect);
    const accuracy=total.attempted?Math.round(total.correct/total.attempted*100):0;
    $('ndAccuracy').textContent=total.attempted?accuracy+'%':'—';
    $('ndProgressRing').style.setProperty('--nd-progress',accuracy+'%');
    $('ndPracticeNote').textContent=total.attempted?'Accuracy across your recorded practice attempts':'Complete your first practice session to see your accuracy.';
  }
  function moveCountdown(){const node=$('neet2028Countdown'); if(mounted && node && node.parentElement!==$('ndCountdown')) $('ndCountdown').append(node);}
  async function loadInventory(){
    try{
      const response=await fetch('data/neet/mcq-inventory.json',{cache:'no-store'});
      if(!response.ok) throw Error('Inventory unavailable');
      inventory=await response.json();
      if(!mounted || !permitted()) return;
      $('ndTotal').textContent=format(inventory.totalPublishedMcqs);
      $('ndHighYield').textContent=format(inventory.sections.highYield);
      $('ndKota').textContent=format(inventory.sections.kotaLevel);
      $('ndPyq').textContent=format(inventory.sections.pyq2025);
      for(const subject of ['biology','chemistry','physics']) $('nd-'+subject+'-count').textContent=format(inventory.bySubject[subject]?.total)+' MCQs';
    }catch{ if($('ndTotal')) $('ndTotal').textContent='Unavailable'; }
  }
  function mount(){
    if(!permitted()) return;
    if(mounted){renderTasks();moveCountdown();return;}
    mounted=true;
    document.documentElement.style.setProperty('--portal-accent','#0064ed');
    const home=$('home');
    home.classList.add('nd-home');
    home.querySelector('h1').innerHTML='Your <span>NEET-UG</span><br>Success Space.';
    home.querySelector('.hero-copy > p').textContent='NCERT-focused learning, high-yield MCQs, PYQs and practice tests — with analysis that helps you improve.';
    home.querySelector('.hero-actions a').textContent='▶  Start Learning →';
    home.querySelector('.hero-actions a').href='#neetChapterPractice';
    home.querySelector('.hero-copy > .eyebrow').classList.add('nd-welcome');
    const process=document.createElement('div'); process.className='nd-process';
    process.innerHTML=[['book','green','Learn','Concepts made simple'],['cards','purple','Revise','Flashcards & sheets'],['target','orange','Practise','Chapter-wise MCQs'],['sheet','blue','Test','PYQs & quizzes'],['chart','pink','Analyse','Detailed performance'],['chart','teal','Improve','Track your progress']].map(([i,t,title,copy])=>`<a href="${({Learn:'#neetChapterPractice',Revise:'#flashcards',Practise:'#high-yield',Test:'#pyqs',Analyse:'#neet-mcq-progress',Improve:'#progress'})[title]}">${icon(i,t)}<strong>${title}</strong><small>${copy}</small></a>`).join('');
    home.querySelector('.hero-actions').before(process);
    const art=document.createElement('div');art.className='nd-hero-art';art.innerHTML='<img src="assets/neet-dashboard-hero.webp" width="1024" height="1024" alt="Stethoscope resting on NCERT Biology, Chemistry and Physics textbooks" fetchpriority="high">';home.append(art);
    const rail=document.createElement('aside');rail.className='nd-rail';rail.innerHTML=`<div class="nd-countdown-card"><h2>▦ NEET 2028</h2><p>Your dream is closer than you think!</p><div id="ndCountdown"></div></div><div class="nd-mission-card"><div class="nd-card-heading"><h2>🎯 Today’s Mission</h2><a href="#neetChapterPractice">View all →</a></div><div id="ndMissionTasks"></div><small id="ndMissionCount"></small><a class="nd-primary" href="#neetChapterPractice">Start Today’s Mission →</a></div>`;home.append(rail);
    const overview=document.createElement('div');overview.className='nd-overview';overview.innerHTML=`
      <div class="nd-stats" aria-label="NEET learning statistics">
        <a href="#neetPublishedInventory">${icon('book')}<div><span>Total MCQs Published <b class="nd-live">Live</b></span><strong id="ndTotal">—</strong><small>Across all NEET subjects</small></div></a>
        <a href="#neetChapterPractice">${icon('sheet')}<div><span>Chapters Available</span><div id="ndChapterMetric"></div><small>NCERT based</small></div></a>
        <a href="#high-yield">${icon('target','pink')}<div><span>High Yield MCQs</span><strong id="ndHighYield">—</strong><small>Topic-wise practice</small></div></a>
        <a href="neet-kota-biology.html">${icon('trophy','orange')}<div><span>Kota Level MCQs</span><strong id="ndKota">—</strong><small>Advanced practice</small></div></a>
        <a href="#pyqs">${icon('cards','purple')}<div><span>NEET 2025 PYQs</span><strong id="ndPyq">—</strong><small>With solutions</small></div></a>
        <a href="#neet-mcq-progress">${icon('chart','green')}<div><span>Your Practice</span><strong id="ndPractised">—</strong><small>MCQ attempts recorded</small></div></a>
      </div>
      <div class="nd-section-heading"><h2>NEET UG — Quick Access</h2><a href="#neet">View all →</a></div>
      <div class="nd-quick">${[['book','green','Chapter-wise Study','#neetChapterPractice'],['sheet','orange','High Yield MCQs','#high-yield'],['trophy','purple','Ranker MCQs','#ranker'],['cards','pink','Previous Year Questions','#pyqs'],['game','blue','NCERT Learning Arcade','ncert-quest.html'],['bolt','teal','Formula Vault','physics-formulas.html'],['sheet','orange','Revision Sheets','#tools'],['bookmark','purple','Error Review','#mcqMistakeReview']].map(([i,t,title,href])=>`<a class="nd-tile nd-${t}" href="${href}">${icon(i,t)}<strong>${title}</strong><span aria-hidden="true">›</span></a>`).join('')}</div>
      <div class="nd-bottom"><div class="nd-subjects nd-card"><h2>Subjects</h2><div class="nd-subject-grid">${[['biology','leaf','green','Biology'],['chemistry','flask','orange','Chemistry'],['physics','atom','blue','Physics']].map(([id,i,t,name])=>`<article>${icon(i,t)}<div><h3>${name}</h3><p id="nd-${id}-count">Loading questions…</p><button type="button" data-nd-subject="${id}">Explore →</button></div></article>`).join('')}</div></div>
      <div class="nd-card nd-progress"><div class="nd-card-heading"><h2>Your Practice</h2><a href="#neet-mcq-progress">Detailed report →</a></div><div class="nd-progress-body"><a href="#neet-mcq-progress" class="nd-ring" id="ndProgressRing"><strong id="ndAccuracy">—</strong><small>Accuracy</small></a><div><p><i class="nd-dot nd-green"></i>Correct <b id="ndCorrect">—</b></p><p><i class="nd-dot nd-pink"></i>Incorrect <b id="ndIncorrect">—</b></p><a class="nd-review-link" href="#mcqMistakeReview">Review mistakes →</a></div></div><small id="ndPracticeNote">Loading your practice record…</small></div>
      <div class="nd-quote"><span aria-hidden="true">“</span><blockquote>Consistent practice today,<br>a doctor tomorrow.</blockquote><small>— Scrutiny Academy</small><div aria-hidden="true">♡ ── ♡ ── ♡</div></div></div>`;
    home.append(overview);
    // Retain the original metric IDs: the course renderer continues to update them.
    $('ndChapterMetric').append($('metricChapters'));
    $('metricChapters').removeAttribute('class');
    $('neet').querySelectorAll('.section-head')[1]?.setAttribute('id','neetChapterPractice');
    if(!$('neetChapterPractice')) $('neetSubject')?.closest('.explorer')?.setAttribute('id','neetChapterPractice');
    home.addEventListener('change',event=>{
      const input=event.target.closest('[data-task]');if(!input || !permitted())return;
      const saved=new Set(taskState());const i=Number(input.dataset.task);input.checked?saved.add(i):saved.delete(i);
      window.ScrutinyStudentStorage.setItem('scrutiny_neet_mission_'+day(),JSON.stringify([...saved]));renderTasks();
    });
    home.addEventListener('click',event=>{
      const button=event.target.closest('[data-nd-subject]');if(!button)return;
      const select=$('neetSubject');if(!select)return;
      select.value=button.dataset.ndSubject;select.dispatchEvent(new Event('change',{bubbles:true}));
      location.hash='neetChapterPractice';
    });
    const neetLink=document.querySelector('#mainNav a[href="#neet"]');if(neetLink){neetLink.textContent='NEET UG';neetLink.classList.add('nd-current');}
    renderTasks();moveCountdown();loadInventory();if(latestPractice)practice(latestPractice);
  }
  addEventListener('scrutiny:dashboard-context',mount);
  addEventListener('scrutiny:neet-dashboard-stats',event=>practice(event.detail));
  addEventListener('scrutiny:student-changed',()=>{latestPractice=null;if(mounted){for(const id of ['ndPractised','ndCorrect','ndIncorrect','ndAccuracy']) $(id).textContent='—';$('ndProgressRing').style.setProperty('--nd-progress','0%');renderTasks();}});
  // Countdown may mount after the authenticated dashboard event.
  new MutationObserver(moveCountdown).observe(document.querySelector('.header-session-actions'),{childList:true});
  addEventListener('pageshow',()=>{if(mounted)renderTasks();});
  mount();
})();
