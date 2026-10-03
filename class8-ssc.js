import { firebaseConfig, SCRUTINY_ADMIN_EMAILS } from "./firebase-config.js";
import { entitledCourses } from "./course-catalog.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, getIdTokenResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const CONTENT = window.CLASS8_CONTENT || {};
const SUBJECTS = Object.keys(CONTENT);
const $ = (id) => document.getElementById(id);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const todayKey = () => new Date().toISOString().slice(0, 10);
let storeKey = "scrutiny_class8_guest";
let selectedSubject = SUBJECTS[0];
let activeChapter = null;
let activeMode = "learn";
let quizIndex = 0;
let quizScore = 0;
let quizLocked = false;
let state = {xp:0,streak:1,lastVisit:"",activities:0,chapters:{},mistakes:[],mission:{date:"",done:[]},lastChapter:""};

function loadState() {
  try { state = {...state, ...JSON.parse(localStorage.getItem(storeKey) || "{}")}; } catch {}
  const today = todayKey();
  if (state.lastVisit !== today) {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    state.streak = state.lastVisit === yesterday.toISOString().slice(0,10) ? (state.streak || 0) + 1 : 1;
    state.lastVisit = today;
  }
  if (state.mission?.date !== today) state.mission = {date:today,done:[]};
  saveState(false);
}

function saveState(render = true) {
  localStorage.setItem(storeKey, JSON.stringify(state));
  if (render) { renderStats(); renderMastery(); renderMistakes(); renderMission(); }
}

function chapterState(id) {
  state.chapters[id] ||= {learn:0,recall:0,practice:0,write:0,revision:0};
  return state.chapters[id];
}

function earn(type, points, value = 100) {
  if (!activeChapter) return;
  const progress = chapterState(activeChapter.id);
  progress[type] = Math.max(progress[type] || 0, value);
  state.xp += points;
  state.activities += 1;
  const missionMap = {learn:0,recall:1,practice:2,write:3,revision:1};
  const mission = missionMap[type];
  if (mission !== undefined && !state.mission.done.includes(mission)) state.mission.done.push(mission);
  state.lastChapter = activeChapter.id;
  saveState();
}

function findChapter(id) {
  for (const subject of SUBJECTS) {
    const chapter = CONTENT[subject].chapters.find((item) => item.id === id);
    if (chapter) return {subject, chapter};
  }
  return null;
}

function renderStats() {
  $("streakCount").textContent = state.streak || 1;
  $("xpCount").textContent = state.xp || 0;
  $("activityCount").textContent = state.activities || 0;
}

function renderMission() {
  const missions = ["Learn one concept set","Complete active recall","Practise chapter questions","Write one full answer"];
  $("missionList").innerHTML = missions.map((label,index) => `<label class="mission-item ${state.mission.done.includes(index)?"done":""}"><input type="checkbox" ${state.mission.done.includes(index)?"checked":""} disabled><span>${label}</span></label>`).join("");
  $("missionDone").textContent = `${state.mission.done.length}/4`;
}

function renderSubjects() {
  $("subjectTabs").innerHTML = SUBJECTS.map((subject) => `<button data-subject="${esc(subject)}" style="--subject-color:${CONTENT[subject].color}" class="${subject===selectedSubject?"active":""}">${CONTENT[subject].icon} ${esc(subject)}</button>`).join("");
  $("subjectTabs").querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {selectedSubject=button.dataset.subject;renderSubjects();renderChapters();}));
  $("examSubject").innerHTML = SUBJECTS.map((s)=>`<option>${esc(s)}</option>`).join("");
}

function chapterMastery(chapter) {
  const p = chapterState(chapter.id);
  return Math.round((p.learn + p.recall + p.practice + p.write + p.revision) / 5);
}

