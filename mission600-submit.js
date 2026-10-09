import { firebaseConfig } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

const $ = (id) => document.getElementById(id), app = initializeApp(firebaseConfig), db = getFirestore(app), storage = getStorage(app), auth = getAuth(app);
const resourceId = new URLSearchParams(location.search).get("test");
let user, submissionId, existing = {}, uploaded = [];
function validFile(file) { return ["image/jpeg","image/png","image/webp","application/pdf"].includes(file.type) && file.size <= 20 * 1024 * 1024; }
async function save(status) {
  if (existing.status === "submitted") throw new Error("Final answers have already been submitted.");
  const files = [...$("answerFiles").files];
  if (files.some((file) => !validFile(file))) throw new Error("Use JPG, PNG, WEBP or PDF files no larger than 20 MB each.");
  if (!existing.createdAt) {
    const draft = { uid: user.uid, resourceId, attemptId: submissionId, status: "draft", typedAnswers: $("typedAnswers").value, files: uploaded, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
    await setDoc(doc(db, "mission600Submissions", submissionId), draft, { merge: false });
    existing = { ...draft, createdAt: true };
  }
  $("formMessage").textContent = files.length ? "Uploading protected answer sheets…" : "Saving answers…";
  for (const file of files) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectRef = ref(storage, `mission600-submissions/${user.uid}/${submissionId}/${crypto.randomUUID()}_${safeName}`);
    await uploadBytes(objectRef, file, { contentType: file.type });
    uploaded.push({ name: file.name, path: objectRef.fullPath, contentType: file.type, size: file.size });
  }
  const payload = { uid: user.uid, resourceId, attemptId: submissionId, status, typedAnswers: $("typedAnswers").value, files: uploaded, updatedAt: serverTimestamp(), ...(status === "submitted" ? { submittedAt: serverTimestamp() } : {}) };
  await setDoc(doc(db, "mission600Submissions", submissionId), payload, { merge: true }); existing = { ...existing, ...payload }; $("submissionStatus").textContent = status === "submitted" ? "PENDING EVALUATION" : "DRAFT SAVED"; $("formMessage").textContent = status === "submitted" ? "Submitted successfully. Your descriptive answers are awaiting human review." : "Draft saved securely."; if (status === "submitted") { $("typedAnswers").disabled = true; $("answerFiles").disabled = true; $("saveDraft").disabled = true; $("submitFinal").disabled = true; }
}
async function init(currentUser) {
  user = currentUser; if (!/^SA-M600-[A-Z0-9-]+$/.test(resourceId || "")) throw new Error("Invalid test code."); submissionId = `${user.uid}_${resourceId}`;
  const [testSnap, contentSnap, submissionSnap] = await Promise.all([getDoc(doc(db,"mission600Tests",resourceId)),getDoc(doc(db,"mission600TestContent",resourceId)),getDoc(doc(db,"mission600Submissions",submissionId))]);
  if (!testSnap.exists() || !contentSnap.exists()) throw new Error("This purchased question paper is not available.");
  const test = testSnap.data(), content = contentSnap.data(); $("testCode").textContent = resourceId; $("testName").textContent = test.name; $("testMeta").textContent = `${test.maximumMarks} marks · ${test.durationMinutes} minutes · ${test.subject}`; $("questionPaper").innerHTML = content.questions.map((question,index)=>`<article class="question"><b>Q${index+1}${question.marks ? ` · ${question.marks} marks` : ""}</b><p>${question.prompt || question.question || ""}</p></article>`).join("");
  if (submissionSnap.exists()) { existing = submissionSnap.data(); uploaded = existing.files || []; $("typedAnswers").value = existing.typedAnswers || ""; $("fileList").textContent = uploaded.length ? uploaded.map((file)=>file.name).join(", ") : "No files uploaded."; if(existing.status === "submitted") { $("submissionStatus").textContent = "PENDING EVALUATION"; $("typedAnswers").disabled = true; $("answerFiles").disabled = true; $("saveDraft").disabled = true; $("submitFinal").disabled = true; } }
  $("saveDraft").onclick = () => save("draft").catch((error)=>$("formMessage").textContent=error.message); $("answerForm").onsubmit = (event) => { event.preventDefault(); if(confirm("Submit final answers? You cannot edit them afterward.")) save("submitted").catch((error)=>$("formMessage").textContent=error.message); }; document.documentElement.classList.remove("auth-check");
}
onAuthStateChanged(auth,(currentUser)=>currentUser?init(currentUser).catch((error)=>{alert(error.message);location.replace("mission600.html");}):location.replace("login.html"));

