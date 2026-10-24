export const STUDENT_OFFER_LIMIT = 100;
export const CLASS6_SUBJECT_PRICE = 69;
export const CLASS6_SUBJECTS = {
  mathematics: "Mathematics",
  science: "Science",
  "social-science": "Social Science",
};

export function class6Price(subjects = [], months = 1) {
  const validSubjects = [...new Set(Array.isArray(subjects) ? subjects : [])]
    .filter((subject) => CLASS6_SUBJECTS[subject]);
  const validMonths = Math.min(12, Math.max(1, Number.parseInt(months, 10) || 1));
  const subtotal = validSubjects.length * CLASS6_SUBJECT_PRICE * validMonths;
  const discountPercent = validMonths >= 6 ? 20 : validMonths >= 3 ? 10 : 0;
  const discount = Math.round(subtotal * discountPercent) / 100;
  return { subjects: validSubjects, months: validMonths, subtotal, discountPercent, discount, total: Math.max(0, subtotal - discount) };
}

export function arabicMonthlyPrice(profile = {}) {
  return profile.requestedCourse && profile.requestedCourse !== "arabic" ? 299 : 399;
}
export const COURSE_CATALOG = {
  arabic: {id:"arabic", name:"Learn Arabic & Quran", shortName:"Arabic & Quran", price:399, regularPrice:399, icon:"۞", validity:"Subscription access: 1, 3 or 6 months; renew to continue", includes:["28 Arabic alphabet lessons", "Hindi, Hinglish, Urdu & English pronunciation guides", "Reading practice and quizzes", "Saved progress and revision", "Quran learning roadmap; verified resources pending"]},
  class6: {
    id: "class6",
    name: "Class 6 CBSE Subject Course",
    shortName: "Class 6 CBSE",
    price: CLASS6_SUBJECT_PRICE,
    regularPrice: CLASS6_SUBJECT_PRICE,
    icon: "🎒",
    validity: "Subscription access: 1, 3 or 6 months; renew to continue",
    includes: ["Choose Mathematics, Science or Social Science", "Chapter learning and memory tricks", "Flashcards and active recall", "MCQs and important question answers", "Progress and mistake review"],
  },
  class8: {
    id: "class8",
    name: "Class 8 SSC Complete Learning Course",
    shortName: "Class 8 Telangana SSC",
    price: 395,
    regularPrice: 395,
    icon: "🚀",
    validity: "Subscription access: 1, 3 or 6 months; renew to continue",
    includes: ["SCERT-aligned subject learning", "Visual revision notes", "Flashcards and active recall", "Practice and chapter tests", "Mistake Book and smart revision"],
  },
  class10: {
    id: "class10",
    name: "Class 10 SSC Complete Course 2027",
    shortName: "Class 10 Telangana SSC",
    price: 495,
    regularPrice: 495,
    icon: "📘",
    validity: "Subscription access: 1, 3 or 6 months; renew to continue",
    includes: ["Daily 60-minute board mission", "Answer Writing Lab", "Flashcards and spaced revision", "Mark-wise practice and tests", "Board Readiness and Error Notebook"],
  },
  class11: {
    id: "class11",
    name: "Class 11 Board Booster 2027",
    shortName: "Class 11 Telangana Intermediate",
    price: 745,
    regularPrice: 745,
    icon: "🌱",
    validity: "Subscription access: 1, 3 or 6 months; renew to continue",
    includes: ["Revision sheets", "VSAQs", "SAQs", "LAQs"],
  },
  class12: {
    id: "class12",
    name: "Class 12 Board Booster 2027",
    shortName: "Class 12 Telangana Intermediate",
    price: 745,
    regularPrice: 745,
    icon: "🎓",
    validity: "Subscription access: 1, 3 or 6 months; renew to continue",
    includes: ["Revision sheets", "VSAQs", "SAQs", "LAQs"],
  },
  neet: {
    id: "neet",
    name: "NEET-UG Target Course",
    shortName: "NEET-UG",
    price: 495,
    regularPrice: 495,
    icon: "🧬",
    validity: "Subscription access: 1, 3 or 6 months; renew to continue",
    includes: ["Physics, Chemistry and Biology MCQs", "NCERT search and revision tools", "Previous-year questions", "Tests, analytics and mistake revision"],
  },
  jee: {
    id: "jee",
    name: "IIT-JEE Complete Preparation Course",
    shortName: "IIT-JEE",
    price: 2495,
    regularPrice: 2495,
    icon: "⚙️",
    validity: "Subscription access: 1, 3 or 6 months; renew to continue",
    includes: ["Physics, Chemistry and Mathematics preparation", "Rigid Body & Rotational Motion masterclass", "JEE Main and Advanced practice", "Flashcards, MCQs and PYQ-focused revision"],
  },
  mbbs: {
    id: "mbbs",
    name: "MBBS Complete Learning Course",
    shortName: "MBBS",
    price: 3995,
    regularPrice: 3995,
    icon: "🩺",
    validity: "Subscription access: 1, 3 or 6 months; renew to continue",
    includes: ["19 MBBS subjects", "Phase-wise medical learning", "Clinical revision tools", "MCQs, bookmarks and progress tracking"],
  },
  neetss: {
    id: "neetss",
    name: "NEET-SS Surgery — Super Speciality Mastery",
    shortName: "NEET-SS Surgery",
    price: 8999,
    regularPrice: 8999,
    fullPrice: 8999,
    icon: "⚕️",
    validity: "Subscription access: 1, 3 or 6 months; renew to continue",
    includes: ["Surgical Group curriculum", "Clinical decision pathways", "Original MCQs with explanations", "Smart flashcards", "Cases, mistakes and performance analytics"],
  },
};

