(() => {
  "use strict";
  const ARCADE_URL = "data/ncert-quest/arcade.json";
  const BOSS_URL = "data/ncert-quest/cell-under-attack.json";
  const STORAGE_KEY = "scrutiny_ncert_arcade_v1";
  const SESSION_SIZE = 5;
  const $ = (id) => document.getElementById(id);
  let modes = [];
  let activeFilter = "all";
  let run = null;
  let profile = loadProfile();

  function loadProfile() {
    try {
      return { xp: 0, streak: 0, lastPlayed: "", modes: {}, questions: {}, daily: {}, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch (_) {
      return { xp: 0, streak: 0, lastPlayed: "", modes: {}, questions: {}, daily: {} };
    }
  }
  function saveProfile() { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); }
  function dayKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
    return copy;
  }
  function esc(value) { return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]); }
  function toast(message) {
    $("toast").textContent = message;
    $("toast").classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => $("toast").classList.remove("show"), 2200);
  }
  function updateStreak() {
    const today = dayKey();
    if (profile.lastPlayed === today) return;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    profile.streak = profile.lastPlayed === dayKey(yesterday) ? profile.streak + 1 : 1;
    profile.lastPlayed = today;
  }
  function bossMode(data) {
    return {
      id: "boss-battle", title: "Chapter Boss Battle", icon: "♛", subject: "Biology", skill: "Chapter mastery",
      description: "Defeat a mixed Cell: The Unit of Life boss with five challenge types.", accent: "#ff765f",
      challenges: data.missions.map((mission) => ({ ...mission, id: `boss-${mission.id}`, source: `${data.subject} XI · ${data.chapter} · ${mission.reference.section} · printed p.${mission.reference.printedPage}` }))
    };
  }
  function questionState(id) { return profile.questions[id] || { attempts: 0, correct: 0, streak: 0, nextDue: 0 }; }
  function masteredQuestions() { return Object.values(profile.questions).filter((item) => item.streak >= 3).length; }
  function selectChallenges(mode) {
    if (mode.id === "escape-room") return [...mode.challenges];
    const now = Date.now();
    const due = shuffle(mode.challenges.filter((challenge) => questionState(challenge.id).nextDue && questionState(challenge.id).nextDue <= now));
    const unseen = shuffle(mode.challenges.filter((challenge) => !questionState(challenge.id).attempts));
    const remaining = shuffle(mode.challenges.filter((challenge) => !due.includes(challenge) && !unseen.includes(challenge)));
    return [...due, ...unseen, ...remaining].slice(0, SESSION_SIZE);
  }
  function renderDashboard() {
    $("totalXp").textContent = profile.xp;
    $("streak").textContent = `${profile.streak} 🔥`;
    $("mastered").textContent = masteredQuestions();
    renderGames();
    renderProgress();
    renderDaily();
  }
  function renderGames() {
    const visible = modes.filter((mode) => activeFilter === "all" || mode.subject === activeFilter || (activeFilter === "Mixed" && mode.subject === "Mixed"));
    $("gameGrid").innerHTML = visible.map((mode) => {
      const stats = profile.modes[mode.id] || { best: 0, plays: 0 };
      return `<button class="game-card" data-mode="${mode.id}" style="--accent:${mode.accent}"><span class="game-icon">${mode.icon}</span><span class="game-copy"><small>${esc(mode.subject.toUpperCase())} · ${stats.plays ? `BEST ${stats.best}%` : "NEW"}</small><h3>${esc(mode.title)}</h3><p>${esc(mode.description)}</p><span class="game-tags"><span>${esc(mode.skill)}</span><span>${mode.challenges.length} challenges</span></span></span><span class="play-arrow">→</span></button>`;
    }).join("");
    $("gameGrid").querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => startMode(button.dataset.mode)));
  }
  function renderProgress() {
    const played = modes.filter((mode) => profile.modes[mode.id]?.plays);
    $("progressMessage").textContent = played.length ? `${played.length} of ${modes.length} games explored · ${masteredQuestions()} concepts mastered through repeated recall.` : "Play your first game to begin building mastery.";
    $("progressGrid").innerHTML = modes.map((mode) => {
      const stats = profile.modes[mode.id] || { best: 0, plays: 0 };
      return `<article class="progress-card" style="--accent:${mode.accent}"><span>${esc(mode.title)}</span><strong>${stats.plays ? `${stats.best}%` : "—"}</strong><div class="mini-progress"><i style="width:${stats.best || 0}%"></i></div></article>`;
    }).join("");
  }
  function dailyMode() { return modes[new Date().getDate() % modes.length] || modes[0]; }
  function renderDaily() {
    const mode = dailyMode();
    const completed = Math.min(3, profile.daily[dayKey()] || 0);
    $("dailyTitle").textContent = mode ? `${mode.title}: complete one five-question run` : "Loading today's mission…";
    $("dailyText").textContent = `${completed}/3 games complete`;
    $("dailyBar").style.width = `${completed / 3 * 100}%`;
  }
  function startMode(modeId) {
    const mode = modes.find((item) => item.id === modeId);
    if (!mode) return;
    run = { mode, challenges: selectChallenges(mode), index: 0, correct: 0, lives: 3, xp: 0, locked: false, clueCount: 1, selectedSequence: [], escapeCode: [] };
    $("resultDialog").close();
    $("gameDialog").showModal();
    $("gameSubject").textContent = mode.subject.toUpperCase();
    $("gameTitle").textContent = mode.title;
    renderChallenge();
  }
  function renderChallenge() {
    const challenge = run.challenges[run.index];
    run.locked = false;
    run.subAnswerCorrect = true;
    run.clueCount = 1;
    run.selectedSequence = [];
    $("feedbackBox").hidden = true;
    $("feedbackBox").classList.remove("incorrect");
    $("questionType").textContent = run.mode.title.toUpperCase();
    $("questionCount").textContent = `${run.index + 1} / ${run.challenges.length}`;
    $("questionProgress").style.width = `${run.index / run.challenges.length * 100}%`;
    updateRunHeader();
    const renderers = { "line-hunter": renderLine, "who-am-i": renderWho, "sequence-sprint": renderSequence, "physics-lab": renderPhysics, "reaction-forge": renderReaction, "treasure-hunt": renderTreasure, "diagram-detective": renderDiagram, "escape-room": renderEscape };
    (renderers[run.mode.id] || renderChoice)(challenge);
  }
  function updateRunHeader() {
    $("runLives").textContent = `${"♥ ".repeat(run.lives)}${"♡ ".repeat(3 - run.lives)}`.trim();
    $("runXp").textContent = `+${run.xp} XP`;
  }
  function heading(prompt, instruction = "Choose the best answer.") { return `<h2>${esc(prompt)}</h2><p class="instruction">${esc(instruction)}</p>`; }
  function choiceMarkup(options) { return `<div class="choice-grid">${options.map((option, index) => `<button class="choice" data-choice="${index}"><b>${String.fromCharCode(65 + index)}</b><span>${esc(option)}</span></button>`).join("")}</div>`; }
  function bindChoices(challenge) { $("gameStage").querySelectorAll("[data-choice]").forEach((button) => button.addEventListener("click", () => answerChoice(challenge, Number(button.dataset.choice)))); }
  function renderChoice(challenge) {
    $("gameStage").innerHTML = heading(challenge.prompt) + choiceMarkup(challenge.options);
    bindChoices(challenge);
  }
  function renderDiagram(challenge) {
    $("gameStage").innerHTML = heading(challenge.prompt, "Inspect the diagram before choosing.") + `<figure class="diagram-frame"><img src="${esc(challenge.image)}" alt="${esc(challenge.alt)}"></figure>` + choiceMarkup(challenge.options);
    bindChoices(challenge);
  }
  function renderPhysics(challenge) {
    $("gameStage").innerHTML = heading(challenge.prompt, "First select the correct formula, then calculate the repair value.") + `<div class="formula-card"><small>STEP 1 · SELECT A FORMULA</small><div class="choice-grid">${challenge.formulaOptions.map((formula, index) => `<button class="choice" data-formula="${index}"><b>${index + 1}</b><span>${esc(formula)}</span></button>`).join("")}</div></div><div id="physicsValue" hidden><p class="instruction">STEP 2 · Calculate and select the value.</p>${choiceMarkup(challenge.options)}</div>`;
    $("gameStage").querySelectorAll("[data-formula]").forEach((button) => button.addEventListener("click", () => {
      const selected = Number(button.dataset.formula);
      run.subAnswerCorrect = selected === challenge.formulaAnswer;
      $("gameStage").querySelectorAll("[data-formula]").forEach((item, index) => { item.disabled = true; if (index === challenge.formulaAnswer) item.classList.add("correct"); if (index === selected && !run.subAnswerCorrect) item.classList.add("wrong"); });
      $("physicsValue").hidden = false;
      bindChoices(challenge);
    }));
  }
  function renderReaction(challenge) {
    $("gameStage").innerHTML = heading(challenge.prompt, "Use the reagent and condition to forge the product.") + `<div class="reaction-card"><small>REACTION FORGE</small><strong>${esc(challenge.equation)}</strong><span>Condition: ${esc(challenge.condition)}</span></div>` + choiceMarkup(challenge.options);
    bindChoices(challenge);
  }
  function renderTreasure(challenge) {
    $("gameStage").innerHTML = heading(challenge.prompt, "Follow the clue to locate the NCERT treasure.") + `<div class="treasure-hint"><small>MAP HINT</small>${esc(challenge.hint)}</div>` + choiceMarkup(challenge.options);
    bindChoices(challenge);
  }
  function renderEscape(challenge) {
    const code = run.escapeCode.length ? run.escapeCode.join(" ") : "_ _ _ _ _";
    $("gameStage").innerHTML = heading(challenge.prompt, "Solve every door to reveal the five-letter exit code.") + `<div class="escape-code"><small>EXIT CODE</small><b>${esc(code)}</b></div>` + choiceMarkup(challenge.options);
    bindChoices(challenge);
  }
  function renderWho(challenge) {
    $("gameStage").innerHTML = heading("Who am I?", "Reveal fewer clues to earn the full recall bonus.") + `<div class="clue-panel" id="cluePanel">${challenge.clues.slice(0, 1).map((clue, i) => `<p>CLUE ${i + 1}: ${esc(clue)}</p>`).join("")}</div><button class="reveal-clue" id="revealClue">REVEAL ANOTHER CLUE</button>` + choiceMarkup(challenge.options);
    $("revealClue").addEventListener("click", () => {
      if (run.clueCount >= challenge.clues.length) return toast("All clues are already visible.");
      run.clueCount += 1;
      $("cluePanel").innerHTML = challenge.clues.slice(0, run.clueCount).map((clue, i) => `<p>CLUE ${i + 1}: ${esc(clue)}</p>`).join("");
      if (run.clueCount === challenge.clues.length) $("revealClue").disabled = true;
    });
    bindChoices(challenge);
  }
  function renderLine(challenge) {
    const tokens = challenge.sentence.split(/\s+/);
    $("gameStage").innerHTML = heading("Find the altered word", "Tap the one word that makes this NCERT statement incorrect.") + `<div class="line-statement">${tokens.map((token, index) => `<button class="word-token" data-word="${index}">${esc(token)}</button>`).join("")}</div><div class="repair-box" id="repairBox" hidden></div>`;
    $("gameStage").querySelectorAll("[data-word]").forEach((button) => button.addEventListener("click", () => {
      if (run.locked) return;
      const raw = tokens[Number(button.dataset.word)].replace(/[.,;:!?“”"']/g, "");
      const target = challenge.wrong.replace(/[.,;:!?“”"']/g, "");
      const correct = raw.toLowerCase() === target.toLowerCase();
      button.classList.add(correct ? "wrong" : "missed");
      if (correct) { $("repairBox").hidden = false; $("repairBox").textContent = `Repair: ${challenge.wrong} → ${challenge.repair}`; }
      finishAnswer(challenge, correct);
    }));
  }
  function renderSequence(challenge) {
    const scrambled = shuffle(challenge.items);
    $("gameStage").innerHTML = heading(challenge.prompt, "Tap the steps in order. Tap a selected step to return it.") + `<div class="sequence-answer" id="sequenceAnswer"><span class="instruction">Your sequence appears here</span></div><div class="sequence-bank" id="sequenceBank">${scrambled.map((item, index) => `<button class="sequence-token" data-item="${index}">${esc(item)}</button>`).join("")}</div><button class="check-sequence" id="checkSequence">CHECK SEQUENCE</button>`;
    const bank = $("sequenceBank"), answer = $("sequenceAnswer");
    bank.querySelectorAll("[data-item]").forEach((button) => button.addEventListener("click", () => {
      if (run.locked) return;
      if (button.parentElement === bank) {
        if (!run.selectedSequence.length) answer.innerHTML = "";
        run.selectedSequence.push(button.textContent);
        button.dataset.order = run.selectedSequence.length;
        answer.appendChild(button);
      } else {
        const index = run.selectedSequence.indexOf(button.textContent);
        if (index >= 0) run.selectedSequence.splice(index, 1);
        bank.appendChild(button);
        [...answer.querySelectorAll("[data-item]")].forEach((item, i) => item.dataset.order = i + 1);
        if (!run.selectedSequence.length) answer.innerHTML = '<span class="instruction">Your sequence appears here</span>';
      }
    }));
    $("checkSequence").addEventListener("click", () => {
      if (run.selectedSequence.length !== challenge.items.length) return toast("Place every step before checking.");
      const correct = run.selectedSequence.every((item, index) => item === challenge.items[index]);
      finishAnswer(challenge, correct);
    });
  }
  function answerChoice(challenge, selected) {
    if (run.locked) return;
    const correct = selected === challenge.answer && run.subAnswerCorrect;
    $("gameStage").querySelectorAll("[data-choice]").forEach((button, index) => {
      button.disabled = true;
      if (index === challenge.answer) button.classList.add("correct");
      if (index === selected && !correct) button.classList.add("wrong");
    });
    if (run.mode.id === "escape-room") run.escapeCode.push(correct ? challenge.code : "×");
    finishAnswer(challenge, correct);
  }
  function finishAnswer(challenge, correct) {
    if (run.locked) return;
    run.locked = true;
    let gained = correct ? 15 : 3;
    if (run.mode.id === "who-am-i" && correct) gained += (3 - run.clueCount) * 3;
    if (correct) run.correct += 1; else run.lives = Math.max(0, run.lives - 1);
    run.xp += gained;
    const state = questionState(challenge.id);
    state.attempts += 1;
    if (correct) {
      state.correct += 1; state.streak += 1;
      const intervals = [1, 3, 7, 14, 30];
      state.nextDue = Date.now() + intervals[Math.min(state.streak - 1, intervals.length - 1)] * 86400000;
    } else {
      state.streak = 0; state.nextDue = Date.now() + 5 * 60000;
    }
    profile.questions[challenge.id] = state;
    saveProfile();
    updateRunHeader();
    $("feedbackBox").hidden = false;
    $("feedbackBox").classList.toggle("incorrect", !correct);
    $("feedbackIcon").textContent = correct ? "✓" : "!";
    $("feedbackHeading").textContent = correct ? `Correct · +${gained} XP` : "Comeback card created";
    $("feedbackExplanation").textContent = challenge.explanation;
    $("feedbackSource").textContent = challenge.source;
    $("nextQuestion").textContent = run.index === run.challenges.length - 1 ? "FINISH GAME →" : "NEXT CHALLENGE →";
  }
  function nextQuestion() {
    if (!run?.locked) return toast("Complete the challenge first.");
    run.index += 1;
    if (run.index >= run.challenges.length) finishRun(); else renderChallenge();
  }
  function finishRun() {
    updateStreak();
    profile.xp += run.xp;
    const percent = Math.round(run.correct / run.challenges.length * 100);
    const stats = profile.modes[run.mode.id] || { best: 0, plays: 0 };
    stats.plays += 1; stats.best = Math.max(stats.best, percent); stats.lastPlayed = Date.now();
    profile.modes[run.mode.id] = stats;
    profile.daily[dayKey()] = (profile.daily[dayKey()] || 0) + 1;
    saveProfile();
    $("gameDialog").close();
    $("scorePercent").textContent = `${percent}%`;
    $("scoreRing").style.setProperty("--score", `${percent}%`);
    $("resultTitle").textContent = percent === 100 ? "Perfect NCERT run!" : percent >= 80 ? "Excellent recall!" : percent >= 60 ? "Strong progress!" : "Comeback cards ready";
    $("resultCopy").textContent = percent >= 80 ? "Your recalled concepts are scheduled for spaced reinforcement." : "Missed concepts will return in future sessions until they are mastered.";
    $("resultCorrect").textContent = `${run.correct}/${run.challenges.length}`;
    $("resultXp").textContent = `+${run.xp}`;
    $("resultBest").textContent = `${stats.best}%`;
    $("resultDialog").showModal();
    renderDashboard();
  }
  function quitGame() {
    if (!run || confirm("Exit this game? Answered concepts are already saved.")) { $("gameDialog").close(); run = null; }
  }
  async function init() {
    try {
      const [arcadeResponse, bossResponse] = await Promise.all([fetch(ARCADE_URL), fetch(BOSS_URL)]);
      if (!arcadeResponse.ok || !bossResponse.ok) throw new Error("Arcade data unavailable");
      const arcade = await arcadeResponse.json();
      const boss = await bossResponse.json();
      modes = [...arcade.modes, bossMode(boss)];
      renderDashboard();
    } catch (error) {
      console.error(error); toast("Game data could not be loaded. Please refresh.");
    }
  }
  document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("active", item === button));
    activeFilter = button.dataset.filter; renderGames();
  }));
  $("quickPlay").addEventListener("click", () => modes.length && startMode(shuffle(modes)[0].id));
  $("dailyPlay").addEventListener("click", () => dailyMode() && startMode(dailyMode().id));
  $("closeGame").addEventListener("click", quitGame);
  $("nextQuestion").addEventListener("click", nextQuestion);
  $("playAgain").addEventListener("click", () => startMode(run.mode.id));
  $("chooseGame").addEventListener("click", () => { $("resultDialog").close(); $("gameModes").scrollIntoView({ behavior: "smooth" }); });
  init();
  if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.error));
})();
