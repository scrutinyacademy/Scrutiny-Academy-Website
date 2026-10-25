import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const catalog = read('data/mission600/catalog.json');
assert.equal(catalog.dpps.length, 171);
assert.equal(new Set(catalog.dpps.map(item => item.id)).size, 171);
const counts = {mathematics:42, physics:36, biology:30, 'social-science':63};
for (const [subject, count] of Object.entries(counts)) assert.equal(catalog.dpps.filter(item => item.subjectId === subject).length, count);
const publications=read('data/mission600/lecture-publications.json');
for(const [id,publication] of Object.entries(publications)){
  const lecture=catalog.weeks.flatMap(week=>week.lectures).find(item=>item.id===id);
  assert.equal(lecture.youtubeUrl,publication.youtubeUrl);assert.equal(lecture.status,'published');
}
const ids = new Set(), prompts = new Set();
let questionCount = 0;
for (const subject of Object.values(catalog.subjects)) {
  const content = read(`data/mission600/dpps/${subject.id}.json`);
  for (const chapter of subject.chapters) {
    const sets = catalog.dpps.filter(item => item.chapterId === chapter.id);
    assert.deepEqual(sets.map(item => item.difficulty), ['Easy','Medium','Hard']);
    for (const item of sets) {
      assert.equal(item.status, 'published'); assert.equal(item.contentComplete, true);
      assert.equal(item.unlocked, true); assert.equal(item.pricePaise, 0); assert.equal(item.purchaseEnabled, false);
      const week = catalog.weeks.find(week => week.week === item.scheduledWeek);
      const lecture = week.lectures.find(lecture => lecture.id === item.lectureId);
      assert(lecture.chapterIds.includes(item.chapterId));
      assert.equal(lecture.subjectId, item.subjectId);
      const offset = ['Easy','Medium','Hard'].indexOf(item.difficulty);
      assert.equal(Date.parse(item.recommendedDate)-Date.parse(lecture.publicationDate), offset*86400000);
      assert(item.recommendedDate >= week.startDate && item.recommendedDate <= week.endDate);
      assert.equal(item.sourceChapter, chapter.number);
      assert(item.sourceBook.endsWith('.pdf'));
      assert(item.sourcePrintedPages.from <= item.sourcePrintedPages.to);
      const bank = content[item.id];
      assert.equal(bank.contentVersion,item.contentVersion);
      assert.equal(bank.questions.length,3); assert.equal(item.questionCount,bank.questions.length);
      assert.equal(item.maximumMarks,bank.questions.length);
      for (const q of bank.questions) {
        assert(!ids.has(q.id),`Duplicate question ID: ${q.id}`); ids.add(q.id);
        assert(!prompts.has(q.question),`Duplicate question: ${q.question}`); prompts.add(q.question);
        assert.equal(q.difficulty,item.difficulty);
        assert.equal(q.options.length,4); assert.equal(new Set(q.options).size,4);
        assert(q.options.every(option=>typeof option==='string' && option.trim()));
        assert(Number.isInteger(q.answer) && q.answer>=0 && q.answer<4);
        assert(q.question.trim() && q.explanation.trim() && q.topic.trim());
        assert(!q.question.includes('_____'),'No mechanical cloze questions');
        questionCount++;
      }
    }
  }
}
assert.equal(questionCount,513);
const player=readFileSync(new URL('mission600-dpp.js',root),'utf8');
assert(!player.includes('selectQuestions'));
assert(player.includes('contentVersion'));
assert(player.includes('dpp.questions.length'));
assert(!player.includes('20 MCQs'));
console.log('PASS: 57 chapters, 171 distinct difficulty-specific DPPs, 513 unique MCQs, valid keys/explanations, aligned dates and all sets unlocked.');
