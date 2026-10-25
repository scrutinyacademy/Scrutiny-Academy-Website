// Mission 600 DPP player. Only the selected local chapter bank is loaded.
const $ = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
const params = new URLSearchParams(location.search);
const requestedId = params.get("dpp");
let dpp = null;
const state = { index: 0, answers: {}, submitted: false };

async function loadDpp() {
  const catalogResponse = await fetch("data/mission600/catalog.json", { cache: "no-store" });
  if (!catalogResponse.ok) throw new Error("The DPP catalogue could not be loaded.");
  const catalog = await catalogResponse.json();
  const metadata = catalog.dpps.find((item) => item.id === requestedId);
  if (!metadata?.contentComplete || metadata.status !== "published" || !metadata.contentFile) throw new Error("This DPP was not found.");
  const response = await fetch(metadata.contentFile, { cache: "no-store" });
  if (!response.ok) throw new Error("The DPP questions could not be loaded.");
  const bank = await response.json();
  const content = bank[metadata.id];
  if (!content || content.contentVersion !== metadata.contentVersion || content.questions?.length !== metadata.questionCount) throw new Error("The DPP content is being updated. Please refresh and retry.");
  dpp = { ...metadata, questions: content.questions };
}

function goBack() {
  if (history.length > 1 && document.referrer.startsWith(location.origin)) history.back();
  else location.href = "mission600.html";
}

function renderQuestion() {
  if (!dpp) return;
  const question = dpp.questions[state.index];
  $("progressText").textContent = `Question ${state.index + 1} of ${dpp.questions.length}`;
  $("progressBar").style.width = `${((state.index + 1) / dpp.questions.length) * 100}%`;
  $("questionCard").innerHTML = `<span class="question-topic">${escapeHtml(question.topic)}</span><h2>${state.index + 1}. ${escapeHtml(question.question)}</h2><div class="dpp-options">${question.options.map((option, optionIndex) => `<label class="${state.answers[state.index] === optionIndex ? "selected" : ""}"><input type="radio" name="answer" value="${optionIndex}" ${state.answers[state.index] === optionIndex ? "checked" : ""} ${state.submitted ? "disabled" : ""}><b>${String.fromCharCode(65 + optionIndex)}</b><span>${escapeHtml(option)}</span></label>`).join("")}</div>`;
  $("questionCard").querySelectorAll("input").forEach((input) => input.addEventListener("change", () => { state.answers[state.index] = Number(input.value); renderQuestion(); }));
  $("previousQuestion").disabled = state.index === 0;
  $("nextQuestion").disabled = state.index === dpp.questions.length - 1;
  $("submitDpp").hidden = state.submitted;
}

function analyseAttempt() {
  const topics = new Map();
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  dpp.questions.forEach((question, index) => {
    const chosen = state.answers[index];
    const isAnswered = Number.isInteger(chosen);
    const isCorrect = isAnswered && chosen === question.answer;
    if (isCorrect) correct += 1;
    else if (isAnswered) wrong += 1;
    else unanswered += 1;
    const topic = question.topic || dpp.chapter;
    const row = topics.get(topic) || { topic, total: 0, correct: 0, wrong: 0, unanswered: 0 };
    row.total += 1;
    if (isCorrect) row.correct += 1;
    else if (isAnswered) row.wrong += 1;
    else row.unanswered += 1;
    topics.set(topic, row);
  });
  const breakdown = [...topics.values()].map((row) => ({ ...row, accuracy: Math.round((row.correct / row.total) * 100) })).sort((a, b) => a.accuracy - b.accuracy || b.wrong - a.wrong);
  const focusTopics = breakdown.filter((row) => row.wrong + row.unanswered > 0).slice(0, 3);
  return { correct, wrong, unanswered, accuracy: Math.round((correct / dpp.questions.length) * 100), breakdown, focusTopics };
}

function saveAttempt(analysis) {
  const key = "mission600DppAttempts";
  let attempts = [];
  try { attempts = JSON.parse(localStorage.getItem(key) || "[]"); } catch { attempts = []; }
  if (!Array.isArray(attempts)) attempts = [];
  attempts.push({ dppId: dpp.id, subject: dpp.subject, chapter: dpp.chapter, difficulty: dpp.difficulty, completedAt: new Date().toISOString(), ...analysis });
  try { localStorage.setItem(key, JSON.stringify(attempts.slice(-100))); } catch { $("dppMessage").textContent = "Your result is available below; this browser could not save the attempt."; }
}

