import fs from "node:fs";

const expected = {
  mathematics: 14,
  biology: 10,
  physics: 12,
  "social-science": 21,
};

let chapters = 0;
let mcqs = 0;
let vsaq = 0;
let saq = 0;
let laq = 0;
const ids = new Set();
const errors = [];

for (const [subject, expectedChapters] of Object.entries(expected)) {
  const data = JSON.parse(fs.readFileSync(`data/class10/${subject}.json`, "utf8"));
  const catalog = JSON.parse(fs.readFileSync(`data/class10/textbooks/${subject}/catalog.json`, "utf8"));
  if (catalog.chapters.length !== expectedChapters) errors.push(`${subject}: sharded catalog is incomplete`);
  if (data.chapters.length !== expectedChapters) errors.push(`${subject}: expected ${expectedChapters} chapters, found ${data.chapters.length}`);
  chapters += data.chapters.length;
  for (const chapter of data.chapters) {
    const catalogChapter = catalog.chapters.find((item) => item.id === chapter.id);
    if (!catalogChapter?.file || !fs.existsSync(catalogChapter.file)) errors.push(`${chapter.name}: missing chapter shard`);
    if (!chapter.overview || !chapter.textbookSource || !chapter.textbookPages) errors.push(`${chapter.name}: incomplete textbook metadata`);
    if (chapter.mcqs.length !== 50) errors.push(`${chapter.name}: expected 50 MCQs, found ${chapter.mcqs.length}`);
    const chapterQuestions = new Set();
    for (const question of chapter.mcqs) {
      if (ids.has(question.id)) errors.push(`duplicate id: ${question.id}`);
      ids.add(question.id);
      if (chapterQuestions.has(question.question)) errors.push(`${chapter.name}: duplicate MCQ wording`);
      chapterQuestions.add(question.question);
      if (!Array.isArray(question.options) || question.options.length !== 4) errors.push(`${question.id}: expected four options`);
      if (!Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3) errors.push(`${question.id}: invalid answer index`);
      const normalized = new Set((question.options || []).map((option) => String(option).toLowerCase().replace(/[^a-z0-9]/g, "")));
      if (normalized.size !== 4) errors.push(`${question.id}: duplicate options`);
      if (!question.explanation || !question.sourcePage) errors.push(`${question.id}: missing explanation/source page`);
      if (question.sourcePage < chapter.textbookPages.from || question.sourcePage > chapter.textbookPages.to) errors.push(`${question.id}: source page outside chapter range`);
    }
    mcqs += chapter.mcqs.length;
    vsaq += chapter.vsaq.length;
    saq += chapter.saq.length;
    laq += chapter.laq.length;
  }
}

if (errors.length) {
  console.error(errors.slice(0, 100).join("\n"));
  process.exit(1);
}

console.log(`Validated ${chapters} Class 10 textbook chapters: ${mcqs} MCQs, ${vsaq} VSAQs, ${saq} SAQs and ${laq} LAQs.`);
