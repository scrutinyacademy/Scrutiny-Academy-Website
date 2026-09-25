import { firebaseConfig } from "./firebase-config.js";
import { COURSE_CATALOG, currentCoursePrice, courseValidity, entitledCourses } from "./course-catalog.js";
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
let latestPurchase = null;
const query = new URLSearchParams(location.search);
let purchaseCourseId = COURSE_CATALOG[query.get("course")] ? query.get("course") : null;
let purchaseNeetYear = ["2027", "2028"].includes(query.get("exam")) ? query.get("exam") : "";

function hasPurchasedCourse(profile = {}) {
  return entitledCourses(profile).includes(purchaseCourseId);
}

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
    `<button class="primary" id="payBtn" type="button">PAY ₹${currentCoursePrice(purchaseCourseId) ?? "—"} & UNLOCK THIS COURSE</button>`;
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
  purchaseCourseId ||= currentProfile.requestedCourse || currentProfile.activeCourse;
  if (purchaseCourseId === "neet") purchaseNeetYear ||= String(currentProfile.neetExamYear || "");
  const courseId = purchaseCourseId;
  const course = COURSE_CATALOG[courseId];
  const price = currentCoursePrice(courseId);
  if (course) {
    $("paymentPrice").textContent = `₹${price}`;
    $("paymentCourseName").textContent = course.name;
    $("paymentIncludes").textContent = `Includes: ${course.includes.join(" • ")}`;
    $("paymentValidity").textContent = courseValidity(courseId, purchaseNeetYear) || "Choose your NEET exam year below.";
    const yearWrap = $("paymentNeetYearWrap");
    if (yearWrap) {
      yearWrap.hidden = courseId !== "neet";
      $("paymentNeetYear").value = purchaseNeetYear;
    }
  }
  const active = hasPurchasedCourse(currentProfile);
  const pill = $("statusPill");
  pill.className = `status-pill ${active ? "active" : "pending"}`;

  if (active) {
    pill.textContent = "COURSE UNLOCKED";
    $("statusText").textContent =
      `${course?.shortName || "This course"} is already included in your account.`;
    showDashboardButton();
    return;
  }

  pill.textContent = "PAYMENT REQUIRED";
  $("statusText").textContent =
    `Complete the ₹${price} Razorpay payment for ${course?.shortName || "your selected course"}. Only this course unlocks after secure verification.`;
  showPayButton();
}

function purchaseMessage(purchase) {
  const features = purchase.features.map((item) => `• ${item}`).join("\n");
  return `Enrollment confirmed\n\nCongratulations! Your ${purchase.courseName} course is unlocked.\n\nHere’s everything included in your course:\n${features}\n\nStudent: ${purchase.studentName}\nCourse: ${purchase.courseName}\nAmount paid: ₹${purchase.amount}\nPayment ID: ${purchase.paymentId}\nPayment status: Successful`;
}

function showPurchaseSuccess(purchase) {
  latestPurchase = purchase;
  $("successStudentName").textContent = purchase.studentName;
  $("successCourseHeading").textContent = `Congratulations! Your ${purchase.courseName} course is unlocked.`;
  $("successFeatures").innerHTML = purchase.features.map((item) => `<li>${item}</li>`).join("");
  $("detailStudent").textContent = purchase.studentName;
  $("detailCourse").textContent = purchase.courseName;
  $("detailAmount").textContent = `₹${purchase.amount}`;
  $("detailPaymentId").textContent = purchase.paymentId;
  $("purchaseSuccess").hidden = false;
  $("purchaseSuccess").scrollIntoView({ behavior: "smooth", block: "start" });
}

$("copyCourseMessage").onclick = async () => {
  if (!latestPurchase) return;
  try {
    await navigator.clipboard.writeText(purchaseMessage(latestPurchase));
    $("copyCourseMessage").textContent = "COPIED ✓";
  } catch {
    message("Could not copy automatically. Please select and copy the purchase details.", "error");
  }
};

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
        accessPrice: null,
        paymentStatus: "not_submitted",
        requestedCourse: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(studentRef, profile);
    }
    purchaseCourseId ||= profile.requestedCourse || profile.activeCourse;
    if (!COURSE_CATALOG[purchaseCourseId]) throw new Error("No valid course was selected.");
    if (purchaseCourseId === "neet") purchaseNeetYear ||= String(profile.neetExamYear || "");
    $("studentName").textContent = profile.name
      ? `Hi, ${profile.name}`
      : "Student Access";
    renderStatus(profile);
    if (!hasPurchasedCourse(profile) && !user.emailVerified) {
      $("statusPill").textContent = "EMAIL VERIFICATION REQUIRED";
      $("statusText").textContent =
        "Open the verification link sent to your email before paying.";
      showVerificationActions();
    }
    message("");

    if (!hasPurchasedCourse(profile)) {
      try {
        const { data: synced } = await syncPayment({ courseId: purchaseCourseId });
        if (synced.active) {
          message(
            "Your completed payment was verified. Access is now active.",
            "success",
          );
          currentProfile.courseEntitlements = { ...(currentProfile.courseEntitlements || {}), [purchaseCourseId]: { status: "active" } };
          renderStatus(currentProfile);
          if (synced.purchase) showPurchaseSuccess(synced.purchase);
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
  if (!currentUser || hasPurchasedCourse(currentProfile)) return;
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
  if (purchaseCourseId === "neet" && !["2027", "2028"].includes(purchaseNeetYear)) {
    message("Choose whether you are preparing for NEET-UG 2027 or 2028.", "error");
    $("paymentNeetYear")?.focus();
    return;
  }

  const button = $("payBtn");
  if (!button) return;
  button.disabled = true;
  message("Preparing secure Razorpay checkout…");

  try {
    const { data: order } = await createOrder({ courseId: purchaseCourseId, neetExamYear: purchaseNeetYear || null });
    if (order?.active) {
      message("Your access is already active.", "success");
      currentProfile.courseEntitlements = { ...(currentProfile.courseEntitlements || {}), [purchaseCourseId]: { status: "active" } };
      renderStatus(currentProfile);
      return;
    }

    const checkout = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: "Scrutiny Academy",
      description: order.courseName || "Scrutiny Academy course access",
      image: new URL("assets/logo.svg", location.href).href,
      prefill: {
        name: currentProfile?.name || currentUser.displayName || "",
        email: currentUser.email || "",
        contact: currentProfile?.phone || "",
      },
      notes: { product: order.courseId || currentProfile?.requestedCourse || "course_access" },
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
          const { data } = await verifyPayment(result);
          message("Payment verified. Your access is now active.", "success");
          currentProfile.courseEntitlements = { ...(currentProfile.courseEntitlements || {}), [purchaseCourseId]: { status: "active" } };
          renderStatus(currentProfile);
          if (data.purchase) showPurchaseSuccess(data.purchase);
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

$("paymentNeetYear")?.addEventListener("change", (event) => {
  purchaseNeetYear = event.target.value;
  $("paymentValidity").textContent = courseValidity("neet", purchaseNeetYear);
});
