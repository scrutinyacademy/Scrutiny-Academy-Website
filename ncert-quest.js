(() => {
  "use strict";
  const DATA_URL = "data/ncert-quest/cell-under-attack.json";
  const STORAGE_KEY = "scrutiny_ncert_quest_v1";
  const SESSION_SIZE = 7;
  const TYPE_LABELS = { who: "WHO AM I?", timeline: "TIMELINE REPAIR", line: "NCERT LINE HUNTER", rescue: "CELL RESCUE", impostor: "SPOT THE IMPOSTOR", match: "MATCH LAB", sequence: "SEQUENCE SPRINT", diagram: "DIAGRAM DETECTIVE" };
  const ZONES = ["Discovery Bay", "Theory Vault", "Cell Interior", "Prokaryote Outpost", "Ribosome Factory", "Membrane Gate", "Plant Fortress", "Organelle District", "Golgi Shipping Hub", "Power Station", "Nuclear Command", "Movement Dock"];
  const $ = (id) => document.getElementById(id);
  let data;
  let profile = loadProfile();
  let run = null;

  function loadProfile() {
    try {
      return { xp: 0, streak: 0, lastPlayed: "", best: 0, runs: 0, mastery: {}, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch (_) { return { xp: 0, streak: 0, lastPlayed: "", best: 0, runs: 0, mastery: {} }; }
  }
  function saveProfile() { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); }
  function dayKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
  function shuffled(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
    return copy;
  }
  function dueMissions() {
    const now = Date.now();
    return data.missions.filter((mission) => profile.mastery[mission.id]?.nextDue && profile.mastery[mission.id].nextDue <= now);
  }
  function selectMissions() {
    const due = shuffled(dueMissions());
    const unseen = shuffled(data.missions.filter((mission) => !profile.mastery[mission.id]));
    const rest = shuffled(data.missions.filter((mission) => !due.includes(mission) && !unseen.includes(mission)));
    return [...due, ...unseen, ...rest].slice(0, SESSION_SIZE);
  }
  function toast(message) {
    $("questToast").textContent = message;
    $("questToast").classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => $("questToast").classList.remove("show"), 2200);
  }
  function updateStreak() {
    const today = dayKey();
    if (profile.lastPlayed === today) return;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    profile.streak = profile.lastPlayed === dayKey(yesterday) ? profile.streak + 1 : 1;
    profile.lastPlayed = today;
  }
  function masteryLevel(entry = {}) { return entry.correctStreak >= 3 ? "mastered" : entry.correctStreak >= 1 ? "restoring" : "unstable"; }
  function renderDashboard() {
    const entries = Object.values(profile.mastery);
    const mastered = entries.filter((entry) => masteryLevel(entry) === "mastered").length;
    const due = data ? dueMissions().length : 0;
    $("xpValue").textContent = profile.xp;
    $("streakValue").textContent = `${profile.streak} 🔥`;
    $("masteredValue").textContent = `${mastered} / ${data?.missions.length || 24}`;
    $("masteredBar").style.width = `${Math.round((mastered / (data?.missions.length || 24)) * 100)}%`;
    $("dueValue").textContent = `${due} due`;
    $("bestValue").textContent = profile.runs ? `${profile.best}%` : "—";
    if (!data) return;
    const zones = ZONES.map((name) => {
      const missions = data.missions.filter((mission) => mission.zone === name);
      if (!missions.length) return null;
      const masteredCount = missions.filter((mission) => masteryLevel(profile.mastery[mission.id]) === "mastered").length;
      return { name, masteredCount, total: missions.length };
    }).filter(Boolean);
    $("zoneTrack").innerHTML = zones.map((zone, index) => `<article class="zone-card ${zone.masteredCount === zone.total ? "restored" : ""}"><small>ZONE ${String(index + 1).padStart(2, "0")}</small><strong>${zone.name}</strong><p>${zone.masteredCount} of ${zone.total} concepts mastered</p><span>${zone.masteredCount === zone.total ? "✓ RESTORED" : zone.masteredCount ? "◉ RESTORING" : "○ UNEXPLORED"}</span></article>`).join("");
    $("mapSummary").textContent = mastered ? `${mastered} concepts permanently restored. Keep returning to stabilise every zone.` : "Start a mission to restore your first zone.";
  }
  function startMission() {
    const missions = selectMissions();
    run = { missions, index: 0, correct: 0, lives: 3, xp: 0, comebackCount: missions.filter((mission) => profile.mastery[mission.id]?.nextDue <= Date.now()).length, locked: false };
    $("howDialog").close();
    $("gameDialog").showModal();
    renderChallenge();
  }
  function renderChallenge() {
    const mission = run.missions[run.index];
    run.locked = false;
    $("missionZone").textContent = mission.zone.toUpperCase();
    $("challengeType").textContent = TYPE_LABELS[mission.type] || "NCERT CHALLENGE";
    $("challengeNumber").textContent = `${run.index + 1} / ${run.missions.length}`;
    $("challengePrompt").textContent = mission.prompt;
    $("challengeClue").hidden = !mission.clue;
    $("challengeClue").textContent = mission.clue || "";
    const image = $("challengeImage");
    image.hidden = !mission.image;
    if (mission.image) { image.querySelector("img").src = mission.image; image.querySelector("img").alt = mission.imageAlt || "NCERT challenge diagram"; }
    $("feedback").hidden = true;
    $("feedback").classList.remove("incorrect");
    $("lifeRow").textContent = `${"● ".repeat(run.lives)}${"○ ".repeat(3 - run.lives)}`.trim();
    $("gameProgress").style.width = `${(run.index / run.missions.length) * 100}%`;
    $("answerGrid").innerHTML = mission.options.map((option, index) => `<button class="answer-button" data-index="${index}"><b>${String.fromCharCode(65 + index)}</b><span>${option}</span></button>`).join("");
    $("answerGrid").querySelectorAll("button").forEach((button) => button.addEventListener("click", () => answer(Number(button.dataset.index))));
  }
  function answer(selected) {
    if (run.locked) return;
    run.locked = true;
    const mission = run.missions[run.index];
    const correct = selected === mission.answer;
    const buttons = [...$("answerGrid").querySelectorAll("button")];
    buttons.forEach((button, index) => { button.disabled = true; if (index === mission.answer) button.classList.add("correct"); if (index === selected && !correct) button.classList.add("wrong"); });
    if (correct) { run.correct += 1; run.xp += 15; } else { run.lives = Math.max(0, run.lives - 1); run.xp += 3; }
    const previous = profile.mastery[mission.id] || { attempts: 0, correct: 0, correctStreak: 0, intervalIndex: 0 };
    previous.attempts += 1;
    if (correct) {
      previous.correct += 1;
      previous.correctStreak += 1;
      const intervals = [1, 3, 7, 14, 30];
      previous.intervalIndex = Math.min((previous.intervalIndex || 0) + 1, intervals.length - 1);
      previous.nextDue = Date.now() + intervals[previous.intervalIndex] * 86400000;
    } else {
      previous.correctStreak = 0;
      previous.intervalIndex = 0;
      previous.nextDue = Date.now() + 5 * 60000;
    }
    profile.mastery[mission.id] = previous;
    saveProfile();
    $("feedback").hidden = false;
    $("feedback").classList.toggle("incorrect", !correct);
    $("feedbackIcon").textContent = correct ? "✓" : "!";
    $("feedbackTitle").textContent = correct ? "System restored" : "Comeback card created";
    $("feedbackText").textContent = mission.explanation;
    $("sourceText").textContent = `${data.chapter} · ${mission.reference.section} · Printed page ${mission.reference.printedPage} · PDF page ${mission.reference.pdfPage}`;
    $("nextChallenge").textContent = run.index === run.missions.length - 1 ? "COMPLETE MISSION →" : "NEXT CHALLENGE →";
    $("lifeRow").textContent = `${"● ".repeat(run.lives)}${"○ ".repeat(3 - run.lives)}`.trim();
  }
  function nextChallenge() {
    if (!run?.locked) return toast("Choose an answer first.");
    run.index += 1;
    if (run.index >= run.missions.length) return finishMission();
    renderChallenge();
  }
  function finishMission() {
    updateStreak();
    profile.xp += run.xp;
    profile.runs += 1;
    const percent = Math.round((run.correct / run.missions.length) * 100);
    profile.best = Math.max(profile.best || 0, percent);
    saveProfile();
    $("gameDialog").close();
    $("resultPercent").textContent = `${percent}%`;
    $("resultRing").style.setProperty("--score", `${percent}%`);
    $("resultHeading").textContent = percent >= 86 ? "Cell City restored!" : percent >= 60 ? "Cell City stabilised" : "The rescue continues";
    $("resultMessage").textContent = percent >= 86 ? "Excellent NCERT recall. Your restored concepts are now scheduled for future reinforcement." : "Your weak concepts have become comeback cards and will return until they are mastered.";
    $("resultCorrect").textContent = `${run.correct}/${run.missions.length}`;
    $("resultXp").textContent = `+${run.xp}`;
    $("resultComebacks").textContent = run.missions.length - run.correct;
    $("resultDialog").showModal();
    renderDashboard();
  }
  function quitMission() {
    if (confirm("Quit this mission? Your answered concepts are already saved.")) { $("gameDialog").close(); run = null; renderDashboard(); }
  }
  async function init() {
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) throw new Error(`Quest data ${response.status}`);
      data = await response.json();
      renderDashboard();
    } catch (error) {
      console.error(error);
      $("startQuest").disabled = true;
      toast("Mission data could not be loaded. Please refresh.");
    }
  }
  $("startQuest").addEventListener("click", () => data && startMission());
  $("openHow").addEventListener("click", () => $("howDialog").showModal());
  $("closeHow").addEventListener("click", () => $("howDialog").close());
  $("howStart").addEventListener("click", () => data && startMission());
  $("nextChallenge").addEventListener("click", nextChallenge);
  $("quitQuest").addEventListener("click", quitMission);
  $("playAgain").addEventListener("click", () => { $("resultDialog").close(); startMission(); });
  init();
  if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(console.error));
})();
