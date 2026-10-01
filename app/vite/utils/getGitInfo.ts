import { execSync } from "node:child_process";

export function getGitInfo() {
  try {
    const commit = execSync("git rev-parse --short HEAD").toString().trim();
    const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();
    const date = execSync("git log -1 --format=%cI").toString().trim();
    return { commit, branch, date };
  } catch {
    return { commit: "unknown", branch: "unknown", date: new Date().toISOString() };
  }
}
