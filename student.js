import "./student-storage.js";
import { firebaseConfig } from "./firebase-config.js";
import { COURSE_CATALOG, currentCoursePrice, entitledCourses, courseValidity } from "./course-catalog.js?v=3";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  getIdTokenResult,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";
const app = initializeApp(firebaseConfig),
  auth = getAuth(app),
  db = getFirestore(app),
  $ = (id) => document.getElementById(id),
  esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

const COURSE_PORTALS = {
  class6: { name: "Class 6 CBSE", label: "CBSE LEARNING PORTAL", icon: "🎒", color: "#1267b2", target: "class6-cbse.html", description: "A cheerful subject-wise learning space with simple lessons, tricks, flashcards, important answers, MCQs and mistake review.", actions: [["Open My Class 6 Course", "Continue learning in your purchased Mathematics, Science or Social Science subjects.", "class6-cbse.html"], ["Chapter Learning", "Understand every chapter with key ideas and simple explanations.", "class6-cbse.html"], ["Flashcards & Tricks", "Remember definitions and concepts through active recall.", "class6-cbse.html"], ["Important Q&A", "Practise exam-ready questions with model answers.", "class6-cbse.html"], ["MCQs & Mistake Book", "Practise questions and retry concepts you missed.", "class6-cbse.html"]] },
  class8: { name: "Class 8 Telangana SSC", label: "SSC FOUNDATION PORTAL", icon: "🚀", color: "#7c3aed", target: "class8-ssc.html", description: "A guided Class 8 learning system for Telangana SSC with concepts, recall, writing practice, tests and smart revision.", actions: [["My Learning Brain", "See subject mastery and what to study next.", "class8-ssc.html#mastery"], ["Learn by Subject", "Open Mathematics, Physical Science, Biological Science, Social Studies, English and Telugu.", "class8-ssc.html#subjects"], ["Practice & Tests", "Build recall with chapter practice and timed tests.", "class8-ssc.html#practice"], ["Mistake Book", "Return to concepts you previously missed.", "class8-ssc.html#mistakes"], ["Exam Planner", "Turn upcoming exams into a daily preparation plan.", "class8-ssc.html#planner"]] },
  class10: { name: "Class 10 Telangana SSC", label: "SSC BOARD MISSION", icon: "📘", color: "#0a67b2", target: "class10-board.html", description: "A guided Learn → Remember → Practise → Write → Test → Improve system for Telangana SSC Boards.", actions: [["Today’s 60-Minute Mission", "Follow a ready-made daily plan without deciding what to study.", "class10-board.html#today"], ["Learn by Subject", "Open board-focused concepts, flashcards and mark-wise questions.", "class10-board.html#subjects"], ["Answer Writing Lab", "Practise model answers, marking points and examiner keywords.", "class10-board.html#workspace"], ["Board Readiness", "See strengths, weak skills and your next best action.", "class10-board.html#readiness"], ["My Mistakes", "Revise automatic error notes and weak-area tests.", "class10-board.html#mistakes"], ["90-Day Board Mode", "Activate a countdown that changes your preparation phase.", "class10-board.html#boardMode"]] },
  class11: { name: "Class 11 Telangana Intermediate", label: "INTERMEDIATE 1ST YEAR", icon: "🌱", color: "#138a5b", target: "class11", description: "A separate Telangana Intermediate board portal with complete Botany, Zoology, Physics and Chemistry answer banks.", actions: [["Botany Answer Bank", "Open all 14 Botany chapters with VSAQs, SAQs and LAQs.", "class11", "botany"], ["Zoology Answer Bank", "Open all 8 official Zoology units with 240 explained answers.", "class11", "zoology"], ["Physics Answer Bank", "Open all 14 revised Physics units with 252 explained answers, derivations and diagrams.", "class11", "physics"], ["Chemistry Answer Bank", "Open all 13 Chemistry chapters with 234 explained answers, reactions and diagrams.", "class11", "chemistry"], ["My Board Progress", "See only your Class 11 learning record.", "progress"]] },
  class12: { name: "Class 12 Telangana Intermediate", label: "INTERMEDIATE 2ND YEAR", icon: "🎓", color: "#7254c7", target: "class12", description: "Second-year board subjects, revision resources and exam preparation.", actions: [["Class 12 Subjects", "Open the second-year chapter catalogue.", "class12"], ["NCERT Tools", "Search connected NCERT concepts.", "ncert"], ["My Progress", "See only your Class 12 learning record.", "progress"], ["Revision Queue", "Review Class 12 mistakes and bookmarks.", "tools"]] },
  neet: { name: "NEET-UG", label: "MEDICAL ENTRANCE PORTAL", icon: "🧬", color: "#d65328", target: "neet", description: "NCERT-focused Biology, Physics and Chemistry MCQs, PYQs and tests.", actions: [["KOTA Level Biology MCQs", "Select and unlock faculty-selected chapters for ₹9 each.", "kota"], ["NCERT Learning Arcade", "Play ten interactive NCERT mastery games.", "quest"], ["Chapter Practice", "Biology, Physics and Chemistry MCQs.", "neet"], ["Create a Test", "Build a personalised NEET test.", "neet"], ["NCERT Search", "Find indexed NCERT concepts and references.", "ncert"], ["Mistake Notebook", "Revise incorrect NEET questions.", "tools"], ["Previous Years", "Open published NEET PYQs.", "pyqs"], ["My Progress", "See only your NEET performance.", "progress"]] },
  jee: { name: "IIT-JEE", label: "ENGINEERING ENTRANCE PORTAL", icon: "⚙️", color: "#ef6c00", target: "jee.html", description: "Physics, Chemistry and Mathematics preparation for JEE Main and Advanced.", actions: [["Rigid Body & Rotational Motion", "Open the complete masterclass with 200 flashcards, 200 MCQs, formulae and JEE tricks.", "jee-rigid-body-free.html?course=jee"], ["Course Roadmap", "View the IIT-JEE subject roadmap and upcoming modules.", "jee.html#roadmap"], ["My JEE Progress", "See only your IIT-JEE learning record.", "progress"]] },
  mbbs: { name: "MBBS", label: "MEDICAL EDUCATION PORTAL", icon: "🩺", color: "#087f87", target: "mbbs", description: "Phase-wise medical subjects, clinical learning, revision and assessments.", actions: [["MBBS Subjects", "Open the phase-wise medical subject catalogue.", "mbbs"], ["Clinical Revision", "Use your MBBS revision queue.", "tools"], ["Bookmarks", "Return to saved medical questions.", "tools"], ["My Progress", "See only your MBBS learning record.", "progress"]] },
  neetss: { name: "NEET-SS Surgery", label: "SUPER SPECIALITY MASTERY", icon: "⚕️", color: "#008b8b", target: "neetss-surgery.html", description: "Surgical Group preparation for MS/DNB General Surgery graduates with clinical decisions, original MCQs, flashcards and analytics.", actions: [["Open NEET-SS Surgery", "Continue the Super Speciality Mastery course.", "neetss-surgery.html"], ["MCQ Practice", "Attempt original Surgical Group questions with +4/−1 scoring.", "neetss-surgery.html#mcq-practice"], ["Clinical Cases", "Work through investigation, diagnosis and management decisions.", "neetss-surgery.html#clinical-cases"], ["Smart Flashcards", "Review due and difficult cards.", "neetss-surgery.html#flashcards"], ["Performance Analytics", "Review accuracy, timing and weak domains.", "neetss-surgery.html#analytics"]] },
};
let activeCourse = "neet";
let availableCourses = [];
let studentProfile = {};
let studentOfferActive = true;
const requestedDashboardCourse = new URLSearchParams(location.search).get("course");

