# Scrutiny Academy — Mission 600

## Current textbook DPP release — 26 October 2026

Mission 600 has **171 published short DPPs across all 57 non-language chapters**:

| Subject | Chapters | Easy/Medium/Hard sets | Original MCQs |
| --- | ---: | ---: | ---: |
| Mathematics | 14 | 42 | 126 |
| Physical Science | 12 | 36 | 108 |
| Biological Science | 10 | 30 | 90 |
| Social Studies | 21 | 63 | 189 |
| Total | 57 | 171 | 513 |

Each short DPP contains **3 questions**, four options per question, an answer key and an explanation. Easy targets recall/foundation, Medium targets application, and Hard targets reasoning or multi-step work. These are focused practice sets, not full board examination papers. They replace the old player selection that padded Easy/Hard sets using Medium cloze questions. Existing Class 10 textbook banks remain untouched for other learning features.

The chapter lists were matched to the four books supplied for this task: `CLASS 10 SOCIAL.pdf`, `X Mathematics EM 2025-26 (02-11-2024) 2.pdf`, `class 10th physics.pdf`, and `X Biology EM 2025-26.pdf`. Metadata names the source book, chapter and printed chapter page range. Those ranges describe chapter alignment, not exact page citations for every original question. No external syllabus-year claim or independent teacher-review claim is made.

## Calendar and access

The existing programme runs from 12 October 2026 to 12 February 2027. Nine syllabus weeks teach all 57 chapters; revision and mock phases continue afterwards. There are 34 existing Saturday/Sunday test entries. Language book details remain separate and unchanged.

Each DPP is attached to its existing chapter lecture and syllabus week. Suggested dates are the lecture date for Easy, the next day for Medium, and the following day for Hard, all within that teaching week. These are study recommendations, **not release locks**. All 171 sets are immediately available through the existing Class 10 Mission 600 portal, with no separate payment or purchase. The existing portal account/subscription gate is preserved. The DPP reader remains directly accessible as before; these static question files are public practice content, not protected assessment material.

The calendar list and date view link directly to the DPPs. Students can also filter the library by subject, difficulty, chapter search and teaching week. The player gives instant correct/wrong/unanswered totals and answer review. Existing attempt history is stored locally in the browser; this release does not add cloud progress sync.

## Implementation

- `scripts/mission600/questions.mjs`: authored question source, grouped by subject/chapter/difficulty.
- `scripts/build-mission600.mjs`: deterministic catalogue and four subject content-file build.
- `data/mission600/catalog.json`: metadata, teaching calendar and existing written-test entries.
- `data/mission600/dpps/*.json`: published original question sets and keys.
- `mission600.js`: catalogue filters and calendar links; legacy Firestore DPP metadata cannot override a versioned local release.
- `mission600-dpp.js`: loads only the selected subject bank and checks its content version against the catalogue.
- `sw.js`: fresh Mission 600 content and cache-version update.

Frontend: repository-root static HTML/CSS/JavaScript, published with GitHub Pages. Existing Firebase Auth, Firestore, Functions and Razorpay features remain in place. This change needs no Firebase rules, Functions, payment or database migration. Written-test drafts are not newly published by this release.

## Verification

```bash
node scripts/build-mission600.mjs
node scripts/test-mission600-all-dpps.mjs
node scripts/test-mission600-player.mjs
node scripts/test-mission600.mjs
node --check mission600.js
node --check mission600-dpp.js
node --check sw.js
git diff --check
```

Automated checks cover distinct IDs/prompts/options, answer-key shape, explanation presence, all 171 metadata/content pairs, dates, difficulty coverage, instant scoring, unanswered/wrong handling, stale-version rejection and portal filters/calendar links. These checks do not substitute for an independent teacher's academic review.
