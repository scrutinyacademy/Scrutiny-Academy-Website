import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'data/neet/class11-physics-bank.js'), 'utf8'), context);
const data = { chapters: context.window.SCRUTINY_CLASS11_PHYSICS };
const targetNames = [
  'Units and Measurements',
  'Motion in a Straight Line',
  'Motion in a Plane',
  'Laws of Motion',
  'Work, Energy and Power',
  'System of Particles and Rotational Motion',
  'Gravitation',
];
const pdfByChapter = {
  'Units and Measurements': 'UNITS AND MEASUREMENT.pdf',
  'Motion in a Straight Line': 'MOTION IN A STRAIGHT LINE.pdf',
  'Motion in a Plane': 'MOTION IN A PLANE.pdf',
  'Laws of Motion': 'LAWS OF MOTION.pdf',
  'Work, Energy and Power': 'WORK, ENERGY AND POWER.pdf',
  'System of Particles and Rotational Motion': 'SYSTEMS OF PARTICLES AND ROTATIONAL MOTION.pdf',
  Gravitation: 'GRAVITATION.pdf',
};
const ids = new Set();
const exact = new Map();
const report = [];
const normalize = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

for (const name of targetNames) {
  const chapter = data.chapters.find(item => item.name === name && item.classLevel === 11);
  assert.ok(chapter, `Missing chapter: ${name}`);
  assert.equal(chapter.subtopics?.length, 4, `${name}: subtopic count`);
  assert.equal(chapter.mcqs?.length, 160, `${name}: total question count`);
  const chapterStats = { name, subtopics: chapter.subtopics.length, total: 0, difficulty: {}, types: {}, visuals: 0, numericals: 0 };
  for (const subtopic of chapter.subtopics) {
    assert.equal(subtopic.mcqs.length, 40, `${name} / ${subtopic.name}: question count`);
    const diff = { Foundation: 0, 'NEET Standard': 0, Challenge: 0 };
    for (const question of subtopic.mcqs) {
      chapterStats.total += 1;
      assert.ok(question.id && !ids.has(question.id), `Duplicate ID ${question.id}`);
      ids.add(question.id);
      assert.ok(question.question?.trim(), `${question.id}: missing question`);
      assert.equal(question.options?.length, 4, `${question.id}: options`);
      assert.equal(new Set(question.options.map(option => option.trim())).size, 4, `${question.id}: duplicate options`);
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `${question.id}: invalid key`);
      assert.ok(question.options[question.answer], `${question.id}: correct option missing`);
      assert.ok(question.explanation?.trim(), `${question.id}: missing explanation`);
      assert.ok(question.solutionSteps?.length >= 3, `${question.id}: incomplete detailed solution`);
      assert.ok(question.conceptTested && question.formulaUsed && question.commonTrap && question.neetShortcut, `${question.id}: incomplete learning metadata`);
      assert.equal(question.chapter, name, `${question.id}: chapter mapping`);
      assert.equal(question.subtopic, subtopic.name, `${question.id}: subtopic mapping`);
      assert.equal(question.ncertSection, subtopic.ncertSections, `${question.id}: section mapping`);
      assert.equal(question.references?.length, 1, `${question.id}: reference count`);
      const reference = question.references[0];
      assert.equal(reference.pdfFilename, pdfByChapter[chapter.name], `${question.id}: PDF reference`);
      assert.ok(reference.pdfPage >= 1, `${question.id}: PDF page`);
      assert.ok(diff[question.difficulty] !== undefined, `${question.id}: difficulty`);
      diff[question.difficulty] += 1;
      chapterStats.difficulty[question.difficulty] = (chapterStats.difficulty[question.difficulty] || 0) + 1;
      chapterStats.types[question.questionType] = (chapterStats.types[question.questionType] || 0) + 1;
      if (question.questionType === 'Numerical') {
        chapterStats.numericals += 1;
        assert.ok(question.calculation && question.finalAnswer && question.unit !== undefined, `${question.id}: numerical audit fields`);
        assert.equal(question.options[question.answer], question.finalAnswer, `${question.id}: numerical result/key mismatch`);
      }
      if (question.visualRequired) {
        chapterStats.visuals += 1;
        assert.equal(question.visualSpec?.type, 'line', `${question.id}: visual specification`);
        assert.ok(question.visualSpec.points?.length >= 2, `${question.id}: graph points`);
      }
      const stem = normalize(question.question);
      assert.ok(!exact.has(stem), `Exact duplicate stem: ${question.id} and ${exact.get(stem)}`);
      exact.set(stem, question.id);
    }
    assert.deepEqual(diff, { Foundation: 8, 'NEET Standard': 24, Challenge: 8 }, `${name} / ${subtopic.name}: difficulty distribution`);
  }
  report.push(chapterStats);
}

assert.equal(ids.size, 1120, 'Total unique IDs');
console.log(JSON.stringify({ chapters: report, totalQuestions: ids.size, duplicateIds: 0, exactDuplicateQuestions: 0, missingAnswers: 0, missingSolutions: 0, invalidAnswerKeys: 0, brokenVisuals: 0 }, null, 2));
