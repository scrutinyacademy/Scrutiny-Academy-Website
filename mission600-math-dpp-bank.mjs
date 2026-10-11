// Mission 600 Mathematics DPP bank for the first three published chapters.
// Every DPP is generated deterministically so question IDs and answers stay stable.
const levels = [
  { code: "E", difficulty: "Easy", title: "Foundation Builder", minutes: 25 },
  { code: "M", difficulty: "Medium", title: "Concept Master", minutes: 35 },
  { code: "H", difficulty: "Hard", title: "Board Challenger", minutes: 45 },
];

const chapters = [
  { number: 1, name: "Real Numbers" },
  { number: 2, name: "Sets" },
  { number: 3, name: "Polynomials" },
];

const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
const setText = (values) => `{${[...values].sort((a, b) => a - b).join(", ")}}`;

function choice(question, correct, distractors, explanation, seed) {
  const raw = [String(correct), ...distractors.map(String)].filter((value, index, all) => all.indexOf(value) === index);
  for (let index = 1; raw.length < 4; index += 1) {
    const numericCorrect = Number(correct);
    const fallback = Number.isFinite(numericCorrect) ? String(numericCorrect + index + 1) : ["Cannot be determined", "All of these", "None of these"][index - 1];
    if (!raw.includes(fallback)) raw.push(fallback);
  }
  const four = raw.slice(0, 4);
  const shift = seed % 4;
  const options = four.slice(shift).concat(four.slice(0, shift));
  return { question, options, answer: options.indexOf(String(correct)), explanation };
}

function realNumbers(index, level) {
  const seed = index + 101 + level * 17;
  const variant = Math.floor((index % 20) / 5);
  if (index % 5 === 0) {
    const factor = 2 + seed % 7;
    const a = factor * (5 + seed);
    const b = factor * (8 + 2 * seed);
    const answer = gcd(a, b);
    return choice(`Find the HCF of ${a} and ${b}.`, answer, [factor, answer + factor, Math.abs(b - a)], `Euclid's algorithm gives the last non-zero remainder ${answer}.`, seed);
  }
  if (index % 5 === 1) {
    const a = 4 + seed;
    const b = 6 + 2 * seed;
    const answer = lcm(a, b);
    return choice(`Find the LCM of ${a} and ${b}.`, answer, [gcd(a, b), a * b, answer + gcd(a, b)], `LCM × HCF = product, so LCM = ${a * b} ÷ ${gcd(a, b)} = ${answer}.`, seed);
  }
  if (index % 5 === 2) {
    const denominator = ((variant + level) % 2 ? [8, 20, 25, 40] : [3, 7, 11, 21])[variant];
    let reduced = denominator;
    while (reduced % 2 === 0) reduced /= 2;
    while (reduced % 5 === 0) reduced /= 5;
    const answer = reduced === 1 ? "Terminating" : "Non-terminating recurring";
    return choice(`Without dividing, classify the decimal expansion of 1/${denominator}.`, answer, [answer === "Terminating" ? "Non-terminating recurring" : "Terminating", "Non-terminating non-recurring", "Not rational"], "A rational number in lowest form terminates only when its denominator has no prime factors other than 2 and 5.", seed);
  }
  if (index % 5 === 3) {
    const p = [2, 3, 5, 7][seed % 4];
    const q = [3, 5, 7, 11][(seed + 1) % 4];
    const number = p * p * q;
    return choice(`Which is the prime factorisation of ${number}?`, `${p}² × ${q}`, [`${p} × ${q}²`, `${p}² + ${q}`, `${p} × ${q}`], `${number} = ${p} × ${p} × ${q}.`, seed);
  }
  const divisor = 5 + seed % 8;
  const quotient = 3 + seed;
  const remainder = seed % divisor;
  const dividend = divisor * quotient + remainder;
  return choice(`When ${dividend} is divided by ${divisor}, what is the remainder?`, remainder, [quotient, divisor - remainder, remainder + 1], `${dividend} = ${divisor} × ${quotient} + ${remainder}.`, seed);
}

