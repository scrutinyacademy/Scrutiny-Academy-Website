import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const $ = (id) => document.getElementById(id);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let course;
let currentChapter = 0;
let activeTab = "roadmap";
let flashIndex = 0;
let flashTag = "All";
let mcqSet = 0;
let answers = {};
let studentId = "guest";
let progress = { completed: [], correct: 0, wrong: 0 };

const progressKey = () => `scrutiny_class6_math_progress_v1_${studentId}`;

function loadProgress() {
  try {
    progress = { completed: [], correct: 0, wrong: 0, ...JSON.parse(localStorage.getItem(progressKey()) || "{}") };
  } catch {
    progress = { completed: [], correct: 0, wrong: 0 };
  }
}

function saveProgress() {
  localStorage.setItem(progressKey(), JSON.stringify(progress));
}

function chapter() {
  return course.chapters[currentChapter];
}

function updateProgress() {
  const done = progress.completed.length;
  $("courseProgressText").textContent = `${done} of ${course.chapters.length} chapters`;
  $("courseProgressBar").style.width = `${Math.round((done / course.chapters.length) * 100)}%`;
  $("lifetimeScore").textContent = `${progress.correct * 4 - progress.wrong} pts`;
}

function renderChapters() {
  $("chapterList").innerHTML = course.chapters.map((item, index) => {
    const done = progress.completed.includes(item.id);
    return `<button type="button" data-chapter="${index}" class="${index === currentChapter ? "active" : ""}"><b>${String(index + 1).padStart(2, "0")}</b><span>${esc(item.title)}</span><i>${done ? "✓" : ""}</i></button>`;
  }).join("");
  $("chapterList").querySelectorAll("[data-chapter]").forEach((button) => {
    button.onclick = () => {
      currentChapter = Number(button.dataset.chapter);
      activeTab = "roadmap";
      flashIndex = 0;
      flashTag = "All";
      mcqSet = 0;
      answers = {};
      history.replaceState(null, "", `?chapter=${chapter().id}`);
      render();
      document.querySelector(".chapter-workspace").scrollIntoView({ behavior: "smooth", block: "start" });
    };
  });
}

function sectionIntro(kicker, title, copy, controls = "") {
  return `<div class="section-intro"><div><span class="eyebrow">${esc(kicker)}</span><h3>${esc(title)}</h3><p>${esc(copy)}</p></div>${controls}</div>`;
}

function renderRoadmap() {
  const item = chapter();
  return `${sectionIntro("YOUR LEARNING PATH", "See the whole chapter first", item.summary)}<div class="roadmap-grid">${item.topics.map((topic, index) => `<article class="roadmap-card"><b>${index + 1}</b><div><h4>${esc(topic.title)}</h4><p>${esc(topic.explanation)}</p></div></article>`).join("")}</div><div class="method-strip"><span>1 · Explore</span><span>2 · Understand</span><span>3 · Try</span><span>4 · Recall</span><span>5 · Practise</span><span>6 · Master</span></div>`;
}

function renderLearn() {
  const item = chapter();
  return `${sectionIntro("TOPIC-WISE LESSONS", "Learn one idea at a time", "Read the idea, study the worked example, then solve the Try It prompt before revealing the answer.")}<div class="topic-list">${item.topics.map((topic, index) => `<article class="topic-card"><header class="topic-card-head"><span>TOPIC ${String(index + 1).padStart(2, "0")}</span><h3>${esc(topic.title)}</h3><p>${esc(topic.explanation)}</p></header><div class="topic-body"><div class="key-points">${topic.keyPoints.map((point) => `<span>${esc(point)}</span>`).join("")}</div><div class="worked"><strong>Worked example</strong>${esc(topic.workedExample)}</div><div class="try-box"><strong>Try it yourself</strong>${esc(topic.tryIt)}<button class="reveal-btn" type="button">REVEAL ANSWER</button><div class="try-answer">${esc(topic.answer)}</div></div></div></article>`).join("")}</div>`;
}

function renderTricks() {
  const icons = ["💡", "🧠", "🎯", "🔎", "⚡", "🧩", "📐", "✨", "🏆"];
  return `${sectionIntro("SMART THINKING", "Tricks that help ideas stick", "Use these as thinking shortcuts. Understand the reason first; the trick then becomes easy to remember.")}<div class="tricks-grid">${chapter().topics.map((topic, index) => `<article class="trick-box"><span>${icons[index % icons.length]}</span><h4>${esc(topic.title)}</h4><p>${esc(topic.tip)}</p></article>`).join("")}</div>`;
}

function filteredFlashcards() {
  return chapter().flashcards.filter((card) => flashTag === "All" || card.tag === flashTag);
}

