(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const state = { bank: [], questions: [], answers: {}, index: 0 };
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
    state.questions = shuffle(available).slice(0, requested); state.answers = {}; state.index = 0;
    $("setup").hidden = true; $("complete").hidden = true; $("quiz").hidden = false; render();
    $("quiz").scrollIntoView({behavior:"smooth", block:"start"});
  }
  function render() {
    const question = state.questions[state.index]; const chosen = state.answers[state.index];
    $("setName").textContent = question.rankerSetLabel; $("position").textContent = `${state.index + 1} / ${state.questions.length}`; $("bar").style.width = `${((state.index + 1) / state.questions.length) * 100}%`;
    $("meta").textContent = `Biology · Cell: The Unit of Life · ${question.sourceCode}`; $("question").textContent = question.question;
    const visual = $("visual"); visual.hidden = !question.visualAsset; if (question.visualAsset) { visual.querySelector("img").src = question.visualAsset; visual.querySelector("img").alt = question.visualSpec?.caption || "Biology question diagram"; }
    $("options").innerHTML = question.options.map((option, index) => `<button type="button" data-option="${index}" class="${chosen === index ? "selected" : ""} ${chosen !== undefined && index === question.answer ? "correct" : ""} ${chosen !== undefined && chosen === index && index !== question.answer ? "wrong" : ""}"><b>${String.fromCharCode(65 + index)}</b><span>${escapeHtml(option)}</span></button>`).join("");
    $("options").querySelectorAll("button").forEach((button) => button.onclick = () => { if (state.answers[state.index] !== undefined) return; state.answers[state.index] = Number(button.dataset.option); render(); });
    $("answer").hidden = chosen === undefined; if (chosen !== undefined) $("answer").innerHTML = `<strong>Correct answer</strong><span>${String.fromCharCode(65 + question.answer)}. ${escapeHtml(question.options[question.answer])}</span>`;
    $("prev").disabled = state.index === 0; $("next").textContent = state.index === state.questions.length - 1 ? "Finish session →" : "Next →";
  }
  function next() { if (state.index === state.questions.length - 1) return finish(); state.index++; render(); }
  function finish() { const score = state.questions.reduce((total, question, index) => total + (state.answers[index] === question.answer ? 1 : 0), 0); $("quiz").hidden = true; $("complete").hidden = false; $("score").textContent = `${score} / ${state.questions.length} correct`; $("complete").scrollIntoView({behavior:"smooth", block:"center"}); }
  $("start").onclick = start; $("prev").onclick = () => { if (state.index > 0) { state.index--; render(); } }; $("next").onclick = next; $("again").onclick = () => { $("complete").hidden = true; $("setup").hidden = false; $("setup").scrollIntoView({behavior:"smooth"}); };
  loadBank().catch(() => { $("start").disabled = true; $("start").textContent = "PLEASE TRY AGAIN SHORTLY"; });
})();
