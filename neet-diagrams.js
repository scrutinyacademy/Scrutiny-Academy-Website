(() => {
  const host=document.getElementById('neet-diagrams');
  if(!host)return;
  const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let catalog=null,subject='biology',chapterId='',kind='all',index=0,request=0;
  const allowed=()=>Boolean(window.__scrutinyStudentContext?.uid&&window.__scrutinyStudentContext.activeCourse==='neet');
  const chapters=()=>catalog.chapters.filter(c=>c.subject===subject);
  const chapter=()=>chapters().find(c=>c.id===chapterId)||chapters()[0];
  const items=()=>chapter().items.filter(i=>kind==='all'||i.type===kind);
  function render(){
    if(!allowed()||!catalog)return;
    const c=chapter();chapterId=c.id;
    host.innerHTML=`<div class="section-head inline"><div><span class="eyebrow">NEET UG · VISUAL REVISION</span><h2>Diagrams &amp; Tables</h2><p>Original PDF crops, organised by subject and chapter. Keep the labels in view as you revise.</p></div><span class="status active">${catalog.chapters.reduce((n,c)=>n+c.items.length,0)} visual panels · ${catalog.chapters.length} chapters</span></div><p><a class="btn ghost" href="neet-biology-diagrams.html">Open complete Class 11 Biology visual library →</a></p><div class="dv-subjects" role="group" aria-label="Diagram subjects">${['biology','chemistry','physics'].map(s=>`<button type="button" class="btn ${s===subject?'primary':'ghost'}" data-dv-subject="${s}" aria-pressed="${s===subject}">${s[0].toUpperCase()+s.slice(1)}</button>`).join('')}</div><div class="dv-filters"><label class="field">Chapter<select id="dvChapter">${chapters().map(c=>`<option value="${c.id}" ${c.id===chapterId?'selected':''}>Class ${c.classLevel} · ${e(c.title)}</option>`).join('')}</select></label><label class="field">Show<select id="dvKind"><option value="all">Diagrams &amp; tables</option><option value="diagram">Diagrams only</option><option value="table">Tables only</option></select></label><label class="field">Jump to visual<select id="dvJump"></select></label></div><div id="dvContent"></div><p class="dv-source-note">Class 11 Biology: all 19 chapters, plus the uploaded Physics and Chemistry chapters. Each panel is cropped directly from the supplied NCERT PDF; original labels and source styling are retained.</p>`;
    host.querySelector('#dvKind').value=kind;
    host.querySelectorAll('[data-dv-subject]').forEach(b=>b.onclick=()=>{subject=b.dataset.dvSubject;chapterId='';index=0;render();});
    host.querySelector('#dvChapter').onchange=ev=>{chapterId=ev.target.value;index=0;show();};
    host.querySelector('#dvKind').onchange=ev=>{kind=ev.target.value;index=0;show();};
    host.querySelector('#dvJump').onchange=ev=>{index=Number(ev.target.value);show();};show();
  }
  function show(){
    const list=items(),c=chapter();index=Math.max(0,Math.min(index,list.length-1));
    const jump=host.querySelector('#dvJump');jump.innerHTML=list.map((i,n)=>`<option value="${n}">${n+1}. ${e(i.title)}</option>`).join('');jump.value=String(index);jump.disabled=!list.length;
    const content=host.querySelector('#dvContent');
    if(!list.length){content.innerHTML='<div class="dv-empty"><h3>No tables in this chapter’s uploaded PDF.</h3><p>Choose “Diagrams &amp; tables” or another chapter.</p></div>';return;}
    const item=list[index];
    content.innerHTML=`<article class="dv-viewer"><div class="dv-title"><div><span class="eyebrow">${e(c.subject)} · CLASS ${c.classLevel} · ${item.type==='table'?'TABLE':'DIAGRAM'}</span><h3>${e(item.title)}</h3></div><button type="button" class="btn ghost" id="dvEnlarge">Enlarge ↗</button></div><p class="dv-counter" role="status">${e(c.title)} · ${index+1} of ${list.length}</p><figure><img id="dvImage" src="${e(item.image)}" width="${item.width}" height="${item.height}" alt="${e(item.title)} — original PDF crop" decoding="async"><figcaption>Source: ${e(c.source)} · PDF page ${item.page}</figcaption></figure><div class="dv-pager"><button type="button" class="btn ghost" id="dvPrevious" ${index===0?'disabled':''}>← Previous</button><span>${index+1} / ${list.length}</span><button type="button" class="btn primary" id="dvNext" ${index===list.length-1?'disabled':''}>Next →</button></div><p class="dv-image-error" id="dvImageError" role="alert" hidden>Image could not load. <button type="button" id="dvRetry">Retry image</button></p></article>`;
    content.querySelector('#dvPrevious').onclick=()=>{index--;show();};content.querySelector('#dvNext').onclick=()=>{index++;show();};
    const img=content.querySelector('#dvImage');img.onerror=()=>content.querySelector('#dvImageError').hidden=false;
    content.querySelector('#dvRetry').onclick=()=>{content.querySelector('#dvImageError').hidden=true;img.src=item.image+'?retry='+Date.now();};
    content.querySelector('#dvEnlarge').onclick=()=>{
      const dialog=document.createElement('dialog');dialog.className='dv-dialog';dialog.innerHTML=`<form method="dialog"><button class="btn primary" autofocus>Close ✕</button></form><p>${e(item.title)} · PDF page ${item.page}</p><div><img src="${e(item.image)}" alt="${e(item.title)}"></div>`;document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove());dialog.showModal();
    };
    if(list[index+1]){const preload=new Image();preload.src=list[index+1].image;}
  }
  async function sync(){
    const token=++request;host.hidden=!allowed();if(host.hidden){host.innerHTML='';document.querySelectorAll('.dv-dialog').forEach(d=>d.close());return;}
    if(catalog){render();return;}
    host.innerHTML='<h2>Diagrams &amp; Tables</h2><p role="status">Loading visual library…</p>';
    try{const response=await fetch('data/neet/diagrams/catalog.json?v=2');if(!response.ok)throw Error('load');const data=await response.json();if(token!==request||!allowed())return;catalog=data;render();}catch{if(token!==request)return;host.innerHTML='<h2>Diagrams &amp; Tables</h2><p>Could not load the visual library. Check your connection.</p><button type="button" class="btn primary">Retry</button>';host.querySelector('button').onclick=sync;}
  }
  addEventListener('scrutiny:dashboard-context',sync);addEventListener('scrutiny:student-changed',sync);sync();
})();
