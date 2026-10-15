(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const state = { data: null, chapter: 1, filter: 'all', query: '', index: 0, items: [] };
  const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function selectChapter(number) {
    state.chapter = number; state.index = 0; state.query = ''; $('visualSearch').value = '';
    $('chapterSelect').value = String(number); renderChapters(); render();
    history.replaceState(null, '', '#chapter-' + number);
  }
  function renderChapters() {
    const search = $('chapterSearch').value.trim().toLowerCase();
    $('chapterList').innerHTML = state.data.chapters.filter(c => `${c.number} ${c.title}`.toLowerCase().includes(search)).map(c => {
      const items = state.data.items.filter(v => v.chapter === c.number);
      return `<button type="button" class="bd-chapter" data-chapter="${c.number}" aria-current="${c.number === state.chapter}"><span>${String(c.number).padStart(2,'0')}</span><span><strong>${esc(c.title)}</strong><small>${items.filter(i=>i.type==='diagram').length} diagrams · ${items.filter(i=>i.type==='table').length} tables</small></span></button>`;
    }).join('') || '<p>No chapters match your search.</p>';
  }
  function render() {
    const chapter = state.data.chapters.find(c => c.number === state.chapter);
    const all = state.data.items.filter(i => i.chapter === state.chapter);
    state.items = all.filter(i => (state.filter === 'all' || i.type === state.filter) && `${i.title} ${i.reference}`.toLowerCase().includes(state.query));
    state.index = Math.min(Math.max(0,state.index), Math.max(0,state.items.length-1));
    $('chapterNumber').textContent = `CHAPTER ${String(chapter.number).padStart(2,'0')} / 19`;
    $('chapterTitle').textContent = chapter.title;
    $('chapterSummary').textContent = `${all.filter(i=>i.type==='diagram').length} diagrams · ${all.filter(i=>i.type==='table').length} tables · Original NCERT visuals`;
    document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.filter===state.filter)));
    $('viewer').hidden = !state.items.length; $('emptyState').hidden = !!state.items.length;
    $('emptyMessage').textContent = !all.length ? 'This chapter has no numbered diagrams or tables in the supplied PDF.' : state.filter === 'table' && !all.some(i=>i.type==='table') ? 'This chapter has no numbered tables in the supplied PDF. Choose All or Diagrams to continue.' : 'Try All, another chapter, or a different search.';
    if (!state.items.length) return;
    $('visualSelect').innerHTML = state.items.map((item,i)=>`<option value="${i}">${esc(item.reference)}</option>`).join('');
    $('visualList').innerHTML = state.items.map((item,i)=>`<button type="button" class="bd-thumb" data-index="${i}" aria-label="View ${esc(item.title)}" aria-current="${i===state.index}"><img src="${item.src}" alt="" width="85" height="58" loading="lazy">${esc(item.reference)}</button>`).join('');
    showItem();
  }
  function showItem() {
    const item = state.items[state.index]; if (!item) return;
    $('visualImage').src = item.src; $('visualImage').alt = item.title;
    $('visualImage').width = item.width; $('visualImage').height = item.height;
    $('visualKind').textContent = item.type === 'table' ? 'NCERT Table' : 'NCERT Diagram';
    $('visualTitle').textContent = item.title;
    $('sourceNote').textContent = `NCERT Biology Class XI · Reprint 2025–26 · PDF page ${item.page} · Direct crop`;
    $('position').textContent = `${state.index+1} of ${state.items.length}`;
    $('previousButton').disabled = state.index === 0; $('nextButton').disabled = state.index === state.items.length-1;
    $('visualSelect').value = String(state.index);
    document.querySelectorAll('[data-index]').forEach(button => button.setAttribute('aria-current',String(Number(button.dataset.index)===state.index)));
    if (state.items[state.index+1]) { const image = new Image(); image.src = state.items[state.index+1].src; }
  }
  function step(delta) { state.index=Math.max(0,Math.min(state.items.length-1,state.index+delta)); showItem(); }
  function zoom() {
    const item=state.items[state.index]; if(!item)return;
    $('zoomTitle').textContent=item.reference; $('zoomImage').src=item.src; $('zoomImage').alt=item.title;
    $('zoomImage').width=item.width; $('zoomImage').height=item.height; $('zoomDialog').showModal();
  }
  async function load() {
    $('loadError').hidden=true;
    try {
      const response=await fetch('data/neet/diagrams/class11-biology.json?v=1');
      if(!response.ok)throw new Error('Library unavailable');
      state.data=await response.json();
      const diagrams=state.data.items.filter(i=>i.type==='diagram').length;
      $('libraryCount').textContent=`${diagrams} diagrams · ${state.data.items.length-diagrams} tables`;
      $('chapterSelect').innerHTML=state.data.chapters.map(c=>`<option value="${c.number}">${String(c.number).padStart(2,'0')} · ${esc(c.title)}</option>`).join('');
      const number=Number(location.hash.match(/^#chapter-(\d+)$/)?.[1]) || 1;
      selectChapter(state.data.chapters.some(c=>c.number===number)?number:1);
    } catch(error) { $('loadError').hidden=false; $('viewer').hidden=true; $('emptyState').hidden=true; $('libraryCount').textContent='Library unavailable'; console.error(error); }
  }
  $('chapterList').addEventListener('click',event=>{const button=event.target.closest('[data-chapter]');if(button)selectChapter(Number(button.dataset.chapter));});
  $('chapterSelect').addEventListener('change',event=>selectChapter(Number(event.target.value)));
  $('chapterSearch').addEventListener('input',()=>{if(state.data)renderChapters();});
  document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{state.filter=button.dataset.filter;state.index=0;if(state.data)render();}));
  $('visualSearch').addEventListener('input',event=>{state.query=event.target.value.trim().toLowerCase();state.index=0;if(state.data)render();});
  $('previousButton').addEventListener('click',()=>step(-1)); $('nextButton').addEventListener('click',()=>step(1));
  $('visualSelect').addEventListener('change',event=>{state.index=Number(event.target.value);showItem();});
  $('visualList').addEventListener('click',event=>{const button=event.target.closest('[data-index]');if(button){state.index=Number(button.dataset.index);showItem();}});
  $('openZoom').addEventListener('click',zoom); $('zoomButton').addEventListener('click',zoom);
  $('closeZoom').addEventListener('click',()=>$('zoomDialog').close());
  $('resetFilters').addEventListener('click',()=>{state.filter='all';state.query='';state.index=0;$('visualSearch').value='';render();});
  $('retryLoad').addEventListener('click',load);
  document.addEventListener('keydown',event=>{if(/INPUT|SELECT|TEXTAREA/.test(event.target.tagName)||$('zoomDialog').open||!state.data||$('viewer').hidden)return;if(event.key==='ArrowLeft')step(-1);if(event.key==='ArrowRight')step(1);});
  window.addEventListener('hashchange',()=>{const n=Number(location.hash.match(/^#chapter-(\d+)$/)?.[1]);if(state.data&&n!==state.chapter&&state.data.chapters.some(c=>c.number===n))selectChapter(n);});
  let started=false;
  function start(){if(!started&&window.__scrutinyStudentContext?.activeCourse==='neet'){started=true;load();}}
  window.addEventListener('scrutiny:dashboard-context',start);start();
})();
