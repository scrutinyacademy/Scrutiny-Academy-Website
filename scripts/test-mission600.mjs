import assert from "node:assert/strict";
import fs from "node:fs";
import { calculateDppCart, mission600DppCode, mission600TestCode } from "../mission600-core.mjs";

const catalog = JSON.parse(fs.readFileSync(new URL("../data/mission600/catalog.json", import.meta.url), "utf8"));
assert.equal(catalog.counts.chapters, 57);
assert.equal(catalog.counts.dpps, 171);
assert.equal(catalog.counts.weekendTests, 34);
assert.equal(new Set(catalog.tests.map((test) => test.id)).size, 34);
assert.equal(new Set(catalog.dpps.map((dpp) => dpp.id)).size, 171);
assert.equal(catalog.tests[0].date, "2026-10-17");
assert.equal(catalog.tests.at(-1).date, "2027-02-07");
assert.ok(catalog.tests.every((test) => test.pricePaise === 900 && !test.purchaseEnabled));
assert.ok(catalog.dpps.every((dpp) => dpp.pricePaise === 200 && !dpp.purchaseEnabled));
assert.ok(catalog.tests.every((test) => [6, 0].includes(new Date(`${test.date}T00:00:00Z`).getUTCDay())));
assert.ok(catalog.tests.every((test) => test.date <= "2027-02-07"));
for (const subject of Object.values(catalog.subjects)) {
  const taught = catalog.weeks.flatMap((week) => week.teaching?.[subject.id] || []).map((chapter) => chapter.id);
  assert.deepEqual(new Set(taught), new Set(subject.chapters.map((chapter) => chapter.id)));
  for (const chapter of subject.chapters) assert.equal(catalog.dpps.filter((dpp) => dpp.chapterId === chapter.id).length, 3);
}
assert.equal(mission600TestCode({ phase: "SYL", week: 1, subject: "MAT", sequence: 1 }), "SA-M600-27-SYL-W01-MAT-001");
assert.equal(mission600DppCode({ subject: "MAT", chapterNumber: 1, level: "E" }), "SA-DPP-27-MAT-CH01-E");

const makeItems = (chapters) => Array.from({ length: chapters }, (_, index) => ({ kind: "dpp", subjectId: "mathematics", chapterId: `ch${index + 1}`, pricePaise: 200 }));
assert.deepEqual(calculateDppCart(makeItems(1)), { itemCount: 1, distinctChapterCount: 1, subtotalPaise: 200, discountPercentage: 3, discountPaise: 6, totalPaise: 194, roundingPolicy: "All prices are stored in paise; percentage discounts round half-up to the nearest paisa." });
assert.equal(calculateDppCart(makeItems(2)).discountPercentage, 6);
assert.equal(calculateDppCart(makeItems(10)).discountPercentage, 30);
assert.equal(calculateDppCart(makeItems(14)).discountPercentage, 30);
assert.equal(calculateDppCart([
  { kind: "dpp", subjectId: "mathematics", chapterId: "ch1", pricePaise: 200 },
  { kind: "dpp", subjectId: "mathematics", chapterId: "ch1", pricePaise: 200 },
  { kind: "dpp", subjectId: "mathematics", chapterId: "ch1", pricePaise: 200 },
]).distinctChapterCount, 1);
console.log("Mission 600 catalogue and pricing tests passed.");
