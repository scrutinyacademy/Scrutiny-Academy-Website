import { firebaseConfig } from "./firebase-config.js";
import {
  getApps,
  getApp,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const PROGRESS_KEY = "scrutiny_v2_progress";
const TOOLS_KEY = "scrutiny_learning_tools";
const MAX_MISTAKES = 120;
const MAX_BOOKMARKS = 100;
const $ = (id) => document.getElementById(id);
const activeCourseId = () => document.documentElement.dataset.course || localStorage.getItem("scrutiny_active_course") || "neet";
const belongsToActiveCourse = (item = {}) => (item.courseId || "neet") === activeCourseId();
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );

let latestSession = null;
let currentUser = null;
let syncTimer = null;

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function getProgress() {
  return readJson(PROGRESS_KEY, { sessions: [] });
}

function getTools() {
  return readJson(TOOLS_KEY, { mistakes: [], bookmarks: [] });
}

function saveTools(tools) {
  localStorage.setItem(TOOLS_KEY, JSON.stringify(tools));
  renderTools();
  scheduleCloudSync();
}

function stableId(item) {
  return String(
    item.id || `${item.subject}:${item.chapter}:${item.question}`,
  ).slice(0, 700);
}

function compactQuestion(item) {
  return {
    id: stableId(item),
    question: String(item.question || "").slice(0, 800),
    options: Array.isArray(item.options)
      ? item.options.slice(0, 6).map((option) => String(option).slice(0, 500))
      : [],
    correctIndex: Number.isInteger(item.correctIndex) ? item.correctIndex : -1,
    explanation: String(item.explanation || "").slice(0, 1600),
    subject: String(item.subject || "").slice(0, 120),
    chapter: String(item.chapter || "").slice(0, 180),
    difficulty: String(item.difficulty || "").slice(0, 30),
    courseId: item.courseId || activeCourseId(),
    reference: referenceText(item.reference).slice(0, 350) || null,
  };
}

function captureMistakes(session) {
  const tools = getTools();
  const existing = new Map(
    tools.mistakes.map((item) => [stableId(item), item]),
  );
  const now = Date.now();
  for (const item of session.review || []) {
    if (item.selected === undefined || item.isCorrect) continue;
    const id = stableId(item);
    const previous = existing.get(id);
    existing.set(id, {
      ...compactQuestion(item),
      wrongCount: (previous?.wrongCount || 0) + 1,
      firstMissedAt: previous?.firstMissedAt || now,
      lastMissedAt: now,
      nextReviewAt: now,
      mastered: false,
    });
  }
  tools.mistakes = [...existing.values()]
    .sort((a, b) => (b.lastMissedAt || 0) - (a.lastMissedAt || 0))
    .slice(0, MAX_MISTAKES);
  saveTools(tools);
}

