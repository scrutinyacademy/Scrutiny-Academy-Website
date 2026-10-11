# NEET-SS Surgery Phase 2 — 11 October 2026

Focused learning expansion, not completion of the entire course.

## Actual inventory

| Domain | Modules | Original MCQs | Flashcards |
| --- | ---: | ---: | ---: |
| General Surgical Principles | 1 | 4 | 6 |
| Surgical Infections | 1 | 4 | 6 |
| Trauma and Emergency Surgery | 1 | 4 | 6 |
| Gastrointestinal Surgery | 1 | 4 | 4 |
| Hepatobiliary and Pancreatic Surgery | 2 | 8 | 8 |
| Colorectal Surgery | 1 | 4 | 4 |
| Vascular Surgery | 1 | 4 | 4 |
| Urology | 1 | 4 | 4 |
| Total | 9 | 36 | 42 |

Six interactive cases with three decisions each; four original classification/mechanism schematics; nine printable revision sheets. No patient photographs or diagnostic scans are included. No generated question is labelled as a PYQ. Full grand tests remain Phase 3.

## Clinical review limits

New topics are checked against WSES Bologna (2017 update, published 2018), cholecystitis (2020), pancreatitis (2019), diverticulitis (2020), ESVS acute limb ischaemia (2020), and EAU Urolithiasis (2026). Exact reference URLs and versions are displayed. These are educational paraphrases, not reproduced textbook chapters. Independent qualified surgeon review is pending; no clinician certification is claimed. Older source versions are named rather than called the newest guidance. Local protocols and individual clinical assessment take precedence.

## Access and preservation

`getNeetssCourseContent` checks Firebase Authentication and the active NEET-SS entitlement server-side (or configured founder access). Unauthorised calls return no learning data. Student records stay under `neetssProgress/{uid}` with existing ownership rules. Legacy question IDs/indexes, module completion IDs and card IDs are migrated without database deletion. No payment amounts or existing course access policies are changed.

The GitHub repository is public: server gating protects app delivery and student records, not the confidentiality of source code committed to a public repository. A fully confidential question bank requires a private content source or a private repository; students' secrets and personal data are never committed.

## Tests

Run `node scripts/validate-neetss-phase2.mjs` and `node tests/neetss-phase2-browser.cjs`, plus existing Phase 1, pricing, multi-course and student-isolation validators. Browser tests use mocked Firebase for safe repeatable UI testing; they do not prove deployed Firebase Rules. Live unauthorised endpoint checks and deployment verification are separate.
