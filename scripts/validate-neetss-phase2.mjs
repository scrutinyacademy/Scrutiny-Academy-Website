import assert from 'node:assert/strict';
import fs from 'node:fs';
import data from '../functions/neetss-content.cjs';
import {migrateProgress,scoreAnswers,scheduleCard,analyse} from '../neetss-core.mjs';
assert.equal(data.modules.length,9);assert.equal(data.questions.length,36);assert.equal(data.cards.length,42);assert.equal(data.cases.length,6);assert.equal(data.atlas.length,4);
for(const collection of ['modules','questions','cards','cases','atlas'])assert.equal(new Set(data[collection].map(x=>x.id)).size,data[collection].length,`duplicate ${collection} IDs`);
assert.equal(new Set(data.questions.map(q=>q.q)).size,data.questions.length);
for(const q of data.questions){assert.equal(q.o.length,4);assert.equal(q.wrong.length,4);assert.ok(Number.isInteger(q.a)&&q.a>=0&&q.a<4);assert.ok(q.why.length>70);assert.ok(q.wrong.every((x,i)=>i===q.a||x.length>12));assert.match(q.sourceUrl,/^https:\/\//);assert.ok(q.provenance.includes('not an official PYQ'));}
for(const c of data.cases){assert.equal(c.steps.length,3);for(const s of c.steps){assert.ok(s.answer>=0&&s.answer<s.choices.length);assert.ok(s.explanation.length>40);}}
const legacy=migrateProgress({mistakes:[0,11],flashcards:{f1:'difficult'},attempts:[{date:'2026-10-10',attempted:12,correct:6,byTopic:{}}],completedModules:['sepsis']},data.questions);
assert.deepEqual(legacy.mistakes,['p1-1','p1-12']);assert.equal(legacy.flashcards.f1.rating,'difficult');assert.equal(legacy.completedModules[0],'sepsis');assert.equal(legacy.attempts.length,1);
assert.deepEqual(scoreAnswers([{choice:0,correct:true},{choice:1,correct:false},{choice:null,correct:false}],3),{attempted:2,correct:1,incorrect:1,unattempted:1,score:3,accuracy:50});
assert.equal(scheduleCard(null,'known',0).dueAt,86400000);assert.equal(scheduleCard(null,'difficult',0).dueAt,600000);assert.equal(scheduleCard({intervalDays:2,reviews:3},'known',0).intervalDays,4);
const signal=analyse([{kind:'case',correct:3,total:3},{kind:'quiz',attempted:2,correct:1,answers:[{choice:0,seconds:20},{choice:1,seconds:40}],byTopic:{GI:{attempted:2,correct:1,seconds:60,timed:2}}}]);assert.equal(signal.total,2);assert.equal(signal.accuracy,50);assert.equal(signal.averageSeconds,30);
const read=f=>fs.readFileSync(new URL(`../${f}`,import.meta.url),'utf8');
const html=read('neetss-surgery.html'),ui=read('neetss-phase2-ui.js'),backend=read('functions/index.js');
for(const id of ['image-atlas','revision-sheets','bookmarks','quizTopic','quizDifficulty','cardMode','topicAnalytics','attemptHistory','searchResults'])assert.ok(html.includes(`id="${id}"`));
assert.ok(backend.includes('exports.getNeetssCourseContent'));
assert.ok(backend.includes("snapshot.data().courseEntitlements?.neetss?.status !== 'active'"));
assert.ok(ui.includes("'getNeetssCourseContent'"));assert.ok(!ui.includes('const questions=['));assert.ok(ui.includes('version!==epoch'));assert.ok(ui.includes('if(epoch!==version||user?.uid!==uid)return'));
console.log('PASS: Phase 2 counts, original-question integrity, case paths, legacy migration, +4/−1/0 scoring, spaced review, analytics, source metadata, server gate and account race guards.');
