export const STUDENT_OFFER_LIMIT = 100;

export const COURSE_CATALOG = {
  class8: {
    id: "class8",
    name: "Class 8 SSC Complete Learning Course",
    shortName: "Class 8 Telangana SSC",
    price: 79,
    regularPrice: 395,
    icon: "🚀",
    validity: "Valid for the Class 8 academic year",
    includes: ["SCERT-aligned subject learning", "Visual revision notes", "Flashcards and active recall", "Practice and chapter tests", "Mistake Book and smart revision"],
  },
  class10: {
    id: "class10",
    name: "Class 10 SSC Complete Course 2027",
    shortName: "Class 10 Telangana SSC",
    price: 99,
    regularPrice: 495,
    icon: "📘",
    validity: "Valid until your 2027 Class 10 board examinations conclude",
    includes: ["Daily 60-minute board mission", "Answer Writing Lab", "Flashcards and spaced revision", "Mark-wise practice and tests", "Board Readiness and Error Notebook"],
  },
  class11: {
    id: "class11",
    name: "Class 11 Board Booster 2027",
    shortName: "Class 11 Telangana Intermediate",
    price: 149,
    regularPrice: 745,
    icon: "🌱",
    validity: "Valid until your 2027 Class 11 annual examinations conclude",
    includes: ["Revision sheets", "VSAQs", "SAQs", "LAQs"],
  },
  class12: {
    id: "class12",
    name: "Class 12 Board Booster 2027",
    shortName: "Class 12 Telangana Intermediate",
    price: 149,
    regularPrice: 745,
    icon: "🎓",
    validity: "Valid until your 2027 Class 12 board examinations conclude",
    includes: ["Revision sheets", "VSAQs", "SAQs", "LAQs"],
  },
  neet: {
    id: "neet",
    name: "NEET-UG Target Course",
    shortName: "NEET-UG",
    price: 99,
    regularPrice: 495,
    icon: "🧬",
    validity: "Valid through the selected NEET-UG examination",
    includes: ["Physics, Chemistry and Biology MCQs", "NCERT search and revision tools", "Previous-year questions", "Tests, analytics and mistake revision"],
  },
  jee: {
    id: "jee",
    name: "IIT-JEE Complete Preparation Course",
    shortName: "IIT-JEE",
    price: 499,
    regularPrice: 2495,
    icon: "⚙️",
    validity: "Valid until you complete your IIT-JEE examination",
    includes: ["Physics, Chemistry and Mathematics preparation", "Rigid Body & Rotational Motion masterclass", "JEE Main and Advanced practice", "Flashcards, MCQs and PYQ-focused revision"],
  },
  mbbs: {
    id: "mbbs",
    name: "MBBS Complete Learning Course",
    shortName: "MBBS",
    price: 799,
    regularPrice: 3995,
    icon: "🩺",
    validity: "Lifetime access",
    includes: ["19 MBBS subjects", "Phase-wise medical learning", "Clinical revision tools", "MCQs, bookmarks and progress tracking"],
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
  if (courseId === "neet" && ["2027", "2028"].includes(String(neetExamYear))) {
    return `Valid until the NEET-UG ${neetExamYear} examination`;
  }
  return COURSE_CATALOG[courseId]?.validity || "";
}

export function entitledCourses(profile = {}) {
  if (profile.founderAccess === true) return Object.keys(COURSE_CATALOG);
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
