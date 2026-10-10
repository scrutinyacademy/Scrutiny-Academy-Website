import { firebaseConfig } from "./firebase-config.js";
import { entitledCourses } from "./course-catalog.js?v=3";
import { calculateMission600Cart, formatRupees, isPurchasableResource } from "./mission600-core.mjs";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, getIdTokenResult, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { collection, doc, getDoc, getDocs, getFirestore, query, where } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";

const $ = (id) => document.getElementById(id);
const state = { catalog: null, profile: {}, entitlements: new Set(), cart: new Map(), currentWeek: null, user: null, results: [], submissions: [] };
const subjectIcon = { mathematics: "📐", physics: "⚛️", biology: "🧬", "social-science": "🌏" };
const subjectName = (id) => state.catalog.subjects[id]?.name || id;
const dateText = (date) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(`${date}T12:00:00+05:30`));

async function loadCatalog() {
  const response = await fetch("data/mission600/catalog.json");
  if (!response.ok) throw new Error("Mission 600 catalogue could not be loaded.");
  state.catalog = await response.json();
}

async function mergePublishedCatalogue(db) {
  const [dppSnapshot, testSnapshot] = await Promise.all([
    getDocs(collection(db, "mission600DPPs")).catch(() => null),
    getDocs(collection(db, "mission600Tests")).catch(() => null),
  ]);
  const merge = (localItems, snapshot) => {
    if (!snapshot) return localItems;
    const remote = new Map(snapshot.docs.map((item) => [item.id, item.data()]));
    return localItems.map((item) => remote.has(item.id) ? { ...item, ...remote.get(item.id), id: item.id } : item);
  };
  state.catalog.dpps = merge(state.catalog.dpps, dppSnapshot);
  state.catalog.tests = merge(state.catalog.tests, testSnapshot);
}

function resolveCurrentWeek() {
  const today = new Date();
  state.currentWeek = state.catalog.weeks.find((week) => today >= new Date(`${week.startDate}T00:00:00+05:30`) && today <= new Date(`${week.endDate}T23:59:59+05:30`)) || state.catalog.weeks[0];
}

function renderNotice() {
  $("sourceNotice").innerHTML = `<strong>Curriculum verification gate:</strong> ${state.catalog.sourceStatus.textbookBasis} Draft DPPs and tests cannot be purchased. <strong>Pricing:</strong> ${state.catalog.pricingPolicy.text}`;
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
  $("lectureJourney").innerHTML = lectures.length ? lectures.map((lecture) => `<article class="journey-card"><div class="video">${subjectIcon[lecture.subjectId]} ▶</div><span class="status">${lecture.youtubeUrl ? "LIVE" : `SCHEDULED · ${dateText(lecture.publicationDate)}`}</span><h3>${lecture.title}</h3><p>${lecture.subject} · Concept lecture → examples → textbook questions → answer writing → revision.</p>${lecture.youtubeUrl ? `<a class="watch-link" href="${lecture.youtubeUrl}" target="_blank" rel="noopener">WATCH ON YOUTUBE</a>` : `<span class="coming-link">YouTube link will appear after publication</span>`}<div class="resource-links"><span>Chapter notes</span><span>Revision sheet</span><span>Free practice</span><span>Easy DPP</span><span>Medium DPP</span><span>Hard DPP</span></div></article>`).join("") : `<div class="empty-state"><strong>${state.currentWeek.phaseName}</strong><p>Revision and mock-examination lesson releases will be announced here with their actual YouTube links.</p></div>`;
}

function setupFilters() {
  const options = Object.values(state.catalog.subjects).map((subject) => `<option value="${subject.id}">${subject.name}</option>`).join("");
  $("dppSubject").insertAdjacentHTML("beforeend", options); $("testSubject").insertAdjacentHTML("beforeend", options);
  [$("dppSubject"), $("dppDifficulty"), $("dppSearch")].forEach((control) => control.addEventListener("input", renderDpps));
  [$("testPhase"), $("testSubject")].forEach((control) => control.addEventListener("input", renderTests));
}