function inferCourse(item = {}) {
  if (COURSE_PORTALS[item.courseId]) return item.courseId;
  const text = `${item.title || ""} ${item.subject || ""}`.toLowerCase();
  if (text.includes("neet")) return "neet";
  if (text.includes("mbbs") || /anatomy|physiology|pathology|pharmacology|medicine|surgery/.test(text)) return "mbbs";
  if (text.includes("class 10")) return "class10";
  if (text.includes("class 11")) return "class11";
  if (text.includes("class 12")) return "class12";
  return "neet";
}

function portalUrl(anchor, subject = "") {
  if (activeCourse === "neetss") return anchor.startsWith("neetss-surgery.html") ? anchor : "neetss-surgery.html";
  if (activeCourse === "class6") return "class6-cbse.html";
  if (activeCourse === "class8") return anchor.startsWith("class8-ssc.html") ? anchor : "class8-ssc.html";
  if (activeCourse === "class10") return anchor.startsWith("class10-board.html") ? anchor : "class10-board.html";
  if (activeCourse === "jee") {
    if (anchor.startsWith("jee-rigid-body-free.html")) return anchor;
    if (anchor.startsWith("jee.html")) return anchor;
    if (anchor === "progress") return "student.html?course=jee#progress";
    return "jee.html";
  }
  if (anchor === "quest") return "ncert-quest.html";
  if (anchor === "kota") return "neet-kota-biology.html";
  return `preview-v2.html?course=${activeCourse}${subject ? `&subject=${subject}` : ""}#${anchor}`;
}

