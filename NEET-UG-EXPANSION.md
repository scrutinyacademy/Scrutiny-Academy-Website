# NEET UG NCERT practice expansion — 14 October 2026

Adds exactly 15,000 original practice variants to the existing 27,650-question bank:

| Subject | Added | Combined total | Chapters / syllabus units |
| --- | ---: | ---: | ---: |
| Biology (Botany and Zoology) | 7,500 | 18,700 | 32 |
| Physics | 3,750 | 13,550 | 29 |
| Chemistry | 3,750 | 10,400 | 21 |
| Total | 15,000 | 42,650 | 82 |

The compact packs contain source concept rows and fixed question specifications.
`neet-ug-expansion.mjs` expands each specification into an ordinary four-option
MCQ with its own stable ID, answer, explanation and chapter reference. Different
option orders alone never count as different questions. These are combinations
and numerical variations of the concept catalogue, not 15,000 independently
authored concepts or official previous-year questions. Automated checks are not
an independent academic review of every underlying scientific statement.

The expansion adds numerical calculations, independent two-statement judgments,
and three/four-row concept matching. Supplemental units cover experimental
skills, p-block trends, and practical chemistry. Source maps for existing chapters
come from the repository's NCERT concept files and builders, rather than inferring
facts from arbitrary existing answer choices. Additional source maps are in
`data/neet/expansion/supplemental-concepts.json`.

Exam coverage reference: [official NEET UG 2026 syllabus](https://neet.nta.nic.in/document/syllabus-for-neet-ug-2026-examination/).
Lab reference: [NCERT Laboratory Manuals](https://ncert.nic.in/science-laboratory-manual.php).
These references identify curriculum scope. Generated content is original and
chapter-level references do not claim verbatim quotations or invented page numbers.
Coverage must be reassessed against the official syllabus for subsequent exams.

The NEET portal merges these additions at load time, including its chapter tests,
custom-test builder and availability totals. The base banks and existing student
question IDs stay intact. Matching tables are retained in result records,
wrong-answer retries, bookmarks and revision cards. Student storage remains
isolated by the existing account/course mechanism.

## Validation

Run from the repository root with Node 22 or later:

```
node scripts/build-neet-ug-expansion.mjs
node scripts/validate-neet-ug-expansion.mjs
node scripts/test-neet-ug-integration.mjs
node scripts/validate-data.mjs
node tests/student-progress-isolation.cjs
```

Checks include exact totals, semantic duplicate detection independent of matching
option order, deterministic content/IDs, four distinct options, reconstructed
matching keys, statement truth masks, numerical substitutions and hand-calculated
cases, balanced answer positions, preservation of base questions, concurrent
loading, failure/retry behavior, and saved-table escaping/rendering. Browser QA
was unavailable in the managed environment; integration was checked in Node.

When changing source concepts or template semantics after publication, version
the pack/module URLs and IDs for changed questions instead of silently reusing an
ID for different content. Regeneration preserves IDs for an unchanged release.
