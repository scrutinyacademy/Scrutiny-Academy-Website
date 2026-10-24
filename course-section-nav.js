(() => {
  const page = location.pathname.split('/').pop() || 'index.html';
  const batches = [
    {test:/^arabic-/,name:'Arabic & Quran',links:[['arabic-learning.html','Course overview'],['arabic-learning.html#alphabet','Alphabet'],['arabic-learning.html#practice','Revision'],['arabic-learning.html#quran','Quran resource status']]},
    {test:/^(class6-)/,name:'Class 6 CBSE',links:[['class6-cbse.html','Course home'],['class6-mathematics.html','Mathematics']]},
    {test:/^class8-ssc/,name:'Class 8 Telangana SSC',links:[['class8-ssc.html','Course home']]},
    {test:/^(class10-|mission600)/,name:'Class 10 SSC',links:[['class10-board.html','Board course'],['class10-lectures.html','Video lectures'],['mission600.html','Mission 600'],['mission600-dpp.html','DPP library']]},
    {test:/^sa1-booster/,name:'Class 10 SA-1 Booster',links:[['sa1-booster.html','Booster home'],['sa1-booster-maths.html','Mathematics'],['sa1-booster-physical-science.html','Physical Science'],['sa1-booster-biology.html','Biology'],['sa1-booster-social.html','Social Studies'],['sa1-booster-model-papers.html','Model papers']]},
    {test:/^(neet-|ncert-quest|physics-formulas)/,name:'NEET-UG',links:[['preview-v2.html?course=neet#neet','NEET dashboard'],['preview-v2.html?course=neet#neet-mcq-progress','My MCQ progress'],['preview-v2.html?course=neet#high-yield','High Yield MCQs'],['neet-ranker-free.html','Ranker MCQs'],['ncert-quest.html','NCERT Quest'],['preview-v2.html?course=neet#neet-diagrams','Diagrams & Tables'],['physics-formulas.html','Physics formulas'],['neet-kota-biology.html','Kota Biology'],['neet-biology-diagrams.html','Class 11 Biology visuals']]},
    {test:/^(jee)/,name:'IIT-JEE',links:[['jee.html','JEE course'],['jee-rigid-body-free.html','Rotational Motion']]},
    {test:/^preview-v2/,name:'Learning Portal',links:[['student.html','My courses']]},
  ];
  const batch=batches.find(x=>x.test.test(page))||{name:'Scrutiny Academy',links:[['student.html','My courses']]};
  const style=document.createElement('link');style.rel='stylesheet';style.href='course-section-nav.css?v=1';document.head.append(style);
  const button=document.createElement('button');button.type='button';button.className='sa-nav-trigger';button.setAttribute('aria-label','Open course sections');button.setAttribute('aria-expanded','false');button.innerHTML='<span aria-hidden="true">☰</span><b>SECTIONS</b>';
  const backdrop=document.createElement('div');backdrop.className='sa-nav-backdrop';backdrop.hidden=true;
  const drawer=document.createElement('aside');drawer.className='sa-nav-drawer';drawer.hidden=true;drawer.setAttribute('aria-hidden','true');drawer.setAttribute('aria-label','Course navigation');drawer.innerHTML=`<header><div><small>${batch.name}</small><strong>Choose a section</strong></div><button type="button" class="sa-nav-close" aria-label="Close course navigation">×</button></header><div class="sa-nav-content"><nav class="sa-page-sections" aria-label="On this page"></nav><nav class="sa-batch-links" aria-label="Batch shortcuts"></nav></div><footer><button type="button" class="sa-nav-back">← Back</button><a href="student.html">My Courses</a></footer>`;
  document.body.append(backdrop,drawer,button);
  const tidy=text=>String(text||'').replace(/\s+/g,' ').trim();
  const visible=el=>!el.hidden&&el.getAttribute('aria-hidden')!=='true'&&getComputedStyle(el).display!=='none';
  function titleFor(el){return tidy(el.querySelector('h1,h2,h3,[data-section-title]')?.textContent||el.getAttribute('aria-label')||el.id.replace(/[-_]/g,' '));}
  function render(){
    const found=[...document.querySelectorAll('main section[id],main [role="region"][id]')].filter(visible).filter((el,i,a)=>a.indexOf(el)===i).map(el=>[el.id,titleFor(el)]).filter(([,label])=>label&&label.length<90).slice(0,24);
    const sectionNav=drawer.querySelector('.sa-page-sections');sectionNav.innerHTML=found.length?'<span>ON THIS PAGE</span>'+found.map(([id,label],i)=>`<button type="button" data-target="${id}"><i>${String(i+1).padStart(2,'0')}</i>${label}</button>`).join(''):'<p>This page has one learning activity.</p>';
    sectionNav.querySelectorAll('[data-target]').forEach(item=>item.onclick=()=>{close();document.getElementById(item.dataset.target)?.scrollIntoView({behavior:'smooth',block:'start'});});
    const unique=batch.links.filter(([href],i,a)=>a.findIndex(x=>x[0]===href)===i);drawer.querySelector('.sa-batch-links').innerHTML='<span>BATCH SHORTCUTS</span>'+unique.map(([href,label])=>`<a href="${href}"${href.split('#')[0]===page?' aria-current="page"':''}>${label}</a>`).join('');
  }
  function open(){render();drawer.hidden=false;backdrop.hidden=false;drawer.setAttribute('aria-hidden','false');button.setAttribute('aria-expanded','true');document.documentElement.classList.add('sa-nav-open');drawer.querySelector('.sa-nav-close').focus();}
  function close(){drawer.hidden=true;backdrop.hidden=true;drawer.setAttribute('aria-hidden','true');button.setAttribute('aria-expanded','false');document.documentElement.classList.remove('sa-nav-open');}
  button.onclick=open;backdrop.onclick=close;drawer.querySelector('.sa-nav-close').onclick=close;drawer.querySelector('.sa-nav-back').onclick=()=>history.length>1?history.back():location.assign('student.html');document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!drawer.hidden){close();button.focus();}});
})();