function renderChapters() {
  const subject = CONTENT[selectedSubject];
  $("chapterGrid").innerHTML = subject.chapters.map((chapter,index) => `<article class="chapter-card" style="--subject-color:${subject.color}"><span class="number">${index+1}</span><h3>${esc(chapter.title)}</h3><p>${esc(chapter.intro)}</p><div class="chapter-meta"><span>${chapter.concepts.length} concept lessons</span><strong>${chapterMastery(chapter)}% mastered</strong></div><button data-chapter="${chapter.id}">${state.lastChapter===chapter.id?"Continue":"Start learning"}</button></article>`).join("");
  $("chapterGrid").querySelectorAll("button").forEach((button) => button.addEventListener("click", () => openChapter(button.dataset.chapter)));
}

function openChapter(id, mode = "learn") {
  const found = findChapter(id); if (!found) return;
  selectedSubject = found.subject; activeChapter = found.chapter; activeMode = mode; state.lastChapter = id; saveState(false);
  $("activeSubject").textContent = `${CONTENT[selectedSubject].icon} ${selectedSubject}`;
  $("chapterTitle").textContent = activeChapter.title;
  $("chapterIntro").textContent = activeChapter.intro;
  $("learning").hidden = false;
  document.querySelectorAll("[data-mode]").forEach((button) => button.classList.toggle("active",button.dataset.mode===mode));
  renderLearning(); $("learning").scrollIntoView({behavior:"smooth",block:"start"});
}

function renderLearning() {
  if (!activeChapter) return;
  if (activeMode === "learn") renderLearn();
  if (activeMode === "flashcards") renderFlashcards();
  if (activeMode === "practice") startQuiz();
  if (activeMode === "write") renderWriting();
}

function renderLearn() {
  $("learningPanel").innerHTML = `<div class="concept-list">${activeChapter.concepts.map((item,index)=>`<article class="concept"><span class="eyebrow">CONCEPT ${index+1}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p><div class="example"><b>Example:</b> ${esc(item.example)}</div></article>`).join("")}</div><div class="complete-row"><button class="primary-action" id="completeLearn">I understand this chapter +20 XP</button></div>`;
  $("completeLearn").addEventListener("click",()=>{earn("learn",20);$("completeLearn").textContent="Concept learning complete ✓";$("completeLearn").disabled=true;});
}

function renderFlashcards(start = 0) {
  let index = start; let revealed = false;
  const draw = () => {
    const card = activeChapter.cards[index];
    $("learningPanel").innerHTML = `<div class="flash-stage"><div class="flash-card" id="flashCard"><div><span>${revealed?"ANSWER":"TAP TO REVEAL"}</span>${revealed?`<p>${esc(card[1])}</p>`:`<strong>${esc(card[0])}</strong>`}</div></div><div class="flash-controls"><button id="prevCard" ${index===0?"disabled":""}>← Previous</button><span>${index+1} / ${activeChapter.cards.length}</span><button id="nextCard">${index===activeChapter.cards.length-1?"Finish":"Next →"}</button></div></div>`;
    $("flashCard").onclick=()=>{revealed=!revealed;draw();};
    $("prevCard").onclick=()=>{index--;revealed=false;draw();};
    $("nextCard").onclick=()=>{if(index===activeChapter.cards.length-1){earn("recall",15);$("learningPanel").insertAdjacentHTML("beforeend",'<p class="feedback">Flashcard sprint complete — recall strengthened ✓</p>');}else{index++;revealed=false;draw();}};
  }; draw();
}

