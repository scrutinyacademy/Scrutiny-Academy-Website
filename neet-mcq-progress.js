import "./student-storage.js";
import { questionsForChapter, readProgress as readHighYieldProgress, questionVisual } from "./neet-high-yield-core.mjs?v=3";
import { SECTION_ORDER, accuracy, emptyStats, paginate, sectionForMistake, statsFromHighYield, statsFromKota, statsFromPyq, statsFromSessions, totalStats, wasEverIncorrect } from "./neet-mcq-progress-core.mjs?v=2";

const $ = id => document.getElementById(id);
const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
const read = (key, fallback) => { try { return JSON.parse(window.ScrutinyStudentStorage.getItem(key)) || fallback; } catch { return fallback; } };
let currentFilter = "All";
let currentMistakePage = 0;
let renderToken = 0;

function permitted() {
  const storage = window.ScrutinyStudentStorage;
  const context = window.__scrutinyStudentContext;
  return Boolean(storage?.uid && context?.uid === storage.uid && context?.activeCourse === "neet");
}

function optionText(item, index) {
  if (!Number.isInteger(index) || index < 0) return "Not recorded";
  return `${String.fromCharCode(65 + index)}. ${item.options?.[index] ?? `Option ${index + 1}`}`;
}

function questionTable(item) {
  if (!item.table?.headers?.length || !item.table?.rows?.length) return "";
  return `<div class="mcq-mistake-table"><table><caption>${esc(item.table.caption || "Question data")}</caption><thead><tr>${item.table.headers.map(cell => `<th scope="col">${esc(cell)}</th>`).join("")}</tr></thead><tbody>${item.table.rows.map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

async function highYieldMistakes(progress) {
  const wrongIds = new Set(Object.entries(progress.attempts || {}).filter(([, attempt]) => wasEverIncorrect(attempt)).map(([id]) => id));
  if (!wrongIds.size) return [];
  const packs = await Promise.all(["biology", "chemistry", "physics"].map(subject => fetch(`data/neet/high-yield/${subject}.json`, {cache:"no-store"}).then(response => response.ok ? response.json() : null)));
  const found = [];
  for (const pack of packs.filter(Boolean)) for (const chapter of pack.chapters) {
    const prefix = `NEET-HY-V1-${chapter.id}-`;
    if (![...wrongIds].some(id => id.startsWith(prefix)) && !(pack.diagrams || []).some(question => question.chapterId === chapter.id && wrongIds.has(question.id))) continue;
    for (const question of questionsForChapter(pack, chapter.id)) if (wrongIds.has(question.id)) {
      const attempt = progress.attempts[question.id];
      found.push({...question, section:"High Yield", selected:attempt.selected, correctIndex:question.answer, lastMissedAt:attempt.at, wrongCount:attempt.wrongCount || 1, visual:questionVisual(question)});
    }
  }
  return found;
}

function savedMistakes(tools, kota) {
  const standard = (tools.mistakes || []).filter(item => (item.courseId || "neet") === "neet").map(item => ({...item, section:sectionForMistake(item)}));
  return [...standard, ...(kota.mistakes || []).map(item => ({...item, section:"Kota Level"}))];
}

function pyqMistakes(state, questions) {
  const byNumber = new Map(questions.map(question => [String(question.number), question]));
  return Object.entries(state.answers || {}).flatMap(([number, selected]) => {
    const question = byNumber.get(String(number));
    if (!question || question.answers.includes(selected)) return [];
    return [{id:`pyq-${number}`, section:"NEET 2025 PYQ", subject:question.subject, chapter:question.chapter, question:`Official NEET 2025 question ${number} (view the booklet image in the PYQ section)`, options:["Option 1","Option 2","Option 3","Option 4"], selected:selected - 1, correctIndex:question.answers[0] - 1, explanation:`Official accepted answer: ${question.answers.join(" or ")}.`, lastMissedAt:0, wrongCount:1}];
  });
}

function statCard(name, stats) {
  return `<article class="mcq-progress-card"><span>${esc(name)}</span><strong>${stats.attempted.toLocaleString("en-IN")}</strong><small>MCQs practised</small><div><b>${stats.correct.toLocaleString("en-IN")}</b> correct · <b>${stats.incorrect.toLocaleString("en-IN")}</b> incorrect</div><div class="mcq-accuracy-track"><i style="width:${accuracy(stats)}%"></i></div><em>${accuracy(stats)}% accuracy</em></article>`;
}

function mistakeCard(item) {
  return `<article class="mcq-mistake-card"><header><span>${esc(item.section)}</span><small>${esc([item.subject, item.chapter, item.topic].filter(Boolean).join(" • ") || "Mixed practice")}</small></header><h4>${esc(item.question || "Question details unavailable")}</h4>${item.visual || questionTable(item)}<div class="mcq-answer wrong"><b>Your answer</b><span>${esc(optionText(item, item.selected))}</span></div><div class="mcq-answer correct"><b>Correct answer</b><span>${esc(optionText(item, item.correctIndex))}</span></div>${item.mistakeReason ? `<p><b>What went wrong:</b> ${esc(item.mistakeReason)}</p>` : ""}${item.explanation ? `<p>${esc(item.explanation)}</p>` : ""}<footer>Missed ${Number(item.wrongCount) || 1} time${Number(item.wrongCount) === 1 ? "" : "s"}</footer></article>`;
}

function renderDashboard(sections, mistakes) {
  const total = totalStats(sections);
  const shown = mistakes.filter(item => currentFilter === "All" || item.section === currentFilter).sort((a,b) => (b.lastMissedAt || 0) - (a.lastMissedAt || 0));
  const page = paginate(shown, currentMistakePage, 5);
  currentMistakePage = page.page;
  const range = page.totalItems ? `${page.start + 1}–${Math.min(page.start + page.pageSize, page.totalItems)}` : "0";
  $("neetMcqProgressBody").innerHTML = `<div class="mcq-total-card"><div><span>TOTAL PRACTICE ATTEMPTS</span><strong>${total.attempted.toLocaleString("en-IN")}</strong><p>Each submitted answer counts as one practice attempt. Retried questions count again.</p></div><div><b>${total.correct.toLocaleString("en-IN")}</b><span>correct</span></div><div><b>${total.incorrect.toLocaleString("en-IN")}</b><span>incorrect</span></div><div><b>${accuracy(total)}%</b><span>accuracy</span></div></div><div class="mcq-progress-grid">${SECTION_ORDER.map(name => statCard(name, sections[name] || emptyStats())).join("")}</div><div class="mcq-mistake-head" id="mcqMistakeReview"><div><span class="eyebrow">INCORRECT ANSWER REVIEW</span><h3>See where you went wrong</h3><p><b>${shown.length.toLocaleString("en-IN")} saved incorrect MCQ${shown.length === 1 ? "" : "s"}</b> · Your answer is shown beside the correct answer.</p></div><label>Section<select id="mcqMistakeFilter"><option>All</option>${SECTION_ORDER.map(name => `<option>${esc(name)}</option>`).join("")}</select></label></div><div class="mcq-mistake-list">${page.items.length ? page.items.map(mistakeCard).join("") : `<div class="mcq-empty"><strong>${currentFilter === "All" ? "No incorrect questions saved yet." : `No saved mistakes in ${esc(currentFilter)}.`}</strong><p>Complete an MCQ session and your review will appear here.</p></div>`}</div>${page.totalItems ? `<nav class="mcq-review-pagination" aria-label="Incorrect MCQ pages"><button type="button" class="btn ghost" id="mcqMistakePrevious" ${page.page === 0 ? "disabled" : ""}>← Previous</button><span>Showing <b>${range}</b> of <b>${page.totalItems.toLocaleString("en-IN")}</b><small>Page ${page.page + 1} of ${page.totalPages}</small></span><button type="button" class="btn primary" id="mcqMistakeNext" ${page.page + 1 >= page.totalPages ? "disabled" : ""}>Next incorrect MCQs →</button></nav>` : ""}`;
  const filter = $("mcqMistakeFilter");
  filter.value = currentFilter;
  filter.onchange = () => { currentFilter = filter.value; currentMistakePage = 0; renderDashboard(sections, mistakes); };
  const changePage = next => { currentMistakePage = next; renderDashboard(sections, mistakes); $("mcqMistakeReview")?.scrollIntoView({behavior:"smooth", block:"start"}); };
  $("mcqMistakePrevious")?.addEventListener("click", () => changePage(page.page - 1));
  $("mcqMistakeNext")?.addEventListener("click", () => changePage(page.page + 1));
}

async function render() {
  const host = $("neetMcqProgressBody");
  if (!host) return;
  const token = ++renderToken;
  if (!permitted()) { host.innerHTML = '<div class="mcq-empty"><strong>Sign in to your NEET portal to see your MCQ record.</strong></div>'; return; }
  const uid = window.ScrutinyStudentStorage.uid;
  const progress = read("scrutiny_v2_progress", {sessions:[]});
  const tools = read("scrutiny_learning_tools", {mistakes:[]});
  const highYield = readHighYieldProgress(window.ScrutinyStudentStorage);
  const kota = read("scrutiny_kota_biology_progress_v2", {sessions:[],mistakes:[]});
  const pyq = read("scrutiny-neet-2025-code48-progress-v1", {answers:{}});
  try {
    const pyqBank = await fetch("data/pyq/neet-2025-code48.json", {cache:"no-store"}).then(response => response.ok ? response.json() : {questions:[]});
    const hyMistakes = await highYieldMistakes(highYield);
    if (token !== renderToken || uid !== window.ScrutinyStudentStorage.uid || !permitted()) return;
    const sessionStats = statsFromSessions(progress.sessions || []);
    const sections = {"Chapter-wise":sessionStats["Chapter-wise"], "High Yield":statsFromHighYield(highYield), "Kota Level":statsFromKota(kota), Ranker:sessionStats.Ranker, "NEET 2025 PYQ":statsFromPyq(pyq.answers, pyqBank.questions || [])};
    renderDashboard(sections, [...savedMistakes(tools, kota), ...hyMistakes, ...pyqMistakes(pyq, pyqBank.questions || [])]);
  } catch (error) {
    console.error(error);
    if (token === renderToken) host.innerHTML = '<div class="mcq-empty"><strong>Your MCQ record could not load.</strong><p>Refresh the page to try again.</p></div>';
  }
}

["scrutiny:dashboard-context","scrutiny:student-changed","scrutiny:progress-changed","scrutiny:session-complete","scrutiny:progress-loaded","scrutiny:high-yield-progress","scrutiny:pyq-progress"].forEach(name => addEventListener(name, render));
addEventListener("storage", render);
render();
