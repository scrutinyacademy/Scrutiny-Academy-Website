import { firebaseConfig, SCRUTINY_ADMIN_EMAILS } from "./firebase-config.js";
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
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const configured =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "REPLACE_ME" &&
  firebaseConfig.projectId !== "REPLACE_ME";

function addAccountControls(auth, user) {
  if (document.getElementById("platformLogout")) return;
  const nav = document.getElementById("mainNav");
  if (!nav) return;
  const account = document.createElement("div");
  account.className = "platform-account";
  account.style.cssText =
    "display:flex;align-items:center;gap:8px;margin-left:8px;";
  const identity = document.createElement("span");
  identity.className = "platform-user";
  identity.textContent =
    user.displayName || (user.email || "Student").split("@")[0] || "Student";
  identity.title = user.email || "";
  identity.style.cssText =
    "font-size:12px;font-weight:700;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
  const logout = document.createElement("button");
  logout.id = "platformLogout";
  logout.type = "button";
  logout.textContent = "Logout";
  logout.setAttribute("aria-label", "Logout of Scrutiny Academy");
  logout.style.cssText =
    "appearance:none;border:1px solid #cbd7e8;background:#fff;color:#102a56;border-radius:10px;padding:9px 14px;font:inherit;font-size:13px;font-weight:800;cursor:pointer;white-space:nowrap;";
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
  account.append(identity, logout);
  nav.appendChild(account);
}
async function openPlatform(auth, user) {
  addAccountControls(auth, user);
  document.documentElement.classList.remove("auth-check");
  try {
    await import("./leaderboard.js");
  } catch (e) {
    console.error("Leaderboard module failed to load", e);
  }
}
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
    if (admin) {
      await openPlatform(auth, user);
      return;
    }
    try {
      const snap = await getDoc(doc(db, "students", user.uid));
      if (!snap.exists() || snap.data().accessStatus !== "active") {
        location.replace("payment.html");
        return;
      }
      await openPlatform(auth, user);
    } catch (error) {
      console.error("Scrutiny Academy access check failed:", error);
      location.replace("payment.html");
    }
  });
}
