import { UAParser } from "ua-parser-js";

export interface SystemInfo {
  appVersion: string;

  gitCommit: string;
  gitBranch: string;
  gitDate: Date;

  os: string;
  osVersion: string;

  browser: string;
  browserVersion: string;
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const result = await UAParser().withClientHints();
  return {
    appVersion: __APP_VERSION__,

    gitCommit: __GIT_COMMIT__,
    gitBranch: __GIT_BRANCH__,
    gitDate: new Date(__GIT_DATE__),

    os: result.os.name || "Unknown",
    osVersion: result.os.version || "Unknown",

    browser: result.browser.name || "Unknown",
    browserVersion: result.browser.version || "Unknown",
  };
}
