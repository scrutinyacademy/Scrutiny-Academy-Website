(() => {
  // Planning target only; replace when NTA announces the official 2028 date.
  const target = new Date("2028-05-07T14:00:00+05:30").getTime();
  let interval = null;
  let context = null;
  function remove() {
    clearInterval(interval);
    interval = null;
    document.getElementById("neet2028Countdown")?.remove();
  }
  function mount(detail = {}) {
    context = detail;
    const course = detail.activeCourse || document.documentElement.dataset.course;
    const eligible = (detail.availableCourses || []).includes("neet") && course === "neet";
    const logout = document.getElementById("platformLogout") || document.getElementById("logoutBtn");
    if (!eligible || !logout) { remove(); return; }
    if (document.getElementById("neet2028Countdown")) return;
    if (!document.getElementById("neetCountdownStyle")) {
      const style = document.createElement("style");
      style.id = "neetCountdownStyle";
      style.textContent = '#neet2028Countdown{display:grid;gap:2px;flex-shrink:0;padding:7px 10px;border:1px solid #dbe7f2;border-radius:10px;background:#f2f8ff;color:#102a56;font-family:system-ui,sans-serif;text-align:center}#neet2028Countdown .countdown-title{font-size:9px;font-weight:800;letter-spacing:.06em}#neet2028Countdown .countdown-units{display:flex;gap:7px}#neet2028Countdown .countdown-unit{display:grid;gap:0}#neet2028Countdown b{font-size:15px;line-height:1.15;font-variant-numeric:tabular-nums}#neet2028Countdown small{font-size:8px;color:#536781}#neet2028Countdown .countdown-note{font-size:7px;color:#69788e}.header-session-actions,.student-head-actions{flex-wrap:wrap;align-items:center}@media(max-width:600px){#neet2028Countdown{padding:5px 7px}#neet2028Countdown b{font-size:12px}#neet2028Countdown .countdown-units{gap:5px}}';
      document.head.appendChild(style);
    }
    const element = document.createElement("aside");
    element.id = "neet2028Countdown";
    element.setAttribute("aria-label", "NEET UG 2028 countdown to provisional preparation target");
    element.title = "Provisional preparation target: 7 May 2028, 2:00 PM IST. Official NTA exam date is awaited.";
    element.innerHTML = '<span class="countdown-title">NEET UG 2028</span><div class="countdown-units">'+['Days','Hours','Minutes','Seconds'].map((label, i)=>`<span class="countdown-unit"><b data-unit="${i}">00</b><small>${label}</small></span>`).join('')+'</div><small class="countdown-note">7 May · provisional target</small>';
    logout.before(element);
    const update = () => {
      const seconds = Math.max(0, Math.floor((target - Date.now()) / 1000));
      const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
      element.querySelectorAll('[data-unit]').forEach((unit, i) => { unit.textContent = String(values[i]).padStart(2, '0'); });
      if (!seconds) { clearInterval(interval); interval = null; }
    };
    update();
    if (Date.now() < target) interval = setInterval(update, 1000);
  }
  addEventListener("scrutiny:dashboard-context", (event) => mount(event.detail));
  addEventListener("scrutiny:student-changed", () => { context = null; remove(); });
  addEventListener("pagehide", () => { clearInterval(interval); interval = null; });
  addEventListener("pageshow", () => { if (context) { remove(); mount(context); } });
  if (window.__scrutinyStudentContext) mount(window.__scrutinyStudentContext);
})();
