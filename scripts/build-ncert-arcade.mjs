import fs from "node:fs";

const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const arcadePath = "data/ncert-quest/arcade.json";
const arcade = read(arcadePath);

const clean = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const firstSentence = (value) => clean(value).split(/(?<=[.!?])\s+/)[0];
const source = (subject, classLevel, chapter) => `NCERT ${subject} Class ${classLevel || "XI/XII"} · ${chapter || "Core concept"}`;

function flattenMcqs(path) {
  return read(path).chapters.flatMap((chapter) => (chapter.mcqs || []).map((q) => ({
    ...q,
    question: clean(q.question),
    options: (q.options || []).map(clean),
    explanation: clean(q.explanation),
    chapter: q.chapter || chapter.name,
    classLevel: chapter.classLevel || "XI/XII"
  }))).filter((q) => q.question && q.options.length === 4 && Number.isInteger(q.answer));
}

function flattenChemistry() {
  const files = ["data/class11/chemistry.json", "data/class12/chemistry.json"];
  return files.flatMap((path, fileIndex) => read(path).chapters.flatMap((chapter) => {
    const items = chapter.vsaq || [];
    return items.map((q, index) => {
      const correct = firstSentence(q.answer);
      const distractors = [1, 2, 3].map((step) => firstSentence(items[(index + step) % items.length]?.answer)).filter(Boolean);
      const options = [correct, ...distractors].slice(0, 4);
      const shift = (index + fileIndex) % 4;
      const rotated = options.slice(shift).concat(options.slice(0, shift));
      return {
        id: q.id,
        question: clean(q.question),
        options: rotated,
        answer: (4 - shift) % 4,
        explanation: correct,
        chapter: chapter.name,
        classLevel: fileIndex === 0 ? 11 : 12
      };
    });
  })).filter((q) => q.options.length === 4 && q.options.every(Boolean));
}

const biology = flattenMcqs("data/neet/biology.json");
const physics = flattenMcqs("data/neet/physics.json");
const chemistry = flattenChemistry();

function rotateChoice(q, rotation = 0) {
  const shift = rotation % q.options.length;
  const options = q.options.slice(shift).concat(q.options.slice(0, shift));
  return { options, answer: (q.answer - shift + q.options.length) % q.options.length };
}

function choiceFrom(q, id, subjectName, prompt = q.question, rotation = 0) {
  const choice = rotateChoice(q, rotation);
  return {
    id,
    prompt,
    ...choice,
    explanation: q.explanation || `The NCERT-supported answer is ${q.options[q.answer]}.`,
    source: source(subjectName, q.classLevel, q.chapter)
  };
}

function topUp(original, generated, count = 100) {
  const kept = original.slice(0, Math.min(original.length, count));
  const ids = new Set(kept.map((item) => item.id));
  for (const item of generated) {
    if (kept.length >= count) break;
    if (!ids.has(item.id)) { kept.push(item); ids.add(item.id); }
  }
  if (kept.length !== count) throw new Error(`Expected ${count} challenges, got ${kept.length}`);
  return kept;
}

const diagramImages = [
  "assets/botany/plant-cell.svg", "assets/botany/cell-division.svg", "assets/botany/flower-morphology.svg",
  "assets/botany/double-fertilisation.svg", "assets/botany/dicot-anatomy.svg", "assets/botany/plant-kingdom.svg",
  "assets/zoology/body-plans.svg", "assets/zoology/chordate-classes.svg", "assets/zoology/ecosystem-flow.svg",
  "assets/zoology/plasmodium-cycle.svg", "assets/questions/cell-mitochondrion.jpg", "assets/questions/cell-chloroplast.jpg",
  "assets/questions/cell-membrane.jpg", "assets/questions/cell-axoneme.jpg", "assets/questions/division-meiosis1.jpg",
  "assets/questions/division-meiosis2.jpg", "assets/questions/division-cycle.jpg", "assets/questions/biomolecules-protein.jpg",
  "assets/questions/biomolecules-glycogen.jpg", "assets/questions/cell-chromosomes.jpg"
];

