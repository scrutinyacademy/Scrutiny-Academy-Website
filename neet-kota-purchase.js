import { getApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-functions.js";

const app = getApp();
const auth = getAuth(app);
const functions = getFunctions(app, "asia-south1");
const createOrder = httpsCallable(functions, "createKotaChapterOrder");
const verifyPayment = httpsCallable(functions, "verifyRazorpayPayment");
const syncPayment = httpsCallable(functions, "syncKotaChapterPayment");

function checkoutButton() { return document.getElementById("checkoutChapters"); }
function setButton(text, disabled = false) {
  const button = checkoutButton();
  if (!button) return;
  button.textContent = text;
  button.disabled = disabled;
}

addEventListener("scrutiny:kota-checkout", async (event) => {
  const chapterIds = [...new Set(event.detail?.chapterIds || [])];
  if (!auth.currentUser || !chapterIds.length) return;
  if (typeof window.Razorpay !== "function") {
    alert("Razorpay Checkout could not load. Check your connection and try again.");
    return;
  }
  setButton("PREPARING SECURE PAYMENT…", true);
  try {
    try {
      const { data: synced } = await syncPayment({ chapterIds });
      if (synced?.active) { location.reload(); return; }
    } catch (error) {
      console.warn("KOTA payment reconciliation unavailable", error);
    }
    const { data: order } = await createOrder({ chapterIds });
    if (order?.active) { location.reload(); return; }
    const context = window.__scrutinyStudentContext?.profile || {};
    const checkout = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: "Scrutiny Academy",
      description: order.productName || "KOTA Level Biology chapters",
      image: new URL("assets/logo.svg", location.href).href,
      prefill: { name: context.name || "", email: context.email || "", contact: context.phone || "" },
      notes: { product: "kota_biology_chapters", chapters: order.chapterIds.join(",") },
      theme: { color: "#0c7b60" },
      modal: { ondismiss: () => setButton("PAY & UNLOCK →", false) },
      handler: async (result) => {
        setButton("VERIFYING PAYMENT…", true);
        try {
          await verifyPayment(result);
          setButton("UNLOCKED ✓", true);
          setTimeout(() => location.reload(), 700);
        } catch (error) {
          console.error("KOTA payment verification failed", error);
          alert("Your payment is still being confirmed. Do not pay again—tap Pay & Unlock once more shortly to restore access automatically.");
          setButton("CHECK PAYMENT STATUS", false);
        }
      },
    });
    checkout.on("payment.failed", (failure) => {
      console.error("KOTA payment failed", failure.error?.code);
      alert(failure.error?.description || "Payment failed. No chapters were unlocked.");
      setButton("PAY & UNLOCK →", false);
    });
    checkout.open();
  } catch (error) {
    console.error("Could not start KOTA chapter checkout", error);
    alert(error?.message || "Could not start secure checkout. Please try again.");
    setButton("PAY & UNLOCK →", false);
  }
});
