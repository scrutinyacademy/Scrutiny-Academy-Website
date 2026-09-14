import { firebaseConfig } from "./firebase-config.js";
import {
  getApps,
  getApp,
  initializeApp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  increment,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig),
  auth = getAuth(app),
  db = getFirestore(app);
const leaderboardEnabled =
  localStorage.getItem("scrutiny_leaderboard_opt_in") === "true";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let activeSeconds = 0,
  lastResultOpen = false;

function inject() {
  if (document.getElementById("leaderboard")) return;
  const style = document.createElement("style");
  style.textContent = `.leaderboard-wrap{overflow:auto;background:#fff;border:1px solid var(--line);border-radius:18px}.leaderboard-table{width:100%;border-collapse:collapse;min-width:720px}.leaderboard-table th,.leaderboard-table td{padding:14px 16px;text-align:left;border-bottom:1px solid var(--line)}.leaderboard-table th{font-size:.72rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);background:#f8fafd}.leaderboard-rank{font-weight:900;color:var(--navy)}.leaderboard-me{background:#eef5ff}.leaderboard-note{color:var(--muted);font-size:.85rem}.result-image-btn{white-space:nowrap}`;
  document.head.appendChild(style);
  const progress = document.getElementById("progress");
  if (progress) {
    const section = document.createElement("section");
    section.className = "section";
    section.id = "leaderboard";
    section.innerHTML = `<div class="section-head"><span class="eyebrow">LIVE STUDENT SCOREBOARD</span><h2>Scrutiny Academy Leaderboard</h2><p>See live practice activity from participating students. Rankings are based on MCQs practised; study time records active time on this learning page.</p></div><div class="leaderboard-wrap"><table class="leaderboard-table"><thead><tr><th>Rank</th><th>Student</th><th>MCQs practised</th><th>Tests</th><th>Best accuracy</th><th>Study time</th></tr></thead><tbody id="leaderboardRows"><tr><td colspan="6">Loading live scoreboard…</td></tr></tbody></table></div><p class="leaderboard-note">Only your display name and learning statistics are shown. Email and phone are never displayed.</p>`;
    progress.after(section);
  }
  const nav = document.getElementById("mainNav");
  if (nav && !nav.querySelector('a[href="#leaderboard"]')) {
    const a = document.createElement("a");
    a.href = "#leaderboard";
    a.textContent = "Scoreboard";
    const account = nav.querySelector(".platform-account");
    account ? nav.insertBefore(a, account) : nav.appendChild(a);
  }
  const share = document.getElementById("shareResult");
  if (share) {
    share.textContent = "Share score as image";
    share.classList.add("result-image-btn");
    share.onclick = shareScoreImage;
  }
  watchResults();
  startStudyClock();
  listenBoard();
}
function userName() {
  const u = auth.currentUser;
  return (
    u?.displayName ||
    (u?.email || "Student").split("@")[0] ||
    "Student"
  ).slice(0, 40);
}
async function ensureProfile() {
  const u = auth.currentUser;
  if (!u) return;
  await setDoc(
    doc(db, "leaderboard", u.uid),
    {
      uid: u.uid,
      name: userName(),
      mcqsPractised: 0,
      testsCompleted: 0,
      bestAccuracy: 0,
      studySeconds: 0,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
function watchResults() {
  const d = document.getElementById("resultDialog");
  if (!d) return;
  new MutationObserver(async () => {
    const open = d.hasAttribute("open");
    if (open && !lastResultOpen) {
      const attempted = parseInt(
        (document.getElementById("resultAttempted")?.textContent || "0").match(
          /\d+/,
        )?.[0] || "0",
        10,
      );
      const accuracy = parseInt(
        (document.getElementById("resultAccuracy")?.textContent || "0").match(
          /\d+/,
        )?.[0] || "0",
        10,
      );
      const u = auth.currentUser;
      if (u) {
        try {
          await ensureProfile();
          await setDoc(
            doc(db, "leaderboard", u.uid),
            {
              uid: u.uid,
              name: userName(),
              mcqsPractised: increment(attempted),
              testsCompleted: increment(1),
              bestAccuracy: accuracy,
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );
        } catch (e) {
          console.error("Scoreboard result sync failed", e);
        }
      }
    }
    lastResultOpen = open;
  }).observe(d, { attributes: true, attributeFilter: ["open"] });
}
function startStudyClock() {
  setInterval(() => {
    if (document.visibilityState === "visible") activeSeconds++;
  }, 1000);
  setInterval(async () => {
    if (activeSeconds < 1 || !auth.currentUser) return;
    const n = activeSeconds;
    activeSeconds = 0;
    try {
      await ensureProfile();
      await setDoc(
        doc(db, "leaderboard", auth.currentUser.uid),
        {
          uid: auth.currentUser.uid,
          name: userName(),
          studySeconds: increment(n),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (e) {
      activeSeconds += n;
      console.error("Study time sync failed", e);
    }
  }, 30000);
}
function fmtTime(sec) {
  sec = Number(sec) || 0;
  const h = Math.floor(sec / 3600),
    m = Math.floor((sec % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}
function listenBoard() {
  const rows = document.getElementById("leaderboardRows");
  if (!rows) return;
  const q = query(
    collection(db, "leaderboard"),
    orderBy("mcqsPractised", "desc"),
    limit(100),
  );
  onSnapshot(
    q,
    (snap) => {
      const me = auth.currentUser?.uid;
      rows.innerHTML = snap.empty
        ? '<tr><td colspan="6">No ranked activity yet. Complete a test to appear here.</td></tr>'
        : snap.docs
            .map((x, i) => {
              const d = x.data();
              return `<tr class="${x.id === me ? "leaderboard-me" : ""}"><td class="leaderboard-rank">#${i + 1}</td><td><strong>${esc(d.name || "Student")}</strong>${x.id === me ? " (You)" : ""}</td><td>${Number(d.mcqsPractised) || 0}</td><td>${Number(d.testsCompleted) || 0}</td><td>${Number(d.bestAccuracy) || 0}%</td><td>${fmtTime(d.studySeconds)}</td></tr>`;
            })
            .join("");
    },
    (e) => {
      console.error(e);
      rows.innerHTML =
        '<tr><td colspan="6">Live scoreboard needs the published Firestore leaderboard rules.</td></tr>';
    },
  );
}
async function shareScoreImage() {
  const title =
      document.getElementById("resultTitle")?.textContent || "Test complete",
    score = document.getElementById("resultScore")?.textContent || "0/0",
    accuracy =
      document.getElementById("resultAccuracy")?.textContent || "0% accuracy",
    attempted = document.getElementById("resultAttempted")?.textContent || "",
    time = document.getElementById("resultTime")?.textContent || "";
  const c = document.createElement("canvas");
  c.width = 1080;
  c.height = 1080;
  const x = c.getContext("2d");
  x.fillStyle = "#f5f8fc";
  x.fillRect(0, 0, 1080, 1080);
  x.fillStyle = "#102a56";
  x.fillRect(0, 0, 1080, 210);
  x.fillStyle = "#fff";
  x.font = "700 58px system-ui";
  x.fillText("SCRUTINY ACADEMY", 70, 105);
  x.font = "28px system-ui";
  x.fillText("LEARN • UNDERSTAND • PRACTICE • MASTER", 70, 160);
  x.fillStyle = "#14213d";
  x.font = "700 48px system-ui";
  x.fillText(title.slice(0, 34), 70, 330);
  x.fillStyle = "#1959b8";
  x.font = "900 150px system-ui";
  x.fillText(score, 70, 535);
  x.fillStyle = "#14213d";
  x.font = "700 48px system-ui";
  x.fillText(accuracy, 70, 625);
  x.font = "34px system-ui";
  x.fillText(attempted, 70, 715);
  x.fillText(time, 70, 775);
  x.fillStyle = "#65738a";
  x.font = "30px system-ui";
  x.fillText(`${userName()} • Scrutiny Academy`, 70, 930);
  const blob = await new Promise((r) => c.toBlob(r, "image/png"));
  if (!blob) return;
  const file = new File([blob], "scrutiny-academy-result.png", {
    type: "image/png",
  });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: "My Scrutiny Academy Score",
        text: `I scored ${score} (${accuracy}) on Scrutiny Academy.`,
        files: [file],
      });
      return;
    }
  } catch (e) {
    if (e.name === "AbortError") return;
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "scrutiny-academy-result.png";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

if (leaderboardEnabled) {
  if (auth.currentUser) inject();
  else
    auth.onAuthStateChanged((u) => {
      if (u) inject();
    });
}
