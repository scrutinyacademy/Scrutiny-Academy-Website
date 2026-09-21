(() => {
  "use strict";

  const sources = {
    physics: "data/ncert/catalog.json",
    biology: "data/ncert/biology-class11.json",
    chemistry: "data/ncert/chemistry-structure-of-atom.json",
    biologyDetails: [
      "data/ncert/biology-sections-1.json",
      "data/ncert/biology-sections-2.json",
    ],
    biologyCrossChapter: "data/ncert/biology-cross-chapter-index.json",
  };
  const $ = (id) => document.getElementById(id);
  const esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (character) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
          character
        ],
    );
  const normalise = (value) =>
    String(value ?? "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/α/g, " alpha ")
      .replace(/β/g, " beta ")
      .replace(/γ/g, " gamma ")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const queryAliases = new Map([
    ["oxygen", [["oxygen"], ["o2"]]],
    ["o2", [["o2"], ["oxygen"]]],
    ["carbon dioxide", [["carbon", "dioxide"], ["co2"]]],
    ["co2", [["co2"], ["carbon", "dioxide"]]],
    ["antidiuretic hormone", [["antidiuretic", "hormone"], ["adh"], ["vasopressin"]]],
    ["adh", [["adh"], ["antidiuretic", "hormone"], ["vasopressin"]]],
    ["krebs cycle", [["krebs", "cycle"], ["tricarboxylic", "acid", "cycle"], ["tca", "cycle"]]],
    ["tca cycle", [["tca", "cycle"], ["krebs", "cycle"], ["tricarboxylic", "acid", "cycle"]]],
    ["epinephrine", [["epinephrine"], ["adrenaline"]]],
    ["adrenaline", [["adrenaline"], ["epinephrine"]]],
    ["norepinephrine", [["norepinephrine"], ["noradrenaline"]]],
    ["noradrenaline", [["noradrenaline"], ["norepinephrine"]]],
    ["abscisic acid", [["abscisic", "acid"], ["aba"]]],
    ["aba", [["aba"], ["abscisic", "acid"]]],
  ]);

  let cache = null;
  async function getData() {
    if (cache) return cache;
    const [physicsIndex, biology, chemistry, crossChapter, ...biologyDetails] =
      await Promise.all([
        fetch(sources.physics).then((response) => response.json()),
        fetch(sources.biology).then((response) => response.json()),
        fetch(sources.chemistry).then((response) => response.json()),
        fetch(sources.biologyCrossChapter).then((response) => response.json()),
        ...sources.biologyDetails.map((url) => fetch(url).then((response) => response.json())),
      ]);
    const physicsShards = await Promise.all(
      (physicsIndex.shards || []).map((url) => fetch(url).then((response) => response.json())),
    );
    const physicsRecords = [
      ...(physicsIndex.records || []),
      ...physicsShards.flatMap((shard) => shard.records || []),
    ];
    const currentChapters = new Set(crossChapter.chapters.map((chapter) => chapter.name));
    const olderDetails = [];
    biologyDetails.forEach((dataset) =>
      (dataset.chapters || []).forEach((chapter) => {
        if (currentChapters.has(chapter.chapter)) return;
        (chapter.rows || []).forEach((row, index) =>
          olderDetails.push({
            id: `bio-detail-${normalise(chapter.chapter)}-${index}`,
            class: 11,
            subject: "Biology",
            topic: row[0],
            meaning: row[2],
            chapter: chapter.chapter,
            section: row[0],
            sourceLabel: "NCERT Biology, Reprint 2025-26",
            pdfFilename: "kebo101_merged.pdf",
            pdfPage: row[1],
            printedPage: row[1],
            keywords: row[3],
            detailed: true,
          }),
        );
      }),
    );
    cache = {
      crossChapter,
      records: [
        ...physicsRecords,
        ...olderDetails,
        ...(biology.records || []).filter((record) => !currentChapters.has(record.chapter)),
        ...(chemistry.records || []),
        ...(crossChapter.records || []),
      ],
    };
    return cache;
  }

  function haystack(record) {
    return ` ${normalise(
      [
        record.topic,
        record.meaning,
        record.chapter,
        record.section,
        record.sourceLabel,
        record.pdfFilename,
        record.keywords,
      ].join(" "),
    )} `;
  }
  function termForms(term) {
    const forms = new Set([term]);
    if (term.endsWith("ies") && term.length > 4) forms.add(`${term.slice(0, -3)}y`);
    if (term.endsWith("es") && term.length > 4) forms.add(term.slice(0, -2));
    if (term.endsWith("s") && term.length > 3) forms.add(term.slice(0, -1));
    return [...forms];
  }
  function hasTerm(hay, term) {
    return termForms(term).some((form) => hay.includes(` ${form} `));
  }
  function queryAlternatives(query) {
    return queryAliases.get(query) || [query.split(" ").filter(Boolean)];
  }
  function matchesQuery(record, alternatives) {
    const hay = haystack(record);
    return alternatives.some((terms) => terms.every((term) => hasTerm(hay, term)));
  }
  function score(record, query, alternatives) {
    const topic = normalise(record.topic);
    const chapter = normalise(record.chapter);
    const section = normalise(record.section);
    const meaning = normalise(record.meaning);
    const terms = alternatives[0];
    let value = record.crossChapter ? 45 : record.detailed ? 25 : 0;
    terms.forEach((term) => {
      value += topic.includes(term) ? 20 : 0;
      value += chapter.includes(term) ? 10 : 0;
      value += section.includes(term) ? 12 : 0;
      value += meaning.includes(term) ? 5 : 0;
    });
    if (topic === query) value += 100;
    else if (topic.startsWith(query)) value += 60;
    else if (topic.includes(query)) value += 40;
    return value;
  }

  function crossChapterSummary(records) {
    if (!records.length) return "";
    const groups = new Map();
    records.forEach((record) => {
      if (!groups.has(record.chapter)) groups.set(record.chapter, []);
      groups.get(record.chapter).push(record);
    });
    const sorted = [...groups.entries()].sort(
      (a, b) => a[1][0].chapterNumber - b[1][0].chapterNumber,
    );
    return `<section class="ncert-cross-summary">
      <span class="eyebrow">CROSS-CHAPTER CONCEPT MAP</span>
      <h3>“${esc($("ncertQuery").value.trim())}” appears in ${sorted.length} NCERT chapter${sorted.length === 1 ? "" : "s"}</h3>
      <p>${records.length} matching source page${records.length === 1 ? "" : "s"} in the uploaded NCERT Biology Reprint 2026-27 chapters.</p>
      <div class="ncert-chapter-map">${sorted
        .map(
          ([chapter, pages]) =>
            `<a href="#ncert-${esc(pages[0].id)}"><strong>Ch ${pages[0].chapterNumber}</strong>${esc(chapter)}<small>${pages.length} page${pages.length === 1 ? "" : "s"}</small></a>`,
        )
        .join("")}</div>
    </section>`;
  }

  function sourceSummary(records) {
    if (!records.length) return "";
    const chapters = [...new Set(records.map((record) => record.chapter))].sort();
    return `<section class="ncert-cross-summary">
      <span class="eyebrow">CROSS-CHAPTER SOURCE MAP</span>
      <h3>“${esc($("ncertQuery").value.trim())}” appears in ${chapters.length} NCERT chapter${chapters.length === 1 ? "" : "s"}</h3>
      <p>${records.length} matching source reference${records.length === 1 ? "" : "s"} across the indexed NCERT Biology, Chemistry and Physics records.</p>
      <div class="ncert-chapter-map">${chapters
        .slice(0, 18)
        .map((chapter) => `<a href="#ncert"><strong>NCERT</strong>${esc(chapter)}</a>`)
        .join("")}</div>
    </section>`;
  }

  function resultCard(record, matchingChapters, firstInChapter) {
    const otherChapters = matchingChapters.filter((chapter) => chapter !== record.chapter);
    const otherChapterLine =
      otherChapters.length || record.crossChapter
        ? `<div class="ncert-other-chapters"><strong>${otherChapters.length ? "Also found in" : "Chapter occurrence"}</strong><span>${
            otherChapters.length
              ? otherChapters.map((chapter) => `<b>${esc(chapter)}</b>`).join("")
              : "This term appears only in this uploaded chapter."
          }</span></div>`
        : "";
    const meaning = record.crossChapter
      ? `NCERT discusses “${esc($("ncertQuery").value.trim())}” in this section. ${esc(record.meaning)}`
      : esc(record.meaning);
    return `<article class="ncert-result-card${record.crossChapter ? " cross-chapter" : ""}"${firstInChapter ? ` id="ncert-${esc(record.id)}"` : ""}>
      <div class="ncert-result-meta"><span>Class ${esc(record.class)}</span><span>${esc(record.subject)}</span>${record.crossChapter ? '<span>Exact PDF page</span>' : record.detailed ? '<span>Exact section</span>' : ""}</div>
      <h3>${esc(record.topic)}</h3>
      <p class="ncert-meaning"><strong>Concept context</strong>${meaning}</p>
      ${otherChapterLine}
      <div class="ncert-reference"><strong>NCERT reference</strong><span>${record.chapterNumber ? `Chapter ${esc(record.chapterNumber)} · ` : ""}${esc(record.chapter)}</span><span>${esc(record.section)}</span><span>${esc(record.sourceLabel)} · Book page ${esc(record.printedPage)} · PDF page ${esc(record.pdfPage)}</span><small>${esc(record.pdfFilename)}</small></div>
    </article>`;
  }

  async function summary() {
    if (normalise($("ncertQuery")?.value)) return;
    const { records, crossChapter } = await getData();
    const chemistryCount = records.filter((record) => record.subject === "Chemistry").length;
    const physicsCount = records.filter((record) => record.subject === "Physics").length;
    const element = $("ncertResults");
    if (!element) return;
    element.innerHTML = `<div class="empty-state compact"><strong>${crossChapter.pageRecordCount} exact Biology source pages</strong> from <strong>${crossChapter.chapterCount} NCERT chapters</strong> are cross-linked, alongside <strong>${chemistryCount.toLocaleString("en-IN")} Chemistry concepts</strong> and <strong>${physicsCount.toLocaleString("en-IN")} Physics Class 11/12 records</strong>. Search a term to see every chapter and page where it occurs.</div>`;
  }

  async function search() {
    const input = $("ncertQuery");
    const query = normalise(input?.value);
    if (!query) {
      input?.focus();
      return summary();
    }
    const { records } = await getData();
    const alternatives = queryAlternatives(query);
    const matches = records
      .filter((record) => matchesQuery(record, alternatives))
      .map((record) => ({ ...record, __score: score(record, query, alternatives) }))
      .sort(
        (a, b) =>
          Number(Boolean(b.crossChapter)) - Number(Boolean(a.crossChapter)) ||
          (a.chapterNumber || 99) - (b.chapterNumber || 99) ||
          Number(a.printedPage) - Number(b.printedPage) ||
          b.__score - a.__score,
      );
    const element = $("ncertResults");
    if (!element) return;
    if (!matches.length) {
      element.innerHTML = `<div class="empty-state compact">No indexed NCERT match for “${esc(input.value.trim())}”. Try a shorter scientific term, abbreviation, or singular form.</div>`;
      return;
    }
    const crossMatches = matches.filter((record) => record.crossChapter);
    const matchingChapters = [...new Set(matches.map((record) => record.chapter))];
    const shown = matches.slice(0, 80);
    const seenChapters = new Set();
    element.innerHTML = `${crossMatches.length ? crossChapterSummary(crossMatches) : sourceSummary(matches)}
      <p class="ncert-result-count">${matches.length} matching NCERT reference${matches.length === 1 ? "" : "s"}${matches.length > shown.length ? ` · showing the first ${shown.length}` : ""}</p>
      <div class="ncert-result-grid">${shown
        .map((record) => {
          const firstInChapter = record.crossChapter && !seenChapters.has(record.chapter);
          if (firstInChapter) seenChapters.add(record.chapter);
          return resultCard(record, matchingChapters, firstInChapter);
        })
        .join("")}</div>`;
  }

  function install() {
    const description = document.querySelector("#ncert .section-head p");
    if (description)
      description.textContent =
        "Search Biology, Chemistry, or Physics NCERT terms and instantly see the chapter, section and page where each concept appears. Physics now includes the uploaded Class 11 chapters plus Class 12 concept records.";
    const input = $("ncertQuery");
    if (input) {
      input.placeholder = "Try: friction, torque, escape velocity, ATP, calcium, hormone…";
      input.setAttribute("aria-label", "Search concepts across NCERT chapters");
      input.addEventListener(
        "keydown",
        (event) => {
          if (event.key === "Enter") {
            event.stopImmediatePropagation();
            event.preventDefault();
            search();
          }
        },
        true,
      );
    }
    const button = $("ncertSearch");
    if (button)
      button.addEventListener(
        "click",
        (event) => {
          event.stopImmediatePropagation();
          event.preventDefault();
          search();
        },
        true,
      );
    setTimeout(summary, 700);
    setTimeout(summary, 1600);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install);
  else install();
})();
