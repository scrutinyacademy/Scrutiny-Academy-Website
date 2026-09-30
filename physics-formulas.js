(() => {
  "use strict";
  if (window.ScrutinyFormulas) return;
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const normal = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const STORAGE = "scrutiny_physics_formulas_v1";
  const chapterCodes = {
    "units and measurements": "0.1", "physical world": "0.1",
    "motion in a straight line": "1.2", "motion in a plane": "1.2", "kinematics": "1.2",
    "laws of motion": "1.3", "work energy and power": "1.4", "work power and energy": "1.4",
    "system of particles and rotational motion": "1.6", "systems of particles and rotational motion": "1.6", "rotational motion": "1.6",
    "gravitation": "1.7", "oscillations": "1.8", "simple harmonic motion": "1.8",
    "mechanical properties of solids": "1.9", "mechanical properties of fluids": "1.9",
    "waves": "2.1", "wave optics": "2.4", "ray optics and optical instruments": "3.2",
    "thermal properties of matter": "4.1", "kinetic theory": "4.2", "kinetic theory of gases": "4.2", "thermodynamics": "4.4",
    "electric charges and fields": "5.1", "electrostatic potential and capacitance": "5.3", "current electricity": "5.4",
    "moving charges and magnetism": "5.6", "magnetism and matter": "5.5", "electromagnetic induction": "5.7", "alternating current": "5.7", "electromagnetic waves": "5.7",
    "dual nature of radiation and matter": "6.1", "atoms": "6.2", "nuclei": "6.3", "semiconductor electronics materials devices and simple circuits": "6.4", "semiconductor electronics": "6.4",
  };
  let catalog, loading, selected, opener, context = {}, requestSerial = 0;
  let query = "", filter = "all", group = "all", zoom = 100, recall = false, revealed = true;
  let memory = { saved: [], reviewed: {}, last: "" };
  function readMemory() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE));
      memory = raw && typeof raw === "object" ? { saved: Array.isArray(raw.saved) ? raw.saved.filter(x => typeof x === "string") : [], reviewed: raw.reviewed && typeof raw.reviewed === "object" && !Array.isArray(raw.reviewed) ? raw.reviewed : {}, last: typeof raw.last === "string" ? raw.last : "" } : { saved: [], reviewed: {}, last: "" };
    } catch { /* The vault remains usable when storage is unavailable. */ }
  }
  function persist() {
    try { localStorage.setItem(STORAGE, JSON.stringify(memory)); }
    catch { announce("Your browser cannot save revision progress. Formulas are still available."); }
  }
  function announce(message) { $("pfStatus").textContent = message; }

  const root = document.createElement("div");
  root.id = "scrutinyPhysicsFormulas";
  root.innerHTML = `
    <button type="button" class="pf-launcher" id="pfLauncher" aria-haspopup="dialog" aria-controls="pfDialog" aria-expanded="false"><span aria-hidden="true">ƒₓ</span> Physics Formulas</button>
    <dialog id="pfDialog" class="pf-dialog" aria-labelledby="pfTitle">
      <div class="pf-shell">
        <header class="pf-header"><div class="pf-brand-mark" aria-hidden="true">ƒₓ</div><div class="pf-header-copy"><span class="pf-eyebrow">SCRUTINY ACADEMY · REVISION COMPANION</span><h2 id="pfTitle">Physics Formula Vault</h2><p>All 34 source topics. Every original equation & diagram.</p></div><button type="button" class="pf-close" id="pfClose" aria-label="Close formula vault">×</button></header>
        <p class="pf-context" id="pfContext" hidden></p>
        <div class="pf-load" id="pfLoad" role="status">Opening your formula library…</div>
        <div class="pf-workspace" id="pfWorkspace" hidden>
          <aside class="pf-sidebar">
            <label class="pf-search-label" for="pfSearch">Find a chapter or topic</label><input type="search" id="pfSearch" class="pf-search" placeholder="Try projectile, lens, RMS…" autocomplete="off">
            <label class="pf-sr" for="pfGroup">Physics unit</label><select id="pfGroup" class="pf-group"><option value="all">All units</option></select>
            <div class="pf-filters" aria-label="Chapter filter"><button type="button" data-pf-filter="all" aria-pressed="true">All</button><button type="button" data-pf-filter="saved" aria-pressed="false">Saved</button><button type="button" data-pf-filter="pending" aria-pressed="false">To revise</button></div>
            <div class="pf-progress-label"><span id="pfProgressLabel">0 / 34 revised</span><button type="button" id="pfSurprise" title="Choose a random chapter from this list">Shuffle ↗</button></div><progress id="pfProgress" value="0" max="34" aria-label="Chapters marked revised"></progress>
            <p class="pf-count" id="pfCount"></p><nav id="pfChapters" class="pf-chapters" aria-label="Physics formula chapters"></nav>
            <p class="pf-local-note">Saved chapters & revision marks stay in this browser. They are self-checks, not exam scores.</p>
          </aside>
          <section class="pf-main" aria-label="Chapter formulas">
            <div class="pf-chapter-head"><div><span class="pf-eyebrow" id="pfChapterGroup"></span><h3 id="pfChapterTitle" tabindex="-1"></h3><p id="pfTopics"></p></div><button type="button" class="pf-button pf-save" id="pfSave" aria-pressed="false">☆ Save</button></div>
            <div class="pf-toolbar"><button type="button" class="pf-button" id="pfRecall" aria-pressed="false">◎ Recall mode</button><button type="button" class="pf-button" id="pfReviewed" aria-pressed="false">Mark revised</button><div class="pf-zoom" aria-label="Formula zoom"><button type="button" id="pfZoomOut" aria-label="Zoom out">−</button><button type="button" id="pfZoomReset" aria-label="Reset zoom to fit">100%</button><button type="button" id="pfZoomIn" aria-label="Zoom in">+</button></div></div>
            <div class="pf-reader" id="pfReader">
              <div class="pf-source-note"><strong>Original source edition</strong><span>Exact artwork from your supplied PDF; no OCR-retyped equations. The source contains some errors—read the chapter cautions below. This is not a complete scientific audit or a current-syllabus checklist.</span></div>
              <div id="pfCorrections"></div>
              <div class="pf-recall-card" id="pfRecallCard" hidden><span class="pf-eyebrow">PAUSE · RECALL · CHECK</span><h4>What can you remember?</h4><p id="pfRecallPrompt"></p><p>Write the equations, explain each symbol, then check the original.</p><button type="button" class="pf-button pf-primary" id="pfReveal">Reveal formulas</button></div>
              <div id="pfSheets"></div>
              <div class="pf-source-footer"><a id="pfSource" href="assets/physics-formulas/source.pdf" target="_blank" rel="noopener">Open original PDF ↗</a><a id="pfReport" href="mailto:scrutinyacademy@gmail.com">Report a formula issue</a><p>Source: <cite>Physics Formulas for Class 11 and Class 12</cite>, Jitender Singh (PDF metadata). Original markings are retained. Formula artwork is visual; use the source PDF for its embedded text.</p></div>
            </div>
            <footer class="pf-footer"><button type="button" class="pf-button" id="pfPrevious">← Previous</button><span id="pfPosition"></span><button type="button" class="pf-button" id="pfNext">Next chapter →</button></footer>
          </section>
        </div>
        <div class="pf-status pf-sr" id="pfStatus" role="status" aria-live="polite"></div>
      </div>
    </dialog>`;
  document.body.appendChild(root);
  const dialog = $("pfDialog");
  const validHash = () => new URLSearchParams(location.search).get("chapter");

  async function getCatalog() {
    if (catalog) return catalog;
    if (!loading) loading = fetch("assets/physics-formulas/catalog.json?v=1")
      .then(r => { if (!r.ok) throw new Error("catalog unavailable"); return r.json(); })
      .then(data => {
        if (!Array.isArray(data.chapters) || !data.chapters.length) throw new Error("invalid catalog");
        catalog = data;
        $("pfGroup").innerHTML = '<option value="all">All units</option>' + [...new Set(data.chapters.map(c => c.group))].map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join("");
        return data;
      }).catch(e => { loading = null; throw e; });
    return loading;
  }

  function matchingChapters() {
    const terms = normal(query).split(" ").filter(Boolean);
    return catalog.chapters.filter(c =>
      (group === "all" || c.group === group) &&
      (filter !== "saved" || memory.saved.includes(c.id)) &&
      (filter !== "pending" || !memory.reviewed[c.id]) &&
      terms.every(term => normal(`${c.title} ${c.group} ${c.topics}`).includes(term)));
  }
  function renderList() {
    const list = matchingChapters();
    $("pfCount").textContent = `${list.length} chapter${list.length === 1 ? "" : "s"} found`;
    $("pfChapters").innerHTML = list.length ? list.map(c => `<button type="button" data-pf-chapter="${esc(c.id)}" aria-current="${selected?.id === c.id ? "true" : "false"}"><span class="pf-chapter-number">${esc(c.code)}</span><span>${esc(c.title)}<small>${esc(c.group)}</small></span><span class="pf-chapter-state" aria-label="${memory.reviewed[c.id] ? "Revised" : memory.saved.includes(c.id) ? "Saved" : "Not revised"}">${memory.reviewed[c.id] ? "✓" : memory.saved.includes(c.id) ? "★" : ""}</span></button>`).join("") : '<p class="pf-empty">No matching chapters. Try another topic or <button type="button" id="pfClear">clear filters</button>.</p>';
    $("pfSurprise").disabled = !list.length;
    const reviewed = catalog.chapters.filter(c => memory.reviewed[c.id]).length;
    $("pfProgressLabel").textContent = `${reviewed} / ${catalog.chapters.length} revised`;
    $("pfProgress").max = catalog.chapters.length;
    $("pfProgress").value = reviewed;
    document.querySelectorAll("[data-pf-filter]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.pfFilter === filter)));
  }
  function renderActions() {
    if (!selected) return;
    const saved = memory.saved.includes(selected.id), reviewed = Boolean(memory.reviewed[selected.id]);
    $("pfSave").setAttribute("aria-pressed", String(saved));
    $("pfSave").textContent = saved ? "★ Saved" : "☆ Save";
    $("pfReviewed").setAttribute("aria-pressed", String(reviewed));
    $("pfReviewed").textContent = reviewed ? "✓ Revised · undo" : "Mark revised";
    $("pfRecall").setAttribute("aria-pressed", String(recall));
    $("pfRecallCard").hidden = !recall;
    $("pfSheets").hidden = recall && !revealed;
    $("pfReveal").textContent = revealed ? "Hide & recall again" : "Reveal formulas";
  }
  function renderChapter(focus = false) {
    if (!selected) return;
    zoom = 100;
    revealed = !recall;
    memory.last = selected.id;
    persist();
    $("pfChapterGroup").textContent = `${selected.group} · ${selected.code}`;
    $("pfChapterTitle").textContent = selected.title;
    $("pfTopics").textContent = selected.topics;
    $("pfRecallPrompt").textContent = `Recall the key relations for ${selected.topics.toLowerCase()}.`;
    const notes = window.ScrutinyFormulaNotes?.[selected.code] || [];
    $("pfCorrections").innerHTML = notes.map(n => `<aside class="pf-caution"><strong>Source caution · ${esc(n.title)}</strong><p>${esc(n.text)}</p>${n.math || ""}<a href="${esc(n.source)}" target="_blank" rel="noopener">Check reference ↗</a></aside>`).join("");
    $("pfSheets").innerHTML = selected.fragments.map((f, index) => `<figure class="pf-figure"><figcaption><span>Original formulas · ${index + 1} / ${selected.fragments.length}</span><a href="${esc(catalog.source.url)}#page=${f.page}" target="_blank" rel="noopener">PDF page ${f.page} ↗</a></figcaption><div class="pf-paper-scroll" tabindex="0" role="region" aria-label="Zoomable formulas for ${esc(selected.title)}, source page ${f.page}"><div class="pf-paper"><svg class="pf-sheet" xmlns="http://www.w3.org/2000/svg" viewBox="${f.viewBox.join(" ")}" role="img" aria-label="${esc(selected.title)}: original equations and diagrams, page ${f.page}, ${f.column === 1 ? "left" : "right"} column"><title>${esc(selected.title)} — original source page ${f.page}</title><image href="${esc(f.asset)}" width="${catalog.source.width}" height="${catalog.source.height}" /></svg></div></div><p class="pf-image-error" hidden>Formula image could not load. <a href="${esc(catalog.source.url)}#page=${f.page}" target="_blank" rel="noopener">Open the original PDF</a> or reopen this chapter to retry.</p></figure>`).join("");
    $("pfSheets").querySelectorAll("image").forEach(img => img.addEventListener("error", () => {
      img.closest("figure").querySelector(".pf-image-error").hidden = false;
      announce("A formula image did not load. Use the original PDF link.");
    }));
    $("pfSource").href = `${catalog.source.url}#page=${selected.pages[0]}`;
    // Reuse the website's existing support address instead of inventing a contact.
    const support = document.querySelector('a[href^="mailto:"]:not(#pfReport)')?.href?.split("?")[0] || "mailto:scrutinyacademy@gmail.com";
    $("pfReport").href = `${support}?subject=${encodeURIComponent(`Physics formula review: ${selected.title}`)}&body=${encodeURIComponent(`Chapter: ${selected.title}\nSource pages: ${selected.pages.join(", ")}\nFormula / issue:\n`)}`;
    const index = catalog.chapters.indexOf(selected);
    $("pfPosition").textContent = `${index + 1} / ${catalog.chapters.length}`;
    $("pfPrevious").disabled = index === 0;
    $("pfNext").disabled = index === catalog.chapters.length - 1;
    $("pfReader").scrollTop = 0;
    renderActions(); renderZoom(); renderList();
    if (focus) $("pfChapterTitle").focus({ preventScroll: true });
    announce(`${selected.title}. ${selected.fragments.length} formula panels. ${notes.length ? "Read the source cautions before revising." : ""}`);
  }
  function choose(id, focus = true) {
    const chapter = catalog.chapters.find(c => c.id === id);
    if (chapter) { selected = chapter; renderChapter(focus); }
  }
  function renderZoom() {
    $("pfSheets").querySelectorAll(".pf-paper").forEach(p => { p.style.width = `${zoom}%`; });
    $("pfZoomReset").textContent = `${zoom}%`;
    $("pfZoomOut").disabled = zoom <= 100;
    $("pfZoomIn").disabled = zoom >= 300;
  }
  async function open(options = {}) {
    const serial = ++requestSerial;
    context = options;
    if (!dialog.open) {
      opener = document.activeElement;
      document.dispatchEvent(new CustomEvent("scrutiny:overlay-open", { detail: { source: "physics-formulas" } }));
      dialog.showModal();
      $("pfLauncher").setAttribute("aria-expanded", "true");
    }
    $("pfContext").hidden = !options.quiz;
    $("pfContext").textContent = options.quiz ? `${options.chapter || "Physics practice"} · Your answers are kept. The quiz timer keeps running. Using formulas is recorded as assisted practice.` : "";
    $("pfClose").setAttribute("aria-label", options.quiz ? "Back to question" : "Close formula vault");
    $("pfLoad").hidden = false;
    $("pfLoad").textContent = "Opening your formula library…";
    try {
      await getCatalog();
      if (serial !== requestSerial || !dialog.open) return;
      readMemory();
      const code = chapterCodes[normal(options.chapter)];
      const matched = catalog.chapters.find(c => c.id === options.id || c.code === code || normal(c.title) === normal(options.chapter));
      selected = matched || selected || catalog.chapters.find(c => c.id === memory.last) || catalog.chapters[0];
      if (matched && options.quiz) { query = ""; filter = "all"; group = "all"; $("pfSearch").value = ""; $("pfGroup").value = "all"; }
      $("pfLoad").hidden = true;
      $("pfWorkspace").hidden = false;
      renderChapter();
      if (options.quiz) document.dispatchEvent(new CustomEvent("scrutiny:formulas-consulted"));
      $("pfSearch").focus({ preventScroll: true });
    } catch {
      if (serial !== requestSerial || !dialog.open) return;
      $("pfWorkspace").hidden = true;
      $("pfLoad").innerHTML = 'The formula library could not load. Check your connection. <button type="button" class="pf-button" id="pfRetry">Try again</button> <a href="assets/physics-formulas/source.pdf" target="_blank" rel="noopener">Open original PDF</a>';
    }
  }
  function close() { requestSerial++; if (dialog.open) dialog.close(); }
  dialog.addEventListener("close", () => {
    $("pfLauncher").setAttribute("aria-expanded", "false");
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
  dialog.addEventListener("cancel", e => { e.preventDefault(); close(); });
  // Do not let Escape or arrow shortcuts reach a quiz beneath this dialog.
  dialog.addEventListener("keydown", e => { e.stopPropagation(); if (e.key === "Escape") { e.preventDefault(); close(); } });
  $("pfLauncher").onclick = () => open();
  $("pfClose").onclick = close;
  $("pfSearch").addEventListener("input", e => { query = e.target.value; renderList(); });
  $("pfGroup").addEventListener("change", e => { group = e.target.value; renderList(); });
  $("pfChapters").addEventListener("click", e => {
    const button = e.target.closest("[data-pf-chapter]");
    if (button) choose(button.dataset.pfChapter);
    if (e.target.closest("#pfClear")) { query = ""; group = "all"; filter = "all"; $("pfSearch").value = ""; $("pfGroup").value = "all"; renderList(); }
  });
  document.querySelectorAll("[data-pf-filter]").forEach(b => b.onclick = () => { filter = b.dataset.pfFilter; renderList(); });
  $("pfSurprise").onclick = () => { const list = matchingChapters(); if (list.length) choose(list[Math.floor(Math.random() * list.length)].id); };
  $("pfSave").onclick = () => {
    if (!selected) return;
    memory.saved = memory.saved.includes(selected.id) ? memory.saved.filter(id => id !== selected.id) : [...memory.saved, selected.id];
    persist(); renderActions(); renderList(); announce(memory.saved.includes(selected.id) ? "Chapter saved in this browser." : "Chapter removed from saved.");
  };
  $("pfReviewed").onclick = () => {
    if (!selected) return;
    if (memory.reviewed[selected.id]) delete memory.reviewed[selected.id]; else memory.reviewed[selected.id] = new Date().toISOString();
    persist(); renderActions(); renderList(); announce(memory.reviewed[selected.id] ? "Chapter marked revised." : "Revision mark removed.");
  };
  $("pfRecall").onclick = () => { recall = !recall; revealed = !recall; renderActions(); $("pfReader").scrollTop = 0; announce(recall ? "Recall mode on. Formulas hidden until you reveal them." : "Reading mode on."); };
  $("pfReveal").onclick = () => { revealed = !revealed; renderActions(); announce(revealed ? "Formulas revealed." : "Formulas hidden. Try to recall them again."); };
  $("pfZoomOut").onclick = () => { zoom = Math.max(100, zoom - 25); renderZoom(); };
  $("pfZoomIn").onclick = () => { zoom = Math.min(300, zoom + 25); renderZoom(); };
  $("pfZoomReset").onclick = () => { zoom = 100; renderZoom(); };
  $("pfPrevious").onclick = () => choose(catalog.chapters[catalog.chapters.indexOf(selected) - 1]?.id);
  $("pfNext").onclick = () => choose(catalog.chapters[catalog.chapters.indexOf(selected) + 1]?.id);
  $("pfLoad").addEventListener("click", e => { if (e.target.closest("#pfRetry")) open(context); });
  document.addEventListener("scrutiny:formulas-open", e => open(e.detail || {}));
  document.addEventListener("click", e => { const trigger = e.target.closest("[data-open-formulas]"); if (trigger) { e.preventDefault(); open({ id: trigger.dataset.chapter || validHash() }); } });
  window.addEventListener("storage", e => { if (e.key === STORAGE && catalog) { readMemory(); renderList(); renderActions(); } });
  window.ScrutinyFormulas = Object.freeze({ open, close });
  if (document.body.dataset.formulaPage === "true") open({ id: validHash() });
})();