const linePool = biology.filter((q) => {
  const correct = q.options[q.answer];
  return /^[A-Za-z0-9-]+$/.test(correct) && q.options.some((option, index) => index !== q.answer && /^[A-Za-z0-9-]+$/.test(option));
});
const lineChallenges = linePool.slice(0, 100).map((q, index) => {
  const wrong = q.options.find((option, optionIndex) => optionIndex !== q.answer && /^[A-Za-z0-9-]+$/.test(option));
  const repair = q.options[q.answer];
  return {
    id: `line-generated-${index + 1}`,
    sentence: `${wrong} is the NCERT answer to the clue: ${q.question.replace(/[?:]+$/, ".")}`,
    wrong,
    repair,
    explanation: q.explanation || `The correct NCERT term is ${repair}.`,
    source: source("Biology", q.classLevel, q.chapter)
  };
});

const diagramChallenges = biology.slice(120, 220).map((q, index) => ({
  ...choiceFrom(q, `diagram-generated-${index + 1}`, "Biology", q.question, index),
  image: diagramImages[index % diagramImages.length],
  alt: `NCERT visual recall plate for ${q.chapter}`
}));

const whoChallenges = biology.slice(320, 420).map((q, index) => ({
  ...choiceFrom(q, `who-generated-${index + 1}`, "Biology", undefined, index),
  clues: [
    `Find me in the NCERT chapter ${q.chapter}.`,
    q.question,
    q.explanation || `I match the NCERT answer ${q.options[q.answer]}.`
  ]
}));

const extraSequences = [
  ["DNA replication", ["Helicase opens the helix", "Primase lays primers", "DNA polymerase extends strands", "Ligase seals fragments"]],
  ["Transcription", ["RNA polymerase binds promoter", "DNA locally unwinds", "RNA chain elongates", "Transcript terminates"]],
  ["Translation", ["mRNA binds ribosome", "Initiator tRNA pairs", "Peptide chain elongates", "Release factor terminates translation"]],
  ["Reflex arc", ["Receptor detects stimulus", "Sensory neuron carries impulse", "CNS relay processes signal", "Motor neuron activates effector"]],
  ["Chemical synapse", ["Action potential reaches terminal", "Calcium channels open", "Neurotransmitter is released", "Postsynaptic receptors bind transmitter"]],
  ["Muscle contraction", ["Calcium binds troponin", "Tropomyosin shifts", "Myosin binds actin", "Power stroke shortens sarcomere"]],
  ["Blood clotting", ["Vessel is injured", "Platelets form a plug", "Thrombin forms", "Fibrin mesh stabilises clot"]],
  ["Spermatogenesis", ["Spermatogonium", "Primary spermatocyte", "Secondary spermatocyte", "Spermatid", "Spermatozoon"]],
  ["Oogenesis", ["Oogonium", "Primary oocyte", "Secondary oocyte", "Ovum"]],
  ["Double fertilisation", ["Pollen germinates", "Pollen tube enters embryo sac", "Syngamy occurs", "Triple fusion occurs"]],
  ["Calvin cycle", ["CO₂ fixation", "Reduction", "Triose phosphate formation", "RuBP regeneration"]],
  ["C4 pathway", ["PEP fixes CO₂", "Oxaloacetate forms", "Malate moves to bundle sheath", "CO₂ enters Calvin cycle"]],
  ["Krebs cycle entry", ["Acetyl-CoA joins oxaloacetate", "Citrate forms", "Oxidative decarboxylations occur", "Oxaloacetate regenerates"]],
  ["Urine formation", ["Glomerular filtration", "Selective reabsorption", "Tubular secretion", "Concentration in collecting duct"]],
  ["Menstrual cycle", ["Menstrual phase", "Follicular phase", "Ovulation", "Luteal phase"]]
];
const sequencePrompts = ["Arrange the NCERT steps of", "Build the correct pathway for", "Restore the biological order of", "Sequence the events in", "Sprint through the correct order for"];
const sequenceSeeds = extraSequences.map(([name, items], index) => ({
  id: `sequence-seed-${index + 1}`,
  prompt: `${sequencePrompts[index % sequencePrompts.length]} ${name}.`,
  items,
  explanation: `${name} follows this ordered progression in NCERT treatment.`,
  source: `NCERT Biology XI/XII · ${name}`
}));
const sequenceChallenges = Array.from({ length: 100 }, (_, index) => {
  const base = sequenceSeeds[index % sequenceSeeds.length];
  const round = Math.floor(index / sequenceSeeds.length);
  return { ...base, id: `sequence-generated-${index + 1}`, prompt: `${sequencePrompts[(index + round) % sequencePrompts.length]} ${base.prompt.split(" ").slice(-2).join(" ")}` };
});