function sets(index, level) {
  const seed = index + 102 + level * 19;
  const variant = Math.floor(index / 5);
  const a = new Set([1, 2 + variant, 3 + seed % 4, 7 + seed % 3 + variant]);
  const b = new Set([2 + variant, 3 + seed % 4, 5 + seed % 5, 9 + seed % 2 + variant]);
  const union = new Set([...a, ...b]);
  const intersection = new Set([...a].filter((value) => b.has(value)));
  if (index % 5 === 0) return choice(`If A = ${setText(a)} and B = ${setText(b)}, find A ∪ B.`, setText(union), [setText(intersection), setText(a), setText(b)], "The union contains every element in A or B, without repetition.", seed);
  if (index % 5 === 1) return choice(`If A = ${setText(a)} and B = ${setText(b)}, find A ∩ B.`, setText(intersection), [setText(union), "∅", setText(a)], "The intersection contains only the elements common to both sets.", seed);
  if (index % 5 === 2) {
    const elements = 3 + variant;
    const answer = 2 ** elements;
    return choice(`How many subsets does a set with ${elements} elements have?`, answer, [elements * 2, answer - 1, elements ** 2], `A set with n elements has 2ⁿ subsets; 2^${elements} = ${answer}.`, seed);
  }
  if (index % 5 === 3) {
    const mathematics = 18 + seed;
    const science = 16 + seed;
    const both = 5 + seed % 6;
    const answer = mathematics + science - both;
    return choice(`${mathematics} students like Mathematics, ${science} like Science and ${both} like both. How many like at least one?`, answer, [mathematics + science, answer - both, Math.max(mathematics, science)], `n(A∪B) = n(A)+n(B)−n(A∩B) = ${answer}.`, seed);
  }
  const extra = [1, 2, 4, 5][variant % 4];
  const universal = new Set([1, 2, 3, 4, 5, 6, 7, 8]);
  const selected = new Set([extra, 3, 6, 8]);
  const complement = new Set([...universal].filter((value) => !selected.has(value)));
  return choice(`For U = ${setText(universal)} and A = ${setText(selected)}, find A′.`, setText(complement), [setText(selected), setText(universal), "∅"], "A′ contains the elements of U that are not in A.", seed);
}

function polynomials(index, level) {
  const seed = index + 101 + level * 19;
  const firstZero = 1 + seed % 7;
  const secondZero = 2 + (seed * 2) % 7;
  const sum = firstZero + secondZero;
  const product = firstZero * secondZero;
  if (index % 5 === 0) {
    const x = 1 + seed % 5;
    const answer = x * x - sum * x + product;
    return choice(`For p(x) = x² − ${sum}x + ${product}, find p(${x}).`, answer, [answer + x, answer - x, product], `Substitution gives ${x}² − ${sum}(${x}) + ${product} = ${answer}.`, seed);
  }
  if (index % 5 === 1) return choice(`What are the zeroes of x² − ${sum}x + ${product}?`, `${firstZero}, ${secondZero}`, [`−${firstZero}, −${secondZero}`, `${sum}, ${product}`, `${firstZero}, −${secondZero}`], `It factorises as (x−${firstZero})(x−${secondZero}).`, seed);
  if (index % 5 === 2) {
    const coefficient = 2 + level;
    return choice(`Find the sum of zeroes of ${coefficient}x² − ${sum * coefficient}x + ${product}.`, sum, [-sum, product, product / coefficient], `For ax²+bx+c, the sum of zeroes is −b/a = ${sum}.`, seed);
  }
  if (index % 5 === 3) {
    const coefficient = 2 + level;
    const constant = firstZero + seed;
    const answer = coefficient * firstZero * firstZero - sum * firstZero + constant;
    return choice(`Find the remainder when ${coefficient}x² − ${sum}x + ${constant} is divided by x − ${firstZero}.`, answer, [constant, answer + firstZero, answer - firstZero], `By the Remainder Theorem, the remainder is p(${firstZero}) = ${answer}.`, seed);
  }
  return choice(`Which monic quadratic has zeroes ${firstZero} and ${secondZero}?`, `x² − ${sum}x + ${product}`, [`x² + ${sum}x + ${product}`, `x² − ${product}x + ${sum}`, `x² + ${product}`], "Use x² − (sum of zeroes)x + product of zeroes.", seed);
}

const generators = [realNumbers, sets, polynomials];

export const publishedMathematicsDpps = chapters.flatMap((chapter, chapterIndex) => levels.map((level, levelIndex) => ({
  id: `SA-DPP-27-MAT-CH${String(chapter.number).padStart(2, "0")}-${level.code}`,
  kind: "dpp",
  subjectId: "mathematics",
  subject: "Mathematics",
  chapterId: `c10-mathematics-ch${chapter.number}`,
  chapterNumber: chapter.number,
  chapter: chapter.name,
  level: level.code,
  title: `${chapter.name} — ${level.title}`,
  difficulty: level.difficulty,
  maximumMarks: 20,
  suggestedDurationMinutes: level.minutes,
  questionCount: 20,
  pricePaise: 0,
  purchaseEnabled: false,
  contentComplete: true,
  status: "published",
  questions: Array.from({ length: 20 }, (_, questionIndex) => ({
    id: `SA-DPP-27-MAT-CH${String(chapter.number).padStart(2, "0")}-${level.code}-Q${String(questionIndex + 1).padStart(2, "0")}`,
    ...generators[chapterIndex](questionIndex + levelIndex * 20, levelIndex),
  })),
})));

export function getPublishedMathematicsDpp(resourceId) {
  return publishedMathematicsDpps.find((dpp) => dpp.id === resourceId) || null;
}
