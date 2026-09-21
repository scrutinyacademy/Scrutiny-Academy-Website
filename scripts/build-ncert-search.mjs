import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const physicsPath = path.join(root, "data/neet/physics.json");
const class11Path = path.join(root, "data/ncert/physics-class11-uploaded.json");
const outputPath = path.join(root, "data/ncert/catalog.json");
const outputDir = path.join(root, "data/ncert");
const physics = JSON.parse(fs.readFileSync(physicsPath, "utf8"));
const class11Catalog = fs.existsSync(class11Path)
  ? JSON.parse(fs.readFileSync(class11Path, "utf8"))
  : { records: [], chapters: [] };
const class11Records = (class11Catalog.records || []).concat(
  ...((class11Catalog.shards || []).map((file) =>
    JSON.parse(fs.readFileSync(path.join(root, file), "utf8")).records || [],
  )),
);

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

const allRecords = [...class11Records, ...records];
const shardSize = 160;
const shards = [];
for (let index = 0; index < allRecords.length; index += shardSize) {
  const shardRecords = allRecords.slice(index, index + shardSize);
  const shardName = `physics-search-${String(shards.length + 1).padStart(2, "0")}.json`;
  fs.writeFileSync(
    path.join(outputDir, shardName),
    `${JSON.stringify({ records: shardRecords }, null, 2)}\n`,
  );
  shards.push(`data/ncert/${shardName}`);
}

const catalog = {
  status: "active",
  title: "NCERT Physics concept and source index",
  description:
    "Concise meanings and source references generated from uploaded Class 11 Physics chapters and the published NCERT-based Class 12 Physics question bank.",
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
  chapterCount: class12Chapters.length + (class11Catalog.chapterCount || 0),
  class11ChapterCount: class11Catalog.chapterCount || 0,
  class12ChapterCount: class12Chapters.length,
  recordCount: allRecords.length,
  shards,
  records: [],
};

fs.writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(
  `Built ${allRecords.length} searchable NCERT Physics records across ${catalog.chapterCount} chapters in ${shards.length} shards.`,
);
