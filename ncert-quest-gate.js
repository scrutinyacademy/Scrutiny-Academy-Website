import { firebaseConfig, SCRUTINY_ADMIN_EMAILS } from "./firebase-config.js";
import { entitledCourses } from "./course-catalog.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, getIdTokenResult, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const configured = firebaseConfig.apiKey && firebaseConfig.apiKey !== "REPLACE_ME" && firebaseConfig.projectId !== "REPLACE_ME";

if (!configured) {
  location.replace("login.html?error=config");
} else {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  onAuthStateChanged(auth, async (user) => {
    if (!user) return location.replace("login.html");
    const listedFounder = SCRUTINY_ADMIN_EMAILS.map((email) => email.toLowerCase()).includes((user.email || "").toLowerCase());
    let founder = listedFounder;
    if (!founder) {
      try { founder = (await getIdTokenResult(user, true)).claims.founder === true; } catch (error) { console.warn("Founder claim unavailable", error); }
    }
    if (!founder) {
      try {
        const snapshot = await getDoc(doc(db, "students", user.uid));
        const profile = snapshot.exists() ? snapshot.data() : {};
        if (profile.accessStatus !== "active" || !entitledCourses(profile).includes("neet")) return location.replace("payment.html?course=neet");
      } catch (error) {
        console.error("NCERT Quest access check failed", error);
        return location.replace("payment.html?course=neet");
      }
    }
    localStorage.setItem("scrutiny_active_course", "neet");
    document.documentElement.classList.remove("auth-check");
  });
}
