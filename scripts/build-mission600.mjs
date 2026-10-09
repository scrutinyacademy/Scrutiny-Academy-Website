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
const chapterSlice = (subject, week) => {
  const chapters = subjects[subject].chapters;
  const start = Math.floor((week - 1) * chapters.length / 9);
  const end = Math.floor(week * chapters.length / 9);
  return chapters.slice(start, end);
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
  const teaching = week <= 9 ? Object.fromEntries(subjectSpecs.map(([id]) => [id, chapterSlice(id, week)])) : {};
  weeks.push({
    week,
    phaseCode,
    phaseName,
    startDate: iso(monday),
    endDate: iso(sunday),
    teaching,
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
      ? subjects[subjectId].chapters.slice(0, Math.floor(week.week * subjects[subjectId].chapters.length / 9))
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
const dpps = subjectSpecs.flatMap(([subjectId, subjectName, subjectCode]) => subjects[subjectId].chapters.flatMap((chapter) => levels.map(([level, title, difficulty]) => ({
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
  suggestedQuestionCount: level === "H" ? 15 : 20,
  suggestedDurationMinutes: level === "E" ? 25 : level === "M" ? 35 : 45,
  status: "draft",
  contentComplete: false,
  purchaseEnabled: false,
  evaluationMethod: level === "E" ? "Objective items may be auto-checked; descriptive answers require rubric review." : "Rubric-based review; handwritten descriptive answers require human review.",
}))));

const payload = {
  programme: "Scrutiny Academy – Mission 600",
  subtitle: "Learn → Revise → Practise → Test → Analyse → Improve",
  timezone: "Asia/Kolkata",
  sourceStatus: {
    officialAcademicCalendar: "SCERT Telangana published an Academic Calendar 2026-27 entry on 24 August 2026.",
    textbookBasis: "The official SCERT e-book catalogue available during the audit is labelled 2025-26; local chapter data uses those books and must be rechecked when official 2026-27 e-books are posted.",
    productionGate: "No DPP or test becomes purchasable until contentComplete, status=published and purchaseEnabled are all true.",
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

