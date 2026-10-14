# NEET UG — High Yield MCQs

A separate, additive bank of 35,000 original NCERT-mapped practice variants:
17,500 Biology (32 chapters), 8,750 Chemistry (21 chapters/units), and 8,750
Physics (29 chapters/units). The existing 42,650 chapter-practice questions,
Kota Biology and NCERT Arcade are preserved. Combined ordinary practice banks
now contain 57,650 questions.

The bank uses existing NCERT concept maps to construct new matching combinations,
independent two-statement assessments and numerical variants. Different option
orders alone do not count as new questions. This is not a collection of 35,000
independently researched concepts, official PYQs or individually expert-reviewed
questions. Twelve additional questions use three original, NCERT-mapped vector
schematics: cell cycle, velocity–time graph, and reaction energy profile. These
are original drawings, not claimed reproductions of NCERT figures.

## Student flow

Open NEET UG → High Yield MCQs → Biology, Chemistry or Physics → chapter.
Start with Unpractised; select 20, 50 or all available questions. Submitting an
answer saves it immediately, including correct/wrong status. Skips remain fresh.
Practised, Incorrect and Bookmarks expose their own chapter counts and practice
pools. Revisiting a question updates its latest correctness. Bookmarking and
removal work both during fresh practice and review. Tables render with real
HTML headers, rows and cells; the same question data reconstructs during review.
Results show +4/−1 marks, correct/wrong/skipped counts, accuracy, elapsed time and
missed topics. Back-to-chapters is available during practice and results.

Progress is account-scoped browser storage under `neet_high_yield_v1`. It persists
across reloads on that browser/device; it does not sync between devices. This is
stated in the student UI. The existing Firebase authentication/course gate remains
in control; the section appears only in NEET UG. No Firestore rules or payment
functions change. Stable IDs use a separate `NEET-HY-V1-` namespace.

## Validation and release

```
node scripts/build-neet-high-yield.mjs
node scripts/validate-neet-high-yield.mjs
node tests/neet-high-yield-ui.mjs
node scripts/test-neet-ug-integration.mjs
node tests/student-progress-isolation.cjs
node scripts/validate-course-section-nav.mjs
```

Validation checks exact counts; semantic duplicates against both existing banks;
matching answer reconstruction; statement masks; numerical calculations; real
tables and escaped content; diagram paths; filters, scoring and bookmarking;
account isolation; full-chapter sessions; logout/stale-load protection; and load
failure/retry. UI tests execute actual handlers in a minimal DOM harness. They
do not verify browser rendering or independently establish scientific accuracy
for all source concept rows. Browser visual QA was unavailable in this environment.

Syllabus scope reference: https://neet.nta.nic.in/document/syllabus-for-neet-ug-2026-examination/
NCERT textbook catalogue: https://ncert.nic.in/textbook.php
Reassess chapter coverage when official subsequent-year syllabuses are released.

Change release IDs and URLs if published question semantics change.
