import { firebaseConfig } from "./firebase-config.js";
import { entitledCourses } from "./course-catalog.js?v=3";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, getIdTokenResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const app = initializeApp(firebaseConfig), auth = getAuth(app), db = getFirestore(app);
const resourceId = new URLSearchParams(location.search).get("dpp");
const state = { user: null, metadata: null, questions: [], answers: [], current: 0, submitted: false };
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);

function renderQuestion() {
  const question = state.questions[state.current], selected = state.answers[state.current];
  $("progressText").textContent = `Question ${state.current + 1} of ${state.questions.length}`;
  $("progressBar").style.width = `${((state.current + 1) / state.questions.length) * 100}%`;
  $("questionCard").innerHTML = `<span class="question-number">QUESTION ${state.current + 1}</span><h2>${escapeHtml(question.question)}</h2><div class="dpp-options">${question.options.map((option, index) => `<label class="${selected === index ? "selected" : ""}"><input type="radio" name="answer" value="${index}" ${selected === index ? "checked" : ""} ${state.submitted ? "disabled" : ""}><span>${String.fromCharCode(65 + index)}</span><b>${escapeHtml(option)}</b></label>`).join("")}</div>${state.submitted ? `<div class="answer-explanation ${selected === question.answer ? "correct" : "incorrect"}"><strong>Correct answer: ${String.fromCharCode(65 + question.answer)}. ${escapeHtml(question.options[question.answer])}</strong><p>${escapeHtml(question.explanation)}</p></div>` : ""}`;
  $("questionCard").querySelectorAll("input").forEach((input) => input.onchange = () => { state.answers[state.current] = Number(input.value); renderQuestion(); });
  $("previousQuestion").disabled = state.current === 0;
  $("nextQuestion").disabled = state.current === state.questions.length - 1;
  $("submitDpp").hidden = state.submitted;
}

async function submitDpp() {
  const unanswered = state.answers.filter((answer) => answer == null).length;
  if (unanswered && !confirm(`${unanswered} question(s) are unanswered. Submit anyway?`)) return;
  $("submitDpp").disabled = true;
  $("dppMessage").textContent = "Saving your attempt…";
  const attemptId = `${state.user.uid}_${resourceId}_${Date.now()}`;
  const answers = state.answers.map((selected, index) => ({ questionId: state.questions[index].id, selected: selected ?? null }));
  let savedOnline = true;
  try {
    await setDoc(doc(db, "mission600Attempts", attemptId), { uid: state.user.uid, resourceId, status: "submitted", answers, startedAt: serverTimestamp(), submittedAt: serverTimestamp(), updatedAt: serverTimestamp() });
  } catch (error) {
    console.warn("Mission 600 attempt saved on this device because cloud saving is unavailable.", error);
    savedOnline = false;
    localStorage.setItem(`mission600Attempt:${state.user.uid}:${resourceId}`, JSON.stringify({ attemptId, uid: state.user.uid, resourceId, status: "submitted", answers, submittedAt: new Date().toISOString() }));
  }
  state.submitted = true;
  const score = state.questions.reduce((total, question, index) => total + (state.answers[index] === question.answer ? 1 : 0), 0;
  $("dppResult").hidden = false;
  $("dppResult").innerHTML = `<span class="eyebrow">DPP COMPLETE</span><h2>${score}/20</h2><p>${score >= 16 ? "Strong work. Review the explanations to make the method automatic." : score >= 10 ? "Good start. Review every incorrect answer, then reattempt the chapter." : "Revisit the chapter lecture and foundation examples before reattempting."}</p>`;
  $("dppMessage").textContent = savedOnline ? "Attempt saved. Correct answers and explanations are now shown." : "Attempt saved on this device. Correct answers and explanations are now shown.";
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function init(user) {
  if (!/^SA-DPP-27-MAT-CH\d{2}-[EMH]$/.test(resourceId || "")) throw new Error("Invalid Mathematics DPP code.");
  state.user = user;
  const [profileSnap, token, catalogResponse, bankResponse] = await Promise.all([
    getDoc(doc(db, "students", user.uid)), getIdTokenResult(user, true),
    fetch("data/mission600/catalog.json"), fetch("data/mission600/private/mathematics-dpps.json"),
  ]);
  const profile = profileSnap.exists() ? profileSnap.data() : {};
  if (token.claims.founder !== true && !entitledCourses(profile).includes("class10")) throw new Error("Class 10 access is required.");
  if (!catalogResponse.ok || !bankResponse.ok) throw new Error("This DPP could not be loaded. Please try again.");
  const [catalog, bank] = await Promise.all([catalogResponse.json(), bankResponse.json()]);
  const localMetadata = catalog.dpps.find((item) => item.id === resourceId);
  const localContent = bank.dpps.find((item) => item.id === resourceId);
  if (!localMetadata || !localContent || localMetadata.contentComplete !== true || !["ready", "published"].includes(localMetadata.status)) throw new Error("This DPP is Coming Soon.");
  const [metadataSnap, contentSnap] = await Promise.all([
    getDoc(doc(db, "mission600DPPs", resourceId)).catch(() => null),
    getDoc(doc(db, "mission600DPPContent", resourceId)).catch(() => null),
  ]);
  state.metadata = metadataSnap?.exists() ? { ...localMetadata, ...metadataSnap.data(), pricePaise: 0, purchaseEnabled: false } : localMetadata;
  state.questions = contentSnap?.exists() && Array.isArray(contentSnap.data().questions) ? contentSnap.data().questions : localContent.questions;
  state.answers = Array(state.questions.length).fill(null);
  if (state.questions.length !== 20) throw new Error("This DPP is undergoing a content check.");
  $("dppCode").textContent = resourceId; $("dppTitle").textContent = state.metadata.title;
  $("dppMeta").textContent = `${state.metadata.chapter} · ${state.metadata.difficulty} · 20 marks · ${state.metadata.suggestedDurationMinutes} minutes`;
  $("previousQuestion").onclick = () => { state.current -= 1; renderQuestion(); };
  $("nextQuestion").onclick = () => { state.current += 1; renderQuestion(); };
  $("submitDpp").onclick = () => submitDpp().catch((error) => { $("dppMessage").textContent = error.message; $("submitDpp").disabled = false; });
  renderQuestion(); document.documentElement.classList.remove("auth-check");
}

onAuthStateChanged(auth, (user) => user ? init(user).catch((error) => { alert(error.message); location.replace("mission600.html"); }) : location.replace("login.html"));
