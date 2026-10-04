import { firebaseConfig, SCRUTINY_ADMIN_EMAILS } from "./firebase-config.js";
import { entitledCourses } from "./course-catalog.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, getIdTokenResult, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function studentName(profile = {}, user = {}) {
  const raw = String(profile.name || profile.fullName || user.displayName || user.email?.split("@")[0] || "IIT-JEE Student");
  return raw.replace(/[._-]+/g, " ").replace(/\d+/g, " ").trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ") || "IIT-JEE Student";
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.replace("index.html?mode=login");
    return;
  }
  try {
    const [studentSnap, token] = await Promise.all([getDoc(doc(db, "students", user.uid)), getIdTokenResult(user)]);
    const profile = studentSnap.exists() ? studentSnap.data() : {};
    const isFounder = token.claims.founder === true || SCRUTINY_ADMIN_EMAILS.includes(String(user.email || "").toLowerCase());
    if (!isFounder && !entitledCourses(profile).includes("jee")) {
      location.replace("payment.html?course=jee");
      return;
    }
    localStorage.setItem("scrutiny_active_course", "jee");
    document.body.classList.remove("auth-check");
    document.body.classList.add("physics-formulas-enabled");
    const name = document.getElementById("jeeStudentName");
    if (name) name.textContent = studentName(profile, user);
  } catch (error) {
    console.error("IIT-JEE access check failed", error);
    location.replace("student.html?course=jee");
  }
});

document.getElementById("jeeLogout")?.addEventListener("click", async () => {
  await signOut(auth);
  location.replace("index.html?mode=login");
});
