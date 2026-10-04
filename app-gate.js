import { firebaseConfig, SCRUTINY_ADMIN_EMAILS } from "./firebase-config.js";
import { entitledCourses } from "./course-catalog.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  getIdTokenResult,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const COURSE_PORTALS = {
  class8: { name: "Class 8 Telangana SSC", label: "SSC FOUNDATION PORTAL", target: "class8", sections: ["support"], color: "#7c3aed", description: "Guided Telangana SSC learning with concepts, practice, writing, tests and smart revision." },
  class10: { name: "Class 10 Telangana SSC", label: "SSC BOARD PORTAL", target: "class10", sections: ["class10", "tools", "progress", "support"], color: "#1677d2", description: "Board questions, chapter practice, revision and Telangana SSC preparation." },
  class11: { name: "Class 11 Telangana Intermediate", label: "INTERMEDIATE 1ST YEAR", target: "class11", sections: ["class11", "progress", "support"], color: "#138a5b", description: "A separate Telangana Intermediate board portal with chapter-wise Botany VSAQs, SAQs and LAQs." },
  class12: { name: "Class 12 Telangana Intermediate", label: "INTERMEDIATE 2ND YEAR", target: "class12", sections: ["class12", "ncert", "ncert-booster", "tools", "progress", "support"], color: "#7254c7", description: "Second-year board preparation, revision and subject resources." },
  neet: { name: "NEET-UG", label: "MEDICAL ENTRANCE PORTAL", target: "neet", sections: ["neet", "ranker", "flashcards", "pyqs", "ncert", "ncert-booster", "tools", "progress", "support"], color: "#d65328", description: "NCERT-focused Biology, Physics and Chemistry practice, tests, PYQs and analysis." },
  jee: { name: "IIT-JEE", label: "ENGINEERING ENTRANCE PORTAL", target: "jee", sections: ["jee", "tools", "progress", "support"], color: "#ef6c00", description: "Physics, Chemistry and Mathematics preparation for JEE Main and Advanced." },
  mbbs: { name: "MBBS", label: "MEDICAL EDUCATION PORTAL", target: "mbbs", sections: ["mbbs", "tools", "progress", "support"], color: "#087f87", description: "Phase-wise medical subjects, clinical learning, revision and assessments." },
};

function friendlyStudentName(profile = {}, user = {}) {
  let value = String(profile.preferredName || profile.fullName || profile.name || user.displayName || (user.email || "").split("@")[0] || "Student").trim();
  if (value.toLowerCase() === "iampramodsharma02") return "Pramod";
  value = value.replace(/^(i[._-]?am|its|official)[._-]?/i, "").replace(/[._-]+/g, " ").replace(/\d+/g, " ").replace(/\s+/g, " ").trim();
  if (!value) return "Student";
  return value.split(" ").slice(0, 2).map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(" ");
}

function selectedCourse(profile = {}, allowed = []) {
  const requested = new URLSearchParams(location.search).get("course");
  const saved = localStorage.getItem("scrutiny_active_course");
  return allowed.includes(requested) ? requested : allowed.includes(saved) ? saved : allowed.includes(profile.activeCourse) ? profile.activeCourse : allowed[0];
}

function applyCoursePortal(courseId, auth, user, db, allowed, profile = {}) {
  if (courseId === "class8") { location.replace("class8-ssc.html"); return; }
  if (courseId === "class10") { location.replace("class10-board.html"); return; }
  if (courseId === "jee") { location.replace("jee.html"); return; }
  const course = COURSE_PORTALS[courseId] || COURSE_PORTALS.neet;
  localStorage.setItem("scrutiny_active_course", courseId);
  document.documentElement.dataset.course = courseId;
  document.documentElement.style.setProperty("--portal-accent", course.color);

  const tools = document.getElementById("courseHeaderTools");
  if (tools) {
    tools.innerHTML = `<div class="active-course-title"><span>${course.label}</span><strong>${course.name}</strong></div>${allowed.length > 1 ? `<label class="course-switch-label"><span>Switch course</span><select id="platformCourseSwitch" aria-label="Switch active course">${allowed.map((id) => `<option value="${id}" ${id === courseId ? "selected" : ""}>${COURSE_PORTALS[id].name}</option>`).join("")}</select></label>` : ""}<a class="my-courses-link" href="student.html">My Course</a>`;
    tools.querySelector("select")?.addEventListener("change", async (event) => {
      const next = event.target.value;
      localStorage.setItem("scrutiny_active_course", next);
      try {
        await setDoc(doc(db, "students", user.uid), { activeCourse: next, updatedAt: serverTimestamp() }, { merge: true });
      } catch (error) {
        console.warn("Course preference saved on this device only", error);
      }
      if (next === "class8") location.assign("class8-ssc.html");
      else if (next === "class10") location.assign("class10-board.html");
      else if (next === "jee") location.assign("jee.html");
      else location.assign(`preview-v2.html?course=${next}#${COURSE_PORTALS[next].target}`);
    });
  }

  const visible = new Set(["home", ...course.sections]);
  document.querySelectorAll("main > section[id]").forEach((section) => {
    section.hidden = !visible.has(section.id);
  });
  document.querySelectorAll("#mainNav a[href^='#']").forEach((link) => {
    const target = link.getAttribute("href").slice(1);
    link.hidden = target !== "home" && !visible.has(target);
  });
  document.getElementById("programs")?.setAttribute("hidden", "");
  const eyebrow = document.querySelector("#home .eyebrow");
  const title = document.querySelector("#home h1");
  const copy = document.querySelector("#home .hero-copy p");
  if (eyebrow) eyebrow.textContent = `WELCOME BACK, ${friendlyStudentName(profile, user).toUpperCase()} • ${course.label}`;
  if (title) title.textContent = `Your ${course.name} learning space.`;
  if (copy) copy.textContent = course.description;
  const explore = document.querySelector("#home .hero-actions a");
  if (explore) { explore.href = `#${course.target}`; explore.textContent = "Open course content"; }
}

