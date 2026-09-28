(function(){
  "use strict";
  const course=window.SA1_COURSE;
  if(!course)return;
  const $=s=>document.querySelector(s);
  const nav=$("#chapterNav"),content=$("#content"),select=$("#chapterSelect"),progress=$("#progressFill"),progressText=$("#progressText");
  const key="sa1-progress-"+course.slug;
  let chapterIndex=0,flashIndex=0,state=JSON.parse(localStorage.getItem(key)||"{}");
  const esc=s=>String(s).replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  function updateProgress(){
    const complete=course.chapters.filter(ch=>state[ch.id]).length;
    progress.style.width=(complete/course.chapters.length*100)+"%";
    progressText.textContent=complete+" / "+course.chapters.length+" chapters revised";
  }
  function sectionHTML(s){return `<article class="section"><h3>${s.icon||"✦"} ${s.title}</h3>${s.body||""}${s.formula?`<div class="formula">${s.formula}</div>`:""}${s.table?`<div class="diagram">Swipe table sideways on mobile</div><table class="quick-table">${s.table}</table>`:""}${s.memory?`<div class="memory"><strong>🧠 Never-forget hook:</strong> ${s.memory}</div>`:""}${s.exam?`<div class="exam"><strong>✍️ Exam-ready line:</strong> ${s.exam}</div>`:""}${s.trap?`<div class="trap"><strong>⚠ Common trap:</strong> ${s.trap}</div>`:""}</article>`}
  function flashHTML(ch){const f=ch.flashcards[flashIndex];return `<section class="flash-area"><div class="flash-head"><h3>⚡ Active-recall flashcards</h3><span class="counter">${flashIndex+1} / ${ch.flashcards.length}</span></div><div class="flashcard" id="flashcard" tabindex="0" role="button" aria-label="Flip flashcard"><div class="flash-inner"><div class="face front"><small>QUESTION · TAP TO FLIP</small><div>${f.q}</div></div><div class="face back"><small>ANSWER</small><div>${f.a}</div></div></div></div><div class="flash-controls"><button data-flash="prev">← Previous</button><button data-flash="shuffle">Shuffle</button><button data-flash="next">Next →</button></div></section>`}
  function quizHTML(ch){if(!ch.quiz?.length)return "";return `<section class="quiz"><h3>🎯 3-question mastery check</h3>${ch.quiz.map((q,i)=>`<div class="q-card" data-q="${i}"><p>${i+1}. ${q.q}</p>${q.options.map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${o}</label>`).join("")}<button class="answer-toggle" data-check="${i}">Check answer</button><div class="feedback"></div></div>`).join("")}</section>`}
  function render(){
    const ch=course.chapters[chapterIndex];flashIndex=0;
    content.innerHTML=`<header class="chapter-title">${ch.bonus?'<span class="bonus">BONUS · BEYOND CORE SA-1 PORTION</span>':""}<h2>${ch.icon} ${ch.title}</h2><p>${ch.subtitle}</p><div class="memory-road"><strong>One mental movie for the whole chapter</strong><div class="road-steps">${ch.road.map(x=>`<span>${x}</span>`).join("")}</div></div><div class="study-actions"><button class="done-btn ${state[ch.id]?"is-done":""}" id="doneBtn">${state[ch.id]?"✓ Revised":"Mark chapter revised"}</button><button class="ghost" id="printBtn">🖨 Print / Save PDF</button></div></header>${ch.sections.map(sectionHTML).join("")}<div id="flashMount">${flashHTML(ch)}</div>${quizHTML(ch)}<p class="source-note">Prepared from the uploaded Telangana SCERT Class 10 textbook. Explanations are rewritten as original memory-first notes. Always follow your school’s latest portion notice.</p>`;
    bindContent();updateNav();
  }
  function bindContent(){
    const ch=course.chapters[chapterIndex];
    $("#doneBtn").onclick=()=>{state[ch.id]=!state[ch.id];localStorage.setItem(key,JSON.stringify(state));render();updateProgress()};
    $("#printBtn").onclick=()=>window.print();
    const card=$("#flashcard");card.onclick=()=>card.classList.toggle("flipped");card.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();card.click()}};
    document.querySelectorAll("[data-flash]").forEach(b=>b.onclick=()=>{const a=b.dataset.flash;if(a==="prev")flashIndex=(flashIndex-1+ch.flashcards.length)%ch.flashcards.length;else if(a==="next")flashIndex=(flashIndex+1)%ch.flashcards.length;else flashIndex=Math.floor(Math.random()*ch.flashcards.length);$("#flashMount").innerHTML=flashHTML(ch);bindFlashOnly()});
    document.querySelectorAll("[data-check]").forEach(b=>b.onclick=()=>{const i=+b.dataset.check,box=b.closest(".q-card"),picked=box.querySelector("input:checked"),feed=box.querySelector(".feedback");box.classList.add("checked");if(!picked){feed.textContent="Choose an option first.";feed.style.color="#a05e00";return}const ok=+picked.value===ch.quiz[i].answer;feed.innerHTML=(ok?"✅ Correct. ":"❌ Revise this. ")+ch.quiz[i].why;feed.style.color=ok?"#147348":"#a52f2f"});
  }
  function bindFlashOnly(){const ch=course.chapters[chapterIndex],card=$("#flashcard");card.onclick=()=>card.classList.toggle("flipped");card.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();card.click()}};document.querySelectorAll("[data-flash]").forEach(b=>b.onclick=()=>{const a=b.dataset.flash;if(a==="prev")flashIndex=(flashIndex-1+ch.flashcards.length)%ch.flashcards.length;else if(a==="next")flashIndex=(flashIndex+1)%ch.flashcards.length;else flashIndex=Math.floor(Math.random()*ch.flashcards.length);$("#flashMount").innerHTML=flashHTML(ch);bindFlashOnly()})}
  function updateNav(){nav.querySelectorAll("button").forEach((b,i)=>b.classList.toggle("on",i===chapterIndex));select.value=chapterIndex;document.title=course.chapters[chapterIndex].title+" | Scrutiny Academy"}
  function init(){
    $("#courseTitle").textContent=course.title;$("#courseSubtitle").textContent=course.subtitle;$("#courseCount").textContent=course.chapters.length+" chapters";
    course.chapters.forEach((ch,i)=>{const b=document.createElement("button");b.innerHTML=`<span class="num">${i+1}</span><span>${esc(ch.title)}</span>`;b.onclick=()=>{chapterIndex=i;render();scrollTo({top:0,behavior:"smooth"})};nav.appendChild(b);const o=document.createElement("option");o.value=i;o.textContent=(i+1)+". "+ch.title;select.appendChild(o)});
    select.onchange=()=>{chapterIndex=+select.value;render()};render();updateProgress();
  }
  init();
})();