function studyDates() {
  return new Set(
    (getProgress().sessions || []).filter(belongsToActiveCourse)
      .map((session) => session.completedAt)
      .filter(Boolean)
      .map((value) => dateKey(new Date(value))),
  );
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function streakCount() {
  const dates = studyDates();
  let cursor = new Date();
  const today = dateKey(cursor);
  if (!dates.has(today)) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (dates.has(dateKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function weakTopics() {
  const rows = new Map();
  for (const session of (getProgress().sessions || []).filter(belongsToActiveCourse)) {
    for (const item of session.review || []) {
      if (item.selected === undefined) continue;
      const key = `${item.subject || "General"} • ${item.chapter || "Mixed practice"}`;
      const row = rows.get(key) || { topic: key, attempted: 0, wrong: 0 };
      row.attempted += 1;
      if (!item.isCorrect) row.wrong += 1;
      rows.set(key, row);
    }
  }
  return [...rows.values()]
    .filter((row) => row.wrong > 0)
    .map((row) => ({
      ...row,
      accuracy: Math.round(((row.attempted - row.wrong) / row.attempted) * 100),
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.wrong - a.wrong)
    .slice(0, 5);
}

function referenceText(reference) {
  if (!reference) return "";
  if (typeof reference === "string") return reference;
  return [
    reference.book,
    reference.chapter,
    reference.section,
    reference.page ? `Page ${reference.page}` : "",
    reference.paragraph ? `Paragraph ${reference.paragraph}` : "",
  ]
    .filter(Boolean)
    .join(" • ");
}

function questionCard(item, actions = true) {
  const correct = item.options?.[item.correctIndex];
  return `<article class="study-question" data-id="${esc(stableId(item))}">
    <span class="eyebrow">${esc(item.subject || "Practice")}${item.chapter ? ` • ${esc(item.chapter)}` : ""}</span>
    <h3>${esc(item.question)}</h3>
    ${correct ? `<p><strong>Correct answer:</strong> ${esc(correct)}</p>` : ""}
    ${item.explanation ? `<p>${esc(item.explanation)}</p>` : ""}
    ${referenceText(item.reference) ? `<small>NCERT reference: ${esc(referenceText(item.reference))}</small>` : ""}
    ${actions ? `<div class="study-actions"><button class="btn ghost small" data-action="bookmark">Bookmark</button><button class="btn primary small" data-action="master">Mark revised</button></div>` : ""}
  </article>`;
}

function renderTools() {
  const tools = getTools();
  const courseMistakes = tools.mistakes.filter(belongsToActiveCourse);
  const courseBookmarks = tools.bookmarks.filter(belongsToActiveCourse);
  const due = courseMistakes.filter(
    (item) => !item.mastered && (item.nextReviewAt || 0) <= Date.now(),
  );
  const streak = streakCount();
  if ($("toolStreak"))
    $("toolStreak").textContent = `${streak} day${streak === 1 ? "" : "s"}`;
  if ($("toolMistakes"))
    $("toolMistakes").textContent = String(courseMistakes.length);
  if ($("toolDue")) $("toolDue").textContent = String(due.length);
  if ($("toolBookmarks"))
    $("toolBookmarks").textContent = String(courseBookmarks.length);

  if ($("revisionList")) {
    $("revisionList").innerHTML = due.length
      ? due
          .slice(0, 8)
          .map((item) => questionCard(item))
          .join("")
      : '<div class="empty-state compact">No questions are due. Complete a test to build your revision queue.</div>';
  }
  if ($("bookmarkList")) {
    $("bookmarkList").innerHTML = courseBookmarks.length
      ? courseBookmarks
          .slice(0, 8)
          .map((item) => questionCard(item, false))
          .join("")
      : '<div class="empty-state compact">Your saved questions will appear here.</div>';
  }
  if ($("weakTopicList")) {
    const topics = weakTopics();
    $("weakTopicList").innerHTML = topics.length
      ? topics
          .map(
            (topic) =>
              `<div class="weak-topic"><span><strong>${esc(topic.topic)}</strong><small>${topic.wrong} errors from ${topic.attempted} attempts</small></span><b>${topic.accuracy}%</b></div>`,
          )
          .join("")
      : '<div class="empty-state compact">Weak-topic insights appear after detailed test sessions.</div>';
  }
}

function toggleBookmark(item) {
  const tools = getTools();
  const compact = compactQuestion(item);
  const index = tools.bookmarks.findIndex(
    (entry) => stableId(entry) === compact.id,
  );
  if (index >= 0) tools.bookmarks.splice(index, 1);
  else tools.bookmarks.unshift({ ...compact, savedAt: Date.now() });
  tools.bookmarks = tools.bookmarks.slice(0, MAX_BOOKMARKS);
  saveTools(tools);
}

function markRevised(id) {
  const tools = getTools();
  const item = tools.mistakes.find((entry) => stableId(entry) === id);
  if (!item) return;
  item.mastered = true;
  item.revisedAt = Date.now();
  item.nextReviewAt = Date.now() + 7 * 86400000;
  saveTools(tools);
}

function renderReview(session) {
  latestSession = session || latestSession;
  if (!latestSession || !$("reviewList")) return;
  $("reviewTitle").textContent = latestSession.title;
  $("reviewList").innerHTML = (latestSession.review || [])
    .map(
      (
        item,
        index,
      ) => `<article class="review-question ${item.selected === undefined ? "unanswered" : item.isCorrect ? "correct" : "incorrect"}">
        <span class="eyebrow">Question ${index + 1} • ${item.selected === undefined ? "Unanswered" : item.isCorrect ? "Correct" : "Incorrect"}</span>
        <h3>${esc(item.question)}</h3>
        ${item.selected !== undefined ? `<p>Your answer: <strong>${esc(item.options?.[item.selected] || "—")}</strong></p>` : ""}
        <p>Correct answer: <strong>${esc(item.options?.[item.correctIndex] || "—")}</strong></p>
        ${item.explanation ? `<p>${esc(item.explanation)}</p>` : ""}
        ${referenceText(item.reference) ? `<small>NCERT reference: ${esc(referenceText(item.reference))}</small>` : ""}
        <button class="btn ghost small review-bookmark" data-index="${index}">Save question</button>
      </article>`,
    )
    .join("");
  $("reviewList")
    .querySelectorAll(".review-bookmark")
    .forEach((button) => {
      button.onclick = () => {
        toggleBookmark(latestSession.review[Number(button.dataset.index)]);
        button.textContent = "Saved";
      };
    });
}

function bindInterface() {
  $("openRevision")?.addEventListener("click", () =>
    $("revisionPanel")?.scrollIntoView({ behavior: "smooth" }),
  );
  $("openBookmarks")?.addEventListener("click", () =>
    $("bookmarkPanel")?.scrollIntoView({ behavior: "smooth" }),
  );
  $("reviewAnswers")?.addEventListener("click", () => {
    renderReview(latestSession);
    $("resultDialog")?.close();
    $("reviewDialog")?.showModal();
  });
  $("closeReview")?.addEventListener("click", () => $("reviewDialog")?.close());
  $("exportProgress")?.addEventListener("click", () => {
    const payload = JSON.stringify(
      { progress: getProgress(), studyTools: getTools() },
      null,
      2,
    );
    const url = URL.createObjectURL(
      new Blob([payload], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrutiny-academy-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  });
  const leaderboardOptIn = $("leaderboardOptIn");
  if (leaderboardOptIn) {
    leaderboardOptIn.checked =
      localStorage.getItem("scrutiny_leaderboard_opt_in") === "true";
    leaderboardOptIn.addEventListener("change", async () => {
      localStorage.setItem(
        "scrutiny_leaderboard_opt_in",
        String(leaderboardOptIn.checked),
      );
      if (!leaderboardOptIn.checked && currentUser) {
        try {
          const app = getApps().length
            ? getApp()
            : initializeApp(firebaseConfig);
          await deleteDoc(
            doc(getFirestore(app), "leaderboard", currentUser.uid),
          );
        } catch (error) {
          console.error("Leaderboard removal failed", error);
        }
      }
      location.reload();
    });
  }
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action]");
    const card = event.target.closest(".study-question");
    if (!button || !card) return;
    const id = card.dataset.id;
    const item = getTools().mistakes.find((entry) => stableId(entry) === id);
    if (button.dataset.action === "master") markRevised(id);
    if (button.dataset.action === "bookmark" && item) {
      toggleBookmark(item);
      button.textContent = "Saved";
    }
  });
}

function mergeById(localItems = [], cloudItems = [], max = 100) {
  const merged = new Map();
  for (const item of [...cloudItems, ...localItems])
    merged.set(stableId(item), item);
  return [...merged.values()].slice(0, max);
}

function cloudPayload() {
  const progress = getProgress();
  const tools = getTools();
  return {
    schemaVersion: 1,
    sessions: (progress.sessions || []).slice(0, 40).map((session) => ({
      id:
        session.id ||
        `legacy-${session.title}-${session.completedAt || "unknown"}`,
      title: String(session.title || "Practice").slice(0, 180),
      total: session.total || 0,
      attempted: session.attempted || 0,
      correct: session.correct || 0,
      accuracy: session.accuracy || 0,
      seconds: session.seconds || 0,
      completedAt: session.completedAt || null,
      courseId: session.courseId || "neet",
    })),
    mistakes: tools.mistakes.slice(0, MAX_MISTAKES),
    bookmarks: tools.bookmarks.slice(0, MAX_BOOKMARKS),
    streak: streakCount(),
    weakTopics: weakTopics(),
    updatedAt: serverTimestamp(),
  };
}

async function pullCloud(db, user) {
  const ref = doc(db, "learningProgress", user.uid);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) {
    const cloud = snapshot.data();
    const progress = getProgress();
    const sessions = new Map();
    for (const item of [
      ...(cloud.sessions || []),
      ...(progress.sessions || []),
    ]) {
      const id =
        item.id || `legacy-${item.title}-${item.completedAt || "unknown"}`;
      sessions.set(id, item);
    }
    progress.sessions = [...sessions.values()]
      .sort((a, b) =>
        String(b.completedAt || "").localeCompare(String(a.completedAt || "")),
      )
      .slice(0, 40);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    const tools = getTools();
    tools.mistakes = mergeById(tools.mistakes, cloud.mistakes, MAX_MISTAKES);
    tools.bookmarks = mergeById(
      tools.bookmarks,
      cloud.bookmarks,
      MAX_BOOKMARKS,
    );
    localStorage.setItem(TOOLS_KEY, JSON.stringify(tools));
    renderTools();
  }
  await setDoc(ref, cloudPayload(), { merge: true });
  document.documentElement.dataset.cloudSync = "ready";
  if ($("cloudStatus")) $("cloudStatus").textContent = "Cloud sync active";
}

function scheduleCloudSync() {
  if (!currentUser) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try {
      const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      await setDoc(
        doc(getFirestore(app), "learningProgress", currentUser.uid),
        cloudPayload(),
        { merge: true },
      );
      if ($("cloudStatus")) $("cloudStatus").textContent = "Cloud sync active";
    } catch (error) {
      console.error("Learning progress sync failed", error);
      if ($("cloudStatus"))
        $("cloudStatus").textContent = "Saved on this device";
    }
  }, 900);
}

function startCloudSync() {
  try {
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    onAuthStateChanged(auth, async (user) => {
      currentUser = user;
      if (!user) return;
      try {
        await pullCloud(db, user);
      } catch (error) {
        console.error("Learning progress could not be loaded", error);
        if ($("cloudStatus"))
          $("cloudStatus").textContent = "Saved on this device";
      }
    });
  } catch (error) {
    console.error("Cloud sync setup failed", error);
  }
}

window.addEventListener("scrutiny:session-complete", (event) => {
  latestSession = event.detail;
  captureMistakes(event.detail);
  renderReview(event.detail);
  renderTools();
  scheduleCloudSync();
});
window.addEventListener("scrutiny:progress-changed", () => {
  renderTools();
  scheduleCloudSync();
});
window.addEventListener("scrutiny:progress-cleared", (event) => {
  const courseId = event.detail?.courseId || activeCourseId();
  const tools = getTools();
  tools.mistakes = tools.mistakes.filter((item) => (item.courseId || "neet") !== courseId);
  tools.bookmarks = tools.bookmarks.filter((item) => (item.courseId || "neet") !== courseId);
  localStorage.setItem(TOOLS_KEY, JSON.stringify(tools));
  renderTools();
  scheduleCloudSync();
});

bindInterface();
renderTools();
startCloudSync();

if ("serviceWorker" in navigator) {
  addEventListener("load", () =>
    navigator.serviceWorker.register("./sw.js").catch(console.error),
  );
}
