import { execSync } from "node:child_process";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(os.tmpdir(), "embroiderly-docs");
const LANGUAGES = ["en", "uk"];

const DOCS_REPO_URL = "https://github.com/embroidery-space/documentation.git";
const DOCS_OUTPUT_DIR = path.join(__dirname, "../app/src-tauri/resources/docs");

try {
  console.log("Bundling documentation...");

  console.log("Cleaning up previous builds...");
  clear(true);

  console.log("Cloning documentation repository...");
  execSync(`git clone ${DOCS_REPO_URL} ${TEMP_DIR}`, { stdio: "inherit" });

  console.log("Installing dependencies...");
  execSync("pnpm install", { cwd: TEMP_DIR, stdio: "inherit" });

  console.log("Fixing page links in locale files...");
  fixPageLinks();

  console.log("Building documentation...");
  execSync("pnpm build", { cwd: TEMP_DIR, stdio: "inherit" });

  // Create output directory
  fs.mkdirSync(DOCS_OUTPUT_DIR, { recursive: true });

  console.log("Copying documentation files...");
  fs.cpSync(path.join(TEMP_DIR, "src/.vitepress/dist/"), DOCS_OUTPUT_DIR, { recursive: true });

  console.log("Fixing asset paths in HTML files...");
  fixAssetPaths(DOCS_OUTPUT_DIR);

  console.log("Cleaning up temporary files...");
  clear();

  console.log("Documentation bundled successfully!");
} catch (error) {
  console.error("Error bundling documentation:", error.message);
  clear();
  process.exit(1);
}

/**
 * Clean up the documentation build.
 * @param {boolean} includeDocsOutputDir - Whether to clean the current docs output directory in the application resources.
 */
function clear(includeDocsOutputDir = false) {
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    if (includeDocsOutputDir) fs.rmSync(DOCS_OUTPUT_DIR, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors.
  }
}

/** Fix page links in locale files to add `.html` extension. */
function fixPageLinks() {
  for (const language of LANGUAGES) {
    const localeFilePath = path.join(TEMP_DIR, "src/.vitepress/locales/", `${language}.ts`);
    if (!fs.existsSync(localeFilePath)) {
      console.warn(`Locale file not found: ${localeFilePath}`);
      continue;
    }

    let content = fs.readFileSync(localeFilePath, "utf-8");

    // Replace page links from `/lang/path/to/page` to `/lang/path/to/page.html`.
    const linkPattern = new RegExp(`"/${language}/([^"]+)(?<!.html)"`, "g");
    content = content.replace(linkPattern, `"/${language}/$1.html"`);

    fs.writeFileSync(localeFilePath, content);
  }
}

/**
 * Fix absolute paths in HTML files to make them work locally
 * @param {string} dir - Directory to process.
 * @param {number} depth - Depth of the directory.
 */
function fixAssetPaths(dir, depth = 0) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  const relativePrefix = "../".repeat(depth);
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) fixAssetPaths(fullPath, depth + 1);
    else if (file.name.endsWith(".html")) {
      let content = fs.readFileSync(fullPath, "utf-8");
      content = content.replace(/href="\//g, `href="${relativePrefix}`);
      content = content.replace(/src="\//g, `src="${relativePrefix}`);
      fs.writeFileSync(fullPath, content);
    }
  }
}
