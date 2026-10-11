import { publishedMathematicsDpps } from "../mission600-math-dpp-bank.mjs";

const expectedChapters = ["Real Numbers", "Sets", "Polynomials"];
const expectedDifficulties = ["Easy", "Medium", "Hard"];

if (publishedMathematicsDpps.length !== 9) throw new Error(`Expected 9 DPPs, found ${publishedMathematicsDpps.length}.`);
if (new Set(publishedMathematicsDpps.map((dpp) => dpp.id)).size !== 9) throw new Error("DPP IDs must be unique.");

for (const chapter of expectedChapters) {
  const chapterDpps = publishedMathematicsDpps.filter((dpp) => dpp.chapter === chapter);
  if (chapterDpps.length !== 3) throw new Error(`${chapter} must have exactly 3 DPPs.`);
  if (expectedDifficulties.some((difficulty) => !chapterDpps.some((dpp) => dpp.difficulty === difficulty))) throw new Error(`${chapter} is missing a difficulty level.`);
}

for (const dpp of publishedMathematicsDpps) {
  if (dpp.questions.length !== 20 || dpp.questionCount !== 20 || dpp.maximumMarks !== 20) throw new Error(`${dpp.id} must contain exactly 20 one-mark MCQs.`);
  if (dpp.pricePaise !== 0 || dpp.purchaseEnabled !== false || dpp.status !== "published") throw new Error(`${dpp.id} must be published without a separate Mission 600 payment.`);
  if (new Set(dpp.questions.map((question) => question.id)).size !== 20) throw new Error(`${dpp.id} contains duplicate question IDs.`);
  if (new Set(dpp.questions.map((question) => question.question)).size !== 20) throw new Error(`${dpp.id} contains duplicate question text.`);
  for (const question of dpp.questions) {
    if (!Array.isArray(question.options) || question.options.length !== 4) throw new Error(`${question.id} must have four options.`);
    if (new Set(question.options).size !== 4) throw new Error(`${question.id} contains duplicate options.`);
    if (question.options.some((option) => /None of these \d/.test(option))) throw new Error(`${question.id} contains a generated placeholder option.`);
    if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) throw new Error(`${question.id} has an invalid answer index.`);
    if (!question.explanation?.trim()) throw new Error(`${question.id} needs an explanation.`);
  }
}

console.log("Mission 600 Maths DPP validation passed: 3 chapters, 9 DPPs, 180 MCQs.");
