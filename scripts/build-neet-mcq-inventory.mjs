import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const sum = (items, fn) => items.reduce((total, item) => total + fn(item), 0);
const chapterMcqs = (file) => sum(read(file).chapters || [], (chapter) => (chapter.mcqs || []).length);
const generatedMcqs = (file) => {
  const pack = read(file);
  return sum(pack.chapters || [], (chapter) => (chapter.specs || []).length) + (pack.diagrams || []).length;
};

const base = ["biology", "physics", "chemistry"].map((subject) => ({
  subject,
  base: chapterMcqs(`data/neet/${subject}.json`),
  expansion: generatedMcqs(`data/neet/expansion/${subject}.json`),
  highYield: generatedMcqs(`data/neet/high-yield/${subject}.json`),
}));

const kotaCatalog = read("data/neet/kota-biology/catalog.json");
const kotaActual = sum(kotaCatalog.chapters || [], (chapter) => {
  const bank = read(chapter.file);
  if ((bank.questions || []).length !== chapter.totalQuestions)
    throw Error(`${chapter.file}: catalog count does not match its published questions`);
  return bank.questions.length;
});
const ranker = read("data/neet/ranker/cell-unit-of-life.json");
const rankerActual = sum(ranker.chapters || [], (chapter) => (chapter.mcqs || []).length);
const pyq = read("data/pyq/neet-2025-code48.json");
const arcade = read("data/ncert-quest/arcade.json");

if (kotaActual !== kotaCatalog.totalQuestions) throw Error("Kota catalog total is inaccurate");
if (rankerActual !== ranker.totalMcqs) throw Error("Ranker catalog total is inaccurate");
if (pyq.questions.length !== 180) throw Error("NEET 2025 PYQ count is inaccurate");
if (sum(base, (row) => row.base + row.expansion) !== 42650) throw Error("Chapter-wise NEET bank is not 42,650");
if (sum(base, (row) => row.highYield) !== 95000) throw Error("High Yield bank is not 95,000");

const subjectPyqs = pyq.questions.reduce((counts, question) => {
  const subject = question.subject === "Physics" ? "physics" : question.subject === "Chemistry" ? "chemistry" : "biology";
  counts[subject] = (counts[subject] || 0) + 1;
  return counts;
}, {});
const bySubject = Object.fromEntries(base.map((row) => [row.subject, {
  chapterWise: row.base + row.expansion,
  highYield: row.highYield,
  kotaLevel: row.subject === "biology" ? kotaActual : 0,
  ranker: row.subject === "biology" ? rankerActual : 0,
  pyq2025: subjectPyqs[row.subject] || 0,
  total: row.base + row.expansion + row.highYield + (row.subject === "biology" ? kotaActual + rankerActual : 0) + (subjectPyqs[row.subject] || 0),
}]));
const sections = {
  chapterWise: sum(base, (row) => row.base + row.expansion),
  highYield: sum(base, (row) => row.highYield),
  kotaLevel: kotaActual,
  ranker: rankerActual,
  pyq2025: pyq.questions.length,
};
const totalPublishedMcqs = Object.values(sections).reduce((total, count) => total + count, 0);
const inventory = {
  schemaVersion: 1,
  auditedAt: "2026-10-15",
  label: "Published inside the NEET UG student portal",
  totalPublishedMcqs,
  sections,
  bySubject,
  excludedFromMcqTotal: {
    ncertArcadeChallenges: arcade.challengeCount,
    reason: "Published as interactive learning games and counted separately from MCQs.",
  },
};

if (totalPublishedMcqs !== 139916) throw Error(`Expected 139,916 published MCQs; found ${totalPublishedMcqs}`);
if (Object.values(bySubject).reduce((total, row) => total + row.total, 0) !== totalPublishedMcqs)
  throw Error("Subject totals do not reconcile with the portal total");

fs.writeFileSync(path.join(root, "data/neet/mcq-inventory.json"), JSON.stringify(inventory, null, 2) + "\n");
console.log(JSON.stringify(inventory, null, 2));
