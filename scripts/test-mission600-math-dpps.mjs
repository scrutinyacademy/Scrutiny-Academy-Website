import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const privatePath = path.join(root, "data/mission600/private/mathematics-dpps.json");
const manifestPath = path.join(root, "data/mission600/math-dpp-manifest.json");
if (!fs.existsSync(privatePath)) throw new Error("Run build-mission600-math-dpps.mjs first.");
const bank = JSON.parse(fs.readFileSync(privatePath, "utf8"));
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const expectedLevels = new Set(["E", "M", "H"]);
const ids = new Set(), questionIds = new Set();
if (bank.dpps.length !== 42) throw new Error(`Expected 42 DPPs, received ${bank.dpps.length}.`);
if (manifest.dpps.length !== 42 || manifest.counts.questions !== 840) throw new Error("Public manifest counts are incorrect.");
for (let chapter = 1; chapter <= 14; chapter += 1) {
  const chapterDpps = bank.dpps.filter((item) => item.chapterNumber === chapter);
  if (chapterDpps.length !== 3 || new Set(chapterDpps.map((item) => item.level)).size !== 3 || chapterDpps.some((item) => !expectedLevels.has(item.level))) throw new Error(`Chapter ${chapter} does not contain E/M/H DPPs.`);
}
for (const dpp of bank.dpps) {
  if (ids.has(dpp.id)) throw new Error(`Duplicate DPP id ${dpp.id}.`);
  ids.add(dpp.id);
  if (dpp.questions.length !== 20 || dpp.questionCount !== 20 || dpp.maximumMarks !== 20) throw new Error(`${dpp.id} must contain 20 one-mark questions.`);
  if (dpp.pricePaise !== 0 || dpp.purchaseEnabled !== false) throw new Error(`${dpp.id} must be included without a separate payment.`);
  if (new Set(dpp.questions.map((question) => question.question)).size !== 20) throw new Error(`${dpp.id} contains duplicate question text.`);
  for (const question of dpp.questions) {
    if (questionIds.has(question.id)) throw new Error(`Duplicate question id ${question.id}.`);
    questionIds.add(question.id);
    if (!question.question || !question.explanation || question.options.length !== 4 || new Set(question.options).size !== 4) throw new Error(`Malformed MCQ ${question.id}.`);
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) throw new Error(`Invalid answer index in ${question.id}.`);
    if (question.options[question.answer] == null) throw new Error(`Missing correct option in ${question.id}.`);
  }
}
if (questionIds.size !== 840) throw new Error(`Expected 840 unique question ids, received ${questionIds.size}.`);
console.log("Mission 600 Mathematics DPP validation passed: 14 chapters, 42 DPPs, 840 MCQs.");
