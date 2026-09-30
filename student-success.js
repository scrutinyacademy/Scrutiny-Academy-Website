(() => {
  const PROFILE_KEY = "scrutiny_success_profile_v1";
  const COMPLETION_KEY = "scrutiny_today_plan_v1";
  const DISPLAY_KEY = "scrutiny_display_preferences_v1";
  const PROGRESS_KEY = "scrutiny_v2_progress";
  const TOOLS_KEY = "scrutiny_learning_tools";
  const DAY = 86400000;
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const dateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const courses = {
    class10: { label: "Class 10 SSC", target: 95, max: 100, subjects: ["Mathematics", "Physical Science", "Biology", "Social Studies"], anchor: "class10" },
    class11: { label: "Class 11 Boards", target: 95, max: 100, subjects: ["Botany", "Zoology", "Physics", "Chemistry"], anchor: "class11" },
    class12: { label: "Class 12 Boards", target: 95, max: 100, subjects: ["Botany", "Zoology", "Physics", "Chemistry"], anchor: "class12" },
    neet: { label: "NEET-UG", target: 650, max: 720, subjects: ["Physics", "Chemistry", "Botany", "Zoology"], anchor: "neet" },
    mbbs: { label: "MBBS", target: 70, max: 100, subjects: ["Anatomy", "Physiology", "Biochemistry", "Pathology"], anchor: "mbbs" },
  };

  let context = window.__scrutinyStudentContext || null;
  let cloudProgress = window.__scrutinyProgress || {};
  let activeCourse = context?.activeCourse || localStorage.getItem("scrutiny_active_course") || "neet";

  const courseInfo = () => courses[activeCourse] || courses.neet;
  const portalUrl = (anchor = courseInfo().anchor) => `preview-v2.html?course=${encodeURIComponent(activeCourse)}#${anchor}`;
  const localProgress = () => read(PROGRESS_KEY, { sessions: [] });
  const tools = () => read(TOOLS_KEY, { mistakes: [], bookmarks: [] });
  const sessions = () => {
    const local = localProgress().sessions || [];
    const cloud = cloudProgress.sessions || [];
    const merged = new Map();
    [...cloud, ...local].forEach((session) => {
      const id = session.id || `${session.title || "session"}-${session.completedAt || "unknown"}`;
      merged.set(id, session);
    });
    return [...merged.values()].filter((session) => (session.courseId || "neet") === activeCourse);
  };
  const courseMistakes = () => (tools().mistakes || []).filter((item) => (item.courseId || "neet") === activeCourse);
  const profiles = () => read(PROFILE_KEY, {});
  const profile = () => profiles()[activeCourse] || null;
  const planStore = () => read(COMPLETION_KEY, {});
  const planKey = () => `${activeCourse}:${dateKey()}`;

  function setContext(detail = {}) {
    context = detail;
    activeCourse = detail.activeCourse || localStorage.getItem("scrutiny_active_course") || "neet";
    document.documentElement.dataset.successCourse = activeCourse;
    render();
    if (!profile() && !$('studyProfileDialog')?.open) setTimeout(openProfile, 450);
  }

  function courseSessions() {
    return sessions().sort((a, b) => String(b.completedAt || "").localeCompare(String(a.completedAt || "")));
  }

  function aggregateMastery() {
    const map = new Map();
    for (const session of courseSessions()) {
      for (const item of session.review || []) {
        if (item.selected === undefined) continue;
        const topic = [item.subject, item.chapter].filter(Boolean).join(" · ") || session.title || "Mixed practice";
        const row = map.get(topic) || { topic, attempted: 0, correct: 0, lastAt: session.completedAt || "" };
        row.attempted += 1;
        if (item.isCorrect) row.correct += 1;
        if (String(session.completedAt || "") > row.lastAt) row.lastAt = session.completedAt;
        map.set(topic, row);
      }
    }
    return [...map.values()].map((row) => ({ ...row, accuracy: Math.round((row.correct / row.attempted) * 100) }))
      .sort((a, b) => b.attempted - a.attempted || a.accuracy - b.accuracy);
  }

  function dueMistakes() {
    const now = Date.now();
    return courseMistakes().filter((item) => !item.mastered && (item.nextReviewAt || 0) <= now);
  }

  function completedPlan() {
    return new Set(planStore()[planKey()] || []);
  }

  function buildTasks() {
    const due = dueMistakes();
    const mastery = aggregateMastery();
    const weakest = [...mastery].filter((row) => row.attempted >= 2).sort((a, b) => a.accuracy - b.accuracy)[0];
    const count = Number(profile()?.minutes || 60) >= 90 ? 20 : 10;
    return [
      due.length
        ? { id: "revision", title: `Revise ${Math.min(due.length, 10)} due mistake${due.length === 1 ? "" : "s"}`, meta: "Fix old errors before learning something new.", action: "REVISE", href: portalUrl("tools") }
        : { id: "revision", title: "Review one saved concept", meta: "Active recall keeps important ideas available in the exam.", action: "REVIEW", href: portalUrl("tools") },
      weakest
        ? { id: "focus", title: `Strengthen ${weakest.topic}`, meta: `${weakest.accuracy}% accuracy from ${weakest.attempted} attempts · your current focus area.`, action: "PRACTISE", href: portalUrl(courseInfo().anchor) }
        : { id: "focus", title: `Explore ${courseInfo().subjects[0]}`, meta: "Start a baseline activity so Scrutiny can measure your mastery.", action: "START", href: portalUrl(courseInfo().anchor) },
      { id: "practice", title: `Complete a ${count}-question focus session`, meta: `Designed for your ${profile()?.minutes || 60}-minute daily study goal.`, action: "BEGIN", href: portalUrl(courseInfo().anchor) },
    ];
  }

  function readiness() {
    const rows = courseSessions();
    const attempted = rows.reduce((sum, row) => sum + (row.attempted || 0), 0);
    const correct = rows.reduce((sum, row) => sum + (row.correct || 0), 0);
    const accuracy = attempted ? correct / attempted : 0;
    const mistakes = courseMistakes();
    const revised = mistakes.filter((item) => item.mastered).length;
    const revisionRatio = mistakes.length ? revised / mistakes.length : 0;
    const value = Math.round(Math.min(100, Math.min(rows.length, 5) * 6 + accuracy * 48 + revisionRatio * 12 + (profile() ? 10 : 0)));
    return { value, attempted, accuracy: Math.round(accuracy * 100) };
  }

  function renderHero() {
    const info = courseInfo();
    const prefs = profile();
    const score = readiness();
    const today = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "short" }).format(new Date()).toUpperCase();
    $("successDate").textContent = today;
    $("successGoalText").textContent = prefs
      ? `${info.label} target: ${prefs.target}/${info.max}. Your plan is tuned for ${prefs.minutes} focused minutes during the ${prefs.studyTime}.`
      : `Set your ${info.label} target and daily study time to create a personal roadmap.`;
    $("successTarget").textContent = prefs ? `${prefs.target}/${info.max}` : "SET GOAL";
    $("successMinutes").textContent = prefs ? `${prefs.minutes} min` : "—";
    $("successLanguage").textContent = prefs?.language || "Choose";
    $("readinessScore").textContent = `${score.value}%`;
    $("readinessRing").style.setProperty("--readiness", score.value);
    $("readinessMessage").textContent = score.attempted
      ? `${score.accuracy}% accuracy across ${score.attempted} attempted questions.`
      : "Complete your first practice session to establish a baseline.";
    $("startTodayPlan").href = buildTasks()[0].href;
  }

  function renderPlan() {
    const completed = completedPlan();
    const tasks = buildTasks();
    $("todayTaskList").innerHTML = tasks.map((task) => `<article class="today-task ${completed.has(task.id) ? "complete" : ""}" data-task="${task.id}"><button class="today-task-check" type="button" aria-label="${completed.has(task.id) ? "Mark incomplete" : "Mark complete"}: ${esc(task.title)}">✓</button><span class="today-task-copy"><strong>${esc(task.title)}</strong><small>${esc(task.meta)}</small></span><a href="${esc(task.href)}">${esc(task.action)} →</a></article>`).join("");
    const count = tasks.filter((task) => completed.has(task.id)).length;
    $("planProgress").textContent = `${count}/${tasks.length} complete`;
    $("todayProgressBar").style.width = `${Math.round((count / tasks.length) * 100)}%`;
    $("planNote").textContent = count === tasks.length ? "Excellent—today’s focused plan is complete. Come back tomorrow for a fresh plan." : "Your plan adapts to recent performance and pending revision.";
    $("todayTaskList").querySelectorAll(".today-task-check").forEach((button) => button.addEventListener("click", () => {
      const id = button.closest(".today-task").dataset.task;
      const store = planStore();
      const current = new Set(store[planKey()] || []);
      if (current.has(id)) current.delete(id); else current.add(id);
      store[planKey()] = [...current];
      write(COMPLETION_KEY, store);
      renderPlan();
    }));
  }

  function renderInsight() {
    const mastery = aggregateMastery();
    const due = dueMistakes();
    const weakest = [...mastery].filter((row) => row.attempted >= 2).sort((a, b) => a.accuracy - b.accuracy)[0];
    if (due.length) {
      $("smartInsightTitle").textContent = "Clear your revision debt first";
      $("smartInsightText").textContent = `${due.length} mistake${due.length === 1 ? " is" : "s are"} ready for spaced revision.`;
      $("smartInsightReason").textContent = "Revisiting mistakes before new practice strengthens recall and prevents repeated errors.";
      $("smartInsightLink").textContent = "OPEN REVISION QUEUE";
      $("smartInsightLink").href = portalUrl("tools");
    } else if (weakest) {
      $("smartInsightTitle").textContent = `Focus on ${weakest.topic}`;
      $("smartInsightText").textContent = `Current accuracy is ${weakest.accuracy}% across ${weakest.attempted} attempts.`;
      $("smartInsightReason").textContent = "This is the lowest measured mastery area in your recent detailed sessions.";
      $("smartInsightLink").textContent = "PRACTISE THIS AREA";
      $("smartInsightLink").href = portalUrl(courseInfo().anchor);
    } else {
      $("smartInsightTitle").textContent = "Start with a baseline session";
      $("smartInsightText").textContent = `Complete your first ${courseInfo().label} practice session to reveal weak areas.`;
      $("smartInsightReason").textContent = "Recommendations become personal only after the platform observes real question attempts.";
      $("smartInsightLink").textContent = "START BASELINE PRACTICE";
      $("smartInsightLink").href = portalUrl(courseInfo().anchor);
    }
  }

  function renderMastery() {
    const rows = aggregateMastery().slice(0, 9);
    if (!rows.length) {
      $("masteryGrid").innerHTML = courseInfo().subjects.map((subject) => `<article class="mastery-item"><div class="mastery-item-head"><strong>${esc(subject)}</strong><b>0%</b></div><div class="mastery-track"><span style="width:0%;--mastery-color:#de5a47"></span></div><span class="mastery-status" style="--mastery-color:#de5a47">Not measured</span><small>Complete practice to calculate mastery</small></article>`).join("");
      return;
    }
    $("masteryGrid").innerHTML = rows.map((row) => {
      const status = row.accuracy >= 80 && row.attempted >= 5 ? "Mastered" : row.accuracy >= 55 ? "Improving" : "Needs focus";
      const color = status === "Mastered" ? "#22a86a" : status === "Improving" ? "#d89a18" : "#de5a47";
      return `<article class="mastery-item"><div class="mastery-item-head"><strong>${esc(row.topic)}</strong><b>${row.accuracy}%</b></div><div class="mastery-track"><span style="width:${row.accuracy}%;--mastery-color:${color}"></span></div><span class="mastery-status" style="--mastery-color:${color}">${status}</span><small>${row.correct}/${row.attempted} correct answers</small></article>`;
    }).join("");
  }

  function renderRevision() {
    const all = courseMistakes();
    const now = Date.now();
    const due = all.filter((item) => !item.mastered && (item.nextReviewAt || 0) <= now);
    const upcoming = all.filter((item) => !item.mastered && (item.nextReviewAt || 0) > now);
    const mastered = all.filter((item) => item.mastered);
    $("revisionDueNow").textContent = String(due.length);
    $("revisionUpcoming").textContent = String(upcoming.length);
    $("revisionMastered").textContent = String(mastered.length);
    $("openRevisionRadar").href = portalUrl("tools");
    const preview = [...due, ...upcoming].slice(0, 3);
    $("revisionPreview").innerHTML = preview.length
      ? preview.map((item) => `<div class="revision-preview-row"><strong>${esc(item.chapter || item.subject || "Practice question")}</strong><span>${item.mastered ? "Revised" : (item.nextReviewAt || 0) <= now ? "Due now" : "Upcoming"}</span></div>`).join("")
      : '<div class="revision-empty">Your revision radar is clear. Mistakes from future tests will be scheduled automatically.</div>';
  }

  function lastSevenDays() {
    const activity = new Map();
    courseSessions().forEach((session) => {
      if (!session.completedAt) return;
      const key = dateKey(new Date(session.completedAt));
      activity.set(key, (activity.get(key) || 0) + 1);
    });
    const days = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - offset);
      days.push({ date, key: dateKey(date), count: activity.get(dateKey(date)) || 0 });
    }
    return days;
  }

  function renderWeek() {
    const days = lastSevenDays();
    $("weekStrip").innerHTML = days.map((day) => `<span class="week-day ${day.count ? "active" : ""} ${day.key === dateKey() ? "today" : ""}" title="${day.count} session${day.count === 1 ? "" : "s"}"><strong>${new Intl.DateTimeFormat("en-IN", { weekday: "narrow" }).format(day.date)}</strong><i></i></span>`).join("");
    const activeDays = days.filter((day) => day.count).length;
    const weekSessions = days.reduce((sum, day) => sum + day.count, 0);
    $("weeklySummary").textContent = activeDays
      ? `${weekSessions} session${weekSessions === 1 ? "" : "s"} across ${activeDays} active day${activeDays === 1 ? "" : "s"} this week.`
      : "Complete a session today to begin your learning streak.";
  }

  function reportText() {
    const cutoff = Date.now() - 7 * DAY;
    const rows = courseSessions().filter((row) => row.completedAt && new Date(row.completedAt).getTime() >= cutoff);
    const attempted = rows.reduce((sum, row) => sum + (row.attempted || 0), 0);
    const correct = rows.reduce((sum, row) => sum + (row.correct || 0), 0);
    const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
    const activeDays = lastSevenDays().filter((day) => day.count).length;
    return `My Scrutiny Academy ${courseInfo().label} weekly report: ${activeDays}/7 active days, ${rows.length} total sessions, ${attempted} questions attempted, ${accuracy}% accuracy and ${dueMistakes().length} revisions due. My target is ${profile()?.target || "not set"}/${courseInfo().max}.`;
  }

  async function shareReport() {
    const text = reportText();
    try {
      if (navigator.share) await navigator.share({ title: "My Scrutiny Academy Weekly Report", text });
      else { await navigator.clipboard.writeText(text); $("shareWeeklyReport").textContent = "REPORT COPIED ✓"; }
    } catch (error) {
      if (error.name !== "AbortError") $("shareWeeklyReport").textContent = "COULD NOT SHARE";
    }
  }

  function applyDisplayPreferences() {
    const prefs = read(DISPLAY_KEY, { largeText: false, contrast: false });
    document.documentElement.classList.toggle("scrutiny-large-text", Boolean(prefs.largeText));
    document.documentElement.classList.toggle("scrutiny-high-contrast", Boolean(prefs.contrast));
    $("toggleContrast")?.setAttribute("aria-pressed", String(Boolean(prefs.contrast)));
  }

  function changeDisplay(patch) {
    const prefs = { ...read(DISPLAY_KEY, {}), ...patch };
    write(DISPLAY_KEY, prefs);
    applyDisplayPreferences();
  }

  function updateConnection() {
    const online = navigator.onLine;
    $("connectionStatus").classList.toggle("offline", !online);
    $("connectionStatus").lastChild.textContent = online ? "Online" : "Offline mode";
  }

  function readPlan() {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const tasks = buildTasks().map((task, index) => `Task ${index + 1}. ${task.title}. ${task.meta}`).join(" ");
    const utterance = new SpeechSynthesisUtterance(`Your Scrutiny Academy plan for today. ${tasks}`);
    utterance.lang = profile()?.language === "Hindi" || profile()?.language === "Hinglish" ? "hi-IN" : profile()?.language === "Telugu" ? "te-IN" : "en-IN";
    utterance.rate = .95;
    speechSynthesis.speak(utterance);
  }

  function openProfile() {
    const info = courseInfo();
    const current = profile() || {};
    $("profileTarget").max = String(info.max);
    $("profileTarget").value = current.target || info.target;
    $("profileMinutes").value = String(current.minutes || 60);
    $("profileLanguage").value = current.language || "English";
    $("profileStudyTime").value = current.studyTime || "evening";
    $("profileConfidence").value = current.confidence || "developing";
    if (!$('studyProfileDialog').open) $('studyProfileDialog').showModal();
  }

  function saveProfile(event) {
    event.preventDefault();
    const info = courseInfo();
    const target = Math.max(1, Math.min(info.max, Number($("profileTarget").value)));
    const data = profiles();
    data[activeCourse] = {
      target,
      minutes: Number($("profileMinutes").value),
      language: $("profileLanguage").value,
      studyTime: $("profileStudyTime").value,
      confidence: $("profileConfidence").value,
      updatedAt: new Date().toISOString(),
    };
    write(PROFILE_KEY, data);
    $("studyProfileDialog").close();
    render();
  }

  function render() {
    if (!$("successCommand")) return;
    renderHero();
    renderPlan();
    renderInsight();
    renderMastery();
    renderRevision();
    renderWeek();
    updateConnection();
  }

  $("editStudyProfile")?.addEventListener("click", openProfile);
  $("closeStudyProfile")?.addEventListener("click", () => $("studyProfileDialog").close());
  $("studyProfileForm")?.addEventListener("submit", saveProfile);
  $("shareWeeklyReport")?.addEventListener("click", shareReport);
  $("fontIncrease")?.addEventListener("click", () => changeDisplay({ largeText: true }));
  $("fontDecrease")?.addEventListener("click", () => changeDisplay({ largeText: false }));
  $("toggleContrast")?.addEventListener("click", () => changeDisplay({ contrast: !document.documentElement.classList.contains("scrutiny-high-contrast") }));
  $("readTodayPlan")?.addEventListener("click", readPlan);
  addEventListener("online", updateConnection);
  addEventListener("offline", updateConnection);
  addEventListener("scrutiny:dashboard-context", (event) => setContext(event.detail || {}));
  addEventListener("scrutiny:dashboard-progress", (event) => { cloudProgress = event.detail || {}; render(); });
  addEventListener("storage", (event) => { if ([PROGRESS_KEY, TOOLS_KEY, PROFILE_KEY].includes(event.key)) render(); });
  applyDisplayPreferences();
  if (context) setContext(context); else render();
})();
