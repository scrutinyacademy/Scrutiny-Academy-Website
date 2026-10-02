import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/neet/physics.json'), 'utf8'));
assert.equal(data.chapters.length, 28);
assert.equal(data.chapters.filter(chapter => chapter.classLevel === 11).length, 14);
assert.equal(data.chapters.filter(chapter => chapter.classLevel === 12).length, 14);

const ids = new Set();
let tables = 0;
let numericals = 0;
for (const chapter of data.chapters) {
  assert.equal(chapter.mcqs.length, 350, `${chapter.name}: expected 350 MCQs`);
  assert.equal(new Set(chapter.mcqs.map(question => question.question.toLowerCase())).size, 350, `${chapter.name}: duplicate stems`);
  const types = new Set();
  for (const question of chapter.mcqs) {
    assert.ok(!ids.has(question.id), `Duplicate ID ${question.id}`);
    ids.add(question.id);
    assert.equal(question.options?.length, 4, `${question.id}: options`);
    assert.equal(new Set(question.options.map(option => option.trim())).size, 4, `${question.id}: duplicate options`);
    assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `${question.id}: answer`);
    assert.ok(question.explanation?.trim(), `${question.id}: explanation`);
    assert.ok(!/\bncert\b/i.test(question.question), `${question.id}: repetitive reference wording`);
    types.add(question.questionType);
    if (/numerical/i.test(question.questionType || '')) numericals++;
    if (question.table) {
      tables++;
      assert.ok(question.table.caption && question.table.headers?.length >= 2 && question.table.rows?.length >= 2, `${question.id}: table`);
      assert.ok(question.table.rows.every(row => row.length === question.table.headers.length), `${question.id}: table shape`);
    }
  }
  assert.ok(types.size >= 5, `${chapter.name}: insufficient question-type variety`);
}

assert.equal(ids.size, 9800);
assert.ok(tables >= 3000);
assert.ok(numericals >= 1200);
console.log(`Validated 9,800 Physics MCQs across 28 chapters, including ${numericals.toLocaleString('en-IN')} numerical/reasoning questions and ${tables.toLocaleString('en-IN')} structured tables.`);
