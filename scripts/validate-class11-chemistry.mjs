import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(import.meta.dirname, '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'data/neet/class11-chemistry-bank.js'), 'utf8'), context);
const chapters = context.window.SCRUTINY_CLASS11_CHEMISTRY;
const expected = [
  ['Some Basic Concepts of Chemistry', 4, 160, 'SOME BASIC CONCEPTS OF CHEMISTRY.pdf'],
  ['Structure of Atom', 4, 160, 'structure of atom.pdf'],
  ['Classification of Elements and Periodicity in Properties', 4, 160, 'Classification of Elements and Periodic Properties.pdf'],
  ['Chemical Bonding and Molecular Structure', 6, 240, 'CHEMICAL BONDING AND MOLECULAR STRUCTURE.pdf'],
  ['Thermodynamics', 5, 200, 'Thermodynamics(1).pdf'],
  ['Equilibrium', 7, 280, 'Equilibrium.pdf'],
];
const ids = new Set();
const stems = new Map();
const normalize = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const report = [];
let visuals = 0;
let auditedNumericals = 0;

assert.equal(chapters.length, 6, 'chapter count');
for (const [name, subtopicCount, total, pdf] of expected) {
  const chapter = chapters.find(x => x.name === name);
  assert.ok(chapter, `missing chapter ${name}`);
  assert.equal(chapter.subtopics.length, subtopicCount, `${name}: subtopic count`);
  assert.equal(chapter.mcqs.length, total, `${name}: question count`);
  const stats = { chapter: name, subtopics: subtopicCount, total, visuals: 0, numericalQuestions: 0 };
  for (const subtopic of chapter.subtopics) {
    assert.equal(subtopic.mcqs.length, 40, `${name}/${subtopic.name}: target`);
    const distribution = { Foundation: 0, 'NEET Standard': 0, Challenge: 0 };
    for (const q of subtopic.mcqs) {
      assert.ok(q.id && !ids.has(q.id), `duplicate id ${q.id}`); ids.add(q.id);
      assert.ok(q.question?.trim(), `${q.id}: stem`);
      assert.equal(q.options?.length, 4, `${q.id}: options`);
      assert.equal(new Set(q.options.map(String)).size, 4, `${q.id}: unique options`);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, `${q.id}: key`);
      assert.ok(q.options[q.answer] !== undefined, `${q.id}: keyed option`);
      assert.ok(q.explanation?.trim(), `${q.id}: explanation`);
      assert.ok(q.solutionSteps?.length >= 3, `${q.id}: solution steps`);
      assert.ok(q.conceptTested && q.formulaUsed && q.commonTrap && q.neetShortcut, `${q.id}: learning metadata`);
      assert.equal(q.chapter, name, `${q.id}: chapter mapping`);
      assert.equal(q.subtopic, subtopic.name, `${q.id}: subtopic mapping`);
      assert.equal(q.ncertSection, subtopic.ncertSections, `${q.id}: NCERT section`);
      assert.equal(q.references?.[0]?.pdfFilename, pdf, `${q.id}: source PDF`);
      assert.ok(q.references[0].pdfPage >= 1, `${q.id}: PDF page`);
      assert.equal(q.verified, true, `${q.id}: verification flag`);
      assert.ok(distribution[q.difficulty] !== undefined, `${q.id}: difficulty`); distribution[q.difficulty] += 1;
      const stem = normalize(q.question);
      assert.ok(!stems.has(stem), `duplicate stem ${q.id}/${stems.get(stem)}`); stems.set(stem, q.id);
      if (q.visualRequired) {
        visuals += 1; stats.visuals += 1;
        assert.ok(q.visualAsset?.startsWith('programmatic:'), `${q.id}: visual asset`);
        assert.ok(['line','measurement','orbital','periodic','molecule','energy','equilibrium'].includes(q.visualSpec?.type), `${q.id}: visual type`);
        if (q.visualSpec.type === 'line') assert.ok(q.visualSpec.points?.length >= 2, `${q.id}: plot points`);
      }
      if (q.questionType === 'Numerical') stats.numericalQuestions += 1;
      if (q.numericalValidated) {
        auditedNumericals += 1;
        assert.ok(q.calculation && q.finalAnswer !== undefined && q.unit !== undefined, `${q.id}: numerical audit`);
        if (q.questionType === 'Numerical' && q.options.includes(q.finalAnswer)) assert.equal(q.options[q.answer], q.finalAnswer, `${q.id}: result/key`);
      }
    }
    assert.deepEqual(distribution, { Foundation: 8, 'NEET Standard': 24, Challenge: 8 }, `${name}/${subtopic.name}: difficulty distribution`);
  }
  report.push(stats);
}

assert.equal(ids.size, 1200, 'total unique questions');
assert.equal(visuals, 120, 'programmatic visual count');
assert.ok(auditedNumericals >= 500, 'numerical/formula audit coverage');
console.log(JSON.stringify({ chapters: report, totalQuestions: ids.size, subtopics: 30, programmaticVisuals: visuals, auditedNumericalItems: auditedNumericals, duplicateIds: 0, exactDuplicateStems: 0, missingAnswers: 0, missingDetailedSolutions: 0, brokenVisuals: 0 }, null, 2));
