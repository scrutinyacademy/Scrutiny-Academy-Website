import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const physicsPath = path.join(root, "data/neet/physics.json");
const outputPath = path.join(root, "data/ncert/catalog.json");
const physics = JSON.parse(fs.readFileSync(physicsPath, "utf8"));

const normalize = (value) =>
  String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const class12Chapters = physics.chapters.filter(
  (chapter) => chapter.classLevel === 12 && chapter.mcqs?.length,
);

const records = [];
for (const [chapterIndex, chapter] of class12Chapters.entries()) {
  const concepts = new Map();
  for (const question of chapter.mcqs) {
    const reference = question.ncertReference || question.references?.[0];
    if (!reference) throw new Error(`Missing NCERT reference: ${question.id}`);

    const key = [
      question.topic,
      question.subtopic,
      question.ncertBasis,
      reference.pdfPage,
      reference.section,
    ].join("|");
    let concept = concepts.get(key);
    if (!concept) {
      concept = {
        topic: question.topic,
        meaning: question.ncertBasis || reference.paragraphContext,
        chapter: chapter.name,
        section: reference.section || question.subtopic,
        sourceLabel: reference.sourceLabel,
        pdfFilename: reference.pdfFilename,
        pdfPage: reference.pdfPage,
        printedPage: reference.printedPage,
        keywords: new Set(),
      };
      concepts.set(key, concept);
    }

    const searchable = [
      question.topic,
      question.subtopic,
      question.ncertBasis,
      question.formulaUsed,
      question.questionType,
      question.question,
      question.explanation,
      ...(question.options || []),
      reference.paragraphContext,
      reference.section,
    ];
    for (const word of normalize(searchable.join(" ")).split(" ")) {
      if (word.length > 1) concept.keywords.add(word);
    }
    for (const alias of [
      question.topic,
      question.subtopic,
      question.formulaUsed,
    ]) {
      const compact = normalize(alias).replaceAll(" ", "");
      if (compact.length > 1 && compact.length <= 80) {
        concept.keywords.add(compact);
      }
    }
  }

  [...concepts.values()].forEach((concept, conceptIndex) => {
    records.push({
      id: `ncert-physics-12-${String(chapterIndex + 1).padStart(2, "0")}-${String(conceptIndex + 1).padStart(3, "0")}`,
      class: 12,
      subject: "Physics",
      ...concept,
      keywords: [...concept.keywords].sort().join(" "),
    });
  });
}

const catalog = {
  status: "active",
  title: "NCERT Class 12 Physics concept index",
  description:
    "Concise meanings and source references generated from the published NCERT-based Physics question bank.",
  policy:
    "Return concise study meanings with the supplied chapter, section and page reference; do not reproduce complete books.",
  recordFields: [
    "id",
    "class",
    "subject",
    "topic",
    "meaning",
    "chapter",
    "section",
    "sourceLabel",
    "pdfFilename",
    "pdfPage",
    "printedPage",
    "keywords",
  ],
  chapterCount: class12Chapters.length,
  records,
};

fs.writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(
  `Built ${records.length} searchable NCERT concepts across ${class12Chapters.length} Class 12 Physics chapters.`,
);
