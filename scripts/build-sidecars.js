import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SIDECARS = ["embroiderly_image", "embroiderly_publish"];

const isDebug = process.env.TAURI_ENV_DEBUG === "true";
const targetTriple = process.env.TAURI_ENV_TARGET_TRIPLE;
if (targetTriple === undefined) {
  console.error("TAURI_ENV_TARGET_TRIPLE must be set!");
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}

const command = ["cargo", "build", ...SIDECARS.map((sidecar) => `-p ${sidecar}`), isDebug ? "" : "-r"]
  .join(" ")
  .trimEnd();
// eslint-disable-next-line sonarjs/os-command
execSync(command, { encoding: "utf8", stdio: "inherit" });

const binaryExt = process.platform === "win32" ? ".exe" : "";
for (const sidecar of SIDECARS) {
  fs.cpSync(
    path.join("target", isDebug ? "debug" : "release", sidecar + binaryExt),
    path.join("app", "src-tauri", "binaries", `${sidecar}-${targetTriple}${binaryExt}`),
    { force: true },
  );
}
