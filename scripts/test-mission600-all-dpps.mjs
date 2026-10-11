import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const catalog = JSON.parse(readFileSync(new URL("data/mission600/catalog.json", root), "utf8"));
const expectedSubjects = { mathematics: 42, physics: 36, biology: 30, "social-science": 63 };
const chapterCache = new Map();

function selectQuestions(chapter, difficulty) {
  const easy = chapter.mcqs.filter((item) => item.difficulty === "Easy");
  const medium = chapter.mcqs.filter((item) => item.difficulty === "Medium");
  const hard = chapter.mcqs.filter((item) => item.difficulty === "Hard");
  if (difficulty === "Easy") return [...easy, ...medium].slice(0, 20);
  if (difficulty === "Hard") return [...hard, ...medium.slice().reverse()].slice(0, 20);
  return medium.slice(0, 20);
}

if (catalog.dpps.length !== 171) throw new Error(`Expected 171 DPPs, found ${catalog.dpps.length}.`);
if (new Set(catalog.dpps.map((dpp) => dpp.id)).size !== 171) throw new Error("DPP IDs must be unique.");
if (new Set(catalog.dpps.map((dpp) => dpp.chapterId)).size !== 57) throw new Error("Expected coverage for all 57 chapters.");

for (const [subjectId, expected] of Object.entries(expectedSubjects)) {
  const actual = catalog.dpps.filter((dpp) => dpp.subjectId === subjectId).length;
  if (actual !== expected) throw new Error(`${subjectId} should have ${expected} DPPs, found ${actual}.`);
}

for (const chapterId of new Set(catalog.dpps.map((dpp) => dpp.chapterId))) {
  const chapterDpps = catalog.dpps.filter((dpp) => dpp.chapterId === chapterId);
  if (chapterDpps.length !== 3) throw new Error(`${chapterId} must have exactly three DPPs.`);
  for (const difficulty of ["Easy", "Medium", "Hard"]) if (!chapterDpps.some((dpp) => dpp.difficulty === difficulty)) throw new Error(`${chapterId} is missing ${difficulty}.`);
}

for (const dpp of catalog.dpps) {
  const path = `data/class10/textbooks/${dpp.subjectId}/chapter-${String(dpp.chapterNumber).padStart(2, "0")}.json`;
  const chapter = chapterCache.get(path) || JSON.parse(readFileSync(new URL(path, root), "utf8"));
  chapterCache.set(path, chapter);
  const questions = selectQuestions(chapter, dpp.difficulty);
  if (questions.length !== 20) throw new Error(`${dpp.id} must resolve to 20 MCQs.`);
  for (const question of questions) {
    if (!Array.isArray(question.options) || question.options.length !== 4 || new Set(question.options).size !== 4) throw new Error(`${question.id} must have four unique options.`);
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) throw new Error(`${question.id} has an invalid answer.`);
    if (!question.explanation?.trim()) throw new Error(`${question.id} needs an explanation.`);
  }
}

const player = readFileSync(new URL("mission600-dpp.js", root), "utf8");
const playerPage = readFileSync(new URL("mission600-dpp.html", root), "utf8");
const missionPage = readFileSync(new URL("mission600.html", root), "utf8");
const missionScript = readFileSync(new URL("mission600.js", root), "utf8");
if (!playerPage.includes("mission600-dpp.js?v=9")) throw new Error("The DPP player cache key is stale.");
for (const required of ["selectQuestions", "questionTopic", "correct", "wrong", "unanswered", "focusTopics", "Topic-by-topic analysis", "Solve another DPP"]) if (!player.includes(required)) throw new Error(`DPP player is missing ${required}.`);
if (/Mission 600 is included with Class 10|official SCERT e-book catalogue|sourceNotice|renderNotice/.test(missionPage + missionScript)) throw new Error("The removed Mission 600 notice is still present.");
if (/₹2|₹9/.test(missionPage + missionScript + playerPage + player)) throw new Error("Retired Mission 600 prices are still visible.");

console.log("Mission 600 validation passed: 57 chapters, 171 DPPs, 3,420 MCQ slots, detailed analytics, and no retired notice/prices.");
