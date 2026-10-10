"use strict";

const fs = require("node:fs");
const path = require("node:path");
const admin = require("firebase-admin");

if (!process.argv.includes("--confirm-production-change")) {
  throw new Error("Refusing to write Firestore. Re-run with --confirm-production-change after explicit production approval.");
}
const enablePurchases = process.argv.includes("--academically-reviewed") && process.argv.includes("--enable-purchases");
const source = path.resolve(__dirname, "../../data/mission600/private/mathematics-dpps.json");
if (!fs.existsSync(source)) throw new Error("Private DPP bank missing. Run scripts/build-mission600-math-dpps.mjs first.");
if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const { dpps } = JSON.parse(fs.readFileSync(source, "utf8"));

async function seed() {
  for (let offset = 0; offset < dpps.length; offset += 200) {
    const batch = db.batch();
    for (const dpp of dpps.slice(offset, offset + 200)) {
      const { questions, ...metadata } = dpp;
      batch.set(db.doc(`mission600DPPContent/${dpp.id}`), {
        schemaVersion: 1,
        resourceId: dpp.id,
        subjectId: dpp.subjectId,
        chapterId: dpp.chapterId,
        questions,
        questionCount: questions.length,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      batch.set(db.doc(`mission600DPPs/${dpp.id}`), {
        ...metadata,
        academicallyReviewed: enablePurchases,
        status: enablePurchases ? "published" : "ready",
        purchaseEnabled: enablePurchases,
        secureContentPath: `mission600DPPContent/${dpp.id}`,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }
    await batch.commit();
  }
  console.log(`Seeded ${dpps.length} Mathematics DPPs. Purchases ${enablePurchases ? "enabled" : "remain disabled pending academic review"}.`);
}

seed().catch((error) => { console.error(error); process.exitCode = 1; });
