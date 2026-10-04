(() => {
  const target = new Date("2028-05-07T14:00:00+05:30").getTime();
  let interval = null;
  function eligible(context = {}) {
    const year = String(context.profile?.neetExamYear || "");
    return year === "2028" && (context.availableCourses || []).includes("neet");
  }
  function mount(context) {
    if (!eligible(context) || document.getElementById("neet2028Countdown")) return;
    const element = document.createElement("aside");
    element.id = "neet2028Countdown";
    element.setAttribute("aria-label", "Countdown to NEET 2028 target date");
    element.innerHTML = '<span>NEET 2028</span><strong>Loading…</strong><small>7 MAY · 2:00 PM IST</small>';
    const style = document.createElement("style");
    style.textContent = '#neet2028Countdown{position:fixed;right:14px;bottom:14px;z-index:1000;min-width:190px;padding:12px 15px;border:1px solid rgba(184,237,84,.45);border-radius:14px;background:rgba(5,31,25,.94);box-shadow:0 16px 40px rgba(0,0,0,.25);backdrop-filter:blur(14px);color:white;font-family:system-ui,sans-serif;display:grid;gap:2px}#neet2028Countdown span{font-size:9px;letter-spacing:.17em;font-weight:800;color:#b8ed54}#neet2028Countdown strong{font-size:16px;letter-spacing:.02em}#neet2028Countdown small{font-size:8px;color:#9fbab1;letter-spacing:.08em}@media(max-width:600px){#neet2028Countdown{right:8px;bottom:8px;min-width:164px;padding:9px 11px}#neet2028Countdown strong{font-size:13px}}';
    document.head.appendChild(style);
    document.body.appendChild(element);
    const update = () => {
      const remaining = Math.max(0, target - Date.now());
      const days = Math.floor(remaining / 86400000);
      const hours = Math.floor(remaining % 86400000 / 3600000);
      const minutes = Math.floor(remaining % 3600000 / 60000);
      const seconds = Math.floor(remaining % 60000 / 1000);
      element.querySelector("strong").textContent = `${days}d ${String(hours).padStart(2,"0")}h ${String(minutes).padStart(2,"0")}m ${String(seconds).padStart(2,"0")}s`;
    };
    update();
    interval = setInterval(update, 1000);
  }
  addEventListener("scrutiny:dashboard-context", (event) => mount(event.detail));
  if (window.__scrutinyStudentContext) mount(window.__scrutinyStudentContext);
  addEventListener("pagehide", () => clearInterval(interval));
})();
