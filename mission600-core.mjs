export const MISSION600_PRICING = Object.freeze({
  dppPaise: 200,
  writtenTestPaise: 900,
  discountPerChapter: 3,
  maximumDiscount: 30,
});

export function distinctChapterCount(items = []) {
  return new Set(items.filter((item) => item?.kind === "dpp").map((item) => `${item.subjectId}:${item.chapterId}`)).size;
}

export function calculateDppCart(items = []) {
  const eligible = items.filter((item) => item?.kind === "dpp" && Number.isInteger(item.pricePaise) && item.pricePaise >= 0);
  const subtotalPaise = eligible.reduce((total, item) => total + item.pricePaise, 0);
  const chapters = distinctChapterCount(eligible);
  const discountPercentage = Math.min(MISSION600_PRICING.discountPerChapter * chapters, MISSION600_PRICING.maximumDiscount);
  // Integer paise, half-up: add half the denominator before integer division.
  const discountPaise = Math.floor((subtotalPaise * discountPercentage + 50) / 100);
  return {
    itemCount: eligible.length,
    distinctChapterCount: chapters,
    subtotalPaise,
    discountPercentage,
    discountPaise,
    totalPaise: subtotalPaise - discountPaise,
    roundingPolicy: "All prices are stored in paise; percentage discounts round half-up to the nearest paisa.",
  };
}

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

