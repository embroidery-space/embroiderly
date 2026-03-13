import Bowser from "bowser";

export interface SystemInfo {
  appVersion: string;

  os: string;
  osVersion: string;

  browser: string;
  browserVersion: string;
}

export function getSystemInfo(): SystemInfo {
  // @ts-expect-error `navigator.userAgentData` is an experimental API: <https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData>.
  const result = Bowser.parse(navigator.userAgent, navigator.userAgentData);

  return {
    appVersion: __APP_VERSION__,

    os: result.os.name ?? "Unknown",
    osVersion: result.os.version ?? "Unknown",

    browser: result.browser.name ?? "Unknown",
    browserVersion: result.browser.version ?? "Unknown",
  };
}