function renderBundles() {
  $("subjectBundles").innerHTML = Object.values(state.catalog.subjects).map((subject) => {
    const resources = state.catalog.dpps.filter((dpp) => dpp.subjectId === subject.id && !state.entitlements.has(dpp.id));
    const purchasable = resources.filter(isPurchasableResource);
    const price = calculateMission600Cart(resources);
    return `<article class="bundle-card"><span class="eyebrow">${subject.chapters.length} CHAPTERS · ${resources.length} DPPs</span><h3>${subjectIcon[subject.id]} ${subject.name}</h3><p><strong>${formatRupees(price.totalPaise)}</strong> · No DPP-only discount</p><button data-bundle="${subject.id}" ${purchasable.length !== resources.length || !resources.length ? "disabled" : ""}>BUY ALL DPPs FOR THIS SUBJECT</button></article>`;
  }).join("");
  document.querySelectorAll("[data-bundle]").forEach((button) => button.onclick = () => { state.catalog.dpps.filter((dpp) => dpp.subjectId === button.dataset.bundle && isPurchasableResource(dpp) && !state.entitlements.has(dpp.id)).forEach((dpp) => state.cart.set(dpp.id, dpp)); renderCart(); });
}

function bundleResources(kind) { return state.catalog[kind === "dpp" ? "dpps" : "tests"].filter((item) => !state.entitlements.has(item.id)); }
function cartPricing(items = [...state.cart.values()]) {
  return calculateMission600Cart(items, {
    requiredDppIds: bundleResources("dpp").map((item) => item.id),
    requiredTestIds: bundleResources("test").map((item) => item.id),
  });
}
function addCollectionToCart(kind) {
  bundleResources(kind).filter(isPurchasableResource).forEach((item) => state.cart.set(item.id, { ...item, kind }));
  renderCart();
}
function collectionReady(kind) {
  const resources = bundleResources(kind);
  return resources.length > 0 && resources.every(isPurchasableResource);
}
function renderProgrammeBundles() {
  const dpps = bundleResources("dpp"), tests = bundleResources("test");
  const dppTotal = dpps.reduce((sum, item) => sum + item.pricePaise, 0);
  const testTotal = tests.reduce((sum, item) => sum + item.pricePaise, 0);
  const combined = calculateMission600Cart([...dpps.map((item) => ({ ...item, kind: "dpp" })), ...tests.map((item) => ({ ...item, kind: "test" }))], { requiredDppIds: dpps.map((item) => item.id), requiredTestIds: tests.map((item) => item.id) });
  const dppReady = collectionReady("dpp"), testReady = collectionReady("test");
  $("programmeBundles").innerHTML = `<article class="bundle-card featured-bundle"><span class="eyebrow">COMPLETE DPP COLLECTION</span><h3>All ${dpps.length} unowned DPPs</h3><p><strong>${formatRupees(dppTotal)}</strong> · No standalone discount</p><button data-all-dpps ${!dppReady ? "disabled" : ""}>${dppReady ? "ADD ALL DPPs TO CART" : "COMPLETE COLLECTION COMING SOON"}</button></article><article class="bundle-card featured-bundle"><span class="eyebrow">BEST COMPLETE COMBINATION</span><h3>All DPPs + Complete Test Series</h3><p>${formatRupees(dppTotal + testTotal)} − ${formatRupees(combined.discountPaise)} = <strong>${formatRupees(combined.totalPaise)}</strong><br>10% off, maximum ₹100</p><button data-combined ${!(dppReady && testReady) ? "disabled" : ""}>${dppReady && testReady ? "ADD COMPLETE COMBINATION" : "COMPLETE COMBINATION COMING SOON"}</button></article>`;
  $("testSeriesBundle").innerHTML = `<article class="bundle-card featured-bundle"><span class="eyebrow">COMPLETE WRITTEN TEST SERIES</span><h3>All ${tests.length} unowned tests</h3><p><strong>${formatRupees(testTotal)}</strong> · Tests remain ₹9 each</p><button data-all-tests ${!testReady ? "disabled" : ""}>${testReady ? "ADD COMPLETE TEST SERIES" : "COMPLETE SERIES COMING SOON"}</button></article>`;
  document.querySelector("[data-all-dpps]").onclick = () => addCollectionToCart("dpp");
  document.querySelector("[data-all-tests]").onclick = () => addCollectionToCart("test");
  document.querySelector("[data-combined]").onclick = () => { addCollectionToCart("dpp"); addCollectionToCart("test"); };
}

