import { firebaseConfig } from "./firebase-config.js";
import { COURSE_CATALOG, currentCoursePrice, entitledCourses, courseValidity } from "./course-catalog.js";
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
  getDocs,
  collection,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
const app = initializeApp(firebaseConfig),
  auth = getAuth(app),
  db = getFirestore(app),
  $ = (id) => document.getElementById(id),
  esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

const COURSE_PORTALS = {
  class10: { name: "Class 10 Telangana SSC", label: "SSC BOARD PORTAL", icon: "📘", color: "#1677d2", target: "class10", description: "Telangana SSC subjects, board questions, revision and chapter practice.", actions: [["Subjects", "Open Class 10 subjects and chapters.", "class10"], ["Board Practice", "VSAQ, SAQ, LAQ and MCQ preparation.", "class10"], ["My Progress", "See only your Class 10 learning record.", "progress"], ["Revision Queue", "Review Class 10 mistakes and bookmarks.", "tools"]] },
  class11: { name: "Class 11 Telangana Intermediate", label: "INTERMEDIATE 1ST YEAR", icon: "🌱", color: "#138a5b", target: "class11", description: "First-year Botany, Zoology, Physics and Chemistry in a board-focused portal.", actions: [["Class 11 Subjects", "Open the first-year chapter catalogue.", "class11"], ["Flashcards", "Revise available Class 11 concept decks.", "flashcards"], ["NCERT Tools", "Search connected NCERT concepts.", "ncert"], ["My Progress", "See only your Class 11 learning record.", "progress"]] },
  class12: { name: "Class 12 Telangana Intermediate", label: "INTERMEDIATE 2ND YEAR", icon: "🎓", color: "#7254c7", target: "class12", description: "Second-year board subjects, revision resources and exam preparation.", actions: [["Class 12 Subjects", "Open the second-year chapter catalogue.", "class12"], ["NCERT Tools", "Search connected NCERT concepts.", "ncert"], ["My Progress", "See only your Class 12 learning record.", "progress"], ["Revision Queue", "Review Class 12 mistakes and bookmarks.", "tools"]] },
  neet: { name: "NEET-UG", label: "MEDICAL ENTRANCE PORTAL", icon: "🧬", color: "#d65328", target: "neet", description: "NCERT-focused Biology, Physics and Chemistry MCQs, PYQs and tests.", actions: [["Chapter Practice", "Biology, Physics and Chemistry MCQs.", "neet"], ["Create a Test", "Build a personalised NEET test.", "neet"], ["NCERT Search", "Find indexed NCERT concepts and references.", "ncert"], ["Mistake Notebook", "Revise incorrect NEET questions.", "tools"], ["Previous Years", "Open published NEET PYQs.", "pyqs"], ["My Progress", "See only your NEET performance.", "progress"]] },
  mbbs: { name: "MBBS", label: "MEDICAL EDUCATION PORTAL", icon: "🩺", color: "#087f87", target: "mbbs", description: "Phase-wise medical subjects, clinical learning, revision and assessments.", actions: [["MBBS Subjects", "Open the phase-wise medical subject catalogue.", "mbbs"], ["Clinical Revision", "Use your MBBS revision queue.", "tools"], ["Bookmarks", "Return to saved medical questions.", "tools"], ["My Progress", "See only your MBBS learning record.", "progress"]] },
};
let activeCourse = "neet";
let availableCourses = [];

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

function portalUrl(anchor) {
  return `preview-v2.html?course=${activeCourse}#${anchor}`;
}

function renderCourseDashboard() {
  const course = COURSE_PORTALS[activeCourse];
  document.documentElement.style.setProperty("--course-accent", course.color);
  $("activeCourseLabel").textContent = course.label;
  $("activeCourseName").textContent = `${course.icon} ${course.name}`;
  $("activeCourseDescription").textContent = course.description;
  $("openCourse").href = portalUrl(course.target);
  $("continueLink").href = portalUrl(course.target);
  $("courseCardGrid").innerHTML = Object.entries(COURSE_CATALOG).map(([id, plan]) => {
    const item = COURSE_PORTALS[id];
    const owned = availableCourses.includes(id);
    if (owned) return `<button type="button" class="course-card ${id === activeCourse ? "active" : ""}" data-course="${id}" style="--card-accent:${item.color}"><span>${item.icon}</span><strong>${item.name}</strong><small>${id === activeCourse ? "CURRENT COURSE" : "OPEN PURCHASED COURSE"}</small></button>`;
    return `<a class="course-card locked" href="payment.html?course=${id}" style="--card-accent:${item.color}" aria-label="Unlock ${item.name} for ₹${currentCoursePrice(id)}"><span>${item.icon}</span><strong>${item.name}</strong><small>🔒 UNLOCK FOR ₹${currentCoursePrice(id)}</small><em>${plan.includes.slice(0,3).join(" • ")}</em></a>`;
  }).join("");
  $("courseActions").innerHTML = course.actions.map(([title, description, anchor]) => `<a class="card big-link" href="${portalUrl(anchor)}"><div><span class="eyebrow">${course.label}</span><h3>${title}</h3><p>${description}</p></div><strong>OPEN →</strong></a>`).join("");
  document.querySelectorAll("button[data-course]").forEach((button) => button.addEventListener("click", () => changeCourse(button.dataset.course)));
}

async function changeCourse(courseId) {
  if (!availableCourses.includes(courseId) || courseId === activeCourse) return;
  activeCourse = courseId;
  localStorage.setItem("scrutiny_active_course", courseId);
  $("courseSwitch").value = courseId;
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
  availableCourses = entitledCourses(profile);
  if (!availableCourses.length) {
    location.replace("payment.html");
    return;
  }
  const saved = localStorage.getItem("scrutiny_active_course");
  activeCourse = availableCourses.includes(saved) ? saved : availableCourses.includes(profile.activeCourse) ? profile.activeCourse : availableCourses[0];
  localStorage.setItem("scrutiny_active_course", activeCourse);
  $("courseSwitch").innerHTML = availableCourses.map((id) => `<option value="${id}" ${id === activeCourse ? "selected" : ""}>${COURSE_PORTALS[id].name}</option>`).join("");
  $("courseSwitch").addEventListener("change", (event) => changeCourse(event.target.value));
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
  window.__scrutinyProgress = data;
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
    $("continueLink").href = portalUrl(COURSE_PORTALS[activeCourse].target);
  } else {
    $("continueTitle").textContent = `Start your first ${COURSE_PORTALS[activeCourse].name} session`;
    $("continueMeta").textContent = "Your latest completed activity for this course will appear here.";
    $("continueLink").textContent = "START PRACTICE";
    $("continueLink").href = portalUrl(COURSE_PORTALS[activeCourse].target);
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
    `${p.email || user.email} • ${courseValidity(p.purchasedCourse || p.requestedCourse || p.activeCourse, p.neetExamYear)}`;
  setupCourseDashboard(p);
  loadInvoices(user);
  $("class10LectureEntry").hidden = !availableCourses.includes("class10");
  renderSummary();
  setupReview(user, p);
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