function renderFlashcards() {
  const cards = filteredFlashcards();
  if (flashIndex >= cards.length) flashIndex = 0;
  const card = cards[flashIndex];
  const tags = ["All", ...new Set(chapter().flashcards.map((item) => item.tag))];
  const controls = `<div class="controls"><label for="flashTag">Card type</label><select id="flashTag">${tags.map((tag) => `<option ${tag === flashTag ? "selected" : ""}>${esc(tag)}</option>`).join("")}</select></div>`;
  return `${sectionIntro("ACTIVE RECALL", "55 beautifully focused flashcards", "Think of the answer before you flip. Active recall builds stronger memory than rereading.", controls)}<div class="flash-stage"><button class="flashcard" id="flashcard" type="button"><div class="front"><small>${esc(card.tag)} · TAP TO FLIP</small><strong>${esc(card.front)}</strong></div><div class="back"><small>ANSWER · TAP TO FLIP BACK</small><strong>${esc(card.back)}</strong></div></button><div class="flash-nav"><button id="flashPrev" type="button" aria-label="Previous card">←</button><button id="flashNext" type="button" aria-label="Next card">→</button></div></div><div class="flash-meta"><span>Card ${flashIndex + 1} of ${cards.length}</span><span>${esc(chapter().title)}</span></div>`;
}

function renderQA() {
  const questions = chapter().importantQuestions;
  return `${sectionIntro("EXAM PREPARATION", `${questions.length} important questions with answers`, "Answer aloud or on paper first. Then open the model answer and compare your key points.")}<div class="qa-list">${questions.map((item, index) => `<details class="qa-card"><summary><span>${item.marks} MARKS</span><strong>${index + 1}. ${esc(item.question)}</strong></summary><p>${esc(item.answer)}</p></details>`).join("")}</div>`;
}

function mcqsForSet() {
  return chapter().mcqs.slice(mcqSet * 10, mcqSet * 10 + 10);
}

function setStats() {
  const ids = mcqsForSet().map((item) => item.id);
  const setAnswers = ids.map((id) => answers[id]).filter(Boolean);
  return { answered: setAnswers.length, correct: setAnswers.filter((item) => item.correct).length, wrong: setAnswers.filter((item) => !item.correct).length };
}

function renderMCQs() {
  const questions = mcqsForSet();
  const stats = setStats();
  const controls = `<div class="controls"><label for="mcqSet">Practice set</label><select id="mcqSet">${Array.from({ length: 15 }, (_, index) => `<option value="${index}" ${index === mcqSet ? "selected" : ""}>Set ${index + 1} · Q${index * 10 + 1}–${index * 10 + 10}</option>`).join("")}</select></div>`;
  const result = stats.answered === 10 ? `<div class="result-card"><h3>Set ${mcqSet + 1} complete!</h3><div class="result-grid"><div><span>CORRECT</span><strong>${stats.correct}</strong></div><div><span>WRONG</span><strong>${stats.wrong}</strong></div><div><span>SCORE</span><strong>${stats.correct * 4 - stats.wrong}/40</strong></div><div><span>ACCURACY</span><strong>${stats.correct * 10}%</strong></div></div></div>` : "";
  return `${sectionIntro("15 SETS · 10 QUESTIONS EACH", "150 chapter MCQs", "Choose carefully: +4 for a correct answer and −1 for a wrong answer. Every answer includes a clear explanation.", controls)}<div class="mcq-toolbar"><strong>Set ${mcqSet + 1} progress: ${stats.answered}/10</strong><div class="score-box"><span>SET SCORE<strong>${stats.correct * 4 - stats.wrong}</strong></span><span>CORRECT<strong>${stats.correct}</strong></span><span>WRONG<strong>${stats.wrong}</strong></span></div></div>${result}<div class="mcq-list">${questions.map((item, index) => {
    const selected = answers[item.id];
    return `<article class="mcq-card"><div class="mcq-card-head"><h4>${mcqSet * 10 + index + 1}. ${esc(item.question)}</h4><span class="difficulty">${esc(item.difficulty)}</span></div><div class="mcq-options">${item.options.map((option, optionIndex) => {
      let className = "";
      if (selected && optionIndex === item.correctIndex) className = "correct";
      if (selected && optionIndex === selected.index && !selected.correct) className = "wrong";
      return `<button type="button" data-question="${item.id}" data-option="${optionIndex}" class="${className}" ${selected ? "disabled" : ""}><b>${String.fromCharCode(65 + optionIndex)}.</b> ${esc(option)}</button>`;
    }).join("")}</div><p class="explanation ${selected ? "show" : ""}"><strong>${selected?.correct ? "Correct." : "Learn from it."}</strong> ${esc(item.explanation)}</p></article>`;
  }).join("")}</div><div class="set-nav"><button id="setPrev" type="button" ${mcqSet === 0 ? "disabled" : ""}>← Previous set</button><button id="setNext" type="button" ${mcqSet === 14 ? "disabled" : ""}>Next set →</button></div>`;
}

