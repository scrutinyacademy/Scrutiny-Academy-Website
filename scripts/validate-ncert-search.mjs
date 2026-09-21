import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) =>
  JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const catalog = read("data/ncert/catalog.json");
const physics = read("data/neet/physics.json");
const class11 = read("data/ncert/physics-class11-uploaded.json");
const chapters = physics.chapters.filter(
  (chapter) => chapter.classLevel === 12 && chapter.mcqs?.length,
);
const chapterNames = new Set(chapters.map((chapter) => chapter.name));
for (const chapter of class11.chapters || []) chapterNames.add(chapter.chapter);

assert.equal(catalog.status, "active");
assert.equal(catalog.class11ChapterCount, 7);
assert.equal(catalog.class12ChapterCount, 14);
assert.equal(catalog.chapterCount, 21);
assert.equal(chapters.length, 14);
assert.ok(catalog.records.length > 420);
assert.equal(
  new Set(catalog.records.map((record) => record.id)).size,
  catalog.records.length,
);

for (const chapter of chapters) {
  assert.equal(
    catalog.records.filter((record) => record.chapter === chapter.name).length,
    30,
    `Expected 30 indexed concepts: ${chapter.name}`,
  );
}

for (const record of catalog.records) {
  assert.ok([11, 12].includes(record.class));
  assert.equal(record.subject, "Physics");
  assert.ok(chapterNames.has(record.chapter), `Unknown chapter: ${record.chapter}`);
  for (const field of [
    "topic",
    "meaning",
    "section",
    "sourceLabel",
    "pdfFilename",
    "keywords",
  ]) {
    assert.ok(record[field]?.trim(), `Missing ${field}: ${record.id}`);
  }
  assert.ok(Number.isInteger(record.pdfPage) && record.pdfPage > 0);
  assert.ok(Number.isInteger(record.printedPage) && record.printedPage > 0);
}

for (const term of [
  "significant figures",
  "instantaneous velocity",
  "projectile motion",
  "static friction",
  "kinetic energy",
  "torque",
  "escape velocity",
  "electric flux",
  "capacitance",
  "kirchhoff",
  "cyclotron",
  "diamagnetism",
  "lenz law",
  "transformer",
  "displacement current",
  "total internal reflection",
  "young double slit",
  "photoelectric effect",
  "bohr radius",
  "binding energy",
  "pn junction",
]) {
  const words = term.toLowerCase().split(/\s+/);
  assert.ok(
    catalog.records.some((record) => {
      const haystack = [
        record.topic,
        record.meaning,
        record.chapter,
        record.section,
        record.keywords,
      ]
        .join(" ")
        .toLowerCase();
      return words.every((word) => haystack.includes(word));
    }),
    `No NCERT search result for: ${term}`,
  );
}

console.log(
  `Validated ${catalog.records.length} NCERT Physics search records across 21 Class 11/12 chapters and representative keyword queries.`,
);
