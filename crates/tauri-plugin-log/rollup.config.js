import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import typescript from "@rollup/plugin-typescript";

const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"));

export default {
  input: "guest-js/index.ts",
  output: [
    {
      file: pkg.exports.import,
      format: "esm",
    },
  ],
  plugins: [
    typescript({
      declaration: true,
      declarationDir: path.dirname(pkg.exports.import),
    }),
  ],
  external: [/^@tauri-apps\/api/, ...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
};
