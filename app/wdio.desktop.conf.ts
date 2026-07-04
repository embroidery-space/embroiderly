import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { VisualServiceOptions } from "@wdio/visual-service";

import {
  ROOT_PATH,
  TESTS_TEMP_PATH,
  closeDefaultPattern,
  createManagedProcess,
  disableAnimationsInCI,
  setupViewport,
  sharedConfig,
  suppressPrompts,
} from "./wdio.shared.conf";

const TAURI_DRIVER_PATH = path.resolve(os.homedir(), ".cargo", "bin", "tauri-driver");

const MSEDGEDERIVER_TOOL_PATH = path.resolve(os.homedir(), ".cargo", "bin", "msedgedriver-tool");
const MSEDGEDRIVER_PATH = path.join(TESTS_TEMP_PATH, "msedgedriver.exe");

const tauriDriver = createManagedProcess("tauri");
tauriDriver.bindProcessCleanup();

export const config: WebdriverIO.Config = {
  ...sharedConfig,

  host: "127.0.0.1",
  port: 4444,

  capabilities: [
    {
      // @ts-expect-error These are custom Tauri options which are not present in WebdriverIO.
      "tauri:options": {
        application: "../target/debug/embroiderly",
      },
    },
  ],

  services: [
    [
      "visual",
      {
        screenshotPath: TESTS_TEMP_PATH,
        formatImageName: "{tag}.desktop",
        disableCSSAnimation: true,
      } satisfies VisualServiceOptions,
    ],
  ],

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

    tauriDriver.start(TAURI_DRIVER_PATH, tauriDriverArgs, {
      stdio: [null, process.stdout, process.stderr],
    });
  },

  async before() {
    await setupViewport();
    await disableAnimationsInCI();
    await suppressPrompts();
    await closeDefaultPattern();
  },

  afterSession: tauriDriver.stop,
};
