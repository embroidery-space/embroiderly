import fs from "node:fs/promises";
import path from "node:path";

import type { Plugin, ResolvedConfig, ViteDevServer } from "vite";

export interface FluentMergeOptions {
  localesDir?: string;
}

const VIRTUAL_PREFIX = "virtual:";

export default function fluentMerge(options: FluentMergeOptions = {}): Plugin {
  let server: ViteDevServer;
  let config: ResolvedConfig;

  const localesDir = path.normalize(options.localesDir || "src/locales");

  async function collectFluentFiles(dir: string) {
    const files: string[] = [];

    const entries = await fs.readdir(dir, { withFileTypes: true });
    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          const subFiles = await collectFluentFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith(".ftl")) {
          files.push(fullPath);
        }
      }),
    );

    return files.sort();
  }

  async function mergeLocale(localeDir: string, minimize: boolean): Promise<string> {
    const files = await collectFluentFiles(localeDir);
    if (files.length === 0) return "";

    const contents = await Promise.all(
      files.map(async (file) => {
        let content = await fs.readFile(file, "utf8");

        if (minimize) {
          // Remove all comments.
          content = content.replaceAll(/^#.*$/gmu, "");
          // Remove extra empty lines.
          content = content.replaceAll(/^[\r\n]+/gmu, "\n");
        }

        return content.trim();
      }),
    );

    const merged = contents.join("\n\n");
    console.log(`[fluent-merge] Merged ${files.length} file(s)`);
    return merged;
  }

  async function loadLocale(localeName: string): Promise<string> {
    const minimize = config.command === "build";
    const localesPath = path.join(config.root, localesDir);
    const localeDir = path.join(localesPath, localeName);
    try {
      return await mergeLocale(localeDir, minimize);
    } catch (error) {
      console.error(`[fluent-merge] Error loading locale ${localeName}:`, error);
      return "";
    }
  }

  async function discoverLocales(): Promise<string[]> {
    const localesPath = path.join(config.root, localesDir);
    try {
      const entries = await fs.readdir(localesPath, { withFileTypes: true });
      return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
    } catch {
      return [];
    }
  }

  return {
    name: "vite-plugin-fluent-merge",

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async buildStart() {
      const locales = await discoverLocales();
      for (const locale of locales) {
        await loadLocale(locale);
      }
    },

    resolveId(id) {
      if (id.startsWith(VIRTUAL_PREFIX) && id.endsWith(".ftl")) {
        return `\0${id}`;
      }
    },

    async load(id) {
      if (id.startsWith(`\0${VIRTUAL_PREFIX}`) && id.endsWith(".ftl")) {
        const localeName = id.slice(`\0${VIRTUAL_PREFIX}`.length, -4);
        const content = await loadLocale(localeName);
        return `export default ${JSON.stringify(content)};`;
      }
    },

    configureServer(devServer) {
      server = devServer;

      const localesPath = path.join(config.root, localesDir);

      server.watcher.add(`${localesPath}/**/*.ftl`);
      server.watcher.on("change", async (filePath) => {
        if (!filePath.endsWith(".ftl")) return;

        const relativeToLocales = path.relative(localesPath, filePath);
        const localeName = relativeToLocales.split(path.sep)[0];
        if (localeName.endsWith(".ftl")) return;

        console.log(`[fluent-merge] File changed: ${path.relative(config.root, filePath)}`);
        await loadLocale(localeName);

        const module = server.moduleGraph.getModuleById(`\0${VIRTUAL_PREFIX}${localeName}.ftl`);
        if (module) {
          server.moduleGraph.invalidateModule(module);
          server.ws.send({ type: "full-reload", path: "*" });
        }
      });
    },
  };
}
