import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mission600DppCode, mission600TestCode } from "../mission600-core.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "data", "mission600");
const subjectSpecs = [
  ["mathematics", "Mathematics", "MAT"],
  ["physics", "Physical Science", "PHY"],
  ["biology", "Biological Science", "BIO"],
  ["social-science", "Social Studies", "SOC"],
];

const readCatalog = (id) => JSON.parse(fs.readFileSync(path.join(root, "data", "class10", "textbooks", id, "catalog.json"), "utf8"));
const subjects = Object.fromEntries(subjectSpecs.map(([id, name, code]) => {
  const catalog = readCatalog(id);
  return [id, { id, name, code, sourceAcademicYear: catalog.academicYear, sourceTextbook: catalog.sourceTextbook,
    chapters: catalog.chapters.map((chapter, index) => ({ id: chapter.id, number: index + 1, name: chapter.name, sourceFile: chapter.file })) }];
}));

const phaseForWeek = (week) => week <= 9 ? ["SYL", "Syllabus Completion"] : week <= 13 ? ["HY", "High-Yield Revision"] : ["MOCK", "Mock Examination"];
const weekendStart = new Date("2026-10-17T00:00:00Z");
const iso = (date) => date.toISOString().slice(0, 10);
const addDays = (date, days) => new Date(date.getTime() + days * 86400000);
const chaptersByNumber = (subjectId, numbers) => numbers.map((number) => subjects[subjectId].chapters[number - 1]);
const block = (subjectId, numbers) => ({
  id: `${subjectId}-${numbers.join("-")}`,
  subjectId,
  chapterIds: chaptersByNumber(subjectId, numbers).map((chapter) => chapter.id),
  title: chaptersByNumber(subjectId, numbers).map((chapter) => chapter.name).join(" + "),
  integrated: numbers.length > 1,
});

// Nine syllabus weeks, exactly two focus subjects per week and at most three
// lecture blocks per subject. Short related Social Studies chapters are paired
// in integrated one-shot lectures because 57 chapters cannot fit into only 54
// standalone slots (9 weeks × 2 subjects × 3 lectures).
const syllabusFocus = {
  1: { mathematics: [[1], [2], [3]], physics: [[1], [2], [3]] },
  2: { biology: [[1], [2], [3]], "social-science": [[1], [2, 3], [4]] },
  3: { mathematics: [[4], [5], [6]], physics: [[4], [5], [6]] },
  4: { biology: [[4], [5], [6]], "social-science": [[5], [6, 7], [8]] },
  5: { mathematics: [[7], [8], [9]], physics: [[7], [8], [9]] },
  6: { biology: [[7], [8]], "social-science": [[9, 10], [11], [12]] },
  7: { mathematics: [[10], [11], [12]], physics: [[10], [11], [12]] },
  8: { biology: [[9], [10]], "social-science": [[13], [14, 15], [16]] },
  9: { mathematics: [[13], [14]], "social-science": [[17, 18], [19], [20, 21]] },
};

const languagePlans = [
  ["Orientation, reading fluency and diagnostic writing", "Grammar diagnostic and sentence correction", "Reading comprehension and vocabulary"],
  ["Prose lesson study and textual answers", "Prose lesson study and textual answers", "Prose lesson study and textual answers"],
  ["Poetry appreciation and central idea", "Poetry appreciation and central idea", "Poetry appreciation and poetic devices"],
  ["Grammar: forms, agreement and usage", "Grammar: forms, agreement and usage", "Grammar: tenses, agreement and editing"],
  ["Letter and formal writing", "Letter and formal writing", "Letter, notice and formal writing"],
  ["Creative writing and paragraph development", "Creative writing and paragraph development", "Creative writing and paragraph development"],
  ["Unseen passage and inference", "Unseen passage and inference", "Unseen passage and inference"],
  ["Textbook revision and answer presentation", "Textbook revision and answer presentation", "Textbook revision and answer presentation"],
  ["Syllabus consolidation and timed language paper", "Syllabus consolidation and timed language paper", "Syllabus consolidation and timed language paper"],
];

