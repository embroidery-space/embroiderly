import fs from "node:fs";
import path from "node:path";
import utils from "node:util";
import zlib from "node:zlib";

import type { Plugin } from "vite";

const gzip = utils.promisify(zlib.gzip);
const brotli = utils.promisify(zlib.brotliCompress);

const COMPRESSORS = [
  { ext: "gz", compress: (src: zlib.InputType) => gzip(src, { level: zlib.constants.Z_BEST_COMPRESSION }) },
  {
    ext: "br",
    compress: (src: zlib.InputType) =>
      brotli(src, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY } }),
  },
];

export function wasmOptimizer(): Plugin {
  return {
    name: "optimize-wasm",
    apply: "build",

    generateBundle: {
      order: "post",
      async handler(_, bundle) {
        const tasks: Promise<void>[] = [];
        for (const output of Object.values(bundle)) {
          if (output.type !== "asset" || !output.fileName.endsWith(".wasm")) continue;
          const { fileName, source } = output;
          for (const { ext, compress } of COMPRESSORS) {
            tasks.push(
              // oxlint-disable-next-line promise/always-return
              compress(source).then((compressed) => {
                this.emitFile({ type: "asset", fileName: `${fileName}.${ext}`, source: compressed });
              }),
            );
          }
        }
        await Promise.all(tasks);
      },
    },

    // We can't delete the original Wasm files in `generateBundle`, as VitePWA needs them to be present to index them.
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
