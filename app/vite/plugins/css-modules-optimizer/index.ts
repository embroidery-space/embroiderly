import { Plugin, UserConfig } from "vite";

import { counter } from "./counter";

export function cssModulesOptimizer(): Plugin {
  const next = counter();
  const map: Map<string, string> = new Map();
  return {
    name: "optimize-css-modules",
    apply: "build",
    config: (): UserConfig => ({
      css: {
        modules: {
          generateScopedName: (name: string, fileName: string) => {
            const key = fileName + name;

            let hash = map.get(key);
            if (!hash) map.set(key, (hash = next()));

            return hash!;
          },
        },
      },
    }),
  };
}
