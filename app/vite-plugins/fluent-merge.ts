import fs from "node:fs/promises";
import path from "node:path";

import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";

export interface FluentMergeOptions {
  localesDir?: string;
  stripComments?: boolean;
}

export default function fluentMerge(options: FluentMergeOptions = {}): Plugin {
  let server: ViteDevServer;
  let config: ResolvedConfig;

  const localesDir = path.normalize(options.localesDir || "src/locales");

  async function collectFluentFiles(dir: string) {
    const files: string[] = [];

    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await collectFluentFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile() && entry.name.endsWith(".ftl")) {
        files.push(fullPath);
      }
    }

    return files.sort();
  }

  async function mergeLocale(localeDir: string, outputPath: string, stripComments: boolean): Promise<void> {
    const files = await collectFluentFiles(localeDir);
    if (files.length === 0) return;

    const contents = await Promise.all(
      files.map(async (file) => {
        let content = await fs.readFile(file, "utf8");
        if (stripComments) content = content.replaceAll(/^\s*#.*$/, "").trim();
        return content.trim();
      }),
    );

    const merged = contents.join("\n\n");
    await fs.writeFile(outputPath, merged, "utf8");

    const relativePath = path.relative(config.root, outputPath);
    console.log(`[fluent-merge] Merged ${files.length} file(s) → ${relativePath}`);
  }

  async function processLocales(stripComments = false) {
    const localesPath = path.join(config.root, localesDir);
    try {
      const entries = await fs.readdir(localesPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const localeName = entry.name;

          const targetLocaleDir = path.join(localesPath, localeName);
          const outputLocaleFile = path.join(localesPath, `${localeName}.ftl`);

          await mergeLocale(targetLocaleDir, outputLocaleFile, stripComments);
        }
      }
    } catch (error) {
      console.error("[fluent-merge] Error processing locales:", error);
    }
  }

  return {
    name: "vite-plugin-fluent-merge",

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async buildStart() {
      const stripComments = config.command === "build";
      await processLocales(stripComments);
    },

    configureServer(devServer) {
      server = devServer;

      server.watcher.add(`${path.join(config.root, localesDir)}/**/*.ftl`);
      server.watcher.on("change", async (filePath) => {
        if (filePath.includes(localesDir) && filePath.endsWith(".ftl")) {
          const relativePath = path.relative(config.root, filePath);
          const isInSubfolder = relativePath.split(/[\\/]/).length > 3;
          if (isInSubfolder) {
            console.log(`[fluent-merge] File changed: ${relativePath}`);
            await processLocales(false);
          }
        }
      });
    },
  };
}
