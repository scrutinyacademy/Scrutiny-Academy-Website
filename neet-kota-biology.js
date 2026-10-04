(() => {
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const state = { catalog: null, chapter: null, pool: [], questions: [], answers: [], index: 0, mode: "practice", started: 0, seconds: 0, limit: 0, timer: null, unlocked: new Set(), cart: new Set() };
  const formatTime = (seconds) => `${String(Math.floor(Math.max(0, seconds) / 60)).padStart(2, "0")}:${String(Math.max(0, seconds) % 60).padStart(2, "0")}`;
  const shuffled = (items) => [...items].sort(() => Math.random() - .5);

  async function boot() {
    try {
      const context = await studentContext();
      const unlocked = context.founderAccess || context.profile?.unlockedKotaChapters?.includes("*")
        ? ["*"] : (context.profile?.unlockedKotaChapters || []);
      state.unlocked = new Set(unlocked);
      state.catalog = await fetch("data/neet/kota-biology/catalog.json", { cache: "no-store" }).then((response) => {
        if (!response.ok) throw new Error("Question catalog unavailable");
        return response.json();
      });
      $("totalMcqs").textContent = state.catalog.totalQuestions.toLocaleString("en-IN");
      renderChapters();
      bind();
      const queryChapter = new URLSearchParams(location.search).get("chapter");
      if (queryChapter && state.catalog.chapters.some((item) => item.slug === queryChapter)) openSetup(queryChapter);
    } catch (error) {
      console.error(error);
      $("chapterGrid").innerHTML = '<p class="loading">The KOTA Biology vault could not load. Please refresh once.</p>';
    }
  }

  function studentContext() {
    if (window.__scrutinyStudentContext) return Promise.resolve(window.__scrutinyStudentContext);
    return new Promise((resolve) => addEventListener("scrutiny:dashboard-context", (event) => resolve(event.detail), { once: true }));
  }

  function owns(slug) { return state.unlocked.has("*") || state.unlocked.has(slug); }

  function renderChapters(filter = "") {
    const term = filter.trim().toLowerCase();
    const chapters = state.catalog.chapters.filter((item) => item.title.toLowerCase().includes(term));
    $("chapterGrid").innerHTML = chapters.map((chapter) => { const unlocked = owns(chapter.slug); const selected = state.cart.has(chapter.slug); return `<article class="chapter-card ${unlocked ? "unlocked" : "locked"} ${selected ? "selected" : ""}" data-card="${esc(chapter.slug)}"><span class="chapter-no">${unlocked ? "✓" : "🔒"}</span><div><div class="chapter-title-line"><h3>${esc(chapter.title)}</h3>${unlocked ? '<span class="owned-badge">UNLOCKED</span>' : '<span class="price-badge">₹9</span>'}</div><div class="chapter-meta"><span><b>${chapter.totalQuestions}</b> MCQs</span><span>Class ${chapter.classLevel}</span><span>${chapter.visualQuestions} visual/table questions</span></div></div>${unlocked ? `<button type="button" data-chapter="${esc(chapter.slug)}" aria-label="Open ${esc(chapter.title)}">→</button>` : `<label class="cart-check" aria-label="Add ${esc(chapter.title)} to cart"><input type="checkbox" data-cart="${esc(chapter.slug)}" ${selected ? "checked" : ""}><i>+</i></label>`}</article>`; }).join("") || '<p class="loading">No chapter matches that search.</p>';
    $("chapterGrid").querySelectorAll("[data-chapter]").forEach((button) => button.addEventListener("click", () => openSetup(button.dataset.chapter)));
    $("chapterGrid").querySelectorAll("[data-cart]").forEach((input) => input.addEventListener("change", () => toggleCart(input.dataset.cart, input.checked)));
    $("chapterGrid").querySelectorAll(".chapter-card.locked").forEach((card) => card.addEventListener("click", (event) => { if (event.target.closest(".cart-check")) return; const input = card.querySelector("[data-cart]"); input.checked = !input.checked; toggleCart(input.dataset.cart, input.checked); }));
  }

  function toggleCart(slug, selected) {
    if (selected) state.cart.add(slug); else state.cart.delete(slug);
    renderChapters($("chapterSearch").value);
    renderCart();
  }

  function renderCart() {
    const cart = $("chapterCart");
    const chapters = state.catalog.chapters.filter((chapter) => state.cart.has(chapter.slug));
    cart.hidden = !chapters.length;
    $("cartSummary").textContent = `${chapters.length} chapter${chapters.length === 1 ? "" : "s"} selected`;
    $("cartNames").textContent = chapters.map((chapter) => chapter.title).join(" • ");
    $("cartTotal").textContent = `₹${chapters.length * 9}`;
  }

  async function openSetup(slug = "all") {
    if (slug !== "all" && !owns(slug)) { toast("Add this chapter to your cart and unlock it for ₹9."); return; }
    if (slug === "all" && !state.catalog.chapters.some((chapter) => owns(chapter.slug))) { toast("Unlock at least one chapter to build a test."); return; }
    state.chapter = slug === "all" ? null : state.catalog.chapters.find((item) => item.slug === slug);
    $("setupTitle").textContent = state.chapter ? state.chapter.title : "Grand KOTA Biology Test";
    const unlockedChapters = state.catalog.chapters.filter((chapter) => owns(chapter.slug));
    const unlockedTotal = unlockedChapters.reduce((total, chapter) => total + chapter.totalQuestions, 0);
    $("setupMeta").textContent = state.chapter ? `${state.chapter.totalQuestions} MCQs · Class ${state.chapter.classLevel} · all three exercises` : `${unlockedTotal.toLocaleString("en-IN")} MCQs across ${unlockedChapters.length} unlocked chapter${unlockedChapters.length === 1 ? "" : "s"}`;
    $("exerciseSelect").disabled = !state.chapter;
    $("exerciseSelect").value = "all";
    updateCounts();
    $("setupDialog").showModal();
  }

  function availableCount() {
    if (!state.chapter) return state.catalog.chapters.filter((chapter) => owns(chapter.slug)).reduce((total, chapter) => total + chapter.totalQuestions, 0);
    const exercise = $("exerciseSelect").value;
    return exercise === "all" ? state.chapter.totalQuestions : state.chapter.exerciseCounts[exercise];
  }

  function updateCounts() {
    const available = availableCount();
    const common = [10, 20, 30, 45, 60, 90, 180].filter((value) => value < available);
    $("countSelect").innerHTML = [...new Set([...common, Math.min(available, 360), available])].sort((a, b) => a - b).map((value) => `<option value="${value}">${value === available ? `All ${value}` : value} questions</option>`).join("");
    $("countSelect").value = String(common.includes(45) ? 45 : Math.min(available, 30));
  }

  async function loadPool() {
    if (state.chapter) {
      const data = await fetch(state.chapter.file, { cache: "no-store" }).then((response) => response.json());
      return data.questions;
    }
    const available = state.catalog.chapters.filter((chapter) => owns(chapter.slug));
    const banks = await Promise.all(available.map((chapter) => fetch(chapter.file, { cache: "no-store" }).then((response) => response.json())));
    return banks.flatMap((bank) => bank.questions.map((question) => ({ ...question, chapterTitle: bank.title })));
  }

  async function startSession(event) {
    event.preventDefault();
    const submit = $("setupForm").querySelector('[type="submit"]');
    submit.disabled = true;
    submit.textContent = "PREPARING QUESTIONS…";
    try {
      state.pool = await loadPool();
      const exercise = $("exerciseSelect").value;
      if (exercise !== "all" && state.chapter) state.pool = state.pool.filter((question) => question.exercise === exercise);
      state.mode = $("modeSelect").value;
      state.questions = shuffled(state.pool).slice(0, Number($("countSelect").value));
      state.answers = Array(state.questions.length).fill(null);
      state.index = 0;
      state.seconds = 0;
      const pace = Number($("paceSelect").value);
      state.limit = state.mode === "test" && pace ? pace * state.questions.length : 0;
      state.started = Date.now();
      $("setupDialog").close();
      $("quizShell").hidden = false;
      document.body.style.overflow = "hidden";
      $("quizChapter").textContent = state.chapter?.title || "Grand KOTA Biology Test";
      $("quizMode").textContent = state.mode === "practice" ? "Practice · instant feedback" : "Timed test · answers locked";
      $("timerLabel").textContent = state.limit ? "TIME LEFT" : "ELAPSED";
      clearInterval(state.timer);
      state.timer = setInterval(tick, 1000);
      tick();
      renderQuestion();
    } catch (error) {
      console.error(error);
      toast("Questions could not load. Please try again.");
    } finally {
      submit.disabled = false;
      submit.textContent = "START SESSION →";
    }
  }

  function tick() {
    state.seconds = Math.floor((Date.now() - state.started) / 1000);
    const shown = state.limit ? Math.max(0, state.limit - state.seconds) : state.seconds;
    $("sessionTimer").textContent = formatTime(shown);
    const answered = state.answers.filter((answer) => answer !== null).length;
    const pace = answered ? Math.round(state.seconds / answered) : 0;
    $("paceReadout").textContent = `${answered} answered${pace ? ` · ${pace}s/MCQ` : ""}`;
    if (state.limit && shown === 0) finishSession(true);
  }

  function renderQuestion() {
    const question = state.questions[state.index];
    const chosen = state.answers[state.index];
    $("questionPosition").textContent = `Question ${state.index + 1} of ${state.questions.length}`;
    $("questionExercise").textContent = question.exerciseName;
    $("questionText").textContent = question.question;
    $("quizProgress").style.width = `${((state.index + 1) / state.questions.length) * 100}%`;
    const visual = $("visualFrame");
    visual.hidden = !question.image;
    if (question.image) { $("questionVisual").src = question.image; $("questionVisual").alt = `${question.question} — exact source diagram or table`; }
    const reveal = state.mode === "practice" && chosen !== null;
    $("optionList").innerHTML = question.options.map((option, index) => {
      const classes = ["option"];
      if (chosen === index) classes.push("selected");
      if (reveal && index === question.answer) classes.push("correct");
      if (reveal && chosen === index && index !== question.answer) classes.push("wrong");
      return `<button type="button" class="${classes.join(" ")}" data-option="${index}" ${reveal ? "disabled" : ""}><i>${String.fromCharCode(65 + index)}</i><span>${esc(option)}</span></button>`;
    }).join("");
    $("optionList").querySelectorAll("[data-option]").forEach((button) => button.addEventListener("click", () => choose(Number(button.dataset.option))));
    const feedback = $("answerFeedback");
    feedback.hidden = !reveal;
    if (reveal) {
      const correct = chosen === question.answer;
      feedback.className = `feedback ${correct ? "good" : "bad"}`;
      feedback.textContent = correct ? "✓ Correct — this matches the printed answer key." : `✕ Correct option: ${String.fromCharCode(65 + question.answer)}. This is mapped directly from the printed answer key.`;
    }
    $("previousQuestion").disabled = state.index === 0;
    const last = state.index === state.questions.length - 1;
    $("nextQuestion").hidden = last;
    $("submitTest").hidden = !last;
    $("submitTest").textContent = state.mode === "practice" ? "FINISH PRACTICE" : "SUBMIT TEST";
  }

  function choose(index) {
    state.answers[state.index] = index;
    renderQuestion();
    if (state.mode === "test" && state.index < state.questions.length - 1) setTimeout(() => { state.index++; renderQuestion(); }, 180);
  }

  function move(delta) {
    const next = state.index + delta;
    if (next < 0 || next >= state.questions.length) return;
    if (delta > 0 && state.mode === "practice" && state.answers[state.index] === null) { toast("Choose an answer before continuing."); return; }
    state.index = next;
    renderQuestion();
  }

  function finishSession(auto = false) {
    if (!state.questions.length) return;
    if (!auto && state.mode === "test" && state.answers.some((answer) => answer === null) && !confirm("Some questions are unanswered. Submit the test now?")) return;
    clearInterval(state.timer);
    const correct = state.questions.reduce((total, question, index) => total + (state.answers[index] === question.answer ? 1 : 0), 0);
    const percent = Math.round(correct / state.questions.length * 100);
    const answered = state.answers.filter((answer) => answer !== null).length;
    $("resultRing").style.setProperty("--score", percent);
    $("resultPercent").textContent = `${percent}%`;
    $("resultTitle").textContent = percent >= 85 ? "KOTA-ready performance" : percent >= 65 ? "Strong attempt — keep sharpening" : "Good baseline — revise and return";
    $("resultSummary").textContent = `${correct} correct from ${state.questions.length}; ${answered} attempted.${auto ? " Time expired and the test was submitted automatically." : ""}`;
    $("resultScore").textContent = `${correct}/${state.questions.length}`;
    $("resultTime").textContent = formatTime(state.seconds);
    $("resultPace").textContent = answered ? `${Math.round(state.seconds / answered)} sec` : "—";
    $("reviewList").hidden = true;
    $("reviewList").innerHTML = state.questions.map((question, index) => { const chosen = state.answers[index]; const good = chosen === question.answer; return `<article class="review-item ${good ? "correct" : ""}"><strong>${index + 1}. ${esc(question.question)}</strong><small>Your answer: ${chosen === null ? "Not answered" : `${String.fromCharCode(65 + chosen)} · ${esc(question.options[chosen])}`}</small><small>Correct: ${String.fromCharCode(65 + question.answer)} · ${esc(question.options[question.answer])}</small></article>`; }).join("");
    $("quizShell").hidden = true;
    document.body.style.overflow = "";
    $("resultDialog").showModal();
    saveResult(correct, percent);
  }

  function saveResult(correct, percent) {
    try {
      const key = "scrutiny_kota_biology_results";
      const results = JSON.parse(localStorage.getItem(key) || "[]");
      results.unshift({ date: new Date().toISOString(), chapter: state.chapter?.title || "Grand test", total: state.questions.length, correct, percent, seconds: state.seconds, mode: state.mode, courseId: "neet" });
      localStorage.setItem(key, JSON.stringify(results.slice(0, 50)));
    } catch {}
  }

  function toast(message) { $("toast").textContent = message; $("toast").classList.add("show"); setTimeout(() => $("toast").classList.remove("show"), 1800); }

  function bind() {
    $("chapterSearch").addEventListener("input", (event) => renderChapters(event.target.value));
    $("startGrandTest").addEventListener("click", () => openSetup("all"));
    $("checkoutChapters").addEventListener("click", () => window.dispatchEvent(new CustomEvent("scrutiny:kota-checkout", { detail: { chapterIds: [...state.cart] } })));
    $("clearCart").addEventListener("click", () => { state.cart.clear(); renderChapters($("chapterSearch").value); renderCart(); });
    $("exerciseSelect").addEventListener("change", updateCounts);
    $("modeSelect").addEventListener("change", () => { $("modeNote").textContent = $("modeSelect").value === "practice" ? "Practice mode shows the correct answer after every attempt while the elapsed timer and question pace remain visible." : "Test mode locks explanations until submission and can run with a countdown at your chosen pace."; });
    $("setupForm").addEventListener("submit", startSession);
    document.querySelector("[data-close-setup]").addEventListener("click", () => $("setupDialog").close());
    $("previousQuestion").addEventListener("click", () => move(-1));
    $("nextQuestion").addEventListener("click", () => move(1));
    $("submitTest").addEventListener("click", () => finishSession(false));
    $("quitQuiz").addEventListener("click", () => { if (confirm("Exit this session? Your current answers will not be saved.")) { clearInterval(state.timer); $("quizShell").hidden = true; document.body.style.overflow = ""; } });
    $("reviewResult").addEventListener("click", () => { $("reviewList").hidden = !$("reviewList").hidden; $("reviewResult").textContent = $("reviewList").hidden ? "REVIEW ANSWERS" : "HIDE REVIEW"; });
    $("newSession").addEventListener("click", () => { $("resultDialog").close(); openSetup(state.chapter?.slug || "all"); });
    $("visualFrame").addEventListener("click", () => { $("visualLarge").src = $("questionVisual").src; $("visualDialog").showModal(); });
    $("closeVisual").addEventListener("click", () => $("visualDialog").close());
  }

  boot();
})();
