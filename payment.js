import { firebaseConfig, SCRUTINY_ACCESS_PRICE } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app, "asia-south1");
const createOrder = httpsCallable(functions, "createRazorpayOrder");
const verifyPayment = httpsCallable(functions, "verifyRazorpayPayment");
const syncPayment = httpsCallable(functions, "syncRazorpayPayment");
const $ = (id) => document.getElementById(id);
const message = (text, kind = "") => {
  const element = $("paymentMessage");
  element.textContent = text;
  element.className = `message ${kind}`;
};

let currentUser = null;
let currentProfile = null;

function showDashboardButton() {
  const actions = $("paymentActions");
  actions.style.display = "block";
  actions.innerHTML =
    '<button class="primary" id="dashboardBtn" type="button">OPEN STUDENT DASHBOARD</button>';
  $("dashboardBtn").onclick = () => {
    location.href = "student.html";
  };
}

function showPayButton() {
  const actions = $("paymentActions");
  actions.style.display = "block";
  actions.innerHTML =
    '<button class="primary" id="payBtn" type="button">PAY ₹99 & UNLOCK ACCESS</button>';
  $("payBtn").onclick = startCheckout;
}

function showVerificationActions() {
  const actions = $("paymentActions");
  actions.style.display = "grid";
  actions.style.gap = "9px";
  actions.innerHTML =
    '<button class="primary" id="verifiedBtn" type="button">I VERIFIED MY EMAIL</button><button class="ghost" id="resendVerificationBtn" type="button">RESEND VERIFICATION EMAIL</button>';
  $("verifiedBtn").onclick = async () => {
    message("Checking your email verification…");
    await currentUser.reload();
    currentUser = auth.currentUser;
    if (currentUser?.emailVerified) {
      message(
        "Email verified. You can now continue to secure payment.",
        "success",
      );
      renderStatus(currentProfile || {});
    } else {
      message(
        "Email is not verified yet. Open the verification link sent to your inbox.",
        "error",
      );
    }
  };
  $("resendVerificationBtn").onclick = async () => {
    try {
      await sendEmailVerification(currentUser);
      message(
        "A new verification email was sent. Check Inbox and Spam.",
        "success",
      );
    } catch (error) {
      message("Could not resend yet. Wait briefly and try again.", "error");
    }
  };
}

function renderStatus(profile) {
  currentProfile = { ...(currentProfile || {}), ...profile };
  const status = currentProfile.accessStatus || "pending";
  const pill = $("statusPill");
  pill.className = `status-pill ${status === "active" ? "active" : "pending"}`;

  if (status === "active") {
    pill.textContent = "ACCESS ACTIVE";
    $("statusText").textContent =
      "Payment verified. Your Scrutiny Academy access is active.";
    showDashboardButton();
    return;
  }

  pill.textContent =
    currentProfile.paymentStatus === "created"
      ? "CHECKOUT READY"
      : "PAYMENT REQUIRED";
  $("statusText").textContent =
    "Complete the ₹99 Razorpay payment. Access unlocks automatically after secure verification.";
  showPayButton();
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.replace("login.html");
    return;
  }
  currentUser = user;
  try {
    const studentRef = doc(db, "students", user.uid);
    const snapshot = await getDoc(studentRef);
    let profile;
    if (snapshot.exists()) {
      profile = snapshot.data();
    } else {
      profile = {
        uid: user.uid,
        name:
          user.displayName ||
          (user.email ? user.email.split("@")[0] : "Student"),
        phone: "",
        email: user.email || "",
        role: "student",
        accessStatus: "pending",
        accessPrice: SCRUTINY_ACCESS_PRICE,
        paymentStatus: "not_submitted",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(studentRef, profile);
    }
    $("studentName").textContent = profile.name
      ? `Hi, ${profile.name}`
      : "Student Access";
    renderStatus(profile);
    if (profile.accessStatus !== "active" && !user.emailVerified) {
      $("statusPill").textContent = "EMAIL VERIFICATION REQUIRED";
      $("statusText").textContent =
        "Open the verification link sent to your email before paying.";
      showVerificationActions();
    }
    message("");

    if (profile.accessStatus !== "active") {
      try {
        const { data: synced } = await syncPayment();
        if (synced.active) {
          message(
            "Your completed payment was verified. Access is now active.",
            "success",
          );
          renderStatus({ accessStatus: "active", paymentStatus: "verified" });
        }
      } catch (syncError) {
        console.warn("Payment reconciliation unavailable:", syncError);
      }
    }
  } catch (error) {
    console.error("Student profile load failed:", error);
    $("statusText").textContent =
      "We could not load your student profile. Please refresh or contact support.";
    $("statusPill").textContent = "PROFILE ERROR";
    $("statusPill").className = "status-pill rejected";
    $("paymentActions").style.display = "none";
    message(
      "Your account is signed in, but its profile could not be loaded.",
      "error",
    );
  }
});

async function startCheckout() {
  if (!currentUser || currentProfile?.accessStatus === "active") return;
  await currentUser.reload();
  currentUser = auth.currentUser;
  if (!currentUser?.emailVerified) {
    message("Verify your email address before starting payment.", "error");
    showVerificationActions();
    return;
  }
  if (typeof window.Razorpay !== "function") {
    message(
      "Razorpay Checkout could not load. Check your connection and try again.",
      "error",
    );
    return;
  }

  const button = $("payBtn");
  if (!button) return;
  button.disabled = true;
  message("Preparing secure Razorpay checkout…");

  try {
    const { data: order } = await createOrder();
    if (order?.active) {
      message("Your access is already active.", "success");
      renderStatus({ accessStatus: "active", paymentStatus: "verified" });
      return;
    }

    const checkout = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: "Scrutiny Academy",
      description: "One-time student access",
      image: new URL("assets/logo.svg", location.href).href,
      prefill: {
        name: currentProfile?.name || currentUser.displayName || "",
        email: currentUser.email || "",
        contact: currentProfile?.phone || "",
      },
      notes: { product: "scrutiny_academy_access" },
      theme: { color: "#102a56" },
      modal: {
        ondismiss: () => {
          button.disabled = false;
          message("Checkout closed. Access was not changed.");
        },
      },
      handler: async (result) => {
        message("Payment received. Verifying securely…");
        try {
          await verifyPayment(result);
          message("Payment verified. Your access is now active.", "success");
          renderStatus({ accessStatus: "active", paymentStatus: "verified" });
        } catch (error) {
          console.error("Payment verification failed:", error);
          message(
            "Payment confirmation is still processing. Do not pay again. Refresh this page shortly.",
            "error",
          );
          button.disabled = false;
        }
      },
    });

    checkout.on("payment.failed", (failure) => {
      console.error("Razorpay payment failed:", failure.error?.code);
      message(
        failure.error?.description ||
          "Payment failed. No access change was made.",
        "error",
      );
      button.disabled = false;
    });
    checkout.open();
  } catch (error) {
    console.error("Could not start Razorpay Checkout:", error);
    const code = error?.code || "";
    const text = code.includes("not-found")
      ? "Payment service is not deployed yet. Please contact scrutinyacademy@gmail.com."
      : error?.message || "Could not start secure checkout. Please try again.";
    message(text, "error");
    button.disabled = false;
  }
}

$("logoutBtn").onclick = async () => {
  await signOut(auth);
  location.replace("login.html");
};
