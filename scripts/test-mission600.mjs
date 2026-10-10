import assert from "node:assert/strict";
import fs from "node:fs";
import { calculateMission600Cart, mission600DppCode, mission600TestCode } from "../mission600-core.mjs";

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
for (const week of catalog.weeks.slice(0, 9)) {
  assert.equal(week.focusSubjects.length, 2);
  assert.equal(Object.keys(week.teachingBlocks).length, 2);
  assert.ok(Object.values(week.teachingBlocks).every((blocks) => blocks.length >= 1 && blocks.length <= 3));
  assert.ok(week.lectures.every((lecture) => lecture.publicationDate >= week.startDate && lecture.publicationDate <= "2026-12-11"));
}
assert.deepEqual(catalog.weeks.slice(0, 9).map((week) => week.focusSubjects), [
  ["mathematics", "physics"], ["biology", "social-science"], ["mathematics", "physics"],
  ["biology", "social-science"], ["mathematics", "physics"], ["biology", "social-science"],
  ["mathematics", "physics"], ["biology", "social-science"], ["mathematics", "social-science"],
]);
assert.equal(catalog.weeks[8].lectures.at(-1).publicationDate, "2026-12-11");
assert.equal(mission600TestCode({ phase: "SYL", week: 1, subject: "MAT", sequence: 1 }), "SA-M600-27-SYL-W01-MAT-001");
assert.equal(mission600DppCode({ subject: "MAT", chapterNumber: 1, level: "E" }), "SA-DPP-27-MAT-CH01-E");

const dpps = [{ id: "d1", kind: "dpp", subjectId: "mathematics", chapterId: "ch1", pricePaise: 200 }, { id: "d2", kind: "dpp", subjectId: "biology", chapterId: "ch1", pricePaise: 200 }];
const tests = [{ id: "t1", kind: "test", pricePaise: 900 }, { id: "t2", kind: "test", pricePaise: 900 }];
assert.equal(calculateMission600Cart(dpps, { requiredDppIds: ["d1", "d2"], requiredTestIds: ["t1", "t2"] }).discountPaise, 0);
assert.equal(calculateMission600Cart(tests, { requiredDppIds: ["d1", "d2"], requiredTestIds: ["t1", "t2"] }).discountPaise, 0);
const combined = calculateMission600Cart([...dpps, ...tests], { requiredDppIds: ["d1", "d2"], requiredTestIds: ["t1", "t2"] });
assert.equal(combined.discountPercentage, 10);
assert.equal(combined.discountPaise, 220);
assert.equal(combined.totalPaise, 1980);
const capped = calculateMission600Cart([{ id: "d1", kind: "dpp", pricePaise: 60000 }, { id: "t1", kind: "test", pricePaise: 60000 }], { requiredDppIds: ["d1"], requiredTestIds: ["t1"] });
assert.equal(capped.discountPaise, 10000);
const fullDppSet = catalog.dpps.map((item) => ({ ...item, kind: "dpp" }));
const fullTestSet = catalog.tests.map((item) => ({ ...item, kind: "test" }));
const completeProgramme = calculateMission600Cart([...fullDppSet, ...fullTestSet], { requiredDppIds: fullDppSet.map((item) => item.id), requiredTestIds: fullTestSet.map((item) => item.id) });
assert.equal(completeProgramme.subtotalPaise, 64800);
assert.equal(completeProgramme.discountPaise, 6480);
assert.equal(completeProgramme.totalPaise, 58320);
console.log("Mission 600 catalogue and pricing tests passed.");
