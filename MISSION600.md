# Scrutiny Academy – Mission 600

## Audited architecture

- Frontend: static multi-page HTML/CSS/JavaScript hosted from the repository root on GitHub Pages.
- Authentication/data: Firebase Web SDK 10.14.1, Firebase Authentication and Cloud Firestore.
- Backend: Firebase Functions v2, Node.js 22, region `asia-south1`.
- Payments: Razorpay Orders API, server-side signature/captured-payment checks, and webhooks.
- Deployment: GitHub Pages serves frontend changes; Firebase Functions, Firestore rules and Storage rules require a separate Firebase deployment.
- Existing Class 10 content: 57 chapters from local SCERT textbook datasets labelled 2025–26 (14 Mathematics, 12 Physical Science, 10 Biological Science, 21 Social Studies).

## Mission 600 implementation

- `mission600.html`: authenticated student portal.
- `mission600-submit.html`: typed and handwritten written-answer submission.
- `data/mission600/catalog.json`: deterministic calendar/product catalogue.
- `mission600-core.mjs`: serial codes, paise-based cart calculation and publication gates.
- `functions/mission600.js`: secure order creation, payment verification and webhook fulfillment.
- `firestore.rules` and `storage.rules`: owner/Founder isolation and protected answer files.

## Academic schedule facts

- Programme: 12 October 2026 through 12 February 2027.
- The last valid test weekend is 6–7 February 2027.
- 17 weekends produce 34 Saturday/Sunday tests.
- Weekday 8–12 February is retained as the final Mock Championship improvement week, with no invented weekend test.
- All 57 current non-language chapters are allocated across the nine syllabus-completion teaching weeks.
- 171 DPP catalogue records exist: three per chapter (Easy, Medium and Hard).
- Language practice is scheduled weekly, but exact Telugu/Hindi/English lesson names remain gated until the prescribed 2026–27 language combinations and books are confirmed.

## Content and payment gates

All generated DPP and test records are drafts. They are deliberately not purchasable. A resource can be published only when:

1. private question content exists;
2. an answer key/explanations or marking rubric exists;
3. both records are marked academically reviewed;
4. metadata is marked `contentComplete: true`, `status: published`, and `purchaseEnabled: true`.

Pricing is stored and calculated in integer paise. DPP discount is `min(3 × distinct chapters, 30)%`, applied only to DPP merchandise and rounded half-up to the nearest paisa. Tests are ₹9 each and excluded from DPP discounts. The backend removes already-owned items and independently recalculates every total.

## Production activation checklist (approval required)

1. Confirm current official 2026–27 SCERT textbook chapter lists and language combinations.
2. Review and upload complete original DPP/test content; keep incomplete records as drafts.
3. Add reviewed resources directly through repository/Firebase deployment work; there is no web admin upload panel.
4. Configure Firebase App Check for the website and Functions.
5. Deploy Firestore and Storage rules to a test project/emulator first.
6. Deploy Functions to a non-production/test Firebase project.
7. Configure the Mission 600 Razorpay webhook in Test Mode.
8. Test success, failure, cancellation, retry, captured-payment reconciliation, webhook replay, duplicate ownership, and partial fulfillment recovery.
9. Seed only reviewed resource metadata/content.
10. Obtain explicit approval before production Firebase deployment, Razorpay live webhook changes, git push, or GitHub Pages publication.

## Validation

```bash
node scripts/build-mission600.mjs
node scripts/test-mission600.mjs
node scripts/validate-data.mjs
npm --prefix functions run check
git diff --check
```

