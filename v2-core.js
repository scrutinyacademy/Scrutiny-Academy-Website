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
      neet: { subject: "biology", data: null, chapter: null, subtopicFilter: "all" },
      custom: { subjects: [] },
      flashcards: {
        catalog: null,
        subjectId: "biology",
        chapterId: "morphology-of-flowering-plants",
        deck: null,
        cards: [],
        index: 0,
        flipped: false,
        view: "all",
        topic: "All",
      },
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
    if (p === "data/neet/physics.json" && Array.isArray(window.SCRUTINY_CLASS11_PHYSICS)) {
      const generated = new Map(window.SCRUTINY_CLASS11_PHYSICS.map((chapter) => [chapter.id, chapter]));
      d.chapters = (d.chapters || []).map((chapter) => generated.get(chapter.id) || chapter);
    }
    if (p === "data/neet/chemistry.json" && Array.isArray(window.SCRUTINY_CLASS11_CHEMISTRY)) {
      const generated = new Map(window.SCRUTINY_CLASS11_CHEMISTRY.map((chapter) => [chapter.id, chapter]));
      d.chapters = (d.chapters || []).map((chapter) => generated.get(chapter.id) || chapter);
    }
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
    const value = String(q.difficulty || q.level || "")
      .trim()
      .toLowerCase();
    return ({ easy: "foundation", moderate: "neet standard", medium: "neet standard", difficult: "challenge", hard: "challenge" })[value] || value;
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
      state.neet.chapter = null;
      $("neetSubtopicPanel").hidden = true;
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
    $("quizBookmark").onclick = toggleQuizBookmark;
    $("quizReport").onclick = reportQuizQuestion;
    $("retryWrong").onclick = retryWrongQuestions;
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
            const hasSubtopics = Array.isArray(ch.subtopics) && ch.subtopics.length;
            return `<article class="neet-chapter-card"><div class="chapter-meta"><span>Class ${esc(ch.classLevel || "—")}</span><span>•</span><span>Chapter ${i + 1}</span></div><h3>${esc(ch.name || ch.title)}</h3><div class="chapter-count">${qs.length}</div><p>${diff === "all" ? "published" : esc(diff)} MCQs available${hasSubtopics ? ` • ${ch.subtopics.length} subtopics` : ""}</p><div class="chapter-actions"><button class="btn primary neet-chapter-practice" data-i="${i}" ${qs.length ? "" : "disabled"}>Mixed chapter test</button>${hasSubtopics ? `<button class="btn ghost neet-subtopic-open" data-i="${i}">Explore subtopics</button>` : ""}</div></article>`;
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
    $("neetChapterGrid")
      .querySelectorAll(".neet-subtopic-open")
      .forEach((button) => {
        button.onclick = () => renderNeetSubtopics(+button.dataset.i);
      });
  }
  function questionMatchesType(q, filter) {
    if (filter === "all") return true;
    const type = String(q.questionType || "").toLowerCase();
    if (["foundation", "neet standard", "challenge"].includes(filter)) return difficulty(q) === filter;
    if (filter === "visual") return Boolean(q.visualRequired || q.visualSpec || q.image);
    if (filter === "common traps") return type.includes("trap") || type.includes("misconception");
    if (filter === "conceptual") return type.includes("concept") || type.includes("statement") || type.includes("assertion");
    return type.includes(filter);
  }
  function renderNeetSubtopics(chapterIndex) {
    const chapter = state.neet.data?.chapters?.[chapterIndex];
    if (!chapter?.subtopics?.length) return;
    state.neet.chapter = chapterIndex;
    state.neet.subtopicFilter = "all";
    const panel = $("neetSubtopicPanel");
    panel.hidden = false;
    panel.innerHTML = `<div class="subtopic-panel-head"><div><span class="eyebrow">CLASS ${esc(chapter.classLevel)} ${esc(state.neet.data?.subject || "NEET")}</span><h3>${esc(chapter.name)}</h3><p>${chapter.subtopics.length} NCERT-mapped subtopics • ${(chapter.mcqs || []).length} validated MCQs</p></div><button class="icon-btn" type="button" id="closeSubtopics" aria-label="Close subtopics">×</button></div><div class="subtopic-filter-row">${["all","foundation","neet standard","challenge","numerical","conceptual","graph","visual","common traps"].map(filter => `<button type="button" class="filter-pill ${filter === "all" ? "active" : ""}" data-sub-filter="${filter}">${filter.replace(/\b\w/g, c => c.toUpperCase())}</button>`).join("")}</div><div id="subtopicGrid" class="subtopic-grid"></div>`;
    $("closeSubtopics").onclick = () => { panel.hidden = true; };
    panel.querySelectorAll("[data-sub-filter]").forEach(button => {
      button.onclick = () => {
        state.neet.subtopicFilter = button.dataset.subFilter;
        panel.querySelectorAll("[data-sub-filter]").forEach(x => x.classList.toggle("active", x === button));
        renderSubtopicCards(chapter);
      };
    });
    renderSubtopicCards(chapter);
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function renderSubtopicCards(chapter) {
    const filter = state.neet.subtopicFilter;
    $("subtopicGrid").innerHTML = chapter.subtopics.map((subtopic, index) => {
      const questions = (subtopic.mcqs || []).filter(q => questionMatchesType(q, filter));
      return `<article class="subtopic-card"><div class="subtopic-card-meta"><span>${esc(subtopic.ncertSections)}</span><span>${esc(subtopic.importance || "High")}</span></div><h4>${esc(subtopic.name)}</h4><strong>${questions.length} MCQs</strong><p>${filter === "all" ? "Complete targeted practice" : `${esc(filter)} filter`}</p><div class="subtopic-actions">${[10,20,40].map(count => `<button type="button" class="btn ${count === 40 ? "primary" : "ghost"} small subtopic-start" data-sub="${index}" data-count="${count}" ${questions.length ? "" : "disabled"}>${count}</button>`).join("")}</div></article>`;
    }).join("");
    $("subtopicGrid").querySelectorAll(".subtopic-start").forEach(button => {
      button.onclick = () => {
        const subtopic = chapter.subtopics[+button.dataset.sub];
        const questions = (subtopic.mcqs || []).filter(q => questionMatchesType(q, filter)).map(q => ({ ...q, __chapter: chapter.name, __subject: state.neet.data?.subject || "NEET" }));
        startQuiz(questions, `${chapter.name} • ${subtopic.name}`, $("neetMode").value, Math.min(+button.dataset.count, questions.length));
      };
    });
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
  function renderQuestionVisual(q) {
    const host = $("quizVisual");
    if (!q.visualSpec) {
      host.hidden = true;
      host.innerHTML = "";
      return;
    }
    const spec = q.visualSpec;
    let art = "";
    if (spec.type === "line") {
      const points = spec.points || [];
      const polyline = points.map(([x, y]) => `${50 + x * 75},${190 - y * 45}`).join(" ");
      art = `<line x1="50" y1="190" x2="315" y2="190" class="graph-axis"/><line x1="50" y1="190" x2="50" y2="20" class="graph-axis"/><polyline points="${polyline}" class="graph-line"/><text x="185" y="222">${esc(spec.xLabel || "X")}</text><text x="18" y="110" transform="rotate(-90 18 110)">${esc(spec.yLabel || "output")}</text>`;
    } else if (spec.type === "orbital") {
      art = `<ellipse cx="128" cy="112" rx="72" ry="28"/><ellipse cx="212" cy="112" rx="72" ry="28"/><circle cx="170" cy="112" r="10" class="chem-core"/><path d="M170 30v164" class="chem-dash"/>`;
    } else if (spec.type === "periodic") {
      art = Array.from({length: 18}, (_, i) => `<rect x="${28 + (i%9)*32}" y="${42 + Math.floor(i/9)*42}" width="26" height="32"/><text x="${41 + (i%9)*32}" y="${63 + Math.floor(i/9)*42}">${i+1}</text>`).join("") + `<path d="M44 154h240" class="chem-arrow"/>`;
    } else if (spec.type === "energy") {
      art = `<line x1="42" y1="185" x2="305" y2="185" class="graph-axis"/><line x1="42" y1="185" x2="42" y2="28" class="graph-axis"/><path d="M55 150 C110 150 105 55 170 55 S230 120 290 120" class="graph-line"/><line x1="60" y1="150" x2="105" y2="150"/><line x1="240" y1="120" x2="290" y2="120"/>`;
    } else if (spec.type === "equilibrium") {
      art = `<circle cx="85" cy="112" r="28"/><circle cx="255" cy="112" r="28"/><path d="M120 92h96l-18-14m18 54h-96l18 14" class="chem-arrow"/><text x="77" y="119">R</text><text x="247" y="119">P</text>`;
    } else if (spec.type === "measurement") {
      art = `<path d="M92 35v112c0 28 22 48 48 48s48-20 48-48V35"/><path d="M93 130h94v18c0 27-21 47-47 47s-47-20-47-47z" class="chem-fill"/><line x1="210" y1="45" x2="210" y2="185"/><line x1="202" y1="75" x2="218" y2="75"/><line x1="202" y1="115" x2="218" y2="115"/><line x1="202" y1="155" x2="218" y2="155"/>`;
    } else {
      art = `<circle cx="100" cy="112" r="34"/><circle cx="240" cy="112" r="34"/><line x1="134" y1="112" x2="206" y2="112" class="chem-bond"/><circle cx="170" cy="112" r="8" class="chem-core"/>`;
    }
    host.hidden = false;
    host.innerHTML = `<strong class="chem-visual-title">${esc(spec.label || q.subtopic || "Question visual")}</strong><svg viewBox="0 0 340 230" role="img" aria-label="${esc(spec.caption || spec.label || "Chemistry question visual")}">${art}</svg>`;
  }
  function questionMarkKey(kind, q) {
    const subject = String(q?.__subject || q?.subject || "general").toLowerCase().replace(/[^a-z0-9]+/g, "_");
    return `scrutiny_${subject}_${kind}`;
  }
  function getQuestionMarks(key) {
    try { return new Set(JSON.parse(localStorage.getItem(key) || "[]")); }
    catch { return new Set(); }
  }
  function toggleQuizBookmark() {
    const q = state.quiz?.questions?.[state.quiz.index];
    if (!q) return;
    const marks = getQuestionMarks(questionMarkKey("bookmarks", q));
    marks.has(q.id) ? marks.delete(q.id) : marks.add(q.id);
    localStorage.setItem(questionMarkKey("bookmarks", q), JSON.stringify([...marks]));
    $("quizBookmark").textContent = marks.has(q.id) ? "♥ Bookmarked" : "♡ Bookmark";
    toast(marks.has(q.id) ? "Question bookmarked." : "Bookmark removed.");
  }
  function reportQuizQuestion() {
    const q = state.quiz?.questions?.[state.quiz.index];
    if (!q) return;
    const reports = getQuestionMarks(questionMarkKey("reports", q));
    reports.add(q.id);
    localStorage.setItem(questionMarkKey("reports", q), JSON.stringify([...reports]));
    $("quizReport").textContent = "⚑ Reported";
    const subject = encodeURIComponent(`${q.__subject || q.subject || "NEET"} MCQ report: ${q.id}`);
    const body = encodeURIComponent(`Question ID: ${q.id}\nChapter: ${q.__chapter || q.chapter || ""}\nSubtopic: ${q.subtopic || ""}\n\nPlease describe the issue:\n`);
    window.open(`mailto:scrutinyacademy@gmail.com?subject=${subject}&body=${body}`, "_blank", "noopener");
    toast(`Report prepared for ${q.id}.`);
  }
  function detailedSolution(q, chosen, correctIndex) {
    const steps = (q.solutionSteps || [q.explanation || "Apply the stated NCERT principle."]).map((step, index) => `<li><strong>Step ${index + 1}</strong> ${esc(step)}</li>`).join("");
    return `<div class="answer-feedback ${chosen === correctIndex ? "is-correct" : "is-wrong"}"><strong>${chosen === correctIndex ? "Correct" : "Incorrect"}</strong><span>Correct answer: ${String.fromCharCode(65 + correctIndex)}. ${esc(q.options[correctIndex])}</span></div><details class="detailed-solution"><summary>View detailed solution</summary><div class="solution-grid"><p><strong>Concept</strong>${esc(q.conceptTested || q.topic || "NCERT concept")}</p><p><strong>Formula</strong>${esc(q.formulaUsed || "Not required")}</p></div><ol>${steps}</ol><p><strong>Why students get this wrong</strong>${esc(q.commonTrap || "A related formula or sign is applied without checking the conditions.")}</p><p><strong>NEET shortcut</strong>${esc(q.neetShortcut || "Write the governing relation and check units before selecting an option.")}</p><p class="solution-reference"><strong>NCERT link</strong>${esc(q.ncertSection || q.references?.[0]?.section || "Mapped to uploaded chapter")}</p></details>`;
  }
  function renderQuiz() {
    const z = state.quiz,
      q = z.questions[z.index],
      chosen = z.answers[z.index],
      ans = answer(q);
    $("quizChapter").textContent =
      `${q.__subject ? `${q.__subject} • ` : ""}${q.__chapter || ""}${q.subtopic ? ` • ${q.subtopic}` : ""}${difficulty(q) ? ` • ${difficulty(q)}` : ""}${q.questionType ? ` • ${q.questionType}` : ""}`;
    $("quizQuestion").textContent = q.question;
    renderQuestionVisual(q);
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
      $("quizExplanation").innerHTML = detailedSolution(q, chosen, ans);
    const bookmarks = getQuestionMarks(questionMarkKey("bookmarks", q));
    const reports = getQuestionMarks(questionMarkKey("reports", q));
    $("quizBookmark").textContent = bookmarks.has(q.id) ? "♥ Bookmarked" : "♡ Bookmark";
    $("quizReport").textContent = reports.has(q.id) ? "⚑ Reported" : "⚑ Report question";
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
        solutionSteps: q.solutionSteps || [],
        conceptTested: q.conceptTested || q.topic || "",
        formulaUsed: q.formulaUsed || "",
        commonTrap: q.commonTrap || "",
        neetShortcut: q.neetShortcut || "",
        questionType: q.questionType || "",
        subtopic: q.subtopic || "",
        ncertSection: q.ncertSection || "",
        visualSpec: q.visualSpec || null,
        visualRequired: Boolean(q.visualRequired),
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
    $("resultAttempted").textContent = `Attempted: ${r.attempted}/${r.total} • Incorrect: ${r.attempted - r.correct} • Unattempted: ${r.total - r.attempted}`;
    $("resultTime").textContent = `Time: ${formatTime(r.seconds)}`;
    $("resultDialog").showModal();
  }
  function retryWrongQuestions() {
    const r = state.lastResult;
    if (!r) return;
    const wrong = r.review.filter(item => item.selected !== undefined && !item.isCorrect).map(item => ({
      ...item,
      answer: item.correctIndex,
      __subject: item.subject,
      __chapter: item.chapter,
    }));
    if (!wrong.length) return toast("No incorrect attempted questions in this session.");
    $("resultDialog").close();
    startQuiz(wrong, `${r.title} • Wrong questions`, "practice", wrong.length);
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

  function flashStoreKey() {
    return `scrutiny_flashcards_${state.flashcards.deck?.id || "default"}_v2`;
  }
  function getFlashStore() {
    try {
      const key = flashStoreKey();
      let raw = localStorage.getItem(key);
      if (!raw && state.flashcards.deck?.id === "morphology-of-flowering-plants")
        raw = localStorage.getItem("scrutiny_morphology_flashcards_v1");
      const value = JSON.parse(raw || "{}");
      return { known: new Set(value.known || []), review: new Set(value.review || []) };
    } catch {
      return { known: new Set(), review: new Set() };
    }
  }
  function saveFlashStore(value) {
    localStorage.setItem(
      flashStoreKey(),
      JSON.stringify({ known: [...value.known], review: [...value.review] }),
    );
  }
  function normaliseFlashDeck(deck) {
    if (Array.isArray(deck.cards)) return deck;
    if (!Array.isArray(deck.seeds)) return { ...deck, cards: [] };
    const modes = [
      ["NCERT Recall", (term) => `What is the key NCERT idea for ${term}?`, (_, answer) => answer],
      ["Term Match", (_, answer) => `Identify the concept: ${answer}`, (term) => term],
      ["Explain the Link", (term) => `Explain the NCERT link associated with “${term}”.`, (_, answer) => answer],
      ["Rapid Revision", (term) => `In one line, recall ${term}.`, (_, answer) => answer],
      ["NEET Concept Check", (term) => `Which fact should you remember for a NEET question on ${term}?`, (_, answer) => answer],
      ["Reverse Recall", (_, answer) => `Which chapter concept is described by this statement? ${answer}`, (term) => term],
    ];
    const cards = deck.seeds.flatMap((seed, seedIndex) =>
      modes.map((mode, modeIndex) => ({
        id: `${deck.id}-${String(seedIndex * modes.length + modeIndex + 1).padStart(3, "0")}`,
        topic: seed[0],
        mode: mode[0],
        front: mode[1](seed[0], seed[1]),
        back: mode[2](seed[0], seed[1]),
        reference: `NCERT ${deck.subject} ${deck.classLevel}, ${deck.chapter}, ${seed[2]}, printed page ${seed[3]}`,
        pyqFocus: modeIndex === 4,
        pyqNote: modeIndex === 4 ? "High-yield NEET concept check." : "",
      })),
    );
    return { ...deck, cards, cardCount: cards.length, pyqFocusCount: cards.filter((card) => card.pyqFocus).length };
  }
  function renderFlashSubjects() {
    const catalog = state.flashcards.catalog;
    $("flashSubjectGrid").innerHTML = catalog.subjects
      .map((subject) => {
        const total = subject.chapters.reduce((sum, chapter) => sum + chapter.count, 0);
        const available = subject.status === "available" && subject.chapters.length;
        return `<button type="button" class="flash-subject ${available ? "available" : "soon"} ${state.flashcards.subjectId === subject.id ? "selected" : ""}" data-flash-subject="${esc(subject.id)}" ${available ? "" : "disabled"}>
          <span>${esc(subject.icon)}</span><div><strong>${esc(subject.name)}</strong><small>${available ? `${subject.chapters.length} ${subject.chapters.length === 1 ? "chapter" : "chapters"} • ${total} cards` : "Flashcards coming soon"}</small></div><b>${available ? "AVAILABLE" : "COMING SOON"}</b>
        </button>`;
      })
      .join("");
  }
  async function selectFlashSubject(subjectId) {
    const subject = state.flashcards.catalog.subjects.find((item) => item.id === subjectId);
    if (!subject?.chapters?.length) return;
    state.flashcards.subjectId = subjectId;
    if (!subject.chapters.some((chapter) => chapter.id === state.flashcards.chapterId))
      state.flashcards.chapterId = subject.chapters[0].id;
    renderFlashSubjects();
    $("flashChapter").innerHTML = subject.chapters
      .map((chapter) => `<option value="${esc(chapter.id)}">${esc(chapter.name)} (${chapter.count})</option>`)
      .join("");
    $("flashChapter").value = state.flashcards.chapterId;
    await loadFlashChapter(state.flashcards.chapterId);
  }
  async function loadFlashChapter(chapterId) {
    const subject = state.flashcards.catalog.subjects.find(
      (item) => item.id === state.flashcards.subjectId,
    );
    const chapter = subject?.chapters.find((item) => item.id === chapterId);
    if (!chapter) return;
    state.flashcards.chapterId = chapterId;
    state.flashcards.deck = normaliseFlashDeck(await load(chapter.file));
    state.flashcards.view = "all";
    state.flashcards.topic = "All";
    document.querySelector(".flash-panel .eyebrow").textContent =
      `${state.flashcards.deck.subject.toUpperCase()} • ${state.flashcards.deck.classLevel.toUpperCase()}`;
    $("flashChapterTitle").textContent = state.flashcards.deck.chapter;
    $("flashChapterSummary").textContent =
      `${state.flashcards.deck.cardCount} cards • ${state.flashcards.deck.pyqFocusCount || 0} PYQ-focus cards • active recall`;
    $("flashAllCount").textContent = state.flashcards.deck.cardCount;
    $("flashPyqCount").textContent = state.flashcards.deck.pyqFocusCount || 0;
    $("flashSourcePolicy").textContent = state.flashcards.deck.sourcePolicy ||
      "Flashcards use concise active recall. PYQ focus identifies high-yield concepts.";
    const topics = [...new Set(state.flashcards.deck.cards.map((card) => card.topic))];
    $("flashTopic").innerHTML =
      '<option value="All">All NCERT topics</option>' +
      topics.map((topic) => `<option value="${esc(topic)}">${esc(topic)}</option>`).join("");
    document.querySelectorAll("[data-flash-view]").forEach((item) =>
      item.classList.toggle("active", item.dataset.flashView === "all"),
    );
    applyFlashcardFilters();
  }
  async function renderFlashcards() {
    state.flashcards.catalog = await load("data/flashcards/catalog.json");
    $("flashSubjectGrid").onclick = (event) => {
      const button = event.target.closest("[data-flash-subject]");
      if (button && !button.disabled) selectFlashSubject(button.dataset.flashSubject);
    };
    $("flashChapter").onchange = (event) => loadFlashChapter(event.target.value);
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
    await selectFlashSubject(state.flashcards.subjectId);
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
