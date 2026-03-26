const fs = require("fs");
const path = require("path");

const sources = [
  {
    slug: "insecticides",
    file: "C:\\Users\\HP\\Documents\\insecticides.txt",
  },
  {
    slug: "herbicides",
    file: "C:\\Users\\HP\\Documents\\Herbicides.txt",
  },
  {
    slug: "fungicides",
    file: "C:\\Users\\HP\\Documents\\fungicides.txt",
  },
  {
    slug: "pgrs",
    file: "C:\\Users\\HP\\Documents\\pgrs.txt",
  },
];

const outputPath = path.join(__dirname, "..", "product-rich-data.js");

const normalizeProductKey = (value = "") =>
  value
    .toUpperCase()
    .replace(/&AMP;/g, "AND")
    .replace(/[^A-Z0-9]+/g, "");

const decodePlainText = (html = "") =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&gt;/gi, ">")
    .replace(/&lt;/gi, "<")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();

const stripLeadingWrappers = (html) => {
  let cleaned = html.trim();
  const wrappers = [
    /^<div>\s*/i,
    /^<div class="co-lg-9 col-md-9 col-sm-9 col-xs-12 form-side">\s*/i,
    /^<div class="cover-product-this extra-desc">\s*/i,
  ];

  let changed = true;
  while (changed) {
    changed = false;
    for (const pattern of wrappers) {
      if (pattern.test(cleaned)) {
        cleaned = cleaned.replace(pattern, "").trim();
        changed = true;
      }
    }
  }

  return cleaned;
};

const stripTrailingClosers = (html) =>
  html
    .trim()
    .replace(/(?:<\/div>\s*)+$/i, "")
    .trim();

const parseSource = ({ slug, file }) => {
  const html = fs.readFileSync(file, "utf8");
  const entries = {};
  const blockRegex = /<h2>\s*\d+\.\s*([^<]+?)\s*<\/h2>([\s\S]*?)(?=<h2>\s*\d+\.|<\/section>)/gi;
  let match;

  while ((match = blockRegex.exec(html)) !== null) {
    const rawName = match[1].trim();
    const body = match[2];
    const imageMatch = body.match(/<img\s+src="([^"]+)"[^>]*title="([^"]*)"[^>]*alt="([^"]*)"[^>]*class="rel-img"/i);
    const detailStart = body.indexOf('<div class="cover-product-this extra-desc">');
    const imageMarker = body.indexOf('<div class="co-lg-4 col-md-4 col-sm-3 col-xs-12 form-side">');

    if (detailStart === -1 || imageMarker === -1 || imageMarker <= detailStart) {
      continue;
    }

    const detailHtml = stripTrailingClosers(
      stripLeadingWrappers(
        body.slice(
          detailStart + '<div class="cover-product-this extra-desc">'.length,
          imageMarker
        )
      )
    );

    const key = normalizeProductKey(rawName);
    if (!key || !detailHtml) continue;

    const firstParagraphMatch = detailHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const firstParagraphText = decodePlainText(firstParagraphMatch ? firstParagraphMatch[1] : "");
    const technicalName = firstParagraphText.includes(":")
      ? firstParagraphText.split(":").slice(1).join(":").trim()
      : firstParagraphText;

    entries[key] = {
      sourceName: rawName,
      technicalName,
      detailHtml,
      imageSrc: imageMatch ? imageMatch[1] : "",
      imageTitle: imageMatch ? imageMatch[2] : rawName,
      imageAlt: imageMatch ? imageMatch[3] : rawName,
    };
  }

  return [slug, entries];
};

const result = Object.fromEntries(sources.map(parseSource));
const output = `window.PRODUCTS_RICH_DATA = ${JSON.stringify(result, null, 2)};\n`;

fs.writeFileSync(outputPath, output, "utf8");
console.log(`Generated ${outputPath}`);
