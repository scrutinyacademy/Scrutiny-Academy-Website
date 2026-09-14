import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
const app = initializeApp(firebaseConfig),
  auth = getAuth(app),
  db = getFirestore(app),
  $ = (id) => document.getElementById(id);

function localProgress() {
  try {
    return (
      JSON.parse(localStorage.getItem("scrutiny_v2_progress")) || {
        sessions: [],
      }
    );
  } catch {
    return { sessions: [] };
  }
}

function localTools() {
  try {
    return (
      JSON.parse(localStorage.getItem("scrutiny_learning_tools")) || {
        mistakes: [],
      }
    );
  } catch {
    return { mistakes: [] };
  }
}

function localStreak(sessions) {
  const key = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const dates = new Set(
    sessions
      .map((session) => session.completedAt)
      .filter(Boolean)
      .map((value) => key(new Date(value))),
  );
  const cursor = new Date();
  if (!dates.has(key(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (dates.has(key(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function renderSummary(data = {}) {
  const local = localProgress();
  const sessions = data.sessions?.length ? data.sessions : local.sessions || [];
  const attempted = sessions.reduce(
    (sum, session) => sum + (session.attempted || 0),
    0,
  );
  const correct = sessions.reduce(
    (sum, session) => sum + (session.correct || 0),
    0,
  );
  const revision = data.mistakes?.length ?? localTools().mistakes.length;
  $("dashSessions").textContent = String(sessions.length);
  $("dashAccuracy").textContent =
    `${attempted ? Math.round((correct / attempted) * 100) : 0}%`;
  const streak = Number.isInteger(data.streak)
    ? data.streak
    : localStreak(sessions);
  $("dashStreak").textContent = `${streak} day${streak === 1 ? "" : "s"}`;
  $("dashRevision").textContent = String(revision);
  const latest = sessions
    .filter((session) => session.completedAt)
    .sort((a, b) =>
      String(b.completedAt).localeCompare(String(a.completedAt)),
    )[0];
  if (latest) {
    $("continueTitle").textContent = latest.title || "Continue practising";
    $("continueMeta").textContent =
      `${latest.correct || 0}/${latest.total || 0} correct • ${latest.accuracy || 0}% accuracy`;
    $("continueLink").textContent = "PRACTISE AGAIN";
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.replace("login.html");
    return;
  }
  const snap = await getDoc(doc(db, "students", user.uid));
  if (!snap.exists()) {
    await signOut(auth);
    location.replace("login.html");
    return;
  }
  const p = snap.data();
  if (p.accessStatus !== "active") {
    location.replace("payment.html");
    return;
  }
  $("welcome").textContent = `Welcome${p.name ? `, ${p.name}` : ""}`;
  $("studentMeta").textContent =
    `${p.email || user.email} • Access status: Active`;
  renderSummary();
  try {
    const progress = await getDoc(doc(db, "learningProgress", user.uid));
    if (progress.exists()) renderSummary(progress.data());
  } catch (error) {
    console.error("Dashboard progress load failed", error);
  }
});
$("logoutBtn").onclick = async () => {
  await signOut(auth);
  location.replace("login.html");
};

if ("serviceWorker" in navigator) {
  addEventListener("load", () =>
    navigator.serviceWorker.register("./sw.js").catch(console.error),
  );
}