const weeks = [];
for (let week = 1; week <= 18; week += 1) {
  const saturday = addDays(weekendStart, (week - 1) * 7);
  const sunday = addDays(saturday, 1);
  const monday = addDays(saturday, -5);
  const [phaseCode, phaseName] = phaseForWeek(week);
  const focus = syllabusFocus[week] || {};
  const teachingBlocks = Object.fromEntries(Object.entries(focus).map(([subjectId, groups]) => [subjectId, groups.map((numbers) => block(subjectId, numbers))]));
  const teaching = Object.fromEntries(Object.entries(focus).map(([subjectId, groups]) => [subjectId, chaptersByNumber(subjectId, groups.flat())]));
  const focusSubjects = Object.keys(focus);
  const lectureDays = [[0, 2, 4], [1, 3, 4]];
  const lectures = focusSubjects.flatMap((subjectId, subjectIndex) => teachingBlocks[subjectId].map((item, index) => ({
    id: `SA-M600-LEC-W${String(week).padStart(2, "0")}-${subjects[subjectId].code}-${String(index + 1).padStart(2, "0")}`,
    subjectId,
    subject: subjects[subjectId].name,
    title: item.integrated ? `${item.title} – Integrated One-Shot` : `${item.title} – Complete Chapter Lecture`,
    chapterIds: item.chapterIds,
    publicationDate: iso(addDays(monday, lectureDays[subjectIndex][index])),
    youtubeUrl: "",
    status: "scheduled",
  })));
  weeks.push({
    week,
    phaseCode,
    phaseName,
    startDate: iso(monday),
    endDate: iso(sunday),
    focusSubjects,
    teaching,
    teachingBlocks,
    lectures,
    workflow: ["Monday: concept lecture", "Tuesday: detailed examples", "Wednesday: textbook problems", "Thursday: board answer writing", "Friday: revision and test preparation"],
    languagePlan: week <= 9 ? {
      telugu: languagePlans[week - 1][0],
      hindi: languagePlans[week - 1][1],
      english: languagePlans[week - 1][2],
      verification: "Map lesson names to the student's 2026-27 prescribed language/medium textbook before publication.",
    } : {
      telugu: phaseCode === "HY" ? "High-yield grammar, textual answers and timed writing" : "Optional full-syllabus language mock and review",
      hindi: phaseCode === "HY" ? "High-yield grammar, textual answers and timed writing" : "Optional full-syllabus language mock and review",
      english: phaseCode === "HY" ? "High-yield grammar, comprehension and timed writing" : "Optional full-syllabus language mock and review",
      verification: "Founder selects only the language combination prescribed for each student.",
    },
  });
}

const testPhase = (date) => date < new Date("2026-12-12T00:00:00Z") ? "SYL" : date < new Date("2027-01-12T00:00:00Z") ? "HY" : "MOCK";
const rotation = (week, day, phaseCode) => {
  if (week <= 9) return weeks[week - 1].focusSubjects[day];
  if (phaseCode !== "MOCK") {
    const weekA = week % 2 === 1;
    return day === 0 ? (weekA ? "mathematics" : "biology") : (weekA ? "physics" : "social-science");
  }
  const mockRotation = [["mathematics", "physics"], ["biology", "social-science"], ["mathematics", "physics"], ["biology", "social-science"]];
  return mockRotation[week - 14][day];
};
const testNames = { mathematics: "Mathematics", physics: "Physical Science", biology: "Biological Science", "social-science": "Social Studies" };
const challengeNames = { mathematics: "Mathematics Challenge", physics: "Physical Science Concept Challenge", biology: "Biological Science Mastery", "social-science": "Social Studies Board Builder" };
let sequence = 0;
const tests = [];
for (const week of weeks.slice(0, 17)) {
  [0, 1].forEach((day) => {
    sequence += 1;
    const date = addDays(new Date(`${week.startDate}T00:00:00Z`), 5 + day);
    const phaseCode = testPhase(date);
    const subjectId = rotation(week.week, day, phaseCode);
    const subject = subjects[subjectId];
    const covered = phaseCode === "SYL"
      ? weeks.slice(0, week.week).flatMap((item) => item.teaching?.[subjectId] || []).filter((chapter, index, all) => all.findIndex((candidate) => candidate.id === chapter.id) === index)
      : subjects[subjectId].chapters;
    const label = phaseCode === "MOCK" ? `${testNames[subjectId]} Mock Examination` : phaseCode === "HY" ? `High-Yield ${testNames[subjectId]} Challenge` : `${challengeNames[subjectId]} ${String(Math.ceil(week.week / 2)).padStart(2, "0")}`;
    tests.push({
      id: mission600TestCode({ phase: phaseCode, week: week.week, subject: subject.code, sequence }),
      name: `Mission 600 – ${label}`,
      subjectId,
      subject: subject.name,
      phaseCode,
      week: week.week,
      date: iso(date),
      day: day === 0 ? "Saturday" : "Sunday",
      opensAt: `${iso(date)}T08:00:00+05:30`,
      closesAt: `${iso(date)}T22:00:00+05:30`,
      pricePaise: 900,
      maximumMarks: phaseCode === "MOCK" ? 80 : 40,
      durationMinutes: phaseCode === "MOCK" ? 180 : 90,
      difficulty: phaseCode === "SYL" ? "Progressive" : phaseCode === "HY" ? "Board-focused" : "Official-pattern simulation",
      chapterIds: covered.map((chapter) => chapter.id),
      status: "draft",
      contentComplete: false,
      purchaseEnabled: false,
      evaluationMethod: "Human review required for descriptive and handwritten answers.",
    });
  });
}

