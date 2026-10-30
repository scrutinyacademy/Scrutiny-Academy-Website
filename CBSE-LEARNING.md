# CBSE Classes 7–12 learning lab

Entry: `cbse.html`; homepage entry: `index.html#cbse-learning`.

## Release scope

The six class routes share one original supplementary-topic learning engine. This is an initial content collection, **not complete NCERT textbook or CBSE syllabus coverage**. Modules are topics, not assertions about current textbook chapter numbering. Class 9 curriculum and book editions changed in 2026–27; map each topic to the prescribed current curriculum before claiming chapter-complete coverage.

Implemented: class/subject/topic navigation, searching, original concept explanations, worked examples, self-check activities, three-level MCQ practice with hints and explanations, topic and mixed-topic timed tests, diagnostic checks, written-answer tasks with self-assessment criteria, flashcards, personal notes, bookmarks, mistake notebook, spaced revision, simple study-time planner, practice-based mastery, six grade-level visual models, numerical drills, support email drafts, printing, and progress JSON export.

Not implemented: complete chapter-by-chapter courses, recorded video libraries, authenticated past-paper collections, full board-pattern mock exams, AI tutoring, live classroom infrastructure, server-side homework submission/teacher grading, class discussion moderation, parent accounts, teacher dashboards, cloud progress synchronization, notifications, or entrance exam tracks. These must not be advertised as available.

Initial inventory: Classes 7–10 each have 6 subject areas, 24 topic modules and 72 MCQs. Classes 11–12 each have 15 subject areas, 30 topic modules and 90 MCQs. Total: 156 modules and 468 MCQs.

## Identity and access

This lab is public supplementary study material. It introduces no new paid plans and never changes existing course entitlements, pricing, accounts, Firestore rules or payment functions. Existing paid content is not copied into it. Optional Firebase authentication uses the site's existing sign-in only to namespace new browser-local progress. No student profile is written. Guest progress is separate and is not assigned to a signed-in account. Each class/subject/module/question has its own key. Local records are not automatically synchronized between devices.

## Content maintenance

Edit `data/cbse/class7.json` through `class12.json`. Each subject contains original topic modules with concepts, example steps, an activity/check, MCQs (zero-based correct-option index), a writing task/rubric, and revision bullets. Every question needs a useful hint, explanation, and Easy/Medium/Hard difficulty. Preserve existing IDs to preserve progress. Add unique IDs rather than padding banks with duplicated questions.

Do not insert copied textbook passages, pages or illustrations. NCERT's textbook page states that website hosting/republication of its textbooks is restricted. Public availability does not establish permission to redistribute. Use original explanations of subject concepts. Do not mislabel original practice as official questions, previous-year questions or expert-reviewed material. Check answer correctness and curriculum applicability before extending coverage.

Official references checked on 30 October 2026:

- CBSE curriculum landing page, academic year 2026–27: https://cbseacademic.nic.in/curriculum_2027.html
- CBSE curriculum release circular, including Class IX changes: https://cbseacademic.nic.in/web_material/Circulars/2026/14_Circular_2026.pdf
- NCERT textbook access and terms: https://ncert.nic.in/textbook.php
- CBSE competency-based learning approach: https://cbseacademic.nic.in/cbe/index.html

## Verification

```sh
node --check cbse.js
node --check cbse-account.js
node --check cbse-labs.mjs
node scripts/validate-cbse.mjs
node tests/cbse-core.mjs
node tests/student-progress-isolation.cjs
```

`validate-cbse` reports actual subject/module/question counts and rejects incomplete records or invalid MCQ options. Core tests check scoring, review intervals, recovery, class and subject isolation, nonduplicated test sampling, and numerical-model calculations. These checks validate structure and behavior, not an independent subject-expert content review.

Deployment uses this repository's existing GitHub Pages flow. The CBSE QA workflow checks changes separately; it does not redeploy Firebase or change backend access. A source commit alone is not proof of publication: verify the Pages deployment result and live route.
