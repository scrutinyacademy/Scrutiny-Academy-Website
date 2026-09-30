(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const state = { bank: [], questions: [], answers: {}, confidence: {}, reasons: {}, index: 0 };
  const confidenceLabels = { sure: "100% sure", two: "Confused between two", educated: "Educated guess", random: "Random guess" };
  const reasonLabels = { concept: "Concept confusion", ncert: "NCERT fact", misread: "Misread question", trap: "Option trap", calculation: "Calculation", time: "Time pressure" };
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
  const shuffle = (items) => { const copy = [...items]; for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; };
  async function loadBank() {
    const response = await fetch("data/neet/ranker/cell-unit-of-life.json");
    if (!response.ok) throw new Error("Question bank unavailable");
    const data = await response.json();
    state.bank = data.chapters[0].mcqs;
  }
  function start() {
    const set = $("set").value;
    const available = set === "all" ? state.bank : state.bank.filter((question) => question.rankerSet === set);
    const requested = $("count").value === "all" ? available.length : Number($("count").value);
    state.questions = shuffle(available).slice(0, requested); state.answers = {}; state.confidence = {}; state.reasons = {}; state.index = 0;
    $("setup").hidden = true; $("complete").hidden = true; $("quiz").hidden = false; render();
    $("quiz").scrollIntoView({behavior:"smooth", block:"start"});
  }
  function render() {
    const question = state.questions[state.index]; const chosen = state.answers[state.index]; const confidence = state.confidence[state.index];
    $("setName").textContent = question.rankerSetLabel; $("position").textContent = `${state.index + 1} / ${state.questions.length}`; $("bar").style.width = `${((state.index + 1) / state.questions.length) * 100}%`;
    $("meta").textContent = `Biology · Cell: The Unit of Life · ${question.sourceCode}`; $("question").textContent = question.question;
    const visual = $("visual"); visual.hidden = !question.visualAsset; if (question.visualAsset) { visual.querySelector("img").src = question.visualAsset; visual.querySelector("img").alt = question.visualSpec?.caption || "Biology question diagram"; }
    $("confidence").querySelectorAll("button").forEach((button) => { button.classList.toggle("active", confidence === button.dataset.confidence); button.disabled = chosen !== undefined; button.onclick = () => { state.confidence[state.index] = button.dataset.confidence; render(); }; });
    $("options").innerHTML = question.options.map((option, index) => `<button type="button" data-option="${index}" ${confidence ? "" : "disabled"} class="${chosen === index ? "selected" : ""} ${chosen !== undefined && index === question.answer ? "correct" : ""} ${chosen !== undefined && chosen === index && index !== question.answer ? "wrong" : ""}"><b>${String.fromCharCode(65 + index)}</b><span>${escapeHtml(option)}</span></button>`).join("");
    $("options").querySelectorAll("button").forEach((button) => button.onclick = () => { if (state.answers[state.index] !== undefined || !state.confidence[state.index]) return; state.answers[state.index] = Number(button.dataset.option); render(); });
    const classification = chosen === undefined ? "" : chosen === question.answer && confidence === "sure" ? "Truly mastered" : chosen === question.answer ? "Fragile knowledge" : confidence === "sure" ? "Dangerous misconception" : "Knowledge gap";
    $("answer").hidden = chosen === undefined; if (chosen !== undefined) $("answer").innerHTML = `<strong>Correct answer</strong><span>${String.fromCharCode(65 + question.answer)}. ${escapeHtml(question.options[question.answer])}</span><b>${classification}</b>`;
    $("reason").hidden = chosen === undefined || chosen === question.answer;
    if (!$("reason").hidden) { const selectedReason = state.reasons[state.index]; $("reason").innerHTML = `<strong>What caused this mistake?</strong><div>${Object.entries(reasonLabels).map(([value, label]) => `<button type="button" data-reason="${value}" class="${selectedReason === value ? "active" : ""}">${label}</button>`).join("")}</div>`; $("reason").querySelectorAll("button").forEach((button) => button.onclick = () => { state.reasons[state.index] = button.dataset.reason; render(); }); }
    $("prev").disabled = state.index === 0; $("next").textContent = state.index === state.questions.length - 1 ? "Finish session →" : "Next →";
  }
  function next() { if (state.index === state.questions.length - 1) return finish(); state.index++; render(); }
  function finish() {
    let mastered = 0, fragile = 0, dangerous = 0, gaps = 0, correct = 0;
    state.questions.forEach((question, index) => { const chosen = state.answers[index]; if (chosen === undefined) return; const isCorrect = chosen === question.answer; if (isCorrect) correct++; if (isCorrect && state.confidence[index] === "sure") mastered++; else if (isCorrect) fragile++; else if (state.confidence[index] === "sure") dangerous++; else gaps++; });
    const recoverableMarks = (dangerous + gaps) * 5;
    $("quiz").hidden = true; $("complete").hidden = false; $("score").textContent = `${correct} / ${state.questions.length} correct`;
    $("publicDna").innerHTML = `<div><strong>${recoverableMarks}</strong><span>marks recoverable</span></div><div><span><b>${mastered}</b> Truly mastered</span><span><b>${fragile}</b> Fragile knowledge</span><span><b>${dangerous}</b> Dangerous misconceptions</span><span><b>${gaps}</b> Knowledge gaps</span></div>`;
    try { const stored = JSON.parse(localStorage.getItem("scrutiny_ranker_dna") || '{"sessions":[]}'); stored.sessions = [{ completedAt:new Date().toISOString(), title:"Free Cell chapter", mastered, fragile, dangerous, gaps, recoverableMarks }, ...(stored.sessions || [])].slice(0,20); localStorage.setItem("scrutiny_ranker_dna",JSON.stringify(stored)); } catch {}
    $("complete").scrollIntoView({behavior:"smooth", block:"center"});
  }
  $("start").onclick = start; $("prev").onclick = () => { if (state.index > 0) { state.index--; render(); } }; $("next").onclick = next; $("again").onclick = () => { $("complete").hidden = true; $("setup").hidden = false; $("setup").scrollIntoView({behavior:"smooth"}); };
  loadBank().catch(() => { $("start").disabled = true; $("start").textContent = "PLEASE TRY AGAIN SHORTLY"; });
})();