function bindContent() {
  document.querySelectorAll(".reveal-btn").forEach((button) => button.onclick = () => {
    button.nextElementSibling.classList.toggle("show");
    button.textContent = button.nextElementSibling.classList.contains("show") ? "HIDE ANSWER" : "REVEAL ANSWER";
  });
  $("flashcard")?.addEventListener("click", (event) => event.currentTarget.classList.toggle("flipped"));
  $("flashPrev")?.addEventListener("click", () => { const cards = filteredFlashcards(); flashIndex = (flashIndex - 1 + cards.length) % cards.length; renderContent(); });
  $("flashNext")?.addEventListener("click", () => { const cards = filteredFlashcards(); flashIndex = (flashIndex + 1) % cards.length; renderContent(); });
  $("flashTag")?.addEventListener("change", (event) => { flashTag = event.target.value; flashIndex = 0; renderContent(); });
  $("mcqSet")?.addEventListener("change", (event) => { mcqSet = Number(event.target.value); renderContent(); });
  $("setPrev")?.addEventListener("click", () => { mcqSet--; renderContent(); document.querySelector(".chapter-workspace").scrollIntoView({ behavior: "smooth" }); });
  $("setNext")?.addEventListener("click", () => { mcqSet++; renderContent(); document.querySelector(".chapter-workspace").scrollIntoView({ behavior: "smooth" }); });
  document.querySelectorAll("[data-question]").forEach((button) => button.onclick = () => {
    const question = chapter().mcqs.find((item) => item.id === button.dataset.question);
    const index = Number(button.dataset.option);
    const correct = index === question.correctIndex;
    answers[question.id] = { index, correct };
    if (correct) progress.correct++; else progress.wrong++;
    saveProgress();
    updateProgress();
    renderContent();
  });
}

function renderContent() {
  const renderers = { roadmap: renderRoadmap, learn: renderLearn, tricks: renderTricks, flashcards: renderFlashcards, qa: renderQA, mcqs: renderMCQs };
  $("content").innerHTML = renderers[activeTab]();
  bindContent();
}

function render() {
  const item = chapter();
  $("chapterIndex").textContent = String(currentChapter + 1).padStart(2, "0");
  $("chapterSource").textContent = `CHAPTER ${currentChapter + 1} · ${item.flashcards.length} CARDS · ${item.mcqs.length} MCQS`;
  $("chapterTitle").textContent = item.title;
  $("chapterGoal").textContent = item.goal;
  const done = progress.completed.includes(item.id);
  $("completeChapter").textContent = done ? "COMPLETED ✓" : "MARK COMPLETE";
  $("completeChapter").classList.toggle("done", done);
  document.querySelectorAll("[data-tab]").forEach((button) => button.classList.toggle("active", button.dataset.tab === activeTab));
  renderChapters();
  renderContent();
  updateProgress();
}

document.querySelectorAll("[data-tab]").forEach((button) => button.onclick = () => { activeTab = button.dataset.tab; render(); });
$("completeChapter").onclick = () => {
  const id = chapter().id;
  progress.completed = progress.completed.includes(id) ? progress.completed.filter((item) => item !== id) : [...progress.completed, id];
  saveProgress();
  render();
};

onAuthStateChanged(auth, (user) => {
  studentId = user?.uid || "guest";
  loadProgress();
  $("studentName").textContent = user ? `Hi, ${user.displayName || user.email?.split("@")[0] || "Student"}` : "Guest learner";
  $("logoutBtn").textContent = user ? "Logout" : "Sign in";
  $("logoutBtn").onclick = async () => {
    if (auth.currentUser) await signOut(auth);
    location.href = "login.html";
  };
  if (course) render();
});

async function start() {
  try {
    const response = await fetch("data/class6/mathematics.json?v=1");
    if (!response.ok) throw new Error(`Course data returned ${response.status}`);
    course = await response.json();
    const requested = new URLSearchParams(location.search).get("chapter");
    const requestedIndex = course.chapters.findIndex((item) => item.id === requested);
    if (requestedIndex >= 0) currentChapter = requestedIndex;
    loadProgress();
    $("loading").hidden = true;
    $("app").hidden = false;
    render();
  } catch (error) {
    console.error(error);
    $("loading").innerHTML = "<strong>We could not load the course.</strong><p>Please refresh the page. If the problem continues, contact Scrutiny Academy support.</p>";
  }
}

start();
