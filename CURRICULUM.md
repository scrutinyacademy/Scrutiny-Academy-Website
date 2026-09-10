# Curriculum and content maintenance

The Intermediate chapter catalog follows the eight user-supplied PDFs. Syllabus documents establish chapter structure; they do not supply question banks, answers, lecture URLs, or revision sheets. Empty sections intentionally show that content is being prepared.

| Class | Subject | Chapters/units | Source | Source year |
| --- | --- | ---: | --- | --- |
| 11 | Botany | 14 | BOTANY_I_SYLLABUS.pdf | 2026-2027 |
| 11 | Zoology | 8 | ZOOLOGY_-I_SYLLABUS.pdf | 2026-2027 |
| 11 | Physics | 14 | PHYSICS_I_SYLLABUS.pdf | 2026-2027 |
| 11 | Chemistry | 10 | CHEMISTRY_I_SYLLABUS.pdf | 2026-2027 |
| 12 | Botany | 14 | Academic_Annual_Plan_Botany_II.pdf | 2026-2027 |
| 12 | Zoology | 8 | Academic_Annual_Plan_Zoology_II.pdf | 2026-2027 |
| 12 | Physics | 16 | Academic_Annual_Plan_Physics_II.pdf | 2026-2027 |
| 12 | Chemistry | 13 | Annual_Plan__Chemistry_II.pdf | 2026-2027 |

Class 11 Botany now follows the replacement 2026-2027 syllabus: Chapter 13 is Plant Communities and Ecological Adaptations, and Chapter 14 is Economic Botany. Zoology's unit hierarchy is retained, with second-year physiology and reproduction subtopics shown inside their parent units. The malformed second-year Chemistry chapter 12 heading is normalized to “Organic Compounds Containing C, H and O”; its scope covers alcohols, phenols, ethers, aldehydes, ketones and carboxylic acids. First-year Physics includes the newly supplied Physics of Emerging Technologies unit.

## Adding content

Edit the relevant `data/class11/subject.json` or `data/class12/subject.json`. Preserve chapter IDs and numbering. Each chapter has:

- `vsaq`, `saq`, `laq`: arrays of `{id, question, answer, marks}`. Marks are per question; no Class 10 mark scheme is assumed for Intermediate.
- `mcqs`: arrays of `{id, question, options, answer, explanation, difficulty, chapter, subject}`. `answer` is a zero-based option index. `difficulty` is Easy, Medium or Hard.
- `resources`: arrays of `{title, url}` with HTTPS links to real lectures, notes or revision sheets.
- `topics`: optional named subtopics.

Do not invent lecture URLs, label newly written questions as past papers, or claim verification without subject review. Add approved questions progressively. Syllabus alignment and answer accuracy need independent content review.

Run `node scripts/build-data.mjs` after every JSON or manifest edit. This generates the offline bundle from the same files used online. Commit both the source JSON and generated bundle. The one-time `scripts/add-intermediate.mjs` migration preserves already-created board files; it is not a content editing tool.

## NEET

The existing 92 questions are retained across Botany, Zoology, Physics and Chemistry. Chapters carry NCERT class labels independently of TG Intermediate board placement (e.g. Waves is NCERT Class 11, TG second year). These files are a partial legacy practice bank, not proof of current exam syllabus coverage. The original combined `biology.json` is retained as an unlisted migration source and excluded from the manifest, live search and generated bundle to avoid duplicate questions. Shared biology topics are grouped under Botany for navigation; the split does not claim official NEET subject ownership.

Practice and chapter tests use only available questions. They do not constitute a full timed NEET mock. Progress remains device-local. Login, cloud sync and an administrative publishing system are not part of this static-site update.

## Validation

Run `node scripts/validate-data.mjs` and `node --check script.js`. Check chapter navigation, question formats, NEET class/chapter filters, practice launch, empty states, search and offline fallback when browser testing is performed.

## Published NEET navigation update

NEET now uses Biology, Chemistry and Physics → Class 11 / Class 12 → chapter names, with 79 NCERT chapter entries plus one retained legacy Environmental Issues entry. Empty chapters are visible with disabled practice buttons. The three subject JSON files are canonical; earlier Botany/Zoology split files are unlisted historical files. This catalog is navigation, not a claim of verified 2027/2028 examination coverage. Check the official NEET syllabus for the target exam year. Source for textbook chapter organization: https://ncert.nic.in/textbook.php . Do not rerun the original add-intermediate migration after this navigation update.

## Chapter practice expansion — September 2026

The Living World, Biological Classification and Plant Kingdom each contain 180 MCQs under NEET Biology / Class 11. Each preserves six existing questions and adds 90 direct questions, 42 two-statement questions and 42 matching questions. The combined formats deliberately revisit concepts through different tasks; these are original practice materials, not authenticated past-paper questions. Biology now contains 702 questions; all NEET subjects together contain 745.

Concepts and distractors are maintained in `scripts/biology-concepts/*.txt`. `node scripts/expand-biology-chapters.mjs` reproducibly assembles the expanded chapters while retaining other questions. IDs and option positions are stable on repeated builds. Run `node scripts/build-data.mjs` and `node scripts/validate-data.mjs` afterwards. The older `add-neet-biology-mcqs.mjs` was a one-time migration for the previous 180-total bank and must not be used to regenerate the current bank.

Reference checks used NCERT Class 11 Biology chapters [1](https://ncert.nic.in/textbook/pdf/kebo101.pdf), [2](https://ncert.nic.in/textbook/pdf/kebo102.pdf) and [3](https://ncert.nic.in/textbook/pdf/kebo103.pdf). Taxonomic keys, herbaria and broader species concepts are retained as supplementary chapter practice. Historical fungal groups and traditional plant categories are explicitly framed as the textbook system. This update does not claim independent expert review or certification of exam-year syllabus coverage.

The chapter practice button loads the full chapter bank instead of silently applying the engine's default 25-question limit. The existing difficulty filter still applies. Other engine entry points retain their question-count controls.

## Chapters 4–7 practice expansion

Animal Kingdom, Morphology of Flowering Plants, Anatomy of Flowering Plants and Structural Organisation in Animals now also contain 180 questions each. This adds 696 questions while preserving the six previously available questions in each chapter. The same direct, two-statement and matching formats revisit concepts through different tasks. All first seven Class 11 Biology chapters now have 180 MCQs; Biology has 1,398 and the combined NEET bank has 1,441.

Four further concept catalogues live in `scripts/biology-concepts/` and are included in the existing deterministic expansion script. The earlier three expanded banks retain their question IDs, prompts, options and answers. Other chapter content is unchanged.

Reference checks used NCERT Class 11 Biology chapters [4](https://ncert.nic.in/textbook/pdf/kebo104.pdf), [5](https://ncert.nic.in/textbook/pdf/kebo105.pdf), [6](https://ncert.nic.in/textbook/pdf/kebo106.pdf) and [7](https://ncert.nic.in/textbook/pdf/kebo107.pdf). Root and stem modifications, meristems, secondary growth and detailed animal-tissue comparisons include supplementary or earlier-edition concepts. Frog coverage emphasises external anatomy, digestion, respiration, circulation, excretion, neural control and reproduction. No past-paper year, official exam endorsement, independent expert review or exhaustive exam-year syllabus alignment is claimed.
