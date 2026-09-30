(() => {
  if (document.getElementById("scrutinyTodayGoal")) return;

  const STORE_KEY = "scrutiny_today_goal_v1";
  const dateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const readStore = () => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch { return {}; }
  };
  const saveStore = (store) => localStorage.setItem(STORE_KEY, JSON.stringify(store));
  const todayGoal = () => readStore()[dateKey()] || { text: "", complete: false };
  const friendly = (value = "Student") => String(value || "Student").trim().split(/\s+/)[0] || "Student";

  const style = document.createElement("style");
  style.textContent = `
    .scrutiny-goal-launcher{position:fixed;right:max(172px,calc(env(safe-area-inset-right) + 172px));bottom:max(18px,env(safe-area-inset-bottom));z-index:9997;min-height:56px;display:flex;align-items:center;gap:9px;border:0;border-radius:999px;padding:0 18px;background:linear-gradient(135deg,#8f3ed7,#5c46d8);color:#fff;box-shadow:0 14px 34px rgba(82,51,176,.3);font:800 14px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;cursor:pointer}.scrutiny-goal-launcher:hover{transform:translateY(-2px)}.scrutiny-goal-launcher svg{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:2}.scrutiny-goal-launcher i{position:absolute;right:1px;top:1px;width:12px;height:12px;border:2px solid #fff;border-radius:50%;background:#ffc83d}.scrutiny-goal-launcher.has-goal i{background:#35d68b}.scrutiny-goal-launcher.complete{background:linear-gradient(135deg,#08774c,#20a76c)}
    .scrutiny-goal-panel{position:fixed;right:max(18px,env(safe-area-inset-right));bottom:86px;z-index:9999;width:min(390px,calc(100vw - 24px));display:none;overflow:hidden;border:1px solid #ded8f3;border-radius:22px;background:#fff;color:#172b45;box-shadow:0 24px 70px rgba(35,25,92,.28);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.scrutiny-goal-panel.open{display:block}.scrutiny-goal-head{display:flex;align-items:center;gap:11px;padding:16px;background:linear-gradient(135deg,#6834b8,#4c64dc);color:#fff}.scrutiny-goal-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:14px;background:rgba(255,255,255,.18);font-size:22px}.scrutiny-goal-title{display:grid;gap:2px;flex:1}.scrutiny-goal-title strong{font-size:16px}.scrutiny-goal-title small{color:#ece8ff;font-size:11px}.scrutiny-goal-close{width:38px;height:38px;border:0;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;font-size:23px;cursor:pointer}.scrutiny-goal-body{display:grid;gap:13px;padding:17px;background:linear-gradient(180deg,#f8f5ff,#fff)}.scrutiny-goal-date{margin:0;color:#6f5bac;font-size:11px;font-weight:900;letter-spacing:.1em}.scrutiny-goal-current{display:grid;gap:6px;padding:14px;border:1px solid #e4def4;border-radius:15px;background:#fff}.scrutiny-goal-current strong{font-size:14px;line-height:1.4}.scrutiny-goal-current small{color:#718096}.scrutiny-goal-current.done strong{text-decoration:line-through;color:#667085}.scrutiny-goal-form{display:grid;gap:8px}.scrutiny-goal-form label{font-size:12px;font-weight:850}.scrutiny-goal-input{width:100%;min-height:78px;resize:none;border:1px solid #cfc5e9;border-radius:12px;padding:11px 12px;font:14px/1.45 inherit;outline:none}.scrutiny-goal-input:focus{border-color:#7956d8;box-shadow:0 0 0 3px rgba(121,86,216,.13)}.scrutiny-goal-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.scrutiny-goal-actions button{min-height:44px;border-radius:11px;padding:9px;border:1px solid #6f53d2;background:#fff;color:#6041be;font:850 12px/1.2 inherit;cursor:pointer}.scrutiny-goal-actions .save{border:0;background:linear-gradient(135deg,#7042ca,#5268df);color:#fff}.scrutiny-goal-actions button:disabled{opacity:.45;cursor:not-allowed}.scrutiny-goal-note{margin:0;color:#718096;font-size:10px;text-align:center}
    @media(max-width:560px){.scrutiny-goal-launcher{right:12px;bottom:max(76px,calc(env(safe-area-inset-bottom) + 76px));min-height:52px;padding:0 15px}.scrutiny-goal-panel{right:8px;bottom:138px;width:calc(100vw - 16px);border-radius:18px}.scrutiny-goal-input{font-size:16px}}
    @media(prefers-reduced-motion:reduce){.scrutiny-goal-launcher:hover{transform:none}}
  `;
  document.head.appendChild(style);

  const root = document.createElement("div");
  root.id = "scrutinyTodayGoal";
  root.innerHTML = `
    <button class="scrutiny-goal-launcher" type="button" aria-label="Open today's goal" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="m14.5 9.5 5-5M16 4.5h3.5V8"/></svg><span>Today’s Goal</span><i aria-hidden="true"></i></button>
    <section class="scrutiny-goal-panel" role="dialog" aria-label="Today's study goal" aria-modal="false">
      <header class="scrutiny-goal-head"><div class="scrutiny-goal-icon" aria-hidden="true">🎯</div><div class="scrutiny-goal-title"><strong>Today’s Goal</strong><small>One clear win for your study day</small></div><button class="scrutiny-goal-close" type="button" aria-label="Close today's goal">×</button></header>
      <div class="scrutiny-goal-body"><p class="scrutiny-goal-date"></p><div class="scrutiny-goal-current"><strong>No goal set yet.</strong><small>Set a realistic goal you can finish today.</small></div><form class="scrutiny-goal-form"><label for="scrutinyGoalInput">What do you want to complete today?</label><textarea class="scrutiny-goal-input" id="scrutinyGoalInput" maxlength="140" placeholder="Example: Complete 40 Biology MCQs and revise my mistakes"></textarea><div class="scrutiny-goal-actions"><button class="save" type="submit">SAVE MY GOAL</button><button class="complete" type="button">MARK COMPLETE ✓</button></div></form><p class="scrutiny-goal-note">Your goal resets each day and stays private on this device.</p></div>
    </section>`;
  document.body.appendChild(root);

  const launcher = root.querySelector(".scrutiny-goal-launcher");
  const panel = root.querySelector(".scrutiny-goal-panel");
  const close = root.querySelector(".scrutiny-goal-close");
  const current = root.querySelector(".scrutiny-goal-current");
  const input = root.querySelector(".scrutiny-goal-input");
  const form = root.querySelector(".scrutiny-goal-form");
  const complete = root.querySelector(".scrutiny-goal-actions .complete");
  const date = root.querySelector(".scrutiny-goal-date");
  let studentName = friendly(window.__scrutinyStudentContext?.profile?.name);

  function render() {
    const goal = todayGoal();
    date.textContent = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(new Date()).toUpperCase();
    current.classList.toggle("done", Boolean(goal.complete));
    current.querySelector("strong").textContent = goal.text || `What will make today successful, ${studentName}?`;
    current.querySelector("small").textContent = goal.text ? (goal.complete ? "Completed — excellent work!" : "Your focus for today") : "Set a realistic goal you can finish today.";
    input.value = goal.text || "";
    complete.disabled = !goal.text;
    complete.textContent = goal.complete ? "MARK ACTIVE AGAIN" : "MARK COMPLETE ✓";
    launcher.classList.toggle("has-goal", Boolean(goal.text));
    launcher.classList.toggle("complete", Boolean(goal.complete));
    launcher.setAttribute("aria-label", goal.text ? `Today's goal: ${goal.text}` : "Open today's goal");
  }

  function openPanel() {
    document.dispatchEvent(new CustomEvent("scrutiny:overlay-open", { detail: { source: "goal" } }));
    panel.classList.add("open");
    launcher.setAttribute("aria-expanded", "true");
    render();
    setTimeout(() => input.focus(), 0);
  }
  function closePanel() {
    panel.classList.remove("open");
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) { input.focus(); return; }
    const store = readStore();
    store[dateKey()] = { text: text.slice(0, 140), complete: false, updatedAt: new Date().toISOString() };
    saveStore(store);
    render();
    document.dispatchEvent(new CustomEvent("scrutiny:goal-updated", { detail: store[dateKey()] }));
  });
  complete.addEventListener("click", () => {
    const store = readStore();
    const goal = store[dateKey()];
    if (!goal?.text) return;
    goal.complete = !goal.complete;
    goal.updatedAt = new Date().toISOString();
    saveStore(store);
    render();
    document.dispatchEvent(new CustomEvent("scrutiny:goal-updated", { detail: goal }));
  });
  launcher.addEventListener("click", () => panel.classList.contains("open") ? closePanel() : openPanel());
  close.addEventListener("click", closePanel);
  document.addEventListener("scrutiny:dashboard-context", (event) => { studentName = friendly(event.detail?.profile?.name); render(); });
  document.addEventListener("scrutiny:overlay-open", (event) => { if (event.detail?.source !== "goal" && panel.classList.contains("open")) closePanel(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && panel.classList.contains("open")) closePanel(); });
  addEventListener("storage", (event) => { if (event.key === STORE_KEY) render(); });
  render();
})();
