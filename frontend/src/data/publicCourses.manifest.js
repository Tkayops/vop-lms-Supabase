// src/data/publicCourses.manifest.js
// Used by ensurePublicCourses() to seed/update courses & lessons.
// Safe to run multiple times (idempotent via UNIQUE(course_id, lesson_number)).

function mkLessons(n) {
  return Array.from({ length: n }, (_, i) => {
    const num = i + 1;
    return {
      number: num,
      title: `Lesson ${num}`,
      // url is optional; if omitted, db.js generates:
      //  - Discover  -> /lessons/discover/lesson{n}.htm
      //  - Ugunduzi  -> /lessons/ugunduzi/lesson{n}.htm
      // If you prefer explicit URLs, uncomment:
      // url: `/lessons/<slug>/lesson${num}.htm`,
    };
  });
}

export const PUBLIC_COURSES = [
  {
    title: "Discover",
    description: "Discover Bible lessons.",
    // If you want explicit URLs instead of generated ones, replace mkLessons with this:
    // lessons: Array.from({ length: 26 }, (_, i) => ({
    //   number: i + 1,
    //   title: `Lesson ${i + 1}`,
    //   url: `/lessons/discover/lesson${i + 1}.htm`,
    // })),
    lessons: mkLessons(26),
  },
  {
    title: "Ugunduzi",
    description: "Ugunduzi Bible lessons (Swahili).",
    // Same note as above for explicit URLs:
    // lessons: Array.from({ length: 26 }, (_, i) => ({
    //   number: i + 1,
    //   title: `Lesson ${i + 1}`,
    //   url: `/lessons/ugunduzi/lesson${i + 1}.htm`,
    // })),
    lessons: mkLessons(10),
  },
];
