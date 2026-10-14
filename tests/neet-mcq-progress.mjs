import assert from "node:assert/strict";
import { accuracy, sectionForMistake, statsFromHighYield, statsFromKota, statsFromPyq, statsFromSessions, totalStats } from "../neet-mcq-progress-core.mjs";

const sessionStats = statsFromSessions([
  {title:"Biology chapter", attempted:10, correct:7, incorrect:3, courseId:"neet"},
  {title:"NEET RANKER • Biology", attempted:8, correct:5, incorrect:3, courseId:"neet"},
  {title:"Another course", attempted:99, correct:99, courseId:"jee"},
]);
assert.deepEqual(sessionStats["Chapter-wise"], {attempted:10, correct:7, incorrect:3, sessions:1});
assert.deepEqual(sessionStats.Ranker, {attempted:8, correct:5, incorrect:3, sessions:1});

const highYield = statsFromHighYield({attempts:{
  q1:{correct:false, attemptCount:3, correctCount:1, wrongCount:2},
  q2:{correct:true},
}});
assert.deepEqual(highYield, {attempted:4, correct:2, incorrect:2, sessions:0});
const kota = statsFromKota({sessions:[{attempted:6,correct:4,incorrect:2},{attempted:4,correct:3,incorrect:1}]});
assert.deepEqual(kota, {attempted:10,correct:7,incorrect:3,sessions:2});
const pyq = statsFromPyq({1:2,2:1}, [{number:1,answers:[2]},{number:2,answers:[3,4]}]);
assert.deepEqual(pyq, {attempted:2,correct:1,incorrect:1,sessions:1});

const all = {"Chapter-wise":sessionStats["Chapter-wise"], Ranker:sessionStats.Ranker, "High Yield":highYield, "Kota Level":kota, "NEET 2025 PYQ":pyq};
assert.deepEqual(totalStats(all), {attempted:34,correct:22,incorrect:12,sessions:5});
assert.equal(accuracy(totalStats(all)), 65);
assert.equal(sectionForMistake({id:"ranker-cell-001"}), "Ranker");
assert.equal(sectionForMistake({id:"NEET-BIO-001"}), "Chapter-wise");
console.log("PASS: MCQ progress totals, retries, section split, accuracy and mistake classification.");
