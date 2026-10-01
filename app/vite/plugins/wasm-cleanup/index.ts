import fs from "node:fs";
import path from "node:path";

import { Plugin } from "vite";

export function wasmCleanup(): Plugin {
  return {
    name: "wasm-cleanup",
    apply: "build",
    closeBundle: {
      order: "post", // Forces it to run after VitePWA's `closeBundle` hook.
      sequential: true,
      handler() {
        function clean(dir: string) {
          if (!fs.existsSync(dir)) return;
          for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const res = path.resolve(dir, entry.name);
            if (entry.isDirectory()) clean(res);
            else if (entry.name.endsWith(".wasm")) {
              if (fs.existsSync(`${res}.gz`) && fs.existsSync(`${res}.br`)) fs.unlinkSync(res);
              else throw new Error(`Compressed WASM alternative not found: ${res}`);
            }
          }
        }
        clean(path.resolve("dist"));
      },
    },
  };
}
