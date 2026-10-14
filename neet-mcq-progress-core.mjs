export const SECTION_ORDER = ["Chapter-wise", "High Yield", "Kota Level", "Ranker", "NEET 2025 PYQ"];

const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;
export const emptyStats = () => ({ attempted: 0, correct: 0, incorrect: 0, sessions: 0 });
export const addStats = (left, right) => ({
  attempted: number(left.attempted) + number(right.attempted),
  correct: number(left.correct) + number(right.correct),
  incorrect: number(left.incorrect) + number(right.incorrect),
  sessions: number(left.sessions) + number(right.sessions),
});
export const accuracy = (stats) => stats.attempted ? Math.round(stats.correct / stats.attempted * 100) : 0;
export const sectionForSession = (session = {}) => /RANKER/i.test(session.title || "") ? "Ranker" : "Chapter-wise";

export function statsFromSessions(sessions = []) {
  const result = { "Chapter-wise": emptyStats(), Ranker: emptyStats() };
  for (const session of sessions.filter(item => (item.courseId || "neet") === "neet")) {
    const key = sectionForSession(session);
    result[key] = addStats(result[key], {
      attempted: session.attempted,
      correct: session.correct,
      incorrect: session.incorrect ?? number(session.attempted) - number(session.correct),
      sessions: 1,
    });
  }
  return result;
}

export function statsFromHighYield(progress = {}) {
  const stats = emptyStats();
  for (const attempt of Object.values(progress.attempts || {})) {
    const attempted = number(attempt.attemptCount) || 1;
    const correct = attempt.correctCount === undefined ? (attempt.correct ? 1 : 0) : number(attempt.correctCount);
    const incorrect = attempt.wrongCount === undefined ? (attempt.correct ? 0 : 1) : number(attempt.wrongCount);
    Object.assign(stats, addStats(stats, { attempted, correct, incorrect }));
  }
  return stats;
}

export function statsFromKota(progress = {}) {
  return (progress.sessions || []).reduce((stats, session) => addStats(stats, {
    attempted: session.attempted,
    correct: session.correct,
    incorrect: session.incorrect ?? number(session.attempted) - number(session.correct),
    sessions: 1,
  }), emptyStats());
}

export function statsFromPyq(answers = {}, questions = []) {
  const answerKey = new Map(questions.map(question => [String(question.number), question.answers || []]));
  let correct = 0;
  for (const [question, selected] of Object.entries(answers)) if (answerKey.get(String(question))?.includes(selected)) correct++;
  const attempted = Object.keys(answers).length;
  return { attempted, correct, incorrect: attempted - correct, sessions: attempted ? 1 : 0 };
}

export function totalStats(sections = {}) {
  return SECTION_ORDER.reduce((total, name) => addStats(total, sections[name] || emptyStats()), emptyStats());
}

export function sectionForMistake(item = {}) {
  return /^ranker-/i.test(item.id || "") || item.mistakeClass ? "Ranker" : "Chapter-wise";
}
