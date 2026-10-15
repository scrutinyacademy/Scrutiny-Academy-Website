# NEET UG — High Yield MCQs

A separate, additive bank of 115,000 original NCERT-mapped practice variants:
57,500 Biology (32 chapters), 28,750 Chemistry (21 chapters/units), and 28,750
Physics (29 chapters/units). The existing 42,650 chapter-practice questions,
Kota Biology and NCERT Arcade are preserved. Combined ordinary practice banks
contain 42,650 questions; High Yield adds a separate 115,000.

The bank uses existing NCERT concept maps to construct new matching combinations,
independent two-statement assessments and numerical variants. Different option
orders alone do not count as new questions. This is not a collection of 115,000
independently researched concepts, official PYQs or individually expert-reviewed
questions. Twelve additional questions use three original, NCERT-mapped vector
schematics: cell cycle, velocity–time graph, and reaction energy profile. These
are original drawings, not claimed reproductions of NCERT figures.

When earlier combination types reach their distinct-content limit, the append
builder can also create single-correct association questions. Each contains one
supported concept-property pair and three concept-specific misconceptions. This
adds new scientific content combinations without changing any earlier question.

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

## Hourly additions

The 15 October batch adds 20,000 variants (10,000 Biology, 5,000 Chemistry,
5,000 Physics), bringing High Yield to 115,000 and the portal inventory to 159,916.
The append builder preserves all existing chapter rows and specs. When a chapter
exhausts distinct combinations, the remainder is allocated to other chapters in
the same subject; it fails if the subject cannot support the requested addition.
Rerunning unchanged targets adds nothing. These are generated practice variants,
not individually expert-reviewed questions.

For subsequent batches, increase the generator's current subject targets by
10,000 / 5,000 / 5,000. Update the expected counts in the High Yield and inventory
validators/builders, displayed totals in neet-high-yield.js and preview-v2.html,
and cache versions in neet-high-yield.js, preview-v2.html and sw.js. Rebuild the
inventory. Compare every previous question by ID and full content before pushing;
existing questions must remain identical. Run the documented checks plus the
inventory validator and tests/neet-mcq-progress.mjs. Publish only after they pass.
