import { firebaseConfig, SCRUTINY_ADMIN_EMAILS } from "./firebase-config.js";
import { entitledCourses } from "./course-catalog.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, getIdTokenResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// The public launch preview runs through 4 October 2026 in India.
const FREE_PREVIEW_END = Date.parse("2026-10-04T18:29:59.999Z");
if (Date.now() > FREE_PREVIEW_END) {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  document.documentElement.style.visibility = "hidden";
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
      document.documentElement.style.visibility = "";
    } catch (error) {
      console.error("IIT-JEE chapter access check failed", error);
      location.replace("student.html?course=jee");
    }
  });
}
