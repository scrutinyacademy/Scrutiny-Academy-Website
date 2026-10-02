import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const manifest = read('data/manifest.json');
const context = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'data/prebundled_data.js'), 'utf8'), context);
const bundle = JSON.parse(JSON.stringify(context.window.SCRUTINY_DATA));
assert.deepEqual(manifest, bundle.manifest);

const expected = {class11: {botany: 14, zoology: 8, physics: 14, chemistry: 13}, class12: {botany: 14, zoology: 8, physics: 16, chemistry: 13}};
const neetIds = [];
const neetCounts = {};
const liveNeet = {};
let structuredTables = 0;

for (const category of manifest.categories) for (const subject of category.subjects) {
  const data = read(subject.file);
  // The live v2 portal fetches these two large banks directly. Keeping them out
  // of the legacy offline prebundle prevents a 25+ MB duplicate download.
  if (!(category.id === 'neet' && ['biology', 'chemistry'].includes(subject.id))) {
    assert.deepEqual(data, bundle[category.id][subject.id], `Stale bundle: ${subject.file}`);
  }
  if (expected[category.id]) assert.equal(data.chapters.length, expected[category.id][subject.id]);
  assert.equal(new Set(data.chapters.map(chapter => chapter.id)).size, data.chapters.length);
  if (category.id === 'neet') {
    liveNeet[subject.id] = data;
    neetCounts[subject.id] = 0;
  }
  for (const chapter of data.chapters) {
    if (category.id === 'neet') assert.ok([11, 12].includes(chapter.classLevel));
    for (const question of chapter.mcqs || []) {
      assert.ok(question.options?.length >= 2 && Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.options.length, `Invalid MCQ: ${question.id}`);
      if (category.id === 'neet') {
        neetIds.push(question.id);
        neetCounts[subject.id]++;
        assert.equal(question.options.length, 4, `NEET MCQ must have four options: ${question.id}`);
        if (['biology', 'chemistry'].includes(subject.id)) assert.equal(new Set(question.options.map(option => option.trim().toLowerCase())).size, 4, `Duplicate options: ${question.id}`);
        assert.ok(question.explanation?.trim(), `Missing explanation: ${question.id}`);
        if (question.table) {
          structuredTables++;
          assert.ok(question.table.caption && question.table.headers?.length >= 2 && question.table.rows?.length >= 2, `Invalid table: ${question.id}`);
          assert.ok(question.table.rows.every(row => row.length === question.table.headers.length), `Uneven table: ${question.id}`);
        }
      }
    }
  }
}

assert.deepEqual(neetCounts, {biology: 8000, physics: 2532, chemistry: 4750});
assert.equal(neetIds.length, 15282);
assert.equal(new Set(neetIds).size, 15282);

const biology = liveNeet.biology;
assert.equal(biology.chapters.length, 32, 'Expected all 32 current NCERT Biology chapters');
assert.equal(biology.chapters.filter(chapter => chapter.classLevel === 11).length, 19);
assert.equal(biology.chapters.filter(chapter => chapter.classLevel === 12).length, 13);
assert.ok(biology.chapters.every(chapter => chapter.mcqs.length === 250), 'Every Biology chapter must have exactly 250 MCQs');
assert.ok(!biology.chapters.some(chapter => chapter.name === 'Environmental Issues'), 'Legacy out-of-syllabus chapter must not be active');

const chemistry = liveNeet.chemistry;
assert.equal(chemistry.chapters.length, 19, 'Expected all 19 current NEET Chemistry chapters');
assert.equal(chemistry.chapters.filter(chapter => chapter.classLevel === 11).length, 9);
assert.equal(chemistry.chapters.filter(chapter => chapter.classLevel === 12).length, 10);
assert.ok(chemistry.chapters.every(chapter => chapter.mcqs.length === 250), 'Every Chemistry chapter must have exactly 250 MCQs');
assert.ok(structuredTables >= 6900, 'Expected extensive structured table coverage');

assert.equal(bundle.class11.botany.source.academicYear, '2026-2027');
const botany = bundle.class11.botany;
assert.equal(botany.chapters.length, 14);
const botanyIds = [];
for (const chapter of botany.chapters) {
  assert.equal(chapter.vsaq.length, 15, `${chapter.name}: expected 15 VSAQs`);
  assert.equal(chapter.saq.length, 10, `${chapter.name}: expected 10 SAQs`);
  assert.equal(chapter.laq.length, 5, `${chapter.name}: expected 5 LAQs`);
  for (const [format, marks] of [['vsaq', 2], ['saq', 4], ['laq', 8]]) for (const question of chapter[format]) {
    botanyIds.push(question.id);
    assert.equal(question.marks, marks, `${question.id}: wrong mark value`);
    assert.ok(question.question?.trim() && question.answer?.trim(), `${question.id}: incomplete answer`);
    assert.ok(question.keyPoints?.trim(), `${question.id}: missing keywords`);
    if (question.diagram) assert.ok(fs.existsSync(path.join(root, question.diagram)), `${question.id}: missing diagram`);
  }
}
assert.equal(botanyIds.length, 420);
assert.equal(new Set(botanyIds).size, 420, 'Botany question IDs must be unique');

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const v2Core = fs.readFileSync(path.join(root, 'v2-core.js'), 'utf8');
const v2Css = fs.readFileSync(path.join(root, 'v2.css'), 'utf8');
assert.ok(!v2Core.includes('temporarilyUnpublishedBiologyChapters'), 'Complete Biology chapters must not be hidden by the UI');
assert.ok(v2Core.includes('question-table'), 'Structured question table renderer is missing');
assert.ok(v2Css.includes('.confidence-check[hidden]'), 'Hidden confidence panel fix is missing');
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const ref = match[1].split('?')[0];
  if (/^(https?:|mailto:|tel:|upi:)/.test(ref)) continue;
  assert.ok(fs.existsSync(path.join(root, decodeURIComponent(ref))), `Missing asset: ${ref}`);
}

console.log(`Validated 420 Class 11 Botany answers, 8,000 Biology MCQs, 4,750 Chemistry MCQs, ${structuredTables.toLocaleString('en-IN')} structured tables and 15,282 unique NEET MCQs.`);
