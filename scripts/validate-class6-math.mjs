import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const course = JSON.parse(await readFile(new URL("../data/class6/mathematics.json", import.meta.url), "utf8"));

assert.equal(course.chapters.length, 10, "The course must contain 10 chapters.");

for (const [chapterIndex, chapter] of course.chapters.entries()) {
  assert.ok(chapter.id && chapter.title && chapter.goal && chapter.summary, `Chapter ${chapterIndex + 1} needs complete metadata.`);
  assert.ok(chapter.topics.length >= 6, `${chapter.title} needs at least 6 topic lessons.`);
  assert.equal(chapter.flashcards.length, 55, `${chapter.title} must have 55 flashcards.`);
  assert.equal(chapter.mcqs.length, 150, `${chapter.title} must have 150 MCQs.`);
  assert.ok(chapter.importantQuestions.length >= 14, `${chapter.title} needs at least 14 important questions.`);
  assert.equal(new Set(chapter.mcqs.map((item) => item.id)).size, 150, `${chapter.title} has duplicate MCQ IDs.`);
  assert.equal(new Set(chapter.mcqs.map((item) => item.question)).size, 150, `${chapter.title} has duplicate MCQ questions.`);

  for (const [questionIndex, question] of chapter.mcqs.entries()) {
    assert.equal(question.options.length, 4, `${chapter.title} MCQ ${questionIndex + 1} must have four options.`);
    assert.ok(Number.isInteger(question.correctIndex) && question.correctIndex >= 0 && question.correctIndex < 4, `${chapter.title} MCQ ${questionIndex + 1} has an invalid answer.`);
    assert.ok(question.explanation.length >= 8, `${chapter.title} MCQ ${questionIndex + 1} needs an explanation.`);
    assert.equal(new Set(question.options.map(String)).size, 4, `${chapter.title} MCQ ${questionIndex + 1} has duplicate options.`);
  }
}

const totals = course.chapters.reduce((sum, chapter) => ({
  topics: sum.topics + chapter.topics.length,
  flashcards: sum.flashcards + chapter.flashcards.length,
  importantQuestions: sum.importantQuestions + chapter.importantQuestions.length,
  mcqs: sum.mcqs + chapter.mcqs.length
}), { topics: 0, flashcards: 0, importantQuestions: 0, mcqs: 0 });

console.log(JSON.stringify({ chapters: course.chapters.length, ...totals }, null, 2));
