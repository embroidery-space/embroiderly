/* eslint-disable unicorn/no-process-exit */
/* eslint-disable sonarjs/no-os-command-from-path */

import { ChildProcess, spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";

import type { VisualServiceOptions } from "@wdio/visual-service";

const ROOT_PATH = fileURLToPath(new URL("..", import.meta.url));

const TESTS_TEMP_PATH = path.join(ROOT_PATH, "app", "tests", ".tmp");
const TESTS_SCREENSHOTS_PATH = path.join(ROOT_PATH, "app", "tests", "__screenshots__");

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

const visualServiceConfig: VisualServiceOptions = {
  isHybridApp: true,
  screenshotPath: TESTS_TEMP_PATH,
  baselineFolder: TESTS_SCREENSHOTS_PATH,
  formatImageName: "{tag}-{width}x{height}",
};

export const config: WebdriverIO.Config = {
  host: "127.0.0.1",
  port: 4444,

  specs: [
    "./tests/specs/pattern-file-management.spec.ts",
    // "./tests/specs/pattern-info-management.spec.ts",
    // "./tests/specs/history-management.spec.ts",
  ],
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

  services: [["visual", visualServiceConfig]],

  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: process.env.GITHUB_ACTIONS ? 600000 : 60000,
  },

  waitforInterval: process.env.GITHUB_ACTIONS ? 1000 : 500,
  waitforTimeout: process.env.GITHUB_ACTIONS ? 60000 : 5000,

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
    // Force disable all CSS animations and transitions during CI.
    if (process.env.GITHUB_ACTIONS) {
      await browser.execute(() => {
        const style = document.createElement("style");
        style.innerHTML = `
                *, *::before, *::after {
                  animation: none !important;
                  transition: none !important;
                }
              `;

        document.head.append(style);
      });
    }
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