function startQuiz() { quizIndex=0;quizScore=0;quizLocked=false;renderQuestion(); }
function renderQuestion() {
  const questions = activeChapter.quiz;
  if (quizIndex >= questions.length) {
    const percentage = Math.round(quizScore/questions.length*100);
    earn("practice",25,percentage);
    $("learningPanel").innerHTML = `<div class="quiz-card"><span class="eyebrow">RESULT</span><h3>${quizScore}/${questions.length} correct • ${percentage}%</h3><p class="feedback">${percentage>=80?"Excellent. Your concept application is strong.":percentage>=50?"Good start. Review the mistakes saved below, then retry.":"Return to Learn, revise each concept and try once more."}</p><button class="primary-action" id="retryQuiz">Try again</button></div>`;
    $("retryQuiz").onclick=startQuiz; return;
  }
  const [question,answer,options] = questions[quizIndex]; quizLocked=false;
  $("learningPanel").innerHTML = `<div class="quiz-card"><div class="quiz-progress"><span style="width:${quizIndex/questions.length*100}%"></span></div><span class="eyebrow">QUESTION ${quizIndex+1} OF ${questions.length}</span><h3>${esc(question)}</h3><div class="options">${options.map((option)=>`<button class="option">${esc(option)}</button>`).join("")}</div><div id="quizFeedback"></div></div>`;
  $("learningPanel").querySelectorAll(".option").forEach((button)=>button.onclick=()=>answerQuestion(button,answer,question));
}

function answerQuestion(button, answer, question) {
  if (quizLocked) return; quizLocked=true;
  const correct = button.textContent === answer;
  button.classList.add(correct?"correct":"wrong");
  $("learningPanel").querySelectorAll(".option").forEach((b)=>{b.disabled=true;if(b.textContent===answer)b.classList.add("correct");});
  if(correct){quizScore++;removeMistake(question);}else addMistake(question,answer,activeChapter.id);
  $("quizFeedback").innerHTML=`<div class="feedback"><b>${correct?"Correct!":"Not quite."}</b> ${correct?"Well done.":`Correct answer: ${esc(answer)}`}</div><button class="primary-action" id="nextQuestion" style="margin-top:12px">${quizIndex===activeChapter.quiz.length-1?"See result":"Next question"}</button>`;
  $("nextQuestion").onclick=()=>{quizIndex++;renderQuestion();};
}

function addMistake(question,answer,chapterId){if(!state.mistakes.some((m)=>m.question===question)){state.mistakes.push({question,answer,chapterId,date:todayKey()});saveState(false);}}
function removeMistake(question){state.mistakes=state.mistakes.filter((m)=>m.question!==question);saveState(false);}

function renderWriting() {
  $("learningPanel").innerHTML = `<div class="writing-area"><div><span class="eyebrow">SSC-STYLE WRITTEN PRACTICE</span><h3>${esc(activeChapter.write)}</h3><textarea id="writtenAnswer" placeholder="Write your complete answer here…"></textarea></div><aside class="rubric"><h3>Self-check before submitting</h3>${activeChapter.rubric.map((item,index)=>`<label><input type="checkbox" data-rubric="${index}"><span>${esc(item)}</span></label>`).join("")}<button class="primary-action" id="saveWriting">Save writing practice</button><p id="writingFeedback"></p></aside></div>`;
  $("saveWriting").onclick=()=>{const answer=$("writtenAnswer").value.trim();const checks=[...document.querySelectorAll("[data-rubric]:checked")].length;if(answer.length<40){$("writingFeedback").textContent="Write at least a few complete sentences first.";return}const score=Math.round(checks/activeChapter.rubric.length*100);earn("write",30,Math.max(40,score));$("writingFeedback").innerHTML=`Saved ✓ Self-check score: <b>${score}%</b>. ${checks<activeChapter.rubric.length?"Improve the unchecked points, then rewrite once.":"Strong structure—well done."}`;};
}

