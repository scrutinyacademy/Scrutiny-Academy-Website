export const MISSION600_PRICING = Object.freeze({
  dppPaise: 200,
  writtenTestPaise: 900,
  combinedBundleDiscountPercent: 10,
  combinedBundleMaximumDiscountPaise: 10000,
});

export function distinctChapterCount(items = []) {
  return new Set(items.filter((item) => item?.kind === "dpp").map((item) => `${item.subjectId}:${item.chapterId}`)).size;
}

export function calculateMission600Cart(items = [], options = {}) {
  const eligible = items.filter((item) => ["dpp", "test"].includes(item?.kind) && Number.isInteger(item.pricePaise) && item.pricePaise >= 0);
  const subtotalPaise = eligible.reduce((total, item) => total + item.pricePaise, 0);
  const dppIds = new Set(eligible.filter((item) => item.kind === "dpp").map((item) => item.id));
  const testIds = new Set(eligible.filter((item) => item.kind === "test").map((item) => item.id));
  const requiredDppIds = [...new Set(options.requiredDppIds || [])];
  const requiredTestIds = [...new Set(options.requiredTestIds || [])];
  const completeDppCollection = requiredDppIds.length > 0 && requiredDppIds.every((id) => dppIds.has(id));
  const completeTestSeries = requiredTestIds.length > 0 && requiredTestIds.every((id) => testIds.has(id));
  const combinedBundleDiscountApplied = completeDppCollection && completeTestSeries;
  const discountPercentage = combinedBundleDiscountApplied ? MISSION600_PRICING.combinedBundleDiscountPercent : 0;
  const percentageDiscountPaise = Math.floor((subtotalPaise * discountPercentage + 50) / 100);
  const discountPaise = Math.min(percentageDiscountPaise, MISSION600_PRICING.combinedBundleMaximumDiscountPaise);
  return {
    itemCount: eligible.length,
    dppCount: dppIds.size,
    testCount: testIds.size,
    distinctChapterCount: distinctChapterCount(eligible),
    subtotalPaise,
    discountPercentage,
    discountPaise,
    totalPaise: subtotalPaise - discountPaise,
    combinedBundleDiscountApplied,
    discountLabel: combinedBundleDiscountApplied ? "Complete DPP + Test Series bundle" : "No discount",
    roundingPolicy: "All prices are stored in paise; percentage discounts round half-up to the nearest paisa.",
  };
}

// Kept as a compatibility alias for older callers. DPP-only carts now receive no discount.
export const calculateDppCart = calculateMission600Cart;

export function formatRupees(paise = 0) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(paise / 100);
}

export function mission600TestCode({ phase, week, subject, sequence }) {
  const phaseCodes = new Set(["SYL", "HY", "MOCK"]);
  const subjectCodes = new Set(["MAT", "PHY", "BIO", "SOC", "TEL", "HIN", "ENG"]);
  if (!phaseCodes.has(phase) || !subjectCodes.has(subject)) throw new TypeError("Invalid Mission 600 phase or subject code.");
  if (!Number.isInteger(week) || week < 1 || week > 99 || !Number.isInteger(sequence) || sequence < 1 || sequence > 999) {
    throw new RangeError("Mission 600 week or sequence is out of range.");
  }
  return `SA-M600-27-${phase}-W${String(week).padStart(2, "0")}-${subject}-${String(sequence).padStart(3, "0")}`;
}

export function mission600DppCode({ subject, chapterNumber, level }) {
  const subjectCodes = new Set(["MAT", "PHY", "BIO", "SOC", "TEL", "HIN", "ENG"]);
  if (!subjectCodes.has(subject) || !["E", "M", "H"].includes(level)) throw new TypeError("Invalid DPP subject or level code.");
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1 || chapterNumber > 99) throw new RangeError("Invalid DPP chapter number.");
  return `SA-DPP-27-${subject}-CH${String(chapterNumber).padStart(2, "0")}-${level}`;
}

export function isPurchasableResource(resource) {
  return resource?.status === "published" && resource?.contentComplete === true && resource?.purchaseEnabled === true;
}

