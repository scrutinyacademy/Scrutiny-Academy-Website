export const COURSE_CATALOG = Object.freeze({
  class10: {
    id: "class10",
    name: "Class 10 SSC",
    fullName: "Class 10 Telangana SSC",
    price: 99,
    features: [
      "Chapter-wise lectures",
      "Comprehensive notes",
      "Revision sheets",
      "Flashcards",
      "Chapter-wise MCQs",
    ],
  },
  class11: {
    id: "class11",
    name: "Class 11",
    fullName: "Class 11 Telangana Intermediate",
    price: 149,
    features: ["Revision sheets", "VSAQ question banks", "SAQ question banks", "LAQ question banks"],
  },
  class12: {
    id: "class12",
    name: "Class 12",
    fullName: "Class 12 Telangana Intermediate",
    price: 149,
    features: ["Revision sheets", "VSAQ question banks", "SAQ question banks", "LAQ question banks"],
  },
  neet: {
    id: "neet",
    name: "NEET UG",
    fullName: "NEET UG",
    price: 99,
    features: [
      "NCERT-focused Physics, Chemistry and Biology MCQs",
      "Previous-year questions",
      "NCERT search and revision tools",
      "Tests, progress tracking and mistake notebook",
    ],
  },
  mbbs: {
    id: "mbbs",
    name: "MBBS",
    fullName: "MBBS Lifetime Access",
    price: 799,
    features: [
      "Phase-wise MBBS subjects",
      "Clinical learning and revision resources",
      "Question practice and assessments",
      "Bookmarks, progress tracking and revision tools",
      "Lifetime course access",
    ],
  },
});

export function courseById(courseId) {
  return COURSE_CATALOG[courseId] || null;
}

export function verifiedCourses(profile = {}) {
  const entitlementIds = Object.entries(profile.courseEntitlements || {})
    .filter(([, entitlement]) => entitlement?.status === "active")
    .map(([courseId]) => courseId)
    .filter((courseId) => COURSE_CATALOG[courseId]);

  if (entitlementIds.length) return [...new Set(entitlementIds)];

  // Legacy accounts pre-date course-specific entitlements. Restrict them to
  // their saved primary course instead of trusting the old all-course array.
  if (profile.accessStatus === "active" && COURSE_CATALOG[profile.activeCourse]) {
    return [profile.activeCourse];
  }
  return [];
}
