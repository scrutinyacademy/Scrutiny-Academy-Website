import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) =>
  JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const catalog = read("data/ncert/catalog.json");
const physics = read("data/neet/physics.json");
const chapters = physics.chapters.filter(
  (chapter) => chapter.classLevel === 12 && chapter.mcqs?.length,
);
const chapterNames = new Set(chapters.map((chapter) => chapter.name));

assert.equal(catalog.status, "active");
assert.equal(catalog.chapterCount, 14);
assert.equal(chapters.length, 14);
assert.equal(catalog.records.length, 420);
assert.equal(new Set(catalog.records.map((record) => record.id)).size, 420);

for (const chapter of chapters) {
  assert.equal(
    catalog.records.filter((record) => record.chapter === chapter.name).length,
    30,
    `Expected 30 indexed concepts: ${chapter.name}`,
  );
}

for (const record of catalog.records) {
  assert.equal(record.class, 12);
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
  "Validated 420 NCERT search concepts across all 14 Class 12 Physics chapters and representative keyword queries.",
);