const mixed = Array.from({ length: 100 }, (_, index) => {
  const pools = [biology, physics, chemistry];
  const pool = pools[index % pools.length];
  return pool[(index * 7) % pool.length];
});
const escapeChallenges = mixed.map((q, index) => ({
  ...choiceFrom(q, `escape-generated-${index + 1}`, index % 3 === 0 ? "Biology" : index % 3 === 1 ? "Physics" : "Chemistry", `Door ${index + 1}: ${q.question}`, index),
  code: String.fromCharCode(65 + (index % 26))
}));

const physicsChallenges = physics.slice(0, 100).map((q, index) => choiceFrom(q, `physics-generated-${index + 1}`, "Physics", `Repair mission ${index + 1}: ${q.question}`, index));
const reactionChallenges = chemistry.slice(0, 100).map((q, index) => choiceFrom(q, `reaction-generated-${index + 1}`, "Chemistry", `Forge mission ${index + 1}: ${q.question}`, index));

const impostorChallenges = biology.slice(520, 620).map((q, index) => {
  const trueLines = [
    `NCERT answer: ${q.options[q.answer]}`,
    `Chapter: ${q.chapter}`,
    `Subject: Biology`
  ];
  const falseAnswer = q.options.find((_, optionIndex) => optionIndex !== q.answer);
  const statements = [...trueLines, `NCERT answer: ${falseAnswer}`];
  const shift = index % 4;
  return {
    id: `impostor-generated-${index + 1}`,
    prompt: `Which line is the impostor for this clue: ${q.question}`,
    options: statements.slice(shift).concat(statements.slice(0, shift)),
    answer: (3 - shift + 4) % 4,
    explanation: q.explanation || `${q.options[q.answer]} is the NCERT-supported answer.`,
    source: source("Biology", q.classLevel, q.chapter)
  };
});

const treasureChallenges = biology.slice(760, 860).map((q, index) => ({
  ...choiceFrom(q, `treasure-generated-${index + 1}`, "Biology", q.question, index),
  hint: `Open NCERT Class ${q.classLevel}, chapter “${q.chapter}”. The answer is a key term or fact from this chapter.`
}));

const generatedByMode = {
  "line-hunter": lineChallenges,
  "diagram-detective": diagramChallenges,
  "who-am-i": whoChallenges,
  "sequence-sprint": sequenceChallenges,
  "escape-room": escapeChallenges,
  "physics-lab": physicsChallenges,
  "reaction-forge": reactionChallenges,
  "impostor": impostorChallenges,
  "treasure-hunt": treasureChallenges
};

for (const mode of arcade.modes) {
  const originals = mode.challenges.filter((challenge) => !challenge.id.includes("-generated-"));
  mode.challenges = topUp(originals, generatedByMode[mode.id] || []);
}

arcade.version = 3;
arcade.challengeCount = 1000;
arcade.updated = "2026-10-02";
fs.writeFileSync(arcadePath, `${JSON.stringify(arcade, null, 2)}\n`);
console.log(`Built ${arcade.modes.length} × 100 arcade challenges; Boss Battle is expanded to 100 at runtime.`);