function renderAnalysis(analysis) {
  const focus = analysis.focusTopics.length
    ? analysis.focusTopics.map((row) => `<li><strong>${escapeHtml(row.topic)}</strong><span>${row.correct}/${row.total} correct · ${row.accuracy}% accuracy</span></li>`).join("")
    : `<li><strong>Excellent work</strong><span>No weak topic was detected in this DPP.</span></li>`;
  $("dppResult").hidden = false;
  $("dppResult").innerHTML = `<div class="result-heading"><span class="eyebrow">DETAILED DPP ANALYSIS</span><h2>${analysis.correct} / ${dpp.questions.length}</h2><p>${analysis.accuracy}% accuracy in ${escapeHtml(dpp.chapter)} · ${escapeHtml(dpp.difficulty)}</p></div><div class="result-metrics"><article><strong>${analysis.correct}</strong><span>Correct</span></article><article class="wrong"><strong>${analysis.wrong}</strong><span>Wrong</span></article><article class="unanswered"><strong>${analysis.unanswered}</strong><span>Unanswered</span></article><article><strong>${analysis.accuracy}%</strong><span>Accuracy</span></article></div><div class="focus-panel"><h3>Topics to focus on</h3><ul>${focus}</ul></div><div class="topic-analysis"><h3>Topic-by-topic analysis</h3><div class="topic-table">${analysis.breakdown.map((row) => `<div><span><strong>${escapeHtml(row.topic)}</strong><small>${row.correct} correct · ${row.wrong} wrong · ${row.unanswered} unanswered</small></span><b>${row.accuracy}%</b></div>`).join("")}</div></div><div class="result-actions"><button type="button" id="reviewAnswers">Review every answer</button><a href="mission600.html#dpps">Solve another DPP</a><button type="button" id="resultBack">← Back</button></div><div class="answer-review" id="answerReview" hidden>${dpp.questions.map((question, index) => { const chosen = state.answers[index]; const correct = chosen === question.answer; return `<article class="${correct ? "correct" : "incorrect"}"><span>Question ${index + 1} · ${escapeHtml(question.topic)}</span><h4>${escapeHtml(question.question)}</h4><p><b>Your answer:</b> ${Number.isInteger(chosen) ? escapeHtml(question.options[chosen]) : "Not answered"}</p><p><b>Correct answer:</b> ${escapeHtml(question.options[question.answer])}</p><p>${escapeHtml(question.explanation)}</p></article>`; }).join("")}</div>`;
  $("reviewAnswers").onclick = () => { const review = $("answerReview"); review.hidden = !review.hidden; $("reviewAnswers").textContent = review.hidden ? "Review every answer" : "Hide answer review"; };
  $("resultBack").onclick = goBack;
  $("dppResult").scrollIntoView({ behavior: "smooth", block: "start" });
}

function submitDpp() {
  if (state.submitted || !dpp) return;
  state.submitted = true;
  const analysis = analyseAttempt();
  saveAttempt(analysis);
  renderQuestion();
  renderAnalysis(analysis);
  $("dppMessage").textContent = "Your result and focus topics are ready below.";
}

async function initialize() {
  document.documentElement.classList.remove("auth-check");
  document.querySelectorAll("[data-simple-back]").forEach((button) => button.addEventListener("click", goBack));
  try { await loadDpp(); } catch (error) {
    $("dppTitle").textContent = "DPP unavailable";
    $("questionCard").innerHTML = `<h2>We could not open this DPP.</h2><p>${escapeHtml(error.message)}</p><button type="button" class="simple-back" onclick="location.reload()">Try again</button>`;
    $("dppMessage").textContent = "Please retry once or return to Mission 600.";
    $("previousQuestion").hidden = $("nextQuestion").hidden = $("submitDpp").hidden = true;
    return;
  }
  $("dppCode").textContent = `${dpp.subject.toUpperCase()} · ${dpp.id}`;
  $("dppTitle").textContent = dpp.title;
  $("dppMeta").textContent = `${dpp.subject} · Chapter ${dpp.chapterNumber} · ${dpp.difficulty} · ${dpp.questions.length} MCQs · ${dpp.suggestedDurationMinutes} minutes · Suggested: ${dpp.recommendedDate} (Week ${dpp.scheduledWeek}) · Unlocked now`;
  $("dppSource").textContent = `Textbook alignment: ${dpp.sourceBook} · Chapter ${dpp.sourceChapter} · Printed pages ${dpp.sourcePrintedPages.from}–${dpp.sourcePrintedPages.to}. 30-question chapter practice, not a full board examination paper.`;
  $("previousQuestion").onclick = () => { if (state.index > 0) { state.index -= 1; renderQuestion(); } };
  $("nextQuestion").onclick = () => { if (state.index < dpp.questions.length - 1) { state.index += 1; renderQuestion(); } };
  $("submitDpp").onclick = submitDpp;
  renderQuestion();
}

initialize().catch((error) => { console.error(error); });