function renderDpps() {
  const subject = $("dppSubject").value, difficulty = $("dppDifficulty").value, search = $("dppSearch").value.trim().toLowerCase();
  const rows = state.catalog.dpps.filter((dpp) => (subject === "all" || dpp.subjectId === subject) && (difficulty === "all" || dpp.difficulty === difficulty) && (!search || dpp.chapter.toLowerCase().includes(search)));
  $("dppStore").innerHTML = rows.map((dpp) => `<article class="resource-card"><div class="resource-meta"><span>${dpp.subject}</span><b>${formatRupees(dpp.pricePaise)}</b></div><h3>${dpp.title}</h3><p>${dpp.id}<br>${dpp.suggestedQuestionCount} questions · ${dpp.suggestedDurationMinutes} minutes</p>${!isPurchasableResource(dpp) ? `<span class="draft-note">Draft — question bank and academic review incomplete</span>` : ""}<button data-add="${dpp.id}" ${!isPurchasableResource(dpp) || state.entitlements.has(dpp.id) ? "disabled" : ""}>${state.entitlements.has(dpp.id) ? "OWNED" : isPurchasableResource(dpp) ? "ADD TO CART" : "COMING SOON"}</button></article>`).join("");
  document.querySelectorAll("[data-add]").forEach((button) => button.onclick = () => { const dpp = state.catalog.dpps.find((item) => item.id === button.dataset.add); if (isPurchasableResource(dpp)) { state.cart.set(dpp.id, dpp); renderCart(); } });
}

function renderTests() {
  const phase = $("testPhase").value, subject = $("testSubject").value;
  const tests = state.catalog.tests.filter((test) => (phase === "all" || test.phaseCode === phase) && (subject === "all" || test.subjectId === subject));
  $("testStore").innerHTML = tests.map((test) => {
    const owned = state.entitlements.has(test.id), ready = isPurchasableResource({ ...test, kind: "test" });
    return `<article class="test-card"><div class="test-date"><small>${test.day}</small><strong>${new Date(`${test.date}T12:00:00+05:30`).getDate()}</strong><small>${dateText(test.date).split(" ")[1]}</small></div><div><span class="test-code">${test.id}</span><h3>${test.name}</h3><p>${test.maximumMarks} marks · ${test.durationMinutes} minutes · ${test.difficulty}</p>${!ready ? `<span class="draft-note">Draft — question paper, answer key and rubric not yet published</span>` : ""}</div><div><strong>${formatRupees(test.pricePaise)}</strong><button data-test-action="${test.id}" ${!ready && !owned ? "disabled" : ""}>${owned ? "OPEN TEST" : ready ? "ADD TEST TO CART" : "COMING SOON"}</button><small class="test-payment-message"></small></div></article>`;
  }).join("");
  document.querySelectorAll("[data-test-action]").forEach((button) => button.onclick = async () => {
    const test = state.catalog.tests.find((item) => item.id === button.dataset.testAction);
    if (state.entitlements.has(test.id)) { location.href = `mission600-submit.html?test=${encodeURIComponent(test.id)}`; return; }
    state.cart.set(test.id, { ...test, kind: "test" }); renderCart();
  });
}

function renderCart() {
  const items = [...state.cart.values()];
  const pricing = cartPricing(items);
  $("cartCount").textContent = items.length; $("cartItemCount").textContent = pricing.dppCount; $("cartTests").textContent = pricing.testCount;
  $("cartSubtotal").textContent = formatRupees(pricing.subtotalPaise); $("cartDiscount").textContent = pricing.combinedBundleDiscountApplied ? `−${formatRupees(pricing.discountPaise)} (10%)` : "₹0.00"; $("cartTotal").textContent = formatRupees(pricing.totalPaise);
  $("cartItems").innerHTML = items.length ? items.map((item) => `<div class="cart-item"><span><strong>${item.title || item.name}</strong><small>${item.id} · ${formatRupees(item.pricePaise)}</small></span><button data-remove="${item.id}" aria-label="Remove">×</button></div>`).join("") : `<div class="empty-state">Your Mission 600 cart is empty.</div>`;
  document.querySelectorAll("[data-remove]").forEach((button) => button.onclick = () => { state.cart.delete(button.dataset.remove); renderCart(); });
  const eligible = items.length && items.every(isPurchasableResource);
  $("discountRow").classList.toggle("applied", pricing.combinedBundleDiscountApplied);
  $("discountLabel").textContent = pricing.combinedBundleDiscountApplied ? "Complete-combination discount" : "Discount";
  $("checkoutButton").disabled = !eligible; $("checkoutButton").textContent = eligible ? `PAY ${formatRupees(pricing.totalPaise)} SECURELY` : "CHECKOUT UNAVAILABLE";
}

