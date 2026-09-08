# Scrutiny Academy Platform Roadmap

## Build principle
Engine first, verified content second. Counts shown to students must come from actual available data.

## Foundation created
- Platform catalog covering Class 10, Class 11, Class 12, NEET and MBBS.
- Empty, non-fabricated catalogs for Class 11 and Class 12.
- NEET batch catalogs for Nurture, Enthuse and Repeaters.
- PYQ catalog with a strict non-fabrication policy.
- NCERT search catalog with copyright/source safeguards.
- Reusable question JSON schema.
- Browser-based question validator.
- Browser-based content manager/export tool.

## Next implementation batches
1. Upgrade the public navigation and homepage to the unified platform map.
2. Replace hard-coded claims/counters with values derived from real data.
3. Refactor MCQ launchers so NEET and MBBS aggregate all available chapter questions and cap requested test sizes to availability.
4. Add reusable course/chapter renderer for Class 11 and Class 12.
5. Build PYQ filtering UI and indexing pipeline.
6. Build NCERT search index UI using short contextual snippets only.
7. Add Study Tools: bookmarks, weak topics, revision tracker and test history.
8. Add Ask Scrutiny UI with a backend abstraction; never expose a private API key in client JavaScript.
9. Accessibility, performance, SEO and GitHub Pages regression testing.

## Content safety / integrity rules
- Never fabricate PYQs, NCERT page numbers, sources, scores, users or question counts.
- Never claim AI is connected when no backend exists.
- Do not reproduce entire copyrighted textbooks.
- Keep question IDs unique and validate before publishing.
