// src/data/publicCourses.manifest.js
// Uses your paths: /lessons/{series}/lesson{n}.htm (no zero-padding)

function gen(prefix, folder) {
  return Array.from({ length: 26 }, (_, i) => {
    const n = i + 1;
    return {
      number: n,
      title: `${prefix} Lesson ${n}`,
      url: `/lessons/discover/${folder}/lesson${n}.htm`,
    };
  });
}

export const PUBLIC_COURSES = [
  {
    slug: "discover",
    title: "Discover",
    description: "The Discover Bible series.",
    lessons: gen("Discover", "discover"),
  },
  {
    slug: "ugunduzi",
    title: "Ugunduzi",
    description: "Mfululizo wa somo la Ugunduzi.",
    lessons: gen("Ugunduzi", "ugunduzi"),
  },
];
