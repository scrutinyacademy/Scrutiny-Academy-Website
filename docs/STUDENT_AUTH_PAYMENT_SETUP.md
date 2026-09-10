# Scrutiny Academy Student Login + ₹59 Payment Gate

This branch contains a working front-end flow for student registration, login, manual ₹59 UPI verification, admin approval, and the student dashboard.

## Flow

1. Student opens `login.html`.
2. Student registers with name, mobile, email and password.
3. Firebase Authentication creates the account and sends an email-verification message.
4. Student is sent to `payment.html`.
5. Student scans the existing Scrutiny Academy QR and pays ₹59.
6. Student submits UTR/reference, payment date and amount.
7. Firestore stores the request as `pending`.
8. The Scrutiny Academy admin signs in with `scrutinyacademy@gmail.com` and opens `admin.html`.
9. Admin manually checks the UTR against actual payment records and selects Approve or Reject.
10. Approved students can open `student.html`, which links to the learning platform.

## Firebase setup required before accounts work

Create a Firebase project owned by Scrutiny Academy, then:

1. Enable **Authentication > Email/Password**.
2. Create a **Cloud Firestore** database.
3. Add a Firebase Web App.
4. Copy the Web App configuration values into `/firebase-config.js`.
5. Deploy `/firestore.rules` in Firebase Console > Firestore Database > Rules.
6. In Authentication > Settings > Authorized domains, add the GitHub Pages hostname used by this project.
7. Register/login once with `scrutinyacademy@gmail.com` before using `admin.html`.

## Security notes

- Passwords are handled by Firebase Authentication; the website does not store raw passwords.
- Students cannot approve their own access under the provided Firestore rules.
- Admin approval is restricted in Firestore Rules to the authenticated email `scrutinyacademy@gmail.com`.
- UTR values should be treated as payment records and should not be exposed publicly.
- This first version deliberately does **not** upload payment screenshots, reducing storage/privacy complexity. UTR + payment date + amount are sufficient for a manual verification workflow.
- `firebase-config.js` contains browser configuration, not a server-side secret. Security depends on Authentication and Firestore Rules.

## Important limitation of GitHub Pages

A login page can control the normal student experience, but it cannot make static files in a public GitHub Pages repository secret. Anyone who knows a direct URL to a static JSON/HTML asset may be able to request it.

Therefore, before putting genuinely paid-only flashcard/question content behind this gate, move premium data into Firestore or another authenticated API/database and apply server-side/database authorization rules. Do not rely on JavaScript redirects as the security boundary for paid content.

## Files

- `login.html` – login/register UI
- `auth.css` – shared portal styling
- `auth.js` – Firebase registration/login/password reset
- `payment.html` / `payment.js` – ₹59 UPI + UTR submission
- `student.html` / `student.js` – approved student dashboard
- `admin.html` / `admin.js` – manual payment verification panel
- `firebase-config.js` – Firebase project configuration template
- `firestore.rules` – student/admin database authorization
- `app-gate.js` – optional access-check module for protected app entry pages

## Recommended production follow-up

After Firebase is configured and manual verification has been tested with a few accounts, the next security step is moving premium content out of public static JSON and serving it only to authenticated users whose `accessStatus` is `active`.
