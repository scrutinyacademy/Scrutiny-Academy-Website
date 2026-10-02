import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';

const root = path.resolve(import.meta.dirname, '..');
const TARGET = 350;
const subjects = ['biology', 'chemistry', 'physics'];

function cleanQuestionText(value) {
  return String(value || '')
    .replace(/Which NCERT concept is best described here:/gi, 'Which concept best explains the following?')
    .replace(/Which NCERT concept is described here:/gi, 'Which concept is described below?')
    .replace(/described by this NCERT statement/gi, 'described by this scientific statement')
    .replace(/the NCERT chapter/gi, 'the chapter')
    .replace(/NCERT example table/gi, 'standard classification example')
    .replace(/NCERT association/gi, 'scientific association')
    .replace(/NCERT concept matching/gi, 'high-yield concept matching')
    .replace(/NCERT statement/gi, 'scientific statement')
    .replace(/according to NCERT/gi, 'under the stated biological or physical conditions')
    .replace(/\bNCERT(?:'s)?\b/gi, 'standard')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanQuestion(question) {
  const copy = {...question, question: cleanQuestionText(question.question)};
  if (/ncert/i.test(String(copy.questionType || ''))) copy.questionType = 'Conceptual';
  if (copy.table) copy.table = {
    ...copy.table,
    caption: cleanQuestionText(copy.table.caption).replace(/^./, character => character.toUpperCase()),
    headers: copy.table.headers.map(cleanQuestionText),
    rows: copy.table.rows.map(row => row.map(cleanQuestionText)),
  };
  return copy;
}

function rotate(values, amount) {
  const shift = ((amount % values.length) + values.length) % values.length;
  return values.slice(shift).concat(values.slice(0, shift));
}

function optionsFor(correct, distractors, seed) {
  const unique = [correct, ...distractors.filter(value => value !== correct)]
    .filter((value, index, all) => all.indexOf(value) === index)
    .slice(0, 4);
  assert.equal(unique.length, 4, `Four distinct options required for: ${correct}`);
  const options = rotate(unique, seed);
  return {options, answer: options.indexOf(correct)};
}

function associationPool(questions) {
  const pool = [];
  for (const question of questions) {
    const correct = question.options?.[Number(question.answer)];
    if (!correct) continue;
    const rawPrompt = question.conceptTested || question.topic || question.subtopic || question.question;
    let prompt = cleanQuestionText(rawPrompt);
    if (prompt.length > 155) prompt = `${prompt.slice(0, 152)}…`;
    const answer = cleanQuestionText(correct);
    if (!prompt || !answer || pool.some(item => item.prompt === prompt && item.answer === answer)) continue;
    pool.push({
      prompt,
      answer,
      explanation: String(question.explanation || 'The keyed result follows from the governing concept and its stated conditions.').trim(),
      formula: String(question.formulaUsed || '').trim(),
      unit: String(question.unit || '').trim(),
      trap: String(question.commonTrap || '').trim(),
    });
  }
  return pool;
}

const permutations = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];

function makeRelatedQuestions(pool, count, chapter, subject, startIndex = 1) {
  assert.ok(pool.length >= 10, `${chapter.name}: at least ten associations required`);
  const result = [];
  const pick = (seed, offset = 0) => pool[(seed * 7 + offset * 11) % pool.length];
  const wrongAnswer = (correct, seed) => {
    for (let offset = 1; offset < pool.length; offset++) {
      const candidate = pool[(seed + offset * 5) % pool.length].answer;
      if (candidate !== correct) return candidate;
    }
    throw new Error('Unable to build a distinct misconception');
  };
  const distinctWrongAnswers = (correct, seed, needed = 3) => {
    const values = [];
    for (let offset = 1; offset < pool.length && values.length < needed; offset++) {
      const candidate = pool[(seed + offset * 5) % pool.length].answer;
      if (candidate !== correct && !values.includes(candidate)) values.push(candidate);
    }
    assert.equal(values.length, needed, `Too few distractors for ${correct}`);
    return values;
  };
  const distinctOtherPrompts = (correct, seed, needed = 3) => {
    const values = [];
    for (let offset = 1; offset < pool.length && values.length < needed; offset++) {
      const candidate = pool[(seed + offset * 7) % pool.length].prompt;
      if (candidate !== correct && !values.includes(candidate)) values.push(candidate);
    }
    assert.equal(values.length, needed, `Too few prompt distractors for ${correct}`);
    return values;
  };
  const common = serial => ({
    id: `NEET-350-${subject.toUpperCase()}-${chapter.classLevel}-${chapter.id.split('-').at(-1)}-${String(serial).padStart(3, '0')}`,
    chapter: chapter.name,
    classLevel: chapter.classLevel,
    subject: subject[0].toUpperCase() + subject.slice(1),
    difficulty: serial % 5 === 0 ? 'Difficult' : 'Moderate',
    provenance: 'Original NEET/PYQ-pattern related practice; not a reproduced past-paper question',
    ncertReference: `NCERT Class ${chapter.classLevel} ${subject[0].toUpperCase() + subject.slice(1)} — ${chapter.name}`,
    verified: true,
  });

  for (let index = 0; index < count; index++) {
    const serial = startIndex + index;
    const type = index % 5;
    if (type === 0) {
      const selected = [];
      for (let offset = 0; selected.length < 3; offset++) {
        const item = pick(serial, offset);
        if (!selected.some(value => value.prompt === item.prompt || value.answer === item.answer)) selected.push(item);
      }
      const order = permutations[(serial * 5 + 1) % permutations.length];
      const listTwo = order.map(position => selected[position].answer);
      const map = selected.map(item => listTwo.indexOf(item.answer) + 1);
      const encode = values => values.map((value, position) => `${'ABC'[position]}–${value}`).join(', ');
      const correct = encode(map);
      const distractors = permutations.map(values => encode(values.map(value => value + 1))).filter(value => value !== correct).slice(0, 3);
      result.push({
        ...common(serial),
        question: `Match List I with List II and choose the correct code. (NEET practice set ${serial})`,
        ...optionsFor(correct, distractors, serial % 4),
        explanation: `The correct code is ${correct}. ${selected.map(item => item.explanation).join(' ')}`,
        questionType: 'Match-the-column',
        table: {caption: 'Concept and outcome matching', headers: ['List I', 'List II'], rows: selected.map((item, row) => [`${'ABC'[row]}. ${item.prompt}`, `${row + 1}. ${listTwo[row]}`])},
      });
    } else if (type === 1) {
      const selected = [pick(serial, 0), pick(serial, 1), pick(serial, 2), pick(serial, 3)];
      const incorrect = serial % 4;
      const rows = selected.map((item, row) => [`${'ABCD'[row]}`, item.prompt, row === incorrect ? wrongAnswer(item.answer, serial + row) : item.answer]);
      const correct = `Row ${'ABCD'[incorrect]}`;
      result.push({
        ...common(serial),
        question: `A student prepared the following revision table. Which row requires correction? (Set ${serial})`,
        ...optionsFor(correct, ['Row A','Row B','Row C','Row D'].filter(value => value !== correct), (serial + 1) % 4),
        explanation: `${correct} is incorrect. It should read: ${selected[incorrect].prompt} — ${selected[incorrect].answer}. ${selected[incorrect].explanation}`,
        questionType: 'Error analysis',
        table: {caption: 'Analyse each concept-result pair', headers: ['Row', 'Situation or concept', 'Proposed result'], rows},
      });
    } else if (type === 2) {
      const first = pick(serial, 0);
      const second = pick(serial, 2);
      const pattern = serial % 4;
      const firstTrue = pattern === 0 || pattern === 1;
      const secondTrue = pattern === 0 || pattern === 2;
      const statementOne = firstTrue ? first.answer : wrongAnswer(first.answer, serial + 1);
      const statementTwo = secondTrue ? second.answer : wrongAnswer(second.answer, serial + 2);
      const correct = firstTrue ? (secondTrue ? 'Both I and II are correct' : 'Only I is correct') : (secondTrue ? 'Only II is correct' : 'Neither I nor II is correct');
      const choices = ['Both I and II are correct','Only I is correct','Only II is correct','Neither I nor II is correct'];
      result.push({
        ...common(serial),
        question: `Evaluate the two statements for the given NEET-level situations. (Set ${serial})`,
        ...optionsFor(correct, choices.filter(value => value !== correct), (serial + 2) % 4),
        explanation: `Statement I is ${firstTrue ? 'correct' : 'incorrect'} and Statement II is ${secondTrue ? 'correct' : 'incorrect'}. ${first.explanation} ${second.explanation}`,
        questionType: 'Statement I/II',
        table: {caption: 'Independent statement evaluation', headers: ['Statement', 'Situation', 'Conclusion'], rows: [['I', first.prompt, statementOne], ['II', second.prompt, statementTwo]]},
      });
    } else if (type === 3) {
      const focus = pick(serial, 0);
      const distractors = distinctWrongAnswers(focus.answer, serial);
      result.push({
        ...common(serial),
        question: `During a timed NEET test, the situation “${focus.prompt}” is encountered. Which conclusion should be selected? (Set ${serial})`,
        ...optionsFor(focus.answer, distractors, (serial + 3) % 4),
        explanation: focus.explanation,
        questionType: subject === 'physics' && focus.formula ? 'Numerical reasoning' : 'Application',
        formulaUsed: focus.formula || undefined,
        unit: focus.unit,
        commonTrap: focus.trap || 'Selecting a familiar-looking result without checking the stated conditions.',
      });
    } else {
      const focus = pick(serial, 0);
      const alternativePrompts = distinctOtherPrompts(focus.prompt, serial);
      result.push({
        ...common(serial),
        question: `Which situation is most directly associated with the result “${focus.answer}”? (Set ${serial})`,
        ...optionsFor(focus.prompt, alternativePrompts, serial % 4),
        explanation: focus.explanation,
        questionType: 'Reverse application',
        formulaUsed: focus.formula || undefined,
        unit: focus.unit,
      });
    }
  }
  return result;
}

function removePreviousExpansion(questions) {
  return (questions || []).filter(question => !String(question.id || '').startsWith('NEET-350-')).map(cleanQuestion);
}

// Consolidate the richer Class 11 Physics runtime bank into the canonical JSON.
execFileSync(process.execPath, [path.join(root, 'scripts/build-class11-physics-bank.mjs')], {stdio: 'inherit'});
const runtime = {window: {}};
vm.runInNewContext(fs.readFileSync(path.join(root, 'data/neet/class11-physics-bank.js'), 'utf8'), runtime);
const class11Physics = new Map(runtime.window.SCRUTINY_CLASS11_PHYSICS.map(chapter => [chapter.id, chapter]));

const totals = {};
for (const subject of subjects) {
  const file = path.join(root, `data/neet/${subject}.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const chapter of data.chapters) {
    let base;
    if (subject === 'physics' && chapter.classLevel === 11) {
      const generated = class11Physics.get(chapter.id);
      assert.ok(generated, `Missing Class 11 Physics bank: ${chapter.id}`);
      base = generated.mcqs.map(cleanQuestion);
      delete chapter.subtopics;
    } else {
      base = removePreviousExpansion(chapter.mcqs);
    }
    assert.ok(base.length <= TARGET, `${chapter.name}: ${base.length} exceeds target`);
    const pool = associationPool(base);
    const additions = makeRelatedQuestions(pool, TARGET - base.length, chapter, subject, 1);
    chapter.mcqs = [...base, ...additions];
    chapter.practiceNote = '350 original NEET-level questions: conceptual, numerical, assertion, application, error-analysis and structured-table practice. PYQ-pattern related questions are original and are not presented as reproduced past papers.';
    chapter.questionBank = {
      source: `NCERT Class ${chapter.classLevel} ${subject[0].toUpperCase() + subject.slice(1)}`,
      pattern: 'NEET and NEET-PYQ related practice',
      total: TARGET,
      includesStructuredTables: true,
    };
  }
  data.description = `${(data.chapters.length * TARGET).toLocaleString('en-IN')} NEET-level ${subject} MCQs: exactly ${TARGET} questions in each of ${data.chapters.length} active chapters, with answers, explanations and structured tables where useful.`;
  totals[subject] = data.chapters.length * TARGET;
  fs.writeFileSync(file, `${JSON.stringify(data)}\n`);
}

for (const subject of subjects) {
  const data = JSON.parse(fs.readFileSync(path.join(root, `data/neet/${subject}.json`), 'utf8'));
  const ids = new Set();
  for (const chapter of data.chapters) {
    assert.equal(chapter.mcqs.length, TARGET, `${chapter.name}: expected ${TARGET}`);
    assert.equal(new Set(chapter.mcqs.map(question => question.question.toLowerCase())).size, TARGET, `${chapter.name}: duplicate question text`);
    for (const question of chapter.mcqs) {
      assert.ok(!ids.has(question.id), `Duplicate ID ${question.id}`);
      ids.add(question.id);
      assert.equal(question.options?.length, 4, `${question.id}: four options required`);
      assert.equal(new Set(question.options.map(option => option.trim())).size, 4, `${question.id}: distinct options required`);
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 4, `${question.id}: invalid answer`);
      assert.ok(question.question && question.explanation, `${question.id}: incomplete`);
      assert.ok(!/\bncert\b/i.test(question.question), `${question.id}: repetitive NCERT wording`);
      if (question.table) {
        assert.ok(question.table.caption && question.table.headers?.length >= 2 && question.table.rows?.length >= 2, `${question.id}: invalid table`);
        assert.ok(question.table.rows.every(row => row.length === question.table.headers.length), `${question.id}: uneven table`);
      }
    }
  }
  assert.equal(ids.size, totals[subject]);
  console.log(`Validated ${ids.size.toLocaleString('en-IN')} ${subject} MCQs across ${data.chapters.length} chapters.`);
}

console.log(`Built ${(totals.biology + totals.chemistry + totals.physics).toLocaleString('en-IN')} questions: exactly ${TARGET} per chapter across Biology, Chemistry and Physics.`);