async function startCheckout(items, button, messageElement) {
  if (!items.length || !items.every(isPurchasableResource)) return;
  button.disabled = true; button.textContent = "CREATING SECURE ORDER…"; if (messageElement) messageElement.textContent = "Backend validation in progress.";
  try {
    const functions = getFunctions(app, "asia-south1"), createOrder = httpsCallable(functions, "createMission600Order"), verifyPayment = httpsCallable(functions, "verifyMission600Payment");
    const result = (await createOrder({ clientRequestId: crypto.randomUUID().replaceAll("-", ""), resourceIds: items.map((item) => item.id) })).data;
    if (result.active) { location.reload(); return; }
    const checkout = new window.Razorpay({ key: result.keyId, order_id: result.razorpayOrderId, amount: result.amount, currency: result.currency, name: "Scrutiny Academy", description: "Mission 600 resources", prefill: { name: state.profile.name || "", email: state.user.email || "", contact: state.profile.phone || "" }, theme: { color: "#0a4f7f" }, handler: async (payment) => { button.textContent = "VERIFYING PAYMENT…"; await verifyPayment({ orderId: result.orderId, ...payment }); items.forEach((item) => state.cart.delete(item.id)); location.reload(); }, modal: { ondismiss: () => { button.disabled = false; button.textContent = "TRY CHECKOUT AGAIN"; if (messageElement) messageElement.textContent = "Payment cancelled; no access was granted."; } } });
    checkout.on("payment.failed", () => { button.disabled = false; button.textContent = "RETRY PAYMENT"; if (messageElement) messageElement.textContent = "Payment failed. Retry or contact support if money was debited."; }); checkout.open();
  } catch (error) { console.error(error); button.disabled = false; button.textContent = "TRY CHECKOUT AGAIN"; if (messageElement) messageElement.textContent = error?.message || "Secure checkout is unavailable."; }
}

function setupCart() {
  const open = () => { $("cartDrawer").classList.add("open"); $("scrim").classList.add("open"); $("cartDrawer").setAttribute("aria-hidden", "false"); };
  const close = () => { $("cartDrawer").classList.remove("open"); $("scrim").classList.remove("open"); $("cartDrawer").setAttribute("aria-hidden", "true"); };
  $("cartButton").onclick = open; $("closeCart").onclick = close; $("scrim").onclick = close;
  $("checkoutButton").onclick = () => startCheckout([...state.cart.values()], $("checkoutButton"), $("cartMessage"));
}

function renderPrivateModules() {
  const ownedDpps = [...state.entitlements].filter((id) => id.startsWith("SA-DPP-")).length, ownedTests = [...state.entitlements].filter((id) => id.startsWith("SA-M600-")).length;
  $("ownedDpps").textContent = ownedDpps; $("ownedTests").textContent = ownedTests;
  const owned = [...state.entitlements].map((id) => state.catalog.dpps.find((item) => item.id === id) || state.catalog.tests.find((item) => item.id === id)).filter(Boolean);
  $("libraryContent").innerHTML = owned.length ? `<div class="compact-list">${owned.map((item) => `<div class="compact-item"><b>${item.kind === "dpp" ? "📝" : "✍️"}</b><span><strong>${item.title || item.name}</strong><small>${item.id}</small></span><i>OWNED</i></div>`).join("")}</div>` : `<strong>No Mission 600 purchases yet.</strong><p>Published resources you buy will appear here immediately after server-verified payment.</p>`;
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
  await loadCatalog(); await mergePublishedCatalogue(db); resolveCurrentWeek(); renderNotice(); setupNavigation(); setupCalendarViews(); setupFilters(); setupCart(); renderDashboard(); renderCalendar(); renderJourney(); renderProgrammeBundles(); renderBundles(); renderDpps(); renderTests(); renderCart(); renderPrivateModules(); document.documentElement.classList.remove("auth-check");
}

const app = initializeApp(firebaseConfig);
onAuthStateChanged(getAuth(app), (user) => user ? initializeForUser(user).catch((error) => { console.error(error); alert("Mission 600 could not be loaded. Please try again."); }) : location.replace("login.html"));