export function currentCoursePrice(courseId, offerActive = true) {
  const course = COURSE_CATALOG[courseId];
  if (!course) return null;
  return offerActive ? course.price : course.regularPrice;
}

export function regularCoursePrice(courseId) {
  return COURSE_CATALOG[courseId]?.regularPrice ?? null;
}

export function courseValidity(courseId, neetExamYear = "") {
  return COURSE_CATALOG[courseId]?.validity || "";
}

export function entitledCourses(profile = {}) {
  if (profile.founderAccess === true) return Object.keys(COURSE_CATALOG);
  if (profile.courseEntitlements && typeof profile.courseEntitlements === "object") {
    const verified = Object.entries(profile.courseEntitlements)
      .filter(([id, value]) => {
        if (!value || value.status !== "active") return false;
        if (!value.expiresAt) return true;
        const expiry = typeof value.expiresAt.toDate === "function" ? value.expiresAt.toDate() : new Date(value.expiresAt);
        return Number.isFinite(expiry.getTime()) && expiry > new Date();
      })
      .map(([id]) => id)
      .filter((id) => COURSE_CATALOG[id]);
    if (verified.length) return [...new Set(verified)];
  }
  if (profile.accessStatus === "active") {
    const legacy = profile.purchasedCourse || profile.requestedCourse || profile.activeCourse;
    if (COURSE_CATALOG[legacy] && !profile.courseEntitlements?.[legacy]) return [legacy];
    const explicit = Array.isArray(profile.enrolledCourses)
      ? profile.enrolledCourses.filter((id) => COURSE_CATALOG[id])
      : [];
    if (explicit.length === 1 && !profile.courseEntitlements?.[explicit[0]]) return explicit;
  }
  return [];
}

// Public learning routes are deliberately separate from checkout and entitlements.
export const FREE_COURSE_CATALOG = {};

export function subscriptionPrice(courseId, months = 1, profile = {}) {
  months = [1,3,6].includes(Number(months)) ? Number(months) : 1;
  const subtotal = (courseId === "arabic" ? arabicMonthlyPrice(profile) : currentCoursePrice(courseId) || 0) * months;
  const discountPercent = months === 6 ? 20 : months === 3 ? 10 : 0;
  const discount = Math.round(subtotal * discountPercent) / 100;
  return {months, subtotal, discountPercent, discount, total: Math.round((subtotal-discount)*100)/100};
}