const levels = [
  ["E", "Foundation Builder", "Easy"],
  ["M", "Concept Master", "Medium"],
  ["H", "Board Challenger", "Hard"],
];
const baseDpps = subjectSpecs.flatMap(([subjectId, subjectName, subjectCode]) => subjects[subjectId].chapters.flatMap((chapter) => levels.map(([level, title, difficulty]) => ({
  id: mission600DppCode({ subject: subjectCode, chapterNumber: chapter.number, level }),
  kind: "dpp",
  subjectId,
  subject: subjectName,
  subjectCode,
  chapterId: chapter.id,
  chapterNumber: chapter.number,
  chapter: chapter.name,
  level,
  title: `${chapter.name} – ${title}`,
  difficulty,
  pricePaise: 200,
  suggestedQuestionCount: 20,
  suggestedDurationMinutes: level === "E" ? 25 : level === "M" ? 35 : 45,
  status: "draft",
  contentComplete: false,
  purchaseEnabled: false,
  evaluationMethod: level === "E" ? "Objective items may be auto-checked; descriptive answers require rubric review." : "Rubric-based review; handwritten descriptive answers require human review.",
}))));

const mathManifestPath = path.join(outputDir, "math-dpp-manifest.json");
const mathManifest = fs.existsSync(mathManifestPath) ? JSON.parse(fs.readFileSync(mathManifestPath, "utf8")) : { dpps: [] };
const mathDpps = new Map(mathManifest.dpps.map((item) => [item.id, item]));
const dpps = baseDpps.map((item) => mathDpps.has(item.id) ? {
  ...item,
  ...mathDpps.get(item.id),
  suggestedQuestionCount: mathDpps.get(item.id).questionCount,
} : item);

const payload = {
  programme: "Scrutiny Academy – Mission 600",
  subtitle: "Learn → Revise → Practise → Test → Analyse → Improve",
  timezone: "Asia/Kolkata",
  sourceStatus: {
    officialAcademicCalendar: "SCERT Telangana published an Academic Calendar 2026-27 entry on 24 August 2026.",
    textbookBasis: "The official SCERT e-book catalogue available during the audit is labelled 2025-26; local chapter data uses those books and must be rechecked when official 2026-27 e-books are posted.",
    productionGate: "No DPP or test becomes purchasable until contentComplete, status=published and purchaseEnabled are all true.",
  },
  pricingPolicy: {
    individualDppPaise: 200,
    individualTestPaise: 900,
    dppOnlyDiscountPercent: 0,
    testOnlyDiscountPercent: 0,
    combinedCompleteBundleDiscountPercent: 10,
    combinedCompleteBundleMaximumDiscountPaise: 10000,
    text: "No DPP-only or test-only discount. Buy the complete remaining DPP collection and complete remaining written-test series together for 10% off, capped at ₹100.",
  },
  phases: [
    { code: "SYL", name: "Complete Syllabus Mastery", startDate: "2026-10-12", endDate: "2026-12-11" },
    { code: "HY", name: "High-Yield Board Booster", startDate: "2026-12-12", endDate: "2027-01-11" },
    { code: "MOCK", name: "Mission 600 Mock Championship", startDate: "2027-01-12", endDate: "2027-02-12" },
    { code: "FINAL", name: "Final Board Revision Mode", startDate: "2027-02-13", endDate: null },
  ],
  subjects,
  weeks,
  tests,
  dpps,
  counts: { chapters: Object.values(subjects).reduce((n, subject) => n + subject.chapters.length, 0), dpps: dpps.length, weekendTests: tests.length },
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "catalog.json"), `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Mission 600: ${payload.counts.chapters} chapters, ${payload.counts.dpps} DPP records, ${payload.counts.weekendTests} weekend tests.`);

