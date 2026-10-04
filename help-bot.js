(() => {
  if (document.getElementById("scrutinyHelpBot")) return;

  const supportNumber = "919052389200";
  const supportUrl = (topic = "I need help with my course") =>
    `https://wa.me/${supportNumber}?text=${encodeURIComponent(`Hi Scrutiny Academy, ${topic}. My registered email is: `)}`;

  const neetPriceAnswer = () => {
    const offerEnds = new Date("2026-10-05T18:29:59Z");
    return new Date() <= offerEnds
      ? "The NEET-UG course is ₹99 until 5 October 2026. From 6 October 2026, the price becomes ₹499. You can choose NEET 2027 or NEET 2028 while registering."
      : "The NEET-UG course price is ₹499. You can choose NEET 2027 or NEET 2028 while registering.";
  };

  const faq = [
    { id: "login", keys: ["login", "log in", "sign in", "password", "incorrect password", "cannot login", "can't login"], answer: "Use the same email and password you used while registering. If the password is forgotten, enter your email on the Login tab and tap “Forgot password?”. Also check Gmail Spam or Promotions for the reset email." },
    { id: "forgot", keys: ["forgot password", "reset password", "password reset", "change password"], answer: "Open Student Login, enter your registered email, then tap “Forgot password?”. Open the reset link sent to Gmail. If it is not in Inbox, check Spam and Promotions." },
    { id: "verify", keys: ["verify", "verification", "email not received", "verification email", "spam", "promotions", "mail not", "link expired"], answer: "Email activation is not required. Register or log in, complete payment for your selected course and access it after payment confirmation." },
    { id: "register", keys: ["register", "registration", "create account", "sign up", "new account"], answer: "Choose your course, enter your real name, mobile number, email and a password of at least 8 characters. After creating the account, verify your email before payment." },
    { id: "payment", keys: ["payment", "pay", "upi", "razorpay", "card", "netbanking", "google pay", "phonepe"], answer: "Payments are completed securely through Razorpay using the methods shown there, such as UPI, cards or netbanking. No email activation is required. Never pay twice if one payment is already processing." },
    { id: "debited", keys: ["debited", "money deducted", "charged", "paid but", "payment successful", "payment pending", "not unlocked", "amount deducted"], answer: "If money was deducted, do not pay again. Wait 2–5 minutes, reopen the Student Dashboard and check My Courses. If access is still locked, contact support with your registered email and Razorpay payment ID." },
    { id: "failed", keys: ["payment failed", "transaction failed", "upi failed", "payment cancelled"], answer: "If Razorpay shows Failed or Cancelled and no money was deducted, you can retry. If money was deducted, do not retry immediately—check your bank/Razorpay status and contact support with the payment ID." },
    { id: "invoice", keys: ["invoice", "receipt", "bill", "payment id"], answer: "After successful payment, the invoice is emailed to your registered address and is also available in your student account. Check Spam/Promotions if the email is not visible." },
    { id: "access", keys: ["access", "unlock", "locked", "course not opening", "not opening", "current course", "my course"], answer: "Open Student Dashboard → My Courses and select the course marked Active. A successful payment unlocks only the course purchased. If your paid course remains locked, reopen the dashboard and contact support with the payment ID." },
    { id: "multiple", keys: ["other course", "multiple course", "switch course", "add course", "upgrade", "cross access"], answer: "Course access is separate. Buying one course does not unlock another. Open My Courses, choose the additional locked course and complete its one-time payment." },
    { id: "class10", keys: ["class 10", "10th", "ssc", "sa1", "sa-1", "telangana"], answer: "Class 10 SSC includes lectures, notes, revision sheets, flashcards and MCQs. The SA-1 Booster for Maths, Physical Science, Biology and Social is currently available free from the home page." },
    { id: "class11", keys: ["class 11", "11th", "first year", "ipe 1"], answer: "Class 11 Board Booster contains chapter-wise revision material plus VSAQ, SAQ and LAQ practice for Botany, Zoology, Physics and Chemistry." },
    { id: "class12", keys: ["class 12", "12th", "second year", "ipe 2"], answer: "Class 12 Board Booster provides board-focused revision sheets and VSAQ, SAQ and LAQ practice across the available subjects." },
    { id: "neet", keys: ["neet", "neet 2027", "neet 2028", "medical entrance", "ncert", "pyq", "mcq"], answer: () => `${neetPriceAnswer()} It includes NCERT-based Physics, Chemistry and Biology MCQs, PYQs, revision tools, NCERT search and mistake practice.` },
    { id: "mbbs", keys: ["mbbs", "medical college", "anatomy", "physiology", "pathology", "pharmacology"], answer: "The MBBS Complete Learning Course is ₹799 with lifetime access. It includes phase-wise learning resources across 19 MBBS subjects, clinical revision tools, MCQs, bookmarks and progress tracking." },
    { id: "price", keys: ["price", "fees", "cost", "how much", "₹", "rupees", "validity"], answer: () => `Current plans: Class 10 SSC ₹99, Class 11 ₹149, Class 12 ₹149 and MBBS ₹799 lifetime. ${neetPriceAnswer()} Each plan is a one-time payment for that course.` },
    { id: "content", keys: ["content", "study material", "notes", "revision sheet", "flashcard", "question", "lecture", "syllabus"], answer: "Open your Student Dashboard and select your active course. Available chapters and tools appear inside the course portal. Free SA-1 resources can be opened directly from the home page without payment." },
    { id: "progress", keys: ["progress", "score", "mistake", "bookmark", "incorrect", "result"], answer: "Your supported practice progress, bookmarked questions, scores and mistakes are stored in the Student Dashboard. Sign in with the same registered account and device/browser storage should not be cleared unnecessarily." },
    { id: "success", keys: ["today plan", "daily plan", "study plan", "mastery", "readiness", "revision radar", "target score", "weekly report"], answer: "Open your Student Dashboard to use Today’s Plan, Exam Readiness, Chapter Mastery Map, Revision Radar and Weekly Report. First set your target score, daily study time and preferred language; your plan then adapts using your real practice and mistake data." },
    { id: "browser", keys: ["technical", "error", "blank", "loading", "button", "not working", "mobile", "android", "iphone", "browser", "page"], answer: "First refresh the page, check your internet connection and reopen the site in the latest Chrome or Safari. If the issue continues, sign out and sign in again. When contacting support, include the page name and a screenshot of the error." },
    { id: "refund", keys: ["refund", "cancel", "cancellation", "return money"], answer: "Refund eligibility follows the Refund Policy linked in the website footer. For a payment-specific review, contact support with your registered email and Razorpay payment ID." },
    { id: "contact", keys: ["contact", "support", "human", "talk", "whatsapp", "help desk", "founder"], answer: "You can contact the Scrutiny Academy Help Desk on WhatsApp. Please share your registered email, selected course, a short description of the issue and payment ID only when relevant." },
  ];

  const categoryReplies = {
    account: { text: "What account issue are you facing?", options: [["I can’t log in", "login"], ["Forgot password", "forgot"], ["Create an account", "register"], ["Do I need to activate my email?", "verify"]] },
    email: { text: "Choose the email issue:", options: [["Verification email missing", "verify"], ["Verification link expired", "verify"], ["Password reset email missing", "forgot"]] },
    payment: { text: "What happened with the payment?", options: [["Money deducted, course locked", "debited"], ["Payment failed", "failed"], ["How can I pay?", "payment"], ["Need invoice/receipt", "invoice"]] },
    course: { text: "Choose your course-access issue:", options: [["Paid course is locked", "access"], ["Buy another course", "multiple"], ["Course prices & validity", "price"], ["Find study material", "content"]] },
    studies: { text: "Which study section do you need help with?", options: [["Class 8 Telangana SSC", "class8"], ["Class 10 SSC / SA-1", "class10"], ["Class 11 Boards", "class11"], ["Class 12 Boards", "class12"], ["NEET-UG", "neet"], ["IIT-JEE", "jee"], ["MBBS", "mbbs"]] },
    technical: { text: faq.find((item) => item.id === "browser").answer, options: [["Paid course still locked", "access"], ["Contact support", "contact"]] },
  };

  const style = document.createElement("style");
  style.textContent = `
    .scrutiny-help-launcher{position:fixed;right:max(18px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom));z-index:9998;border:0;border-radius:999px;background:linear-gradient(135deg,#073c79,#087ed1);color:#fff;box-shadow:0 14px 34px rgba(3,56,116,.34);min-height:56px;padding:0 18px;display:flex;align-items:center;gap:10px;font:800 14px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer}.scrutiny-help-launcher:hover{transform:translateY(-2px)}.scrutiny-help-launcher svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2}.scrutiny-help-launcher .help-pulse{position:absolute;right:1px;top:1px;width:12px;height:12px;border:2px solid #fff;border-radius:50%;background:#24c875}
    .scrutiny-help-panel{position:fixed;right:max(18px,env(safe-area-inset-right));bottom:86px;z-index:9999;width:min(390px,calc(100vw - 24px));height:min(620px,calc(100dvh - 112px));display:none;grid-template-rows:auto 1fr auto;background:#fff;border:1px solid #d9e4ef;border-radius:22px;overflow:hidden;box-shadow:0 24px 70px rgba(9,42,82,.28);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#172b45}.scrutiny-help-panel.open{display:grid}.scrutiny-help-head{display:flex;align-items:center;gap:11px;padding:15px 16px;background:linear-gradient(135deg,#062f68,#087ccf);color:#fff}.scrutiny-help-avatar{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:#fff;color:#075faf;font-size:21px}.scrutiny-help-title{display:grid;gap:2px;flex:1}.scrutiny-help-title strong{font-size:15px}.scrutiny-help-title small{font-size:11px;color:#d9eeff}.scrutiny-help-close{border:0;background:rgba(255,255,255,.14);color:#fff;width:38px;height:38px;border-radius:50%;font-size:23px;cursor:pointer}.scrutiny-help-messages{overflow:auto;padding:16px;background:linear-gradient(180deg,#f4f9fd,#fff);scroll-behavior:smooth}.scrutiny-help-message{max-width:88%;margin:0 0 10px;padding:11px 13px;border-radius:15px;font-size:13px;line-height:1.5;white-space:pre-line;box-shadow:0 5px 16px rgba(24,61,99,.06)}.scrutiny-help-message.bot{background:#fff;border:1px solid #dce8f2;border-top-left-radius:5px}.scrutiny-help-message.user{margin-left:auto;background:#0a6fc0;color:#fff;border-top-right-radius:5px}.scrutiny-help-options{display:flex;flex-wrap:wrap;gap:7px;margin:2px 0 14px}.scrutiny-help-option{border:1px solid #83b9e2;background:#edf7ff;color:#07589d;border-radius:999px;padding:9px 11px;font:750 12px/1.2 inherit;cursor:pointer}.scrutiny-help-option:hover,.scrutiny-help-option:focus-visible{background:#dcefff;outline:2px solid #79b9ea;outline-offset:1px}.scrutiny-help-link{display:inline-flex;margin-top:9px;color:#075faf;font-weight:850;text-decoration:none}.scrutiny-help-home{border:0;background:transparent;color:#61748a;font:750 12px/1 inherit;padding:5px 0;cursor:pointer}.scrutiny-help-form{display:grid;grid-template-columns:1fr 44px;gap:8px;padding:12px;border-top:1px solid #dce6ef;background:#fff}.scrutiny-help-input{min-width:0;border:1px solid #becddd;border-radius:12px;padding:11px 12px;font:14px/1.3 inherit;outline:none}.scrutiny-help-input:focus{border-color:#238bd7;box-shadow:0 0 0 3px rgba(35,139,215,.13)}.scrutiny-help-send{border:0;border-radius:12px;background:#075faf;color:#fff;font-size:19px;cursor:pointer}.scrutiny-help-footnote{grid-column:1/-1;text-align:center;color:#718096;font-size:10px;line-height:1.35}
    @media(max-width:560px){.scrutiny-help-launcher{right:12px;bottom:max(12px,env(safe-area-inset-bottom));min-height:52px;padding:0 15px}.scrutiny-help-panel{right:8px;bottom:74px;width:calc(100vw - 16px);height:min(650px,calc(100dvh - 88px));border-radius:18px}.scrutiny-help-input{font-size:16px}}
    @media(prefers-reduced-motion:reduce){.scrutiny-help-messages{scroll-behavior:auto}.scrutiny-help-launcher:hover{transform:none}}
  `;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.id = "scrutinyHelpBot";
  root.innerHTML = `
    <button class="scrutiny-help-launcher" type="button" aria-label="Open Scrutiny Help" aria-expanded="false">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h14v11H9l-4 3V5Z"/><path d="M9 9h6M9 12h4"/></svg><span>Need Help?</span><i class="help-pulse" aria-hidden="true"></i>
    </button>
    <section class="scrutiny-help-panel" role="dialog" aria-label="Scrutiny Academy Help Assistant" aria-modal="false">
      <header class="scrutiny-help-head"><div class="scrutiny-help-avatar" aria-hidden="true">🎓</div><div class="scrutiny-help-title"><strong>Scrutiny Help</strong><small>Online now · Instant answers</small></div><button class="scrutiny-help-close" type="button" aria-label="Close help assistant">×</button></header>
      <div class="scrutiny-help-messages" role="log" aria-live="polite"></div>
      <form class="scrutiny-help-form"><input class="scrutiny-help-input" type="text" maxlength="240" autocomplete="off" placeholder="Type your question…" aria-label="Ask Scrutiny Help"/><button class="scrutiny-help-send" type="submit" aria-label="Send question">➤</button><div class="scrutiny-help-footnote">Instant FAQ assistant · Never share your password, OTP or card details</div></form>
    </section>`;
  document.body.appendChild(root);

  const launcher = root.querySelector(".scrutiny-help-launcher");
  const panel = root.querySelector(".scrutiny-help-panel");
  const closeButton = root.querySelector(".scrutiny-help-close");
  const messages = root.querySelector(".scrutiny-help-messages");
  const form = root.querySelector(".scrutiny-help-form");
  const input = root.querySelector(".scrutiny-help-input");
  let started = false;

  const scrollToLatest = () => { messages.scrollTop = messages.scrollHeight; };
  const addMessage = (text, who = "bot") => {
    const bubble = document.createElement("div");
    bubble.className = `scrutiny-help-message ${who}`;
    bubble.textContent = typeof text === "function" ? text() : text;
    messages.appendChild(bubble);
    scrollToLatest();
  };
  const addOptions = (options) => {
    const wrap = document.createElement("div");
    wrap.className = "scrutiny-help-options";
    options.forEach(([label, value]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "scrutiny-help-option";
      button.textContent = label;
      button.addEventListener("click", () => choose(label, value));
      wrap.appendChild(button);
    });
    messages.appendChild(wrap);
    scrollToLatest();
  };
  const addSupport = (topic) => {
    const link = document.createElement("a");
    link.className = "scrutiny-help-link";
    link.href = supportUrl(topic);
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Chat with Help Desk on WhatsApp";
    messages.appendChild(link);
    const home = document.createElement("button");
    home.type = "button";
    home.className = "scrutiny-help-home";
    home.textContent = "← Show all help topics";
    home.addEventListener("click", showMainChoices);
    messages.appendChild(home);
    scrollToLatest();
  };
  const mainOptions = [["My Study Plan", "success"], ["Account & Login", "account"], ["Email Verification", "email"], ["Payment Issue", "payment"], ["Course Access", "course"], ["Study Material", "studies"], ["Technical Issue", "technical"], ["Talk to Help Desk", "contact"]];
  function showMainChoices() {
    addMessage("What kind of issue are you facing? Choose an option or type your question below.");
    addOptions(mainOptions);
  }
  function showFaq(id) {
    const item = faq.find((entry) => entry.id === id);
    if (!item) return;
    addMessage(item.answer);
    if (["debited", "failed", "access", "refund", "contact", "browser"].includes(id)) addSupport(`I need help with ${id}`);
    else addOptions([["That solved it", "solved"], ["Ask another question", "home"], ["Still need help", "contact"]]);
  }
  function choose(label, value) {
    addMessage(label, "user");
    if (value === "solved") {
      addMessage("Glad I could help! You can open Scrutiny Help again anytime.");
      addOptions([["Ask another question", "home"]]);
      return;
    }
    if (value === "home") return showMainChoices();
    if (categoryReplies[value]) {
      addMessage(categoryReplies[value].text);
      addOptions(categoryReplies[value].options);
      return;
    }
    showFaq(value);
  }
  function findAnswer(query) {
    const normalized = query.toLowerCase().replace(/[^a-z0-9₹\s'-]/g, " ").replace(/\s+/g, " ").trim();
    let winner = null;
    let best = 0;
    faq.forEach((item) => {
      let score = 0;
      item.keys.forEach((key) => {
        if (normalized.includes(key)) score += key.includes(" ") ? 3 : 1;
      });
      if (score > best) { best = score; winner = item; }
    });
    return best > 0 ? winner : null;
  }
  function start() {
    if (started) return;
    started = true;
    addMessage("Hi! I’m the Scrutiny Academy Help Assistant 👋\nI can instantly help with account, registration, payment, course access and study-material questions.");
    showMainChoices();
  }
  function openPanel() {
    document.dispatchEvent(new CustomEvent("scrutiny:overlay-open", { detail: { source: "help" } }));
    panel.classList.add("open");
    launcher.setAttribute("aria-expanded", "true");
    launcher.querySelector(".help-pulse")?.remove();
    start();
    setTimeout(() => input.focus(), 0);
  }
  function closePanel() {
    panel.classList.remove("open");
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }
  launcher.addEventListener("click", () => panel.classList.contains("open") ? closePanel() : openPanel());
  closeButton.addEventListener("click", closePanel);
  document.addEventListener("scrutiny:overlay-open", (event) => { if (event.detail?.source !== "help" && panel.classList.contains("open")) closePanel(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && panel.classList.contains("open")) closePanel(); });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim();
    if (!query) return;
    input.value = "";
    addMessage(query, "user");
    const match = findAnswer(query);
    if (match) {
      addMessage(match.answer);
      addOptions([["That solved it", "solved"], ["Ask another question", "home"], ["Still need help", "contact"]]);
    } else {
      addMessage("I couldn’t identify that issue exactly. Please choose the closest help topic below, or contact the Help Desk for a personal answer.");
      addOptions(mainOptions.slice(0, 6));
      addSupport(`I need help with: ${query}`);
    }
  });
})();