function renderMastery() {
  const chapterValues = SUBJECTS.flatMap((s)=>CONTENT[s].chapters.map(chapterMastery));
  const overall = chapterValues.length ? Math.round(chapterValues.reduce((a,b)=>a+b,0)/chapterValues.length) : 0;
  $("masteryScore").textContent=`${overall}%`;document.querySelector(".mastery-ring").style.setProperty("--mastery",`${overall}%`);
  const skills = [["Concepts","learn"],["Recall","recall"],["Practice","practice"],["Writing","write"],["Revision","revision"]];
  $("skillBars").innerHTML=skills.map(([label,key])=>{const values=SUBJECTS.flatMap(s=>CONTENT[s].chapters.map(c=>chapterState(c.id)[key]||0));const v=Math.round(values.reduce((a,b)=>a+b,0)/values.length);return `<div class="skill-row"><span>${label}</span><div class="skill-track"><span style="width:${v}%"></span></div><b>${v}%</b></div>`;}).join("");
  const ranked=skills.map(([label,key])=>[label,Math.round(SUBJECTS.flatMap(s=>CONTENT[s].chapters.map(c=>chapterState(c.id)[key]||0)).reduce((a,b)=>a+b,0)/chapterValues.length)]).sort((a,b)=>a[1]-b[1]);
  $("coach").textContent=state.activities?`Your next best step is ${ranked[0][0].toLowerCase()}. Open your current chapter and complete one ${ranked[0][0].toLowerCase()} activity today.`:"Start with one short concept lesson. The coach will adapt after your first activity.";
  $("subjectProgress").innerHTML=SUBJECTS.map((s)=>{const vals=CONTENT[s].chapters.map(chapterMastery);const v=Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);return `<article class="progress-card" style="--accent:${CONTENT[s].color}"><header><span>${CONTENT[s].icon} ${esc(s)}</span><b>${v}%</b></header><div class="mini-track"><span style="width:${v}%"></span></div></article>`;}).join("");
}

function renderMistakes() {
  if(!state.mistakes.length){$("mistakeList").innerHTML='<div class="empty"><strong>No mistakes waiting 🎉</strong><p>Incorrect practice answers will be saved here automatically for revision.</p></div>';return;}
  $("mistakeList").innerHTML=state.mistakes.map((m,index)=>{const found=findChapter(m.chapterId);return `<article class="mistake-card"><div><span class="eyebrow">${esc(found?.chapter.title||"REVISION")}</span><strong>${esc(m.question)}</strong><p>Correct answer: ${esc(m.answer)}</p></div><button data-revise="${index}">I know it now</button></article>`;}).join("");
  $("mistakeList").querySelectorAll("[data-revise]").forEach((button)=>button.onclick=()=>{const item=state.mistakes[Number(button.dataset.revise)];const found=findChapter(item.chapterId);if(found){activeChapter=found.chapter;earn("revision",10,100);}state.mistakes.splice(Number(button.dataset.revise),1);saveState();});
}

function renderPlanner(event) {
  event.preventDefault();const exam=new Date($("examDate").value+"T00:00:00"),now=new Date();now.setHours(0,0,0,0);const days=Math.ceil((exam-now)/86400000),subject=$("examSubject").value,chapters=$("examChapters").value,minutes=Number($("studyTime").value);
  if(days<1){$("planOutput").innerHTML='<div class="empty"><strong>Choose a future exam date.</strong></div>';return;}
  const phases=days<=4?["Learn + recall","Written practice","Timed test","Weak-topic revision"]:["Concept learning","Active recall","Question practice","Answer writing","Chapter test","Mistake revision","Model paper"];
  const rows=Array.from({length:Math.min(days,14)},(_,i)=>{const remaining=days-i;const phase=i===days-1?"Light recall and confidence review":i===days-2?"Timed model paper + error review":phases[i%phases.length];return `<div class="plan-day"><b>Day ${i+1}</b><span>${esc(phase)} • ${esc(subject)} ${esc(chapters)} • ${minutes} min ${remaining>1?`(${remaining} days left)`:""}</span></div>`;}).join("");
  $("planOutput").innerHTML=`<div class="plan-card"><span class="eyebrow">YOUR PERSONALISED PLAN</span><h3>${days} days until ${esc(subject)}</h3><p>Coverage: ${esc(chapters)}. The plan balances concepts, recall, writing, testing and revision.</p><div class="plan-days">${rows}</div>${days>14?`<p><b>Days 15–${days}:</b> repeat the cycle with new chapters, reserving the final two days for a model paper and weak topics.</p>`:""}</div>`;
}

