const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const email = process.argv[2];
const confirmed = process.argv.includes("--confirm-production-change");
if (!email || !confirmed) {
  console.error("Usage: node scripts/set-founder-claim.js <email> --confirm-production-change");
  process.exit(1);
}
initializeApp();
getAuth().getUserByEmail(email).then(async (user) => {
  await getAuth().setCustomUserClaims(user.uid, { ...(user.customClaims || {}), founder: true });
  console.log(`Founder claim assigned to ${email}. The user must refresh their ID token.`);
}).catch((error) => { console.error(error.message); process.exitCode = 1; });

