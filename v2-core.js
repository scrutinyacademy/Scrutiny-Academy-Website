(() => {
  "use strict";
  const repo = {
    manifest: "data/manifest.json",
    platform: "data/platform.json",
    class11: "data/class11/catalog.json",
    class12: "data/class12/catalog.json",
    ncert: "data/ncert/catalog.json",
  };
  const temporarilyUnpublishedBiologyChapters = new Set([
    "Photosynthesis in Higher Plants",
    "Respiration in Plants",
    "Plant Growth and Development",
    "Breathing and Exchange of Gases",
    "Body Fluids and Circulation",
    "Excretory Products and their Elimination",
    "Locomotion and Movement",
    "Neural Control and Coordination",
    "Chemical Coordination and Integration",
  ]);
  const cache = new Map(),
    state = {
      platform: null,
      manifest: null,
      class10: { subject: "biology", chapter: 0, format: "mcqs", data: null },
      neet: { subject: "biology", data: null },
      custom: { subjects: [] },
      flashcards: { deck: null, cards: [], index: 0, flipped: false, view: "all", topic: "All" },
      quiz: null,
      timer: null,
      lastResult: null,
    };
  const $ = (id) => document.getElementById(id);
  async function load(p) {
    if (cache.has(p)) return cache.get(p);
    const r = await fetch(p);
    if (!r.ok) throw Error(p);
    const d = await r.json();
    if (p === "data/neet/biology.json")
      for (const chapter of d.chapters || [])
        if (temporarilyUnpublishedBiologyChapters.has(chapter.name))
          chapter.mcqs = [];
    cache.set(p, d);
    return d;
  }
  const esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const shuffle = (a) => {
    let o = [...a];
    for (let i = o.length - 1; i; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [o[i], o[j]] = [o[j], o[i]];
    }
    return o;
  };
  const isTemporarilyUnpublished = (d, chapter) =>
    d?.subject === "Biology" &&
    chapter?.classLevel === 11 &&
    temporarilyUnpublishedBiologyChapters.has(chapter.name);
  const publishedChapters = (d) =>
    (d?.chapters || []).filter((chapter) =>
      !isTemporarilyUnpublished(d, chapter),
    );
  const allMcqs = (d) =>
    publishedChapters(d).flatMap((ch, ci) =>
      (ch.mcqs || []).map((q) => ({
        ...q,
        __chapter: ch.name || ch.title || "",
        __chapterIndex: ci,
        __subject: d.subject || "",
      })),
    );
  function difficulty(q) {
    return String(q.difficulty || q.level || "")
      .trim()
      .toLowerCase();
  }
  function filterDifficulty(qs, d) {
    return d === "all" ? qs : qs.filter((q) => difficulty(q) === d);
  }
  function toast(m) {
    const t = $("toast");
    t.textContent = m;
    t.classList.add("show");
    clearTimeout(t._x);
    t._x = setTimeout(() => t.classList.remove("show"), 2600);
  }
  async function init() {
    try {
      [state.platform, state.manifest] = await Promise.all([
        load(repo.platform),
        load(repo.manifest),
      ]);
      await Promise.all([
        renderPrograms(),
        renderClass10(),
        renderNeet(),
        renderCustomBuilder(),
        renderFlashcards(),
        renderMbbs(),
        renderCatalog("class11"),
        renderCatalog("class12"),
        renderInventory(),
        renderNcertSummary(),
      ]);
      renderProgress();
      bind();
    } catch (e) {
      console.error(e);
      toast("Some published data could not be loaded.");
    }
  }
  function bind() {
    $("menuBtn").onclick = () => $("mainNav").classList.toggle("open");
    $("quickPractice").onclick = async () =>
      startQuiz(
        allMcqs(await load("data/class10/biology.json")),
        "Class 10 Biology",
        "practice",
        10,
      );
    $("c10Practice").onclick = () =>
      startQuiz(
        allMcqs(state.class10.data),
        `Class 10 ${state.class10.data?.subject || ""}`,
        "practice",
        25,
      );
    $("c10Chapter").onchange = (e) => {
      state.class10.chapter = +e.target.value || 0;
      renderC10Content();
    };
    document.querySelectorAll("#c10Tabs button").forEach(
      (b) =>
        (b.onclick = () => {
          document
            .querySelectorAll("#c10Tabs button")
            .forEach((x) => x.classList.toggle("active", x === b));
          state.class10.format = b.dataset.format;
          renderC10Content();
        }),
    );
    $("neetSubject").onchange = async (e) => {
      state.neet.subject = e.target.value;
      await renderNeetAvailability();
      renderNeetChapters();
    };
    $("neetClass").onchange = renderNeetChapters;
    $("neetDifficulty").onchange = renderNeetChapters;
    $("neetChapterSearch").oninput = renderNeetChapters;
    $("neetStart").onclick = startNeet;
    $("buildCustomTest").onclick = buildCustomTest;
    $("ncertSearch").onclick = searchNcert;
    $("ncertQuery").onkeydown = (event) => {
      if (event.key === "Enter") searchNcert();
    };
    $("clearProgress").onclick = () => {
      if (confirm("Clear all progress on this device?")) {
        localStorage.removeItem("scrutiny_v2_progress");
        renderProgress();
        window.dispatchEvent(new CustomEvent("scrutiny:progress-cleared"));
      }
    };
    $("quizClose").onclick = closeQuiz;
    $("quizPrev").onclick = () => moveQuiz(-1);
    $("quizNext").onclick = () => moveQuiz(1);
    $("quizSubmit").onclick = finishQuiz;
    $("shareResult").onclick = shareResult;
    $("closeResult").onclick = () => $("resultDialog").close();
  }
  async function renderPrograms() {
    const icons = {
        class10: "📘",
        class11: "🌱",
        class12: "🎓",
        neet: "🧬",
        mbbs: "🩺",
      },
      targets = {
        class10: "#class10",
        class11: "#class11",
        class12: "#class12",
        neet: "#neet",
        mbbs: "#mbbs",
      };
    $("programGrid").innerHTML = state.platform.courses
      .map(
        (c) =>
          `<a class="program-card" href="${targets[c.id] || "#"}"><span>${icons[c.id] || "📚"}</span><h3>${esc(c.name)}</h3><p>${esc((c.subjects || []).join(" • "))}</p><span class="status ${c.status.startsWith("active") ? "active" : "foundation"}">${c.status.startsWith("active") ? "Active" : "Foundation ready"}</span></a>`,
      )
      .join("");
  }
  async function renderInventory() {
    let s = 0,
      ch = 0,
      q = 0;
    for (const c of state.manifest.categories || [])
      for (const x of c.subjects || []) {
        s++;
        try {
          const d = await load(x.file);
          ch += publishedChapters(d).length;
          q += allMcqs(d).length;
        } catch {}
      }
    $("metricSubjects").textContent = s;
    $("metricChapters").textContent = ch;
    $("metricMcqs").textContent = q.toLocaleString("en-IN");
    $("inventoryNote").textContent =
      "Calculated from currently published data.";
  }
  async function renderClass10() {
    const cat = state.manifest.categories.find((c) => c.id === "class10");
    $("c10Subjects").innerHTML = (cat.subjects || [])
      .map(
        (s, i) =>
          `<button data-id="${s.id}" class="${i ? "" : "active"}">${esc(s.icon || "📘")} ${esc(s.name)}</button>`,
      )
      .join("");
    $("c10Subjects")
      .querySelectorAll("button")
      .forEach(
        (b) =>
          (b.onclick = async () => {
            document
              .querySelectorAll("#c10Subjects button")
              .forEach((x) => x.classList.toggle("active", x === b));
            state.class10.subject = b.dataset.id;
            state.class10.chapter = 0;
            await loadC10();
          }),
      );
    await loadC10();
  }
  async function loadC10() {
    const cat = state.manifest.categories.find((c) => c.id === "class10"),
      sub = cat.subjects.find((s) => s.id === state.class10.subject),
      d = await load(sub.file);
    state.class10.data = d;
    $("c10Title").textContent = `${d.icon || ""} ${d.subject || sub.name}`;
    $("c10Desc").textContent = d.description || "";
    $("c10Chapter").innerHTML = (d.chapters || [])
      .map(
        (ch, i) =>
          `<option value="${i}">${i + 1}. ${esc(ch.name || ch.title)}</option>`,
      )
      .join("");
    renderC10Content();
  }
  function renderC10Content() {
    const d = state.class10.data,
      ch = d?.chapters?.[state.class10.chapter],
      items = ch?.[state.class10.format] || [];
    if (!ch) return;
    $("c10Content").innerHTML =
      state.class10.format === "mcqs"
        ? `<div class="empty-state"><strong>${items.length} MCQs published.</strong><br><br><button class="btn primary small" id="chapterPractice">Practice chapter</button></div>`
        : items.length
          ? items
              .map(
                (q, i) =>
                  `<article><b>Q${i + 1}. ${esc(q.question)}</b><p>${esc(q.answer)}</p></article>`,
              )
              .join("")
          : '<div class="empty-state">No published questions in this format yet.</div>';
    if ($("chapterPractice"))
      $("chapterPractice").onclick = () =>
        startQuiz(
          items.map((q) => ({ ...q, __chapter: ch.name || ch.title })),
          `${d.subject} • ${ch.name || ch.title}`,
          "practice",
          items.length,
        );
  }
  async function renderCatalog(k) {
    const d = await load(repo[k]);
    document.querySelector(`[data-catalog="${k}"]`).innerHTML = (
      d.subjects || []
    )
      .map(
        (s) =>
          `<article><strong>${esc(s.name)}</strong><span>${(s.chapters || []).length} chapters listed</span></article>`,
      )
      .join("");
  }
  function neetCat() {
    return state.manifest.categories.find((c) => c.id === "neet");
  }
  async function renderNeet() {
    const cat = neetCat();
    $("neetSubject").innerHTML = (cat.subjects || [])
      .map((s) => `<option value="${s.id}">${esc(s.name)}</option>`)
      .join("");
    await renderNeetAvailability();
    renderNeetChapters();
  }
  async function renderNeetAvailability() {
    const sub = neetCat().subjects.find((s) => s.id === state.neet.subject),
      d = await load(sub.file);
    state.neet.data = d;
    $("neetAvailability").innerHTML =
      `<strong>${allMcqs(d).length.toLocaleString("en-IN")}</strong> ${esc(sub.name)} MCQs across <strong>${publishedChapters(d).length}</strong> published chapters.`;
    return { d, sub };
  }
  function renderNeetChapters() {
    const d = state.neet.data;
    if (!d) return;
    const cls = $("neetClass").value,
      diff = $("neetDifficulty").value,
      search = $("neetChapterSearch").value.toLowerCase();
    const arr = (d.chapters || [])
      .map((ch, i) => ({ ch, i }))
      .filter(
        (x) =>
          !isTemporarilyUnpublished(d, x.ch) &&
          (cls === "all" || String(x.ch.classLevel || "") === cls) &&
          (!search ||
            String(x.ch.name || x.ch.title)
              .toLowerCase()
              .includes(search)),
      );
    $("neetChapterGrid").innerHTML = arr.length
      ? arr
          .map(({ ch, i }) => {
            const all = (ch.mcqs || []).map((q) => ({
                ...q,
                __chapter: ch.name || ch.title,
              })),
              qs = filterDifficulty(all, diff);
            return `<article class="neet-chapter-card"><div class="chapter-meta"><span>Class ${esc(ch.classLevel || "—")}</span><span>•</span><span>Chapter ${i + 1}</span></div><h3>${esc(ch.name || ch.title)}</h3><div class="chapter-count">${qs.length}</div><p>${diff === "all" ? "published" : esc(diff)} MCQs available</p><button class="btn primary neet-chapter-practice" data-i="${i}" ${qs.length ? "" : "disabled"}>Practice this chapter</button></article>`;
          })
          .join("")
      : '<div class="empty-state">No chapters match.</div>';
    $("neetChapterGrid")
      .querySelectorAll(".neet-chapter-practice")
      .forEach(
        (b) =>
          (b.onclick = () => {
            const ch = d.chapters[+b.dataset.i],
              qs = filterDifficulty(
                (ch.mcqs || []).map((q) => ({
                  ...q,
                  __chapter: ch.name || ch.title,
                })),
                diff,
              ),
              n = Math.min(+$("neetCount").value || 10, qs.length);
            startQuiz(
              qs,
              `NEET ${d.subject} • ${ch.name || ch.title}`,
              $("neetMode").value,
              n,
            );
          }),
      );
  }
  async function startNeet() {
    const { d, sub } = await renderNeetAvailability(),
      cls = $("neetClass").value,
      diff = $("neetDifficulty").value;
    let qs = publishedChapters(d)
      .filter((ch) => cls === "all" || String(ch.classLevel || "") === cls)
      .flatMap((ch) =>
        (ch.mcqs || []).map((q) => ({ ...q, __chapter: ch.name || ch.title })),
      );
    qs = filterDifficulty(qs, diff);
    if (!qs.length) return toast("No MCQs match this difficulty yet.");
    startQuiz(
      qs,
      `NEET ${sub.name}`,
      $("neetMode").value,
      Math.min(+$("neetCount").value || 10, qs.length),
    );
  }
  async function renderCustomBuilder() {
    const cat = neetCat(),
      wanted = ["biology", "physics", "chemistry"],
      cards = [];
    state.custom.subjects = [];
    for (const id of wanted) {
      const sub = (cat.subjects || []).find((s) => s.id === id);
      if (!sub) {
        cards.push(
          `<article class="custom-subject unavailable"><h3>${id[0].toUpperCase() + id.slice(1)}</h3><p>No published MCQ bank connected yet.</p></article>`,
        );
        continue;
      }
      try {
        const d = await load(sub.file),
          entry = { id, name: sub.name, data: d };
        state.custom.subjects.push(entry);
        cards.push(
          `<article class="custom-subject" data-subject="${id}"><div class="custom-title"><h3>${esc(sub.name)}</h3><label><input type="checkbox" class="custom-enable" data-subject="${id}"> Include</label></div><label class="field">MCQs from this subject<input class="custom-count" data-subject="${id}" type="number" min="1" max="180" value="10"></label><div class="chapter-checks">${(d.chapters || []).map((ch, i) => ({ ch, i })).filter(({ ch }) => !isTemporarilyUnpublished(d, ch)).map(({ ch, i }) => `<label><input type="checkbox" class="custom-chapter" data-subject="${id}" value="${i}"> <span>${esc(ch.name || ch.title)} <small>(${(ch.mcqs || []).length})</small></span></label>`).join("")}</div></article>`,
        );
      } catch {
        cards.push(
          `<article class="custom-subject unavailable"><h3>${esc(sub.name)}</h3><p>Question bank unavailable.</p></article>`,
        );
      }
    }
    $("customTestSubjects").innerHTML = cards.join("");
    document
      .querySelectorAll(".custom-enable,.custom-count,.custom-chapter")
      .forEach((x) => (x.onchange = updateCustomTotal));
    updateCustomTotal();
  }
  function updateCustomTotal() {
    let total = 0;
    for (const s of state.custom.subjects) {
      const en = document.querySelector(
        `.custom-enable[data-subject="${s.id}"]`,
      );
      if (en?.checked)
        total += Math.max(
          0,
          +document.querySelector(`.custom-count[data-subject="${s.id}"]`)
            ?.value || 0,
        );
    }
    $("customTestTotal").textContent = `${total} questions selected`;
    $("customTestNote").textContent =
      "Questions are randomly selected from the chapters you tick.";
  }
  function buildCustomTest() {
    let final = [];
    for (const s of state.custom.subjects) {
      if (
        !document.querySelector(`.custom-enable[data-subject="${s.id}"]`)
          ?.checked
      )
        continue;
      const ids = [
        ...document.querySelectorAll(
          `.custom-chapter[data-subject="${s.id}"]:checked`,
        ),
      ].map((x) => +x.value);
      if (!ids.length) continue;
      let pool = ids.flatMap((i) => {
        const ch = s.data.chapters[i];
        return (ch.mcqs || []).map((q) => ({
          ...q,
          __chapter: ch.name || ch.title,
          __subject: s.name,
        }));
      });
      const wanted = Math.max(
        1,
        +document.querySelector(`.custom-count[data-subject="${s.id}"]`)
          ?.value || 10,
      );
      final.push(...shuffle(pool).slice(0, Math.min(wanted, pool.length)));
    }
    if (!final.length)
      return toast("Select a subject and at least one chapter.");
    startQuiz(shuffle(final), "My Custom NEET Test", "test", final.length);
  }
  async function renderMbbs() {
    const cat = state.manifest.categories.find((c) => c.id === "mbbs"),
      a = [];
    for (const s of cat.subjects || [])
      try {
        const d = await load(s.file);
        a.push(
          `<article class="mbbs-card"><h3>${esc(s.name)}</h3><p>${allMcqs(d).length} published MCQs</p></article>`,
        );
      } catch {}
    $("mbbsGrid").innerHTML = a.join("");
  }
  const normalizeSearch = (value) =>
    String(value ?? "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  function ncertHaystack(record) {
    return normalizeSearch(
      [
        record.topic,
        record.meaning,
        record.chapter,
        record.section,
        record.sourceLabel,
        record.pdfFilename,
        record.keywords,
      ].join(" "),
    );
  }
  function ncertScore(record, query, terms) {
    const topic = normalizeSearch(record.topic);
    const chapter = normalizeSearch(record.chapter);
    const section = normalizeSearch(record.section);
    const meaning = normalizeSearch(record.meaning);
    let score = terms.reduce(
      (total, term) =>
        total +
        (topic.includes(term) ? 20 : 0) +
        (chapter.includes(term) ? 10 : 0) +
        (section.includes(term) ? 6 : 0) +
        (meaning.includes(term) ? 4 : 0),
      0,
    );
    if (topic === query) score += 100;
    else if (topic.startsWith(query)) score += 60;
    else if (topic.includes(query)) score += 40;
    return score;
  }
  async function renderNcertSummary() {
    const data = await load(repo.ncert);
    $("ncertResults").innerHTML = `<div class="empty-state compact"><strong>${Number(data.records?.length || 0).toLocaleString("en-IN")} concepts</strong> indexed across <strong>${Number(data.chapterCount || 0)} Class 12 Physics chapters</strong>. Enter a keyword to find its meaning and NCERT reference.</div>`;
  }
  async function searchNcert() {
    const query = normalizeSearch($("ncertQuery").value);
    if (!query) {
      $("ncertQuery").focus();
      return renderNcertSummary();
    }
    const data = await load(repo.ncert);
    const terms = [...new Set(query.split(" ").filter(Boolean))];
    const matches = (data.records || [])
      .filter((record) => {
        const haystack = ncertHaystack(record);
        return terms.every((term) => haystack.includes(term));
      })
      .map((record) => ({
        ...record,
        __score: ncertScore(record, query, terms),
      }))
      .sort(
        (a, b) =>
          b.__score - a.__score ||
          a.chapter.localeCompare(b.chapter) ||
          a.topic.localeCompare(b.topic),
      );

    if (!matches.length) {
      $("ncertResults").innerHTML = `<div class="empty-state compact">No indexed Class 12 Physics concept matches “${esc($("ncertQuery").value.trim())}”. Try a shorter scientific term or formula name.</div>`;
      return;
    }

    const shown = matches.slice(0, 30);
    $("ncertResults").innerHTML = `
      <p class="ncert-result-count">${matches.length} result${matches.length === 1 ? "" : "s"} found${matches.length > shown.length ? ` · showing the top ${shown.length}` : ""}</p>
      <div class="ncert-result-grid">${shown
        .map(
          (record) => `<article class="ncert-result-card">
            <div class="ncert-result-meta"><span>Class ${esc(record.class)}</span><span>${esc(record.subject)}</span></div>
            <h3>${esc(record.topic)}</h3>
            <p class="ncert-meaning"><strong>Meaning</strong>${esc(record.meaning)}</p>
            <div class="ncert-reference">
              <strong>NCERT reference</strong>
              <span>${esc(record.chapter)}</span>
              <span>${esc(record.section)}</span>
              <span>${esc(record.sourceLabel)} · Book page ${esc(record.printedPage)} · PDF page ${esc(record.pdfPage)}</span>
              <small>${esc(record.pdfFilename)}</small>
            </div>
          </article>`,
        )
        .join("")}</div>`;
  }
  function startQuiz(qs, title, mode = "practice", count = 25) {
    const usable = (qs || []).filter(
      (q) => Array.isArray(q.options) && q.options.length >= 2,
    );
    if (!usable.length) return toast("No MCQs available in this set.");
    state.quiz = {
      title,
      mode,
      questions: shuffle(usable).slice(0, Math.min(count, usable.length)),
      index: 0,
      answers: {},
      started: Date.now(),
    };
    $("quizTitle").textContent = title;
    $("quizMode").textContent = mode === "test" ? "Test" : "Practice";
    $("quizDialog").showModal();
    clearInterval(state.timer);
    state.timer = setInterval(() => {
      if (state.quiz)
        $("quizTimer").textContent = formatTime(
          Math.floor((Date.now() - state.quiz.started) / 1000),
        );
    }, 1000);
    renderQuiz();
  }
  function answer(q) {
    if (Number.isInteger(q.answer)) return q.answer;
    if (typeof q.answer === "string") {
      let t = q.answer.trim();
      if (/^[A-Da-d]$/.test(t)) return t.toUpperCase().charCodeAt(0) - 65;
      let n = +t;
      if (Number.isInteger(n)) return n;
    }
    return -1;
  }
  function renderQuiz() {
    const z = state.quiz,
      q = z.questions[z.index],
      chosen = z.answers[z.index],
      ans = answer(q);
    $("quizChapter").textContent =
      `${q.__subject ? `${q.__subject} • ` : ""}${q.__chapter || ""}${difficulty(q) ? ` • ${difficulty(q)}` : ""}`;
    $("quizQuestion").textContent = q.question;
    $("quizPosition").textContent = `${z.index + 1} / ${z.questions.length}`;
    $("quizProgress").style.width =
      `${((z.index + 1) / z.questions.length) * 100}%`;
    $("quizPrev").disabled = z.index === 0;
    $("quizNext").hidden = z.index === z.questions.length - 1;
    $("quizSubmit").hidden = z.index !== z.questions.length - 1;
    $("quizOptions").innerHTML = q.options
      .map(
        (o, i) =>
          `<button class="option ${chosen === i ? "selected" : ""} ${z.mode === "practice" && chosen !== undefined ? (i === ans ? "correct" : i === chosen ? "incorrect" : "") : ""}" data-i="${i}">${String.fromCharCode(65 + i)}. ${esc(o)}</button>`,
      )
      .join("");
    $("quizOptions")
      .querySelectorAll("button")
      .forEach(
        (b) =>
          (b.onclick = () => {
            if (z.mode === "practice" && z.answers[z.index] !== undefined)
              return;
            z.answers[z.index] = +b.dataset.i;
            renderQuiz();
          }),
      );
    $("quizExplanation").hidden = !(
      z.mode === "practice" && chosen !== undefined
    );
    if (!$("quizExplanation").hidden)
      $("quizExplanation").innerHTML =
        `<strong>${chosen === ans ? "Correct" : "Review this concept"}</strong><br>${esc(q.explanation || "Explanation not published yet.")}`;
  }
  function moveQuiz(d) {
    state.quiz.index = Math.max(
      0,
      Math.min(state.quiz.questions.length - 1, state.quiz.index + d),
    );
    renderQuiz();
  }
  function finishQuiz() {
    const z = state.quiz;
    if (!z) return;
    let attempted = 0,
      correct = 0;
    const review = z.questions.map((q, i) => {
      const selected = z.answers[i];
      const correctIndex = answer(q);
      const isCorrect = selected === correctIndex;
      if (selected !== undefined) {
        attempted++;
        if (isCorrect) correct++;
      }
      return {
        id: q.id || `${q.__subject || ""}:${q.__chapter || ""}:${q.question}`,
        question: q.question,
        options: q.options,
        selected,
        correctIndex,
        isCorrect,
        explanation: q.explanation || "",
        subject: q.__subject || "",
        chapter: q.__chapter || "",
        difficulty: difficulty(q),
        reference: q.reference || q.ncertReference || q.source || null,
      };
    });
    const seconds = Math.floor((Date.now() - z.started) / 1000),
      accuracy = attempted ? Math.round((correct / attempted) * 100) : 0,
      r = {
        id: `session-${Date.now()}`,
        title: z.title,
        total: z.questions.length,
        attempted,
        correct,
        accuracy,
        seconds,
        completedAt: new Date().toISOString(),
        review,
      };
    saveSession(r);
    state.lastResult = r;
    window.dispatchEvent(
      new CustomEvent("scrutiny:session-complete", { detail: r }),
    );
    closeQuiz();
    showResult(r);
    renderProgress();
  }
  function showResult(r) {
    $("resultTitle").textContent = r.title;
    $("resultScore").textContent = `${r.correct}/${r.total}`;
    $("resultAccuracy").textContent = `${r.accuracy}% accuracy`;
    $("resultAttempted").textContent = `Attempted: ${r.attempted}/${r.total}`;
    $("resultTime").textContent = `Time: ${formatTime(r.seconds)}`;
    $("resultDialog").showModal();
  }
  async function shareResult() {
    const r = state.lastResult;
    if (!r) return;
    const text = `I scored ${r.correct}/${r.total} (${r.accuracy}% accuracy) in ${r.title} on Scrutiny Academy. Can you beat my score?`;
    try {
      if (navigator.share)
        await navigator.share({
          title: "My Scrutiny Academy Result",
          text,
          url: location.href.split("#")[0] + "#neet",
        });
      else {
        await navigator.clipboard.writeText(
          `${text} ${location.href.split("#")[0]}#neet`,
        );
        toast("Result copied — share it anywhere.");
      }
    } catch (e) {
      if (e.name !== "AbortError") toast("Could not share this result.");
    }
  }
  function closeQuiz() {
    clearInterval(state.timer);
    state.timer = null;
    state.quiz = null;
    if ($("quizDialog").open) $("quizDialog").close();
  }
  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  function getProgress() {
    try {
      return (
        JSON.parse(localStorage.getItem("scrutiny_v2_progress")) || {
          sessions: [],
        }
      );
    } catch {
      return { sessions: [] };
    }
  }
  function saveSession(s) {
    const p = getProgress();
    p.sessions.unshift(s);
    p.sessions = p.sessions.slice(0, 40);
    localStorage.setItem("scrutiny_v2_progress", JSON.stringify(p));
    window.dispatchEvent(
      new CustomEvent("scrutiny:progress-changed", { detail: p }),
    );
  }
  function renderProgress() {
    const ss = getProgress().sessions || [],
      a = ss.reduce((n, s) => n + (s.attempted || 0), 0),
      c = ss.reduce((n, s) => n + (s.correct || 0), 0);
    $("pAttempts").textContent = a;
    $("pCorrect").textContent = c;
    $("pAccuracy").textContent = `${a ? Math.round((c / a) * 100) : 0}%`;
    $("pSessions").textContent = ss.length;
    $("recentSessions").innerHTML = ss.length
      ? ss
          .slice(0, 8)
          .map(
            (s) =>
              `<div class="session"><strong>${esc(s.title)}</strong><span>${s.correct}/${s.total} • ${s.accuracy}%</span></div>`,
          )
          .join("")
      : '<div class="empty-state compact">No practice sessions saved yet.</div>';
  }

  const flashStoreKey = "scrutiny_morphology_flashcards_v1";
  function getFlashStore() {
    try {
      const value = JSON.parse(localStorage.getItem(flashStoreKey) || "{}");
      return { known: new Set(value.known || []), review: new Set(value.review || []) };
    } catch {
      return { known: new Set(), review: new Set() };
    }
  }
  function saveFlashStore(value) {
    localStorage.setItem(
      flashStoreKey,
      JSON.stringify({ known: [...value.known], review: [...value.review] }),
    );
  }
  async function renderFlashcards() {
    const catalog = await load("data/flashcards/catalog.json");
    const chapter = catalog.subjects
      .find((subject) => subject.id === "biology")
      .chapters[0];
    state.flashcards.deck = await load(chapter.file);
    const topics = [...new Set(state.flashcards.deck.cards.map((card) => card.topic))];
    $("flashTopic").innerHTML =
      '<option value="All">All NCERT topics</option>' +
      topics.map((topic) => `<option value="${esc(topic)}">${esc(topic)}</option>`).join("");
    document.querySelectorAll("[data-flash-view]").forEach((button) => {
      button.onclick = () => {
        state.flashcards.view = button.dataset.flashView;
        document.querySelectorAll("[data-flash-view]").forEach((item) =>
          item.classList.toggle("active", item === button),
        );
        applyFlashcardFilters();
      };
    });
    $("flashTopic").onchange = (event) => {
      state.flashcards.topic = event.target.value;
      applyFlashcardFilters();
    };
    $("flashCard").onclick = flipStudyCard;
    $("flashPrev").onclick = () => moveStudyCard(-1);
    $("flashNext").onclick = () => moveStudyCard(1);
    $("flashShuffle").onclick = shuffleStudyCards;
    $("flashKnown").onclick = () => rateStudyCard("known");
    $("flashReview").onclick = () => rateStudyCard("review");
    applyFlashcardFilters();
  }
  function applyFlashcardFilters() {
    const deck = state.flashcards.deck;
    if (!deck) return;
    const saved = getFlashStore();
    let cards = deck.cards.filter(
      (card) => state.flashcards.topic === "All" || card.topic === state.flashcards.topic,
    );
    if (state.flashcards.view === "pyq") cards = cards.filter((card) => card.pyqFocus);
    if (state.flashcards.view === "known") cards = cards.filter((card) => saved.known.has(card.id));
    if (state.flashcards.view === "review") cards = cards.filter((card) => saved.review.has(card.id));
    state.flashcards.cards = cards;
    state.flashcards.index = 0;
    state.flashcards.flipped = false;
    renderStudyCard();
  }
  function currentStudyCard() {
    return state.flashcards.cards[state.flashcards.index];
  }
  function renderStudyCard() {
    const card = currentStudyCard();
    const saved = getFlashStore();
    const total = state.flashcards.cards.length;
    $("flashKnownCount").textContent = saved.known.size;
    $("flashReviewCount").textContent = saved.review.size;
    $("flashEmpty").hidden = total > 0;
    $("flashCard").hidden = total === 0;
    $("flashReference").hidden = total === 0;
    $("flashPyqNote").hidden = true;
    ["flashPrev", "flashNext", "flashShuffle", "flashKnown", "flashReview"].forEach(
      (id) => ($(id).disabled = total === 0),
    );
    if (!card) {
      $("flashPosition").textContent = "0 / 0";
      $("flashProgressBar").style.width = "0%";
      return;
    }
    $("flashMode").textContent = `${card.topic.toUpperCase()} • ${card.mode.toUpperCase()}`;
    $("flashPyqBadge").hidden = !card.pyqFocus;
    $("flashPosition").textContent = `${state.flashcards.index + 1} / ${total}`;
    $("flashProgressBar").style.width = `${((state.flashcards.index + 1) / total) * 100}%`;
    $("flashFront").textContent = card.front;
    $("flashBack").textContent = card.back;
    $("flashFront").hidden = state.flashcards.flipped;
    $("flashBack").hidden = !state.flashcards.flipped;
    $("flashFaceLabel").textContent = state.flashcards.flipped ? "NCERT ANSWER" : "QUESTION";
    $("flashTapHint").textContent = state.flashcards.flipped
      ? "Tap to return to the question"
      : "Tap to reveal the NCERT answer";
    $("flashCard").classList.toggle("answer", state.flashcards.flipped);
    $("flashReference").textContent = card.reference;
    $("flashPyqNote").textContent = card.pyqNote;
    $("flashPyqNote").hidden = !(state.flashcards.flipped && card.pyqFocus);
    $("flashKnown").textContent = saved.known.has(card.id) ? "Mastered ✓" : "Mark mastered ✓";
    $("flashReview").textContent = saved.review.has(card.id) ? "In review queue" : "Review again";
  }
  function flipStudyCard() {
    state.flashcards.flipped = !state.flashcards.flipped;
    renderStudyCard();
  }
  function moveStudyCard(direction) {
    const total = state.flashcards.cards.length;
    if (!total) return;
    state.flashcards.index = (state.flashcards.index + direction + total) % total;
    state.flashcards.flipped = false;
    renderStudyCard();
  }
  function shuffleStudyCards() {
    state.flashcards.cards = shuffle(state.flashcards.cards);
    state.flashcards.index = 0;
    state.flashcards.flipped = false;
    renderStudyCard();
    toast("Flashcards shuffled.");
  }
  function rateStudyCard(rating) {
    const card = currentStudyCard();
    if (!card) return;
    const saved = getFlashStore();
    if (rating === "known") {
      saved.known.add(card.id);
      saved.review.delete(card.id);
    } else {
      saved.review.add(card.id);
      saved.known.delete(card.id);
    }
    saveFlashStore(saved);
    if (state.flashcards.view === "known" || state.flashcards.view === "review") {
      applyFlashcardFilters();
    } else {
      moveStudyCard(1);
    }
  }
  init();
})();