function friendlyStudentName(profile = {}, user = auth.currentUser) {
  const emailHandle = String(user?.email || "").split("@")[0].toLowerCase();
  let value = String(profile.preferredName || profile.fullName || profile.name || user?.displayName || emailHandle || "Student").trim();
  if (value.toLowerCase() === "iampramodsharma02") return "Pramod";
  if (value.includes("@")) value = value.split("@")[0];
  value = value.replace(/^(i[._-]?am|its|official)[._-]?/i, "").replace(/[._-]+/g, " ").replace(/\d+/g, " ").replace(/\s+/g, " ").trim();
  if (!value) return "Student";
  return value.split(" ").slice(0, 2).map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");
}

function welcomeLine(name) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${greeting}, ${name} 👋`;
}

function renderCourseDashboard() {
  const course = COURSE_PORTALS[activeCourse];
  document.body.classList.toggle("physics-formulas-enabled", ["neet", "jee"].includes(activeCourse));
  document.documentElement.style.setProperty("--course-accent", course.color);
  $("activeCourseLabel").textContent = course.label;
  $("activeCourseName").textContent = `${course.icon} ${course.name}`;
  $("activeCourseDescription").textContent = course.description;
  $("openCourse").href = portalUrl(course.target);
  $("continueLink").href = portalUrl(course.target);
  $("courseSwitchCurrent").textContent = `${course.icon} ${course.name}`;
  $("studentMeta").textContent =
    `${studentProfile.email || auth.currentUser?.email || "Student"} • ${courseValidity(activeCourse, studentProfile.courseEntitlements?.[activeCourse]?.neetExamYear || studentProfile.neetExamYear)}`;
  renderCourseSwitchMenu();
  $("courseCardGrid").innerHTML = Object.entries(COURSE_CATALOG).map(([id, plan]) => {
    const item = COURSE_PORTALS[id];
    const owned = availableCourses.includes(id);
    if (owned && id === activeCourse) return `<a class="course-card active" href="${portalUrl(item.target)}" style="--card-accent:${item.color}" aria-label="Open ${esc(item.name)}"><span>${item.icon}</span><strong>${item.name}</strong><small>OPEN CURRENT COURSE →</small></a>`;
    if (owned) return `<button type="button" class="course-card" data-course="${id}" style="--card-accent:${item.color}"><span>${item.icon}</span><strong>${item.name}</strong><small>SWITCH &amp; OPEN COURSE →</small></button>`;
    const lockedHref=plan.inviteOnly?"neetss-surgery.html?request=1":`payment.html?course=${id}`;
    const lockedLabel=plan.inviteOnly?"REQUEST COMPLIMENTARY ACCESS":`🔒 UNLOCK FOR ₹${currentCoursePrice(id, studentOfferActive)}`;
    return `<a class="course-card locked" href="${lockedHref}" style="--card-accent:${item.color}" aria-label="${esc(lockedLabel)}"><span>${item.icon}</span><strong>${item.name}</strong><small>${lockedLabel}</small><em>${plan.includes.slice(0,3).join(" • ")}</em></a>`;
  }).join("");
  $("courseActions").innerHTML = course.actions.map(([title, description, anchor, subject]) => `<a class="card big-link" href="${portalUrl(anchor, subject)}"><div><span class="eyebrow">${course.label}</span><h3>${title}</h3><p>${description}</p></div><strong>OPEN →</strong></a>`).join("");
  $("class10LectureEntry").hidden = activeCourse !== "class10";
  document.querySelectorAll("button[data-course]").forEach((button) => button.addEventListener("click", () => changeCourse(button.dataset.course)));
  document.documentElement.dataset.course = activeCourse;
  window.__scrutinyStudentContext = {
    uid: auth.currentUser?.uid,
    activeCourse,
    availableCourses: [...availableCourses],
    profile: { name: friendlyStudentName(studentProfile), neetExamYear: studentProfile.courseEntitlements?.neet?.neetExamYear || studentProfile.neetExamYear || null },
  };
  window.dispatchEvent(new CustomEvent("scrutiny:dashboard-context", { detail: window.__scrutinyStudentContext }));
}

function renderCourseSwitchMenu() {
  const list = $("courseSwitchList");
  list.innerHTML = Object.entries(COURSE_CATALOG).map(([id, plan]) => {
    const portal = COURSE_PORTALS[id];
    const owned = availableCourses.includes(id);
    const current = id === activeCourse;
    const detail = plan.includes.slice(0, 3).join(" • ");
    const status = current
      ? '<span class="course-menu-badge current">CURRENT</span>'
      : owned
        ? '<span class="course-menu-badge owned">OWNED</span>'
        : plan.inviteOnly ? '<span class="course-menu-price"><small>COMPLIMENTARY</small></span>' : `<span class="course-menu-price">₹${currentCoursePrice(id, studentOfferActive)}${id === "mbbs" ? "<small>LIFETIME</small>" : ""}</span>`;
    const openUrl = id === "class6" ? "class6-cbse.html" : id === "class8" ? "class8-ssc.html" : id === "class10" ? "class10-board.html" : id === "jee" ? "jee.html" : id === "neetss" ? "neetss-surgery.html" : `preview-v2.html?course=${id}#${portal.target}`;
    const action = current
      ? `<a class="course-menu-action owned-action" href="${openUrl}">OPEN</a>`
      : owned
        ? `<button type="button" class="course-menu-action owned-action" data-switch-course="${id}">SWITCH</button>`
      : `<a class="course-menu-action buy-action" href="${plan.inviteOnly?'neetss-surgery.html?request=1':`payment.html?course=${id}`}" aria-label="${plan.inviteOnly?'Request complimentary access':`Buy ${esc(plan.shortName)} for ₹${currentCoursePrice(id, studentOfferActive)}`} ">${plan.inviteOnly?'REQUEST ACCESS':'BUY COURSE'}</a>`;
    return `<article class="course-menu-item ${current ? "active" : ""}" role="menuitem"><span class="course-menu-icon" style="--item-accent:${portal.color}">${portal.icon}</span><span class="course-menu-copy"><strong>${esc(portal.name)}</strong><small>${esc(detail)}</small></span>${status}${action}</article>`;
  }).join("");
  list.querySelectorAll("[data-switch-course]").forEach((button) => button.addEventListener("click", () => {
    closeCourseMenu();
    changeCourse(button.dataset.switchCourse);
  }));
}

