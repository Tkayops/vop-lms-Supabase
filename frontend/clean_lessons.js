// clean_lessons.js
import fs from "fs";
import path from "path";
import sanitizeHtml from "sanitize-html";
import { JSDOM } from "jsdom";

const LESSONS_DIR = "./public/lessons/discover";
const files = fs.readdirSync(LESSONS_DIR).filter(f => f.endsWith(".htm") || f.endsWith(".html"));

for (const file of files) {
  const filePath = path.join(LESSONS_DIR, file);
  const html = fs.readFileSync(filePath, "utf8");
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Remove all inline MS Word formatting
  doc.querySelectorAll("[style],[class]").forEach(el => {
    el.removeAttribute("style");
    el.removeAttribute("class");
  });

  // Make all images responsive
  doc.querySelectorAll("img").forEach(img => {
    img.setAttribute("style", "max-width:100%;height:auto;display:block;margin:1rem auto;border-radius:8px;");
  });

  // Clean up the markup safely
  let cleaned = sanitizeHtml(doc.documentElement.outerHTML, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3", "blockquote"]),
    allowedAttributes: {
      a: ["href"],
      img: ["src", "alt", "style"]
    },
  });

  // Inject your theme stylesheet
  cleaned = cleaned.replace("</head>", `<link rel="stylesheet" href="/lessons/style.css"></head>`);

  // Save file
  fs.writeFileSync(filePath, cleaned, "utf8");
  console.log(`✅ Cleaned ${file}`);
}

console.log("✨ All Discover lessons cleaned and styled successfully!");
