# Free Arabic & Quran learning

Public entry: `arabic-learning.html`; deep links: `arabic-lesson.html?id=letter-01` through `letter-28` and curriculum lesson IDs.

## Published functionality

28 alphabet study pages, four pronunciation guide choices, dot and recognition quizzes, name matching, retry errors, randomized revision, optional daily revision, local progress, seven-level roadmap, foundational reading practice in levels 2–5, official YouTube channel and configured video rendering. Course is separately exported as FREE_COURSE_CATALOG; never add it to the paid COURSE_CATALOG, payment forms or entitlements.

Lessons and pronunciation notes are prominently marked practice drafts pending qualified teacher review. English articulation explanations are not yet translated into all interface languages; language selection switches pronunciation guides only.

Guest access never imports Firebase or payment modules. Optional sync loads existing Firebase Authentication on user request. Only an already authenticated account can synchronize. Guest import requires a separate checkbox. Device records are scoped by UID after opting in; guests have their own record. Sync is manual, merges cloud/local history, and does not alter student documents. Deploy firestore.rules through the existing backend workflow before cloud sync is available. On failure, device practice continues.

## Pending resources and release process

No teacher sign-off, audio assets, Quran text or translation permissions were supplied. There is no synthetic speech or invented Quran content. No listening activity claims to work without approved recordings. Quran levels and reader remain unavailable to users until reviewed resources exist. Full course completion is deliberately not shown as available.

- Alphabet JSON: `audio` and optional `slowAudio` become `{url, license, reviewedBy}` only after license review and a teacher verifies the exact letter name/sound. Native audio controls and repeat-three activate only with all fields. Slow mode requires a separate approved recording. Listen-and-identify questions are added only when an approved recording is present.
- Review all alphabet pronunciation cues and makharij, joining examples and levels 2–5 with a qualified Arabic/Quran teacher. Record reviewer identity, date and corrections in a signed review record before declaring authoritative lessons. The current draft is not certification.
- `data/arabic/quran.json`: status remains `pending-verification`. The reader requires status `approved`, `reviewedBy`, `source`, `license`, `tradition` and nonempty `surahs`. Each surah has numeric `number`, `name`, and sequential `ayahs` with `number`, untouched `arabic`, optional `translations: {hi,en,ur}`, and an optional licensed/reviewed `audio` object. The configured reader supports ayah selection, native play/pause, repeat, font size, bookmarks and resume. Test approved data against source before publication. No Quran content has yet been validated by automated tests.
- Candidate text source: https://tanzil.net/docs/Text_License — requires unchanged text, attribution, link and copyright notice. Its permission does not cover unrelated translations or recordings. No Tanzil text is bundled in this release.
- `videos.json`: add `{title,videoId,lessonId,published:true}` for actual published Scrutiny Academy videos. No fabricated video IDs are supplied. Only valid IDs marked published render a lazy iframe.

## Validation

`node tests/arabic-learning.cjs` with Playwright and Chromium tests all 28 lessons, language guides, persistence, scoring, revision, pending-resource notices, error handling and mobile/tablet/desktop overflow. `.github/workflows/arabic-learning-qa.yml` installs isolated browser dependencies and runs it along with existing access regression tests. Live sign-in and cloud synchronization require authenticated Firebase testing; do not claim these passed based on guest tests. No live checkout is initiated by these tests.

## Modified integration points

Homepage and student dashboard free-course links; separate free catalog export; shared course navigation; sitemap entries; owner-scoped Arabic Firestore progress rule. Existing auth gates, student records, payment JavaScript, Razorpay functions, premium course data and prices are unchanged.
