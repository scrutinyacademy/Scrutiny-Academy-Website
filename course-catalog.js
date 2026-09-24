export const NEET_PROMO_END = "2026-10-05T18:29:59.999Z";

export const COURSE_CATALOG = {
  class10: {
    id: "class10",
    name: "Class 10 SSC Complete Course 2027",
    shortName: "Class 10 Telangana SSC",
    price: 99,
    icon: "📘",
    validity: "Valid until your 2027 Class 10 board examinations conclude",
    includes: ["Video lectures", "Chapter notes", "Revision sheets", "Flashcards", "MCQs"],
  },
  class11: {
    id: "class11",
    name: "Class 11 Board Booster 2027",
    shortName: "Class 11 Telangana Intermediate",
    price: 149,
    icon: "🌱",
    validity: "Valid until your 2027 Class 11 annual examinations conclude",
    includes: ["Revision sheets", "VSAQs", "SAQs", "LAQs"],
  },
  class12: {
    id: "class12",
    name: "Class 12 Board Booster 2027",
    shortName: "Class 12 Telangana Intermediate",
    price: 149,
    icon: "🎓",
    validity: "Valid until your 2027 Class 12 board examinations conclude",
    includes: ["Revision sheets", "VSAQs", "SAQs", "LAQs"],
  },
  neet: {
    id: "neet",
    name: "NEET-UG Target Course",
    shortName: "NEET-UG",
    price: 499,
    promoPrice: 99,
    icon: "🧬",
    validity: "Valid through the selected NEET-UG examination",
    includes: ["Physics, Chemistry and Biology MCQs", "NCERT search and revision tools", "Previous-year questions", "Tests, analytics and mistake revision"],
  },
  mbbs: {
    id: "mbbs",
    name: "MBBS Complete Learning Course",
    shortName: "MBBS",
    price: 799,
    icon: "🩺",
    validity: "Lifetime access",
    includes: ["19 MBBS subjects", "Phase-wise medical learning", "Clinical revision tools", "MCQs, bookmarks and progress tracking"],
  },
};

export function currentCoursePrice(courseId, now = new Date()) {
  const course = COURSE_CATALOG[courseId];
  if (!course) return null;
  if (courseId === "neet" && now.getTime() <= new Date(NEET_PROMO_END).getTime()) return course.promoPrice;
  return course.price;
}

export function courseValidity(courseId, neetExamYear = "") {
  if (courseId === "neet" && ["2027", "2028"].includes(String(neetExamYear))) {
    return `Valid until the NEET-UG ${neetExamYear} examination`;
  }
  return COURSE_CATALOG[courseId]?.validity || "";
}

export function entitledCourses(profile = {}) {
  if (profile.courseEntitlements && typeof profile.courseEntitlements === "object") {
    const verified = Object.entries(profile.courseEntitlements)
      .filter(([, value]) => value && value.status === "active")
      .map(([id]) => id)
      .filter((id) => COURSE_CATALOG[id]);
    if (verified.length) return [...new Set(verified)];
  }
  if (profile.accessStatus === "active") {
    const legacy = profile.purchasedCourse || profile.requestedCourse || profile.activeCourse;
    if (COURSE_CATALOG[legacy]) return [legacy];
    const explicit = Array.isArray(profile.enrolledCourses)
      ? profile.enrolledCourses.filter((id) => COURSE_CATALOG[id])
      : [];
    if (explicit.length === 1) return explicit;
  }
  return [];
}
