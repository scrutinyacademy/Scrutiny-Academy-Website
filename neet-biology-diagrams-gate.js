import "./student-storage.js";
import { firebaseConfig, SCRUTINY_ADMIN_EMAILS } from "./firebase-config.js";
import { entitledCourses } from "./course-catalog.js?v=2";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, getIdTokenResult, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const admins = SCRUTINY_ADMIN_EMAILS.map((email) => email.toLowerCase());

onAuthStateChanged(auth, async (user) => {
  window.ScrutinyStudentStorage.setUser(user);
  if (!user) { location.replace("login.html"); return; }
  try {
    const [snapshot, token] = await Promise.all([getDoc(doc(db, "students", user.uid)), getIdTokenResult(user, true)]);
    const profile = snapshot.exists() ? snapshot.data() : {};
    const founder = token.claims.founder === true || admins.includes((user.email || "").toLowerCase());
    const allowed = founder ? ["neet"] : entitledCourses(profile);
    if (!allowed.includes("neet")) { location.replace("student.html"); return; }
    const neetExamYear = profile.courseEntitlements?.neet?.neetExamYear || profile.neetExamYear || null;
    window.__scrutinyStudentContext = {
      uid: user.uid,
      activeCourse: "neet",
      availableCourses: allowed,
      profile: {
        neetExamYear,
        name: profile.name || user.displayName || "Student",
        email: profile.email || user.email || "",
        phone: profile.phone || "",
      },
      founderAccess: founder,
    };
    window.dispatchEvent(new CustomEvent("scrutiny:dashboard-context", { detail: window.__scrutinyStudentContext }));
    document.documentElement.classList.remove("auth-check");
    document.getElementById("logoutButton")?.addEventListener("click", async () => { window.ScrutinyStudentStorage.setUser(null); await signOut(auth); location.replace("login.html"); });
  } catch (error) {
    console.error("Biology visual library access check failed", error);
    location.replace("student.html");
  }
});
