// One-time owner-authorized grant. Run only with trusted Firebase Admin credentials.
// Usage: GOOGLE_APPLICATION_CREDENTIALS=/secure/path/service-account.json node scripts/grant-founder.js
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const EMAIL = 'iampramodsharma02@gmail.com';
const EXPECTED_UID = 'hdSelQ5s1bSBTxwfti9N6orhhxs2';
initializeApp({ credential: applicationDefault() });
(async () => {
  const auth = getAuth();
  const user = await auth.getUserByEmail(EMAIL);
  if (user.uid !== EXPECTED_UID) throw new Error('UID mismatch; grant aborted.');
  const claims = { ...(user.customClaims || {}), founder: true };
  await auth.setCustomUserClaims(user.uid, claims);
  await getFirestore().doc('students/' + user.uid).set({ role: 'founder', accessStatus: 'active', founderGrantedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  const confirmed = await auth.getUser(user.uid);
  if (confirmed.customClaims?.founder !== true) throw new Error('Claim verification failed');
  console.log('Founder claim verified for', EMAIL, 'UID', user.uid);
})().catch(e => { console.error(e); process.exitCode = 1; });
