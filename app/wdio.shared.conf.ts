import { ChildProcess, spawn } from "node:child_process";
import type { SpawnOptions } from "node:child_process";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath, URL } from "node:url";

import { PatternEditorPage } from "./tests/e2e/shared/pages/";

export const APP_PATH = fileURLToPath(new URL(".", import.meta.url));
export const ROOT_PATH = fileURLToPath(new URL("..", import.meta.url));

export const TESTS_TEMP_PATH = path.join(ROOT_PATH, "app", "tests", ".tmp");

export const sharedConfig = {
  specs: [
    "./tests/e2e/specs/pattern-file-management.spec.ts",
    "./tests/e2e/specs/pattern-info-management.spec.ts",
    "./tests/e2e/specs/app-settings.spec.ts",
  ],
  reporters: ["spec"],

  maxInstances: 1,

  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: process.env.CI ? 600000 : 60000,
  },

  waitforInterval: process.env.CI ? 1000 : 500,
  waitforTimeout: process.env.CI ? 60000 : 5000,
} satisfies Partial<WebdriverIO.Config>;

/** Manages the lifecycle of a server process spawned for the duration of a WebdriverIO session. */
export function createManagedProcess(label: string) {
  let child: ChildProcess | undefined;
  let exit = false;

  function start(command: string, args: string[], options: SpawnOptions) {
    child = spawn(command, args, options);

    child.on("error", (error) => {
      console.error(`${label} error:`, error);
      process.exit(1);
    });

    child.on("exit", (code) => {
      if (!exit) {
        console.error(`${label} exited with code:`, code);
        process.exit(1);
      }
    });

    return child;
  }

  function stop() {
    exit = true;
    child?.kill();
  }

  // Make sure the spawned process is also killed if the test runner itself is terminated.
  function bindProcessCleanup() {
    function cleanup() {
      try {
        stop();
      } finally {
        process.exit();
      }
    }

    process.on("exit", cleanup);
    process.on("SIGINT", cleanup);
    process.on("SIGTERM", cleanup);
    process.on("SIGHUP", cleanup);
    process.on("SIGBREAK", cleanup);
  }

  return { start, stop, bindProcessCleanup };
}

/** Returns the WebdriverIO `browserName` to use for the web target on the current platform. */
export function getPlatformBrowserName() {
  switch (process.platform) {
    case "win32":
      return "msedge";
    case "linux":
      return "firefox";
    case "darwin":
      return "safari";
    default:
      throw new Error(`Unsupported platform for browser testing: ${process.platform}`);
  }
}

/** Sets a fixed window size so tests aren't affected by the host's default window/screen size. */
export async function setupViewport() {
  try {
    await browser.setViewport({ width: 1920, height: 1080, devicePixelRatio: 1 });
  } catch {
    // The `setViewport` method is not available for `tauri-driver`, as it doesn't support the BiDi protocol.
    // So, set only the window size.
    await browser.setWindowSize(1920, 1080);
  }
}

/** Force disables all CSS animations and transitions during CI so tests aren't flaky on timing. */
export async function disableAnimationsInCI() {
  if (!process.env.CI) return;

  await browser.execute(() => {
    // @ts-expect-error The `document` object is available inside this callback.
    const style = document.createElement("style");
    style.innerHTML = `
              *, *::before, *::after {
                animation: none !important;
                transition: none !important;
              }
            `;

    // @ts-expect-error ...
    document.head.append(style);
  });
}

/** Disables the tour and telemetry prompts so they don't interfere with the tests. */
export async function suppressPrompts() {
  await browser.execute(() => {
    localStorage.setItem("embroiderly-tour-offered", "true");
    localStorage.setItem("embroiderly-telemetry-prompt-shown", "true");
  });
}

/** Closes the initial default pattern. */
export async function closeDefaultPattern() {
  await setTimeout(500);
  await PatternEditorPage.forceCloseAllPatterns();
}
