import { ChildProcess, spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath, URL } from "node:url";

import { PatternEditorPage } from "./tests/e2e/shared/pages/";

const ROOT_PATH = fileURLToPath(new URL("..", import.meta.url));

const TESTS_TEMP_PATH = path.join(ROOT_PATH, "app", "tests", ".tmp");

const TAURI_DRIVER_PATH = path.resolve(os.homedir(), ".cargo", "bin", "tauri-driver");

const MSEDGEDERIVER_TOOL_PATH = path.resolve(os.homedir(), ".cargo", "bin", "msedgedriver-tool");
const MSEDGEDRIVER_PATH = path.join(TESTS_TEMP_PATH, "msedgedriver.exe");

// Keep track of the `tauri-driver` child process.
let exit = false;
let tauriDriver: ChildProcess;
function closeTauriDriver() {
  exit = true;
  tauriDriver?.kill();
}

export const config: WebdriverIO.Config = {
  host: "127.0.0.1",
  port: 4444,

  specs: ["./tests/e2e/specs/pattern-file-management.spec.ts", "./tests/e2e/specs/pattern-info-management.spec.ts"],
  reporters: ["spec"],

  maxInstances: 1,
  capabilities: [
    {
      // @ts-expect-error These are custom Tauri options which are not present in WebdriverIO.
      "tauri:options": {
        application: "../target/debug/embroiderly",
      },
    },
  ],

  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: process.env.CI ? 600000 : 60000,
  },

  waitforInterval: process.env.CI ? 1000 : 500,
  waitforTimeout: process.env.CI ? 60000 : 5000,

  onPrepare() {
    // Ensure the temporary directory exists.
    if (!fs.existsSync(TESTS_TEMP_PATH)) fs.mkdirSync(TESTS_TEMP_PATH);

    // Ensure the fresh Microsoft Edge Driver is installed on Windows.
    if (os.platform() === "win32" && !fs.existsSync(MSEDGEDRIVER_PATH)) {
      spawnSync(MSEDGEDERIVER_TOOL_PATH, [], {
        cwd: TESTS_TEMP_PATH,
        stdio: [null, process.stdout, process.stderr],
      });
    }

    // Ensure the Tauri project is built since we expect this binary to exist for the webdriver sessions.
    spawnSync("pnpm", ["tauri", "build", "--debug", "--no-bundle"], {
      cwd: ROOT_PATH,
      stdio: "inherit",
      shell: true,
    });
  },

  beforeSession() {
    const tauriDriverArgs = [];

    // Ensure we are running `tauri-driver` before the session starts so that we can proxy the webdriver requests.
    if (os.platform() === "win32") tauriDriverArgs.push("--native-driver", MSEDGEDRIVER_PATH);

    tauriDriver = spawn(TAURI_DRIVER_PATH, tauriDriverArgs, {
      stdio: [null, process.stdout, process.stderr],
    });

    tauriDriver.on("error", (error) => {
      console.error("tauri-driver error:", error);
      process.exit(1);
    });

    tauriDriver.on("exit", (code) => {
      if (!exit) {
        console.error("tauri-driver exited with code:", code);
        process.exit(1);
      }
    });
  },

  async before() {
    // Set window size.
    await browser.setWindowSize(1920, 1080);

    // Force disable all CSS animations and transitions during CI.
    if (process.env.CI) {
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

    // Disable the tour and telemetry prompts.
    await browser.execute(() => {
      localStorage.setItem("embroiderly-tour-offered", "true");
      localStorage.setItem("embroiderly-telemetry-prompt-shown", "true");
    });

    // Close an initial default pattern (wait a while to ensure it is open).
    await setTimeout(500);
    await PatternEditorPage.forceCloseAllPatterns();
  },

  afterSession() {
    // Clean up the `tauri-driver` process we spawned at the start of the session.
    closeTauriDriver();
  },
};

// Bind cleanup function to process events.
(() => {
  function cleanup() {
    try {
      closeTauriDriver();
    } finally {
      process.exit();
    }
  }

  process.on("exit", cleanup);
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("SIGHUP", cleanup);
  process.on("SIGBREAK", cleanup);
})();