function currentOrFirst(){const found=findChapter(state.lastChapter);return found||{subject:SUBJECTS[0],chapter:CONTENT[SUBJECTS[0]].chapters[0]};}
function openTool(type){const current=currentOrFirst();activeChapter=current.chapter;selectedSubject=current.subject;const dialog=$("toolDialog"),content=$("dialogContent");if(type==="flash"){content.innerHTML=`<span class="eyebrow">FLASHCARD SPRINT</span><h2>${esc(activeChapter.title)}</h2><div class="dialog-list">${activeChapter.cards.map(c=>`<div class="dialog-card"><b>${esc(c[0])}</b><p>${esc(c[1])}</p></div>`).join("")}</div><button class="primary-action" id="dialogComplete">Complete sprint +15 XP</button>`;}else if(type==="write"){content.innerHTML=`<span class="eyebrow">WRITING STUDIO</span><h2>${esc(activeChapter.write)}</h2><p>Open the full chapter writing mode for the rubric and saved score.</p><button class="primary-action" id="dialogOpen">Open writing mode</button>`;}else{content.innerHTML=`<span class="eyebrow">${type==="boss"?"CHAPTER BOSS":"ACTIVE RECALL"}</span><h2>${esc(activeChapter.title)}</h2><p>${type==="boss"?"Answer the chapter quiz and aim for at least 80% mastery.":`Without checking notes, explain: ${esc(activeChapter.cards[0][0])}`}</p><button class="primary-action" id="dialogOpen">${type==="boss"?"Start challenge":"Reveal and review"}</button>`;}dialog.showModal();$("dialogComplete")?.addEventListener("click",()=>{earn("recall",15);dialog.close();});$("dialogOpen")?.addEventListener("click",()=>{dialog.close();openChapter(activeChapter.id,type==="write"?"write":type==="boss"?"practice":"flashcards");});}

function bindUI(){document.querySelectorAll("[data-mode]").forEach(b=>b.onclick=()=>{activeMode=b.dataset.mode;document.querySelectorAll("[data-mode]").forEach(x=>x.classList.toggle("active",x===b));renderLearning();});$("backToChapters").onclick=()=>{$("subjects").scrollIntoView({behavior:"smooth"});};$("continueBtn").onclick=()=>{const current=currentOrFirst();openChapter(current.chapter.id);};$("plannerForm").onsubmit=renderPlanner;document.querySelectorAll("[data-tool]").forEach(b=>b.onclick=()=>openTool(b.dataset.tool));$("closeDialog").onclick=()=>$("toolDialog").close();$("menuBtn").onclick=()=>{const open=$("mainNav").classList.toggle("open");$("menuBtn").setAttribute("aria-expanded",String(open));};$("mainNav").onclick=()=>$("mainNav").classList.remove("open");}

const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
onAuthStateChanged(auth,async(user)=>{if(!user){location.replace("login.html");return;}try{const [snap,token]=await Promise.all([getDoc(doc(db,"students",user.uid)),getIdTokenResult(user,true)]);const profile=snap.exists()?snap.data():{};const founder=token.claims.founder===true||SCRUTINY_ADMIN_EMAILS.map(x=>x.toLowerCase()).includes((user.email||"").toLowerCase());if(!entitledCourses(profile).includes("class8")&&!founder){location.replace("student.html");return;}storeKey=`scrutiny_class8_${user.uid}`;loadState();const name=(profile.name||user.displayName||(user.email||"Student").split("@")[0]).split(" ")[0];const hour=new Date().getHours();$("welcome").textContent=`Good ${hour<12?"morning":hour<17?"afternoon":"evening"}, ${name} 👋 Your mission is ready.`;renderSubjects();renderChapters();renderStats();renderMission();renderMastery();renderMistakes();bindUI();document.documentElement.classList.remove("auth-check");}catch(error){console.error("Class 8 access check failed",error);location.replace("student.html");}});