function setupResponsiveNavigation() {
  const button = document.getElementById("menuBtn");
  const nav = document.getElementById("mainNav");
  const backdrop = document.getElementById("navBackdrop");
  if (!button || !nav || button.dataset.bound === "true") return;
  button.dataset.bound = "true";

  const setOpen = (open) => {
    nav.classList.toggle("open", open);
    backdrop?.classList.toggle("show", open);
    document.body.classList.toggle("nav-open", open);
    button.classList.toggle("active", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  };

  button.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
  backdrop?.addEventListener("click", () => setOpen(false));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });
  addEventListener("resize", () => {
    if (innerWidth > 1280) setOpen(false);
  });
}

const configured =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "REPLACE_ME" &&
  firebaseConfig.projectId !== "REPLACE_ME";

function addAccountControls(auth, user, profile = {}) {
  const logout = document.getElementById("platformLogout");
  const nav = document.getElementById("mainNav");
  if (!logout || !nav || logout.dataset.bound === "true") return;
  logout.dataset.bound = "true";
  const identity = document.createElement("span");
  identity.className = "platform-user";
  identity.textContent = `Signed in as ${friendlyStudentName(profile, user)}`;
  identity.title = user.email || "";
  nav.appendChild(identity);
  logout.addEventListener("click", async () => {
    logout.disabled = true;
    logout.textContent = "Logging out…";
    try {
      await signOut(auth);
      location.replace("login.html");
    } catch (error) {
      console.error("Logout failed:", error);
      logout.disabled = false;
      logout.textContent = "Logout";
      alert("Logout failed. Please try again.");
    }
  });
}
async function openPlatform(auth, user, profile, db) {
  const allowed = entitledCourses(profile);
  if (!allowed.length) { location.replace("payment.html"); return; }
  setupResponsiveNavigation();
  addAccountControls(auth, user, profile);
  applyCoursePortal(selectedCourse(profile, allowed), auth, user, db, allowed, profile);
  window.__scrutinyStudentContext = {
    activeCourse: selectedCourse(profile, allowed),
    availableCourses: [...allowed],
    profile: { neetExamYear: profile.courseEntitlements?.neet?.neetExamYear || profile.neetExamYear || null },
  };
  window.dispatchEvent(new CustomEvent("scrutiny:dashboard-context", { detail: window.__scrutinyStudentContext }));
  document.documentElement.classList.remove("auth-check");
  try {
    await import("./leaderboard.js");
  } catch (e) {
    console.error("Leaderboard module failed to load", e);
  }
}

setupResponsiveNavigation();
if (!configured) {
  console.error("Scrutiny Academy authentication is not configured.");
  location.replace("login.html?error=config");
} else {
  const app = initializeApp(firebaseConfig),
    auth = getAuth(app),
    db = getFirestore(app);
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      location.replace("login.html");
      return;
    }
    const admin = SCRUTINY_ADMIN_EMAILS.map((x) => x.toLowerCase()).includes(
      (user.email || "").toLowerCase(),
    );
    let founderAccess = admin;
    if (!founderAccess) {
      try {
        const token = await getIdTokenResult(user, true);
        founderAccess = token.claims.founder === true;
      } catch (error) {
        console.warn("Founder access claim could not be checked", error);
      }
    }
    if (founderAccess) {
      let founderProfile = {};
      try {
        const founderSnap = await getDoc(doc(db, "students", user.uid));
        if (founderSnap.exists()) founderProfile = founderSnap.data();
      } catch (error) {
        console.warn("Founder profile could not be loaded; continuing with founder access", error);
      }
      await openPlatform(auth, user, { ...founderProfile, accessStatus: "active", founderAccess: true }, db);
      return;
    }
    try {
      const snap = await getDoc(doc(db, "students", user.uid));
      if (!snap.exists() || snap.data().accessStatus !== "active") {
        location.replace("payment.html");
        return;
      }
      await openPlatform(auth, user, snap.data(), db);
    } catch (error) {
      console.error("Scrutiny Academy access check failed:", error);
      location.replace("payment.html");
    }
  });
}
