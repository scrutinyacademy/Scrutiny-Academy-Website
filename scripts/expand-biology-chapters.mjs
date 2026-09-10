import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const file = path.join(root, 'data/neet/biology.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const targets = ['living-world', 'biological-classification', 'plant-kingdom',
  'animal-kingdom', 'morphology-flowering-plants', 'anatomy-flowering-plants',
  'structural-organisation-animals'];
const permutations = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];

// Deterministic shuffle: rebuilds preserve IDs and option order, including progress references.
function shuffle(items, seed) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

for (const [chapterIndex, slug] of targets.entries()) {
  const chapter = data.chapters.find(c => c.id === `neet-biology-11-${chapterIndex + 1}`);
  assert.ok(chapter && chapter.classLevel === 11);
  const rows = fs.readFileSync(path.join(import.meta.dirname, 'biology-concepts', slug + '.txt'), 'utf8')
    .split(/\r?\n/).filter(line => line.trim() && !line.startsWith('#'))
    .map((line, index) => {
      const parts = line.split('|').map(part => part.trim());
      assert.equal(parts.length, 6, `${slug}, line ${index + 1}: expected six fields`);
      const [label, correct, ...rest] = parts;
      const explanation = rest.pop();
      const distractors = rest;
      assert.equal(new Set([correct, ...distractors]).size, 4, label);
      return {label, correct, distractors, explanation, conceptId:`${slug}-${index + 1}`};
    });
  assert.equal(rows.length, 90, `${slug}: concept count`);
  assert.equal(new Set(rows.map(row => row.label)).size, 90);
  const prefix = `NEET-BIO-C11-${chapterIndex + 1}-`;
  const existing = chapter.mcqs.filter(q => !q.id.startsWith(prefix));
  assert.equal(existing.length, 6, `${slug}: expected six preserved questions`);
  const additions = [];
  function add(question, options, answer, explanation, kind, concepts) {
    const serial = additions.length + 1;
    // Set the final answer position explicitly: every 4 consecutive questions are balanced.
    const correct = options[answer];
    const wrong = shuffle(options.filter((_, index) => index !== answer), serial * 97 + chapterIndex);
    const answerPosition = (serial - 1 + chapterIndex) % 4;
    wrong.splice(answerPosition, 0, correct);
    assert.equal(wrong.length, 4);
    assert.equal(new Set(wrong).size, 4);
    additions.push({id:prefix + String(serial).padStart(3,'0'), question,
      options:wrong, answer:answerPosition, explanation,
      difficulty:kind === 'single' ? 'Easy' : 'Medium',
      chapter:chapter.name, subject:'Biology', questionType:kind,
      conceptIds:concepts.map(c => c.conceptId), provenance:'Original practice question'});
  }

  // 90 direct questions cover the authored concept catalogue.
  for (const row of rows) {
    add(`${row.label} is:`, [row.correct, ...row.distractors], 0,
      row.explanation, 'single', [row]);
  }

  // 42 two-statement questions test proposed associations, including plausible errors.
  // Truth status is encoded independently from the displayed answer position.
  for (let i = 0; i < 42; i++) {
    const first = rows[i * 2];
    const second = rows[i * 2 + 1];
    const truth = shuffle([0,1,2,3], Math.floor(i / 4) * 101 + chapterIndex + 31)[i % 4];
    const firstTrue = Boolean(truth & 1);
    const secondTrue = Boolean(truth & 2);
    const firstValue = firstTrue ? first.correct : first.distractors[i % 3];
    const secondValue = secondTrue ? second.correct : second.distractors[(i + 1) % 3];
    const answer = firstTrue ? (secondTrue ? 0 : 1) : (secondTrue ? 2 : 3);
    add(`Evaluate these proposed associations. I. ${first.label}: ${firstValue}. II. ${second.label}: ${secondValue}. Which assessment is correct?`,
      ['Both I and II are correct','Only I is correct','Only II is correct','Neither I nor II is correct'], answer,
      `I is ${firstTrue ? 'correct' : 'incorrect'}; II is ${secondTrue ? 'correct' : 'incorrect'}. ${first.explanation} ${second.explanation}`,
      'two-statements', [first,second]);
  }

  // 42 matching tasks have three distinct responses and four distinct full mappings.
  const usedSets = new Set();
  for (let i = 0; i < 42; i++) {
    const start = (i * 2 + 1) % rows.length;
    const selected = [rows[start]];
    for (let offset = 1; selected.length < 3 && offset < rows.length; offset++) {
      const next = rows[(start + offset) % rows.length];
      if (!selected.some(row => row.correct.toLowerCase() === next.correct.toLowerCase())) selected.push(next);
    }
    assert.equal(selected.length, 3);
    const signature = selected.map(row => row.conceptId).sort().join('|');
    assert.ok(!usedSets.has(signature)); usedSets.add(signature);
    const right = shuffle(selected.map(row => row.correct), i * 103 + chapterIndex + 17);
    const mapping = selected.map(row => right.indexOf(row.correct));
    const incorrect = shuffle(permutations.filter(p => p.join() !== mapping.join()), i + 83).slice(0,3);
    const render = p => p.map((n,index) => `${'ABC'[index]}–${n + 1}`).join(', ');
    const leftText = selected.map((row,index) => `${'ABC'[index]}. ${row.label}`).join('; ');
    const rightText = right.map((value,index) => `${index + 1}. ${value}`).join('; ');
    add(`Match List I with List II. List I: ${leftText}. List II: ${rightText}. Choose the correct mapping.`,
      [render(mapping), ...incorrect.map(render)], 0,
      `Correct mapping: ${render(mapping)}. ${selected.map(row => row.explanation).join(' ')}`,
      'match', selected);
  }

  assert.equal(additions.length, 174);
  chapter.mcqs = [...existing, ...additions];
  assert.equal(chapter.mcqs.length, 180);
  assert.equal(new Set(chapter.mcqs.map(q => q.question.toLowerCase())).size, 180);
  chapter.practiceNote = 'Original chapter practice: direct, two-statement and matching questions. These are not labelled as previous-year exam questions.';
  console.log(`${chapter.name}: ${chapter.mcqs.length} MCQs (${existing.length} preserved + ${additions.length} added)`);
}
const total = data.chapters.reduce((sum,ch) => sum + ch.mcqs.length,0);
const complete = data.chapters.filter(ch => ch.classLevel === 11 && ch.mcqs.length === 180).length;
data.description = `${total.toLocaleString('en-US')} chapter-wise Biology practice MCQs with answers and explanations. ${complete} Class 11 chapters have 180 questions each. Cell, Biomolecules and Cell Division include source references, diagrams and tables. Confirm exam-year coverage against the official syllabus.`;
fs.writeFileSync(file,JSON.stringify(data,null,2) + '\n');
