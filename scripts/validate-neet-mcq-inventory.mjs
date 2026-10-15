import fs from "node:fs";
import assert from "node:assert/strict";

const inventory = JSON.parse(fs.readFileSync("data/neet/mcq-inventory.json", "utf8"));
assert.equal(inventory.totalPublishedMcqs, 259916);
assert.deepEqual(inventory.sections, {
  chapterWise: 42650,
  highYield: 215000,
  kotaLevel: 1872,
  ranker: 214,
  pyq2025: 180,
});
assert.deepEqual(Object.fromEntries(Object.entries(inventory.bySubject).map(([key, row]) => [key, row.total])), {
  biology: 128376,
  physics: 67345,
  chemistry: 64195,
});
assert.equal(Object.values(inventory.bySubject).reduce((total, row) => total + row.total, 0), 259916);
assert.equal(inventory.excludedFromMcqTotal.ncertArcadeChallenges, 1000);
const core = fs.readFileSync("v2-core.js", "utf8");
const html = fs.readFileSync("preview-v2.html", "utf8");
assert.match(core, /q = Number\(inventory\.totalPublishedMcqs \|\| 0\)/);
assert.match(core, /renderNeetMcqInventory\(inventory\)/);
assert.match(html, /id="neetPublishedInventory"/);
assert.match(core, /Plus \$\{format\(inventory\.excludedFromMcqTotal/);
console.log("PASS: 259,916 published NEET MCQs reconcile by section and subject; 1,000 Arcade challenges are labelled separately.");
