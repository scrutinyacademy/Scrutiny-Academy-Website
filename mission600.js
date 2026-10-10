import { firebaseConfig } from "./firebase-config.js";
import { entitledCourses } from "./course-catalog.js?v=3";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, getIdTokenResult, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const state = { catalog: null, profile: {}, entitlements: new Set(), currentWeek: null, user: null, results: [], submissions: [] };
const subjectIcon = { mathematics: "📐", physics: "⚛️", biology: "🧬", "social-science": "🌏" };
const subjectName = (id) => state.catalog.subjects[id]?.name || id;
const dateText = (date) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${date}T12:00:00+05:30`));
const isFreeReadyResource = (resource) => resource?.contentComplete === true && ["ready", "published"].includes(resource?.status);

async function loadCatalog() {
  const response = await fetch("data/mission600/catalog.json");
  if (!response.ok) throw new Error("Mission 600 catalogue could not be loaded.");
  state.catalog = await response.json();
  state.catalog.dpps = []; // Retire all legacy DPP entries; replacement is generated independently.
  state.catalog.tests = state.catalog.tests.map((item) => ({ ...item, pricePaise: 0, purchaseEnabled: false }));
}

async function mergePublishedCatalogue(db) {
  const [dppSnapshot, testSnapshot] = await Promise.all([
    getDocs(collection(db, "mission600DPPs")).catch(() => null),
    getDocs(collection(db, "mission600Tests")).catch(() => null),
  ]);
  const merge = (localItems, snapshot) => {
    if (!snapshot) return localItems;
    const remote = new Map(snapshot.docs.map((item) => [item.id, item.data()]));
    return localItems.map((item) => {
      if (!remote.has(item.id)) return item;
      const serverItem = remote.get(item.id);
      const merged = { ...item, ...serverItem, id: item.id, pricePaise: 0, purchaseEnabled: false };
      return item.status === "ready" && serverItem.status !== "published"
        ? { ...merged, status: "ready", contentComplete: true, questionCount: item.questionCount, suggestedQuestionCount: item.suggestedQuestionCount }
        : merged;
    });
  };
  state.catalog.dpps = merge(state.catalog.dpps, dppSnapshot);
  state.catalog.tests = merge(state.catalog.tests, testSnapshot);
}

function resolveCurrentWeek() {
  const today = new Date();
  state.currentWeek = state.catalog.weeks.find((week) => today >= new Date(`${week.startDate}T00:00:00+05:30`) && today <= new Date(`${week.endDate}T23:59:59+05:30`)) || state.catalog.weeks[0];
}

function renderNotice() {
  const readyDpps = 42;
  const readyTests = state.catalog.tests.filter(isFreeReadyResource).length;
  $("sourceNotice").innerHTML = `<strong>Mission 600 is included with Class 10:</strong> no separate Mission 600 payment is required. ${readyDpps} completed DPPs and ${readyTests} completed written tests are available now; unfinished resources remain Coming Soon. <strong>Academic note:</strong> ${state.catalog.sourceStatus.textbookBasis}`;
}

function setupNavigation() {
  document.querySelectorAll("[data-view]").forEach((button) => button.onclick = () => showView(button.dataset.view));
  document.querySelectorAll("[data-jump]").forEach((button) => button.onclick = () => showView(button.dataset.jump));
}
function showView(name) {
  document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === name));
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === `view-${name}`));
  window.scrollTo({ top: document.querySelector(".shell").offsetTop - 60, behavior: "smooth" });
}

function renderDashboard() {
  const week = state.currentWeek;
  $("currentPhase").textContent = `${week.phaseName} · Week ${week.week} · ${dateText(week.startDate)}–${dateText(week.endDate)}`;
  const teaching = Object.entries(week.teachingBlocks || {});
  $("weeklyMission").innerHTML = teaching.length ? teaching.map(([id, blocks]) => `<div class="mission-item"><b>${subjectIcon[id]}</b><span><strong>${subjectName(id)}</strong><small>${blocks.map((item) => item.title).join(" · ")}</small></span><i>${blocks.length} LECTURES</i></div>`).join("") : `<div class="mission-item"><b>🏆</b><span><strong>${week.phaseName}</strong><small>Full-syllabus revision, timed practice and analysis</small></span><i>ACTIVE</i></div>`;
  const upcoming = state.catalog.tests.filter((test) => new Date(`${test.date}T23:59:59+05:30`) >= new Date()).slice(0, 3);
  const shown = upcoming.length ? upcoming : state.catalog.tests.slice(0, 3);
  $("upcomingTests").innerHTML = shown.map((test) => `<div class="compact-item"><b>${subjectIcon[test.subjectId]}</b><span><strong>${test.subject}</strong><small>${dateText(test.date)} · ${test.id}</small></span><i>${test.status.toUpperCase()}</i></div>`).join("");
  if (shown[0]) { $("nextTest").textContent = shown[0].subject; $("nextTestDate").textContent = `${shown[0].day}, ${dateText(shown[0].date)}`; }
}

function renderCalendar(view = "list") {
  const host = $("calendarContent");
  if (view === "list") {
    host.className = "calendar-list";
    host.innerHTML = state.catalog.weeks.map((week) => `<details class="calendar-week" ${week.week === state.currentWeek.week ? "open" : ""}><summary><b class="week-number">W${String(week.week).padStart(2, "0")}</b><span><strong>${dateText(week.startDate)} – ${dateText(week.endDate)}</strong><small>${week.phaseName}${week.focusSubjects?.length ? ` · Focus: ${week.focusSubjects.map(subjectName).join(" + ")}` : ""}</small></span><i class="phase-badge">${week.phaseCode}</i></summary><div class="week-body">${Object.entries(week.teachingBlocks || {}).map(([id, blocks]) => `<div class="subject-plan"><strong>${subjectIcon[id]} ${subjectName(id)}</strong><span>${blocks.map((item) => item.title).join(" · ")}</span></div>`).join("")}${(week.lectures || []).length ? `<div class="lecture-dates"><strong>▶ YouTube release plan</strong>${week.lectures.map((lecture) => `<span>${dateText(lecture.publicationDate)} · ${lecture.subject}: ${lecture.title}</span>`).join("")}</div>` : ""}<div class="subject-plan"><strong>🗣️ Languages</strong><span>Telugu: ${week.languagePlan.telugu}<br>Hindi: ${week.languagePlan.hindi}<br>English: ${week.languagePlan.english}</span></div></div></details>`).join("");
  } else if (view === "calendar") {
    host.className = "calendar-month";
    host.innerHTML = state.catalog.tests.map((test) => `<article class="calendar-day"><b>${dateText(test.date)}</b><small>${test.subject}</small><small>${test.phaseCode} · ${test.day}</small></article>`).join("");
  } else {
    host.className = "subject-calendar";
    host.innerHTML = Object.values(state.catalog.subjects).map((subject) => `<article><h3>${subjectIcon[subject.id]} ${subject.name}</h3><ol>${subject.chapters.map((chapter) => `<li>${chapter.name}</li>`).join("")}</ol></article>`).join("");
  }
}

function setupCalendarViews() { document.querySelectorAll("[data-calendar-view]").forEach((button) => button.onclick = () => { document.querySelectorAll("[data-calendar-view]").forEach((item) => item.classList.toggle("active", item === button)); renderCalendar(button.dataset.calendarView); }); }

function renderJourney() {
  const lectures = state.currentWeek.lectures || [];
  $("lectureJourney").innerHTML = lectures.length ? lectures.map((lecture) => `<article class="journey-card"><div class="video">${subjectIcon[lecture.subjectId]} ▶</div><span class="status">${lecture.youtubeUrl ? "LIVE" : `SCHEDULED · ${dateText(lecture.publicationDate)}`}</span><h3>${lecture.title}</h3><p>${lecture.subject} · Concept lecture → examples → textbook questions → answer writing → revision.</p>${lecture.youtubeUrl ? `<a class="watch-link" href="${lecture.youtubeUrl}" target="_blank" rel="noopener">WATCH ON YOUTUBE</a>` : `<span class="coming-link">YouTube link will appear after publication</span>`}<div class="resource-links"><span>Chapter notes</span><span>Revision sheet</span><span>Free practice</span></div></article>`).join("") : `<div class="empty-state"><strong>${state.currentWeek.phaseName}</strong><p>Revision and mock-examination lesson releases will be announced here with their actual YouTube links.</p></div>`;
}

function setupFilters() {
  const options = Object.values(state.catalog.subjects).map((subject) => `<option value="${subject.id}">${subject.name}</option>`).join("");
  $("dppSubject").insertAdjacentHTML("beforeend", options); $("testSubject").insertAdjacentHTML("beforeend", options);
  [$("dppSubject"), $("dppDifficulty"), $("dppSearch")].forEach((control) => control.addEventListener("input", renderDpps));
  [$("testPhase"), $("testSubject")].forEach((control) => control.addEventListener("input", renderTests));
}

function renderBundles() {
  $("subjectBundles").innerHTML = Object.values(state.catalog.subjects).map((subject) => {
    const resources = subject.id === "mathematics" ? Array(42).fill({contentComplete:true,status:"ready"}) : [];
    const ready = resources.filter(isFreeReadyResource);
    return `<article class="bundle-card"><span class="eyebrow">${subject.chapters.length} CHAPTERS · ${resources.length} DPPs</span><h3>${subjectIcon[subject.id]} ${subject.name}</h3><p><strong>${ready.length} included now</strong> · ${resources.length - ready.length} Coming Soon</p><button data-bundle="${subject.id}" ${!ready.length ? "disabled" : ""}>${ready.length ? "VIEW INCLUDED DPPs" : "COMING SOON"}</button></article>`;
  }).join("");
  document.querySelectorAll("[data-bundle]").forEach((button) => button.onclick = () => {
    $("dppSubject").value = button.dataset.bundle;
    renderDpps();
    $("dppStore").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function renderProgrammeBundles() {
  const readyDpps = state.catalog.dpps.filter(isFreeReadyResource).length;
  const readyTests = state.catalog.tests.filter(isFreeReadyResource).length;
  $("programmeBundles").innerHTML = `<article class="bundle-card featured-bundle"><span class="eyebrow">CLASS 10 BATCH BENEFIT</span><h3>Mission 600 DPP Collection</h3><p><strong>${readyDpps} DPPs included now</strong><br>Every completed DPP will unlock here without another payment.</p><button data-jump="library">OPEN MY RESOURCES</button></article><article class="bundle-card featured-bundle"><span class="eyebrow">NO MISSION 600 CHECKOUT</span><h3>One Class 10 access</h3><p>No ₹2 DPP payment, no ₹9 test payment and no Mission 600 cart.</p><button data-jump="dashboard">VIEW WEEKLY MISSION</button></article>`;
  $("testSeriesBundle").innerHTML = `<article class="bundle-card featured-bundle"><span class="eyebrow">WRITTEN TEST SERIES INCLUDED</span><h3>${readyTests} tests published now</h3><p>Completed tests will open automatically for active Class 10 batch students. Draft papers remain Coming Soon.</p><button disabled>${readyTests ? "AVAILABLE BELOW" : "TESTS COMING SOON"}</button></article>`;
  document.querySelectorAll("[data-jump]").forEach((button) => button.onclick = () => showView(button.dataset.jump));
}

function renderDpps() {
  const subject = $("dppSubject").value, difficulty = $("dppDifficulty").value, search = $("dppSearch").value.trim().toLowerCase();
  const chapters = state.catalog.subjects.mathematics?.chapters || [];
  const levels = [{code:"E",difficulty:"Easy",label:"Foundation Builder",minutes:25},{code:"M",difficulty:"Medium",label:"Concept Master",minutes:35},{code:"H",difficulty:"Hard",label:"Board Challenger",minutes:45}];
  const rows = subject !== "all" && subject !== "mathematics" ? [] : chapters.flatMap((chapter,index)=>levels.map(level=>({chapter:chapter.name,index, ...level}))).filter(item=>(difficulty==="all"||item.difficulty===difficulty)&&(!search||item.chapter.toLowerCase().includes(search)));
  $("dppStore").innerHTML = rows.map(item=> {
    const id = `M600-NEW-MAT-${String(item.index+1).padStart(2,"0")}-${item.code}`;
    return `<article class="resource-card resource-ready"><div class="resource-meta"><span>MATHEMATICS</span><b class="free-resource-label">NEW · INCLUDED</b></div><h3>${item.chapter} — ${item.label}</h3><p>20 MCQs · 20 marks · ${item.minutes} minutes</p><span class="draft-note">Fresh Mission 600 practice · Easy / Medium / Hard</span><button data-new-dpp="${id}">START DPP</button></article>`;
  }).join("") || '<p>No Mathematics DPPs match your filters.</p>';
  document.querySelectorAll("[data-new-dpp]").forEach(button=>button.onclick=()=>{location.href=`mission600-dpp.html?dpp=${encodeURIComponent(button.dataset.newDpp)}`;});
}

function renderTests() {
  const phase = $("testPhase").value, subject = $("testSubject").value;
  const tests = state.catalog.tests.filter((test) => (phase === "all" || test.phaseCode === phase) && (subject === "all" || test.subjectId === subject));
  $("testStore").innerHTML = tests.map((test) => {
    const ready = isFreeReadyResource(test);
    return `<article class="test-card"><div class="test-date"><small>${test.day}</small><strong>${new Date(`${test.date}T12:00:00+05:30`).getDate()}</strong><small>${dateText(test.date).split(" ")[1]}</small></div><div><span class="test-code">${test.id}</span><h3>${test.name}</h3><p>${test.maximumMarks} marks · ${test.durationMinutes} minutes · ${test.difficulty}</p>${!ready ? `<span class="draft-note">Draft — question paper, answer key and rubric not yet published</span>` : `<span class="draft-note">Included with your Class 10 batch</span>`}</div><div><strong class="free-resource-label">${ready ? "INCLUDED" : "DRAFT"}</strong><button data-test-action="${test.id}" ${!ready ? "disabled" : ""}>${ready ? "OPEN TEST" : "COMING SOON"}</button></div></article>`;
  }).join("");
  document.querySelectorAll("[data-test-action]").forEach((button) => button.onclick = () => { location.href = `mission600-submit.html?test=${encodeURIComponent(button.dataset.testAction)}`; });
}

function renderPrivateModules() {
  const available = state.catalog.tests.filter(isFreeReadyResource);
  const availableDpps = 42;
  const availableTests = available.length;
  $("ownedDpps").textContent = availableDpps; $("ownedTests").textContent = availableTests;
  $("libraryContent").innerHTML = available.length ? `<div class="compact-list">${available.map((item) => {
    const dpp = item.kind === "dpp" || item.id.startsWith("SA-DPP-");
    return `<a class="compact-item resource-open" href="${dpp ? `mission600-dpp.html?dpp=${encodeURIComponent(item.id)}` : `mission600-submit.html?test=${encodeURIComponent(item.id)}`}"><b>${dpp ? "📝" : "✍️"}</b><span><strong>${item.title || item.name}</strong><small>${item.id} · Included with Class 10</small></span><i>OPEN</i></a>`;
  }).join("")}</div>` : `<strong>No Mission 600 resource is published yet.</strong><p>Completed resources will appear here automatically without a separate payment.</p>`;
  const publishedResults = state.results.filter((item) => item.status === "published");
  $("resultsContent").innerHTML = publishedResults.length ? `<div class="compact-list">${publishedResults.map((item) => `<div class="compact-item"><b>🏆</b><span><strong>${item.resourceId}</strong><small>${item.teacherFeedback || "Evaluation published"}</small></span><i>${item.totalMarks} MARKS</i></div>`).join("")}</div>` : `<strong>No published Mission 600 results yet.</strong><p>Submitted written tests will show Pending Evaluation, Reviewed or Published here.</p>`;
  const revision = publishedResults.filter((item) => item.revisionTopics);
  $("mistakeContent").innerHTML = revision.length ? `<div class="compact-list">${revision.map((item) => `<div class="compact-item"><b>↻</b><span><strong>${item.resourceId}</strong><small>${item.revisionTopics}</small></span><i>REVISE</i></div>`).join("")}</div>` : `<strong>Your Mission 600 mistake book is ready.</strong><p>Question-level mistakes and teacher recommendations will appear after evaluated attempts.</p>`;
  $("progressContent").innerHTML = Object.values(state.catalog.subjects).map((subject) => `<article><h3>${subjectIcon[subject.id]} ${subject.name}</h3><strong>0%</strong><p>Complete lectures, DPPs and evaluated tests to build a reliable mastery score.</p></article>`).join("");
}

async function initializeForUser(user) {
  state.user = user;
  const db = getFirestore();
  const [profileSnap, token] = await Promise.all([getDoc(doc(db, "students", user.uid)).catch(() => null), getIdTokenResult(user, true)]);
  state.profile = profileSnap?.exists() ? profileSnap.data() : {};
  const founder = token.claims.founder === true;
  if (!founder && !entitledCourses(state.profile).includes("class10")) { location.replace("payment.html?course=class10"); return; }
  const [entitlementSnapshot, resultSnapshot, submissionSnapshot] = await Promise.all([
    getDocs(query(collection(db, "mission600Entitlements"), where("uid", "==", user.uid))).catch(() => null),
    getDocs(query(collection(db, "mission600Results"), where("uid", "==", user.uid))).catch(() => null),
    getDocs(query(collection(db, "mission600Submissions"), where("uid", "==", user.uid))).catch(() => null),
  ]);
  state.entitlements = new Set(entitlementSnapshot ? entitlementSnapshot.docs.filter((item) => item.data().status === "active").map((item) => item.data().resourceId) : []);
  state.results = resultSnapshot ? resultSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })) : [];
  state.submissions = submissionSnapshot ? submissionSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })) : [];
  $("welcomeTitle").textContent = `${state.profile.name || user.displayName || "Student"}, this is your Mission 600.`;
  $("logoutButton").onclick = async () => { await signOut(getAuth()); location.replace("login.html"); };
  await loadCatalog(); await mergePublishedCatalogue(db); resolveCurrentWeek(); renderNotice(); setupNavigation(); setupCalendarViews(); setupFilters(); renderDashboard(); renderCalendar(); renderJourney(); renderProgrammeBundles(); renderBundles(); renderDpps(); renderTests(); renderPrivateModules(); document.documentElement.classList.remove("auth-check");
}

const app = initializeApp(firebaseConfig);
onAuthStateChanged(getAuth(app), (user) => user ? initializeForUser(user).catch((error) => { console.error(error); alert("Mission 600 could not be loaded. Please try again."); }) : location.replace("login.html"));