function openCourseMenu() {
  $("courseSwitchMenu").hidden = false;
  $("courseSwitchTrigger").setAttribute("aria-expanded", "true");
  document.body.classList.add("course-menu-open");
}

function closeCourseMenu() {
  $("courseSwitchMenu").hidden = true;
  $("courseSwitchTrigger").setAttribute("aria-expanded", "false");
  document.body.classList.remove("course-menu-open");
}

function toggleCourseMenu() {
  if ($("courseSwitchMenu").hidden) openCourseMenu();
  else closeCourseMenu();
}

async function changeCourse(courseId) {
  if (!availableCourses.includes(courseId) || courseId === activeCourse) return;
  activeCourse = courseId;
  window.ScrutinyStudentStorage.setItem("scrutiny_active_course", courseId);
  renderCourseDashboard();
  renderSummary(window.__scrutinyProgress || {});
  try {
    const user = auth.currentUser;
    if (user) await setDoc(doc(db, "students", user.uid), { activeCourse: courseId, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.warn("Course preference saved on this device only", error);
  }
}

function setupCourseDashboard(profile = {}) {
  studentProfile = profile;
  availableCourses = entitledCourses(profile);
  if (!availableCourses.length) {
    location.replace("payment.html");
    return;
  }
  const saved = window.ScrutinyStudentStorage.getItem("scrutiny_active_course");
  activeCourse = availableCourses.includes(requestedDashboardCourse)
    ? requestedDashboardCourse
    : availableCourses.includes(saved)
      ? saved
      : availableCourses.includes(profile.activeCourse)
        ? profile.activeCourse
        : availableCourses[0];
  window.ScrutinyStudentStorage.setItem("scrutiny_active_course", activeCourse);
  if (requestedDashboardCourse) history.replaceState({}, "", "student.html");
  $("courseSwitchTrigger").addEventListener("click", toggleCourseMenu);
  $("courseSwitchClose").addEventListener("click", closeCourseMenu);
  document.addEventListener("click", (event) => {
    if (!$("courseSwitcher").contains(event.target)) closeCourseMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCourseMenu();
  });
  renderCourseDashboard();
}

async function loadInvoices(user) {
  const list = $("invoiceList");
  if (!list) return;
  try {
    const snap = await getDocs(collection(db, "students", user.uid, "invoices"));
    const invoices = snap.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => Number(b.createdAt?.seconds || 0) - Number(a.createdAt?.seconds || 0));
    if (!invoices.length) {
      list.innerHTML = "<p>Your course invoices will appear here after payment.</p>";
      return;
    }
    list.innerHTML = invoices.map((invoice) => `<article class="invoice-row"><div><strong>${esc(invoice.courseName)}</strong><p>${esc(invoice.invoiceNumber)} · ₹${esc(invoice.amount)} · ${esc(invoice.paymentId)}</p></div><button class="ghost" type="button" data-invoice="${esc(invoice.id)}">DOWNLOAD PDF</button></article>`).join("");
    list.querySelectorAll("[data-invoice]").forEach((button) => button.addEventListener("click", () => {
      const invoice = invoices.find((item) => item.id === button.dataset.invoice);
      if (!invoice?.pdfBase64) return;
      const binary = atob(invoice.pdfBase64);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${invoice.invoiceNumber}.pdf`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }));
  } catch (error) {
    console.error("Invoice load failed", error);
    list.innerHTML = "<p>Invoices are temporarily unavailable. Please try again later.</p>";
  }
}

function localProgress() {
  try {
    return (
      JSON.parse(window.ScrutinyStudentStorage.getItem("scrutiny_v2_progress")) || {
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
      JSON.parse(window.ScrutinyStudentStorage.getItem("scrutiny_learning_tools")) || {
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
  window.__scrutinyProgress = data;
  window.dispatchEvent(new CustomEvent("scrutiny:dashboard-progress", { detail: data }));
  const local = localProgress();
  const allSessions = data.sessions?.length ? data.sessions : local.sessions || [];
  const sessions = allSessions.filter((session) => inferCourse(session) === activeCourse);
  const attempted = sessions.reduce(
    (sum, session) => sum + (session.attempted || 0),
    0,
  );
  const correct = sessions.reduce(
    (sum, session) => sum + (session.correct || 0),
    0,
  );
  const allMistakes = data.mistakes?.length ? data.mistakes : localTools().mistakes || [];
  const revision = allMistakes.filter((item) => inferCourse(item) === activeCourse).length;
  const history = $("practiceHistoryList");
  if (history) {
    const ordered = [...sessions].filter((x)=>x.completedAt).sort((a,b)=>String(b.completedAt).localeCompare(String(a.completedAt)));
    history.innerHTML = ordered.length ? ordered.slice(0,20).map((session) => {
      const wrong = Number.isFinite(session.incorrect) ? session.incorrect : Math.max(0,(session.attempted||0)-(session.correct||0));
      const score = Number.isFinite(session.score) ? session.score : (session.correct||0)*4-wrong;
      const maxScore = session.maxScore || (session.total||0)*4;
      const mins = Math.floor((session.seconds||0)/60), secs = (session.seconds||0)%60;
      const focus = session.focusMessage || (session.accuracy < 70 ? "Revise weak concepts and retry incorrect MCQs." : session.accuracy < 85 ? "Review errors and improve accuracy before increasing speed." : "Strong accuracy — now work on maintaining it with better pace.");
      const weak = (session.weakAreas||[]).map((x)=>x.topic).filter(Boolean).slice(0,3).join(" • ");
      return `<article class="invoice-row"><div><strong>${esc(session.title || "Practice session")}</strong><p>${new Date(session.completedAt).toLocaleString("en-IN")} · ${session.attempted||0} attempted · ${session.correct||0} correct · ${wrong} wrong</p><p><b>${score}/${maxScore} marks</b> (+4/−1) · ${session.accuracy||0}% accuracy · ${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")} · ${session.avgSecondsPerAttempt||((session.attempted||0)?Math.round((session.seconds||0)/session.attempted):0)}s/MCQ</p>${weak?`<p><b>Needs focus:</b> ${esc(weak)}</p>`:""}<p><b>Next step:</b> ${esc(focus)}</p></div></article>`;
    }).join("") : "<p>No MCQ practice sessions yet. Your completed sessions will appear here automatically.</p>";
  }
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
      `${Number.isFinite(latest.score) ? latest.score : ((latest.correct||0)*4-Math.max(0,(latest.attempted||0)-(latest.correct||0)))}/${latest.maxScore || (latest.total||0)*4} marks • ${latest.accuracy || 0}% accuracy • +4/−1`;
    $("continueLink").textContent = "PRACTISE AGAIN";
    $("continueLink").href = portalUrl(COURSE_PORTALS[activeCourse].target);
  } else {
    $("continueTitle").textContent = `Start your first ${COURSE_PORTALS[activeCourse].name} session`;
    $("continueMeta").textContent = "Your latest completed activity for this course will appear here.";
    $("continueLink").textContent = "START PRACTICE";
    $("continueLink").href = portalUrl(COURSE_PORTALS[activeCourse].target);
  }
}

window.addEventListener("scrutiny:student-changed", () => renderSummary({}));

onAuthStateChanged(auth, async (user) => {
  window.ScrutinyStudentStorage.setUser(user);
  const identityGeneration = window.ScrutinyStudentStorage.generation;
  const stillCurrent = () => auth.currentUser?.uid === user?.uid && identityGeneration === window.ScrutinyStudentStorage.generation;
  if (!user) {
    location.replace("login.html");
    return;
  }
  const snap = await getDoc(doc(db, "students", user.uid));
  if (!stillCurrent()) return;
  if (!snap.exists()) {
    await signOut(auth);
    location.replace("login.html");
    return;
  }
  if (!stillCurrent()) return;
  const p = snap.data();
  const token = await getIdTokenResult(user, true);
  if (!stillCurrent()) return;
  const founderAccess = token.claims.founder === true;
  if (p.accessStatus !== "active" && !founderAccess) {
    location.replace("payment.html");
    return;
  }
  const studentName = friendlyStudentName(p, user);
  try {
    const status = httpsCallable(getFunctions(app, "asia-south1"), "getStudentOfferStatus");
    const { data } = await status();
    studentOfferActive = data?.active !== false;
  } catch (offerError) {
    console.warn("Student offer status unavailable:", offerError);
  }
  if (!stillCurrent()) return;
  $("welcome").textContent = welcomeLine(studentName);
  setupCourseDashboard({ ...p, founderAccess });
  if (founderAccess) $("studentMeta").textContent = `${user.email} • FOUNDER PREVIEW • ALL COURSES`;
  loadInvoices(user);
  renderSummary();
  setupReview(user, p);
  try {
    const progress = await getDoc(doc(db, "learningProgress", user.uid));
    if (stillCurrent() && progress.exists()) renderSummary(progress.data());
  } catch (error) {
    console.error("Dashboard progress load failed", error);
  }
});
$("logoutBtn").onclick = async () => {
  await signOut(auth);
  location.replace("login.html");
};

let selectedRating=0;
function paintStars(){
  document.querySelectorAll('#starPicker button').forEach(button=>{
    button.classList.toggle('selected',Number(button.dataset.star)<=selectedRating);
  });
}
function setupReview(user, profile){
  const form=$('reviewForm');
  if(!form) return;
  document.querySelectorAll('#starPicker button').forEach(button=>button.addEventListener('click',()=>{
    selectedRating=Number(button.dataset.star); paintStars();
  }));
  getDoc(doc(db,'reviews',user.uid)).then(snap=>{
    if(!snap.exists()) return;
    const review=snap.data();
    selectedRating=Number(review.rating)||0;
    $('reviewText').value=review.review||'';
    paintStars();
  }).catch(console.error);
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const message=$('reviewMessage');
    const review=$('reviewText').value.trim();
    if(selectedRating<1){ message.textContent='Choose a star rating first.'; message.className='message error'; return; }
    if(review.length<10){ message.textContent='Please write at least 10 characters.'; message.className='message error'; return; }
    message.textContent='Saving your review…'; message.className='message';
    try{
      await setDoc(doc(db,'reviews',user.uid),{
        uid:user.uid,
        studentName:(profile.name||'Student').trim().slice(0,80),
        rating:selectedRating,
        review:review.slice(0,500),
        verifiedRegisteredStudent:true,
        updatedAt:serverTimestamp()
      },{merge:true});
      message.textContent='Thank you. Your review is now saved.';
      message.className='message success';
    }catch(error){
      console.error('Review save failed',error);
      message.textContent='Could not save your review. Please try again.';
      message.className='message error';
    }
  });
}

if ("serviceWorker" in navigator) {
  addEventListener("load", () =>
    navigator.serviceWorker.register("./sw.js").catch(console.error),
  );
}
