import { ChildProcess, spawn, spawnSync } from "node:child_process";
import type { SpawnOptions } from "node:child_process";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath } from "node:url";

import type { VisualServiceOptions } from "@wdio/visual-service";

const ROOT_PATH = fileURLToPath(new URL("../..", import.meta.url));
const APP_PATH = path.join(ROOT_PATH, "app");
const VITE_BIN_PATH = path.join(APP_PATH, "node_modules", "vite", "bin", "vite.js");

const PREVIEW_PORT = 1430;
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;

const previewServer = createManagedProcess("vite");
previewServer.bindProcessCleanup();

export const config: WebdriverIO.Config = {
  specs: ["./specs/overview.ts", "./specs/guides/*.ts"],
  reporters: ["spec"],

  maxInstances: 1,

  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: process.env.CI ? 600000 : 60000,
  },

  waitforInterval: process.env.CI ? 1000 : 500,
  waitforTimeout: process.env.CI ? 60000 : 5000,

  baseUrl: PREVIEW_URL,
  capabilities: [{ browserName: "MicrosoftEdge" }],

  services: [
    [
      "visual",
      {
        screenshotPath: path.join(ROOT_PATH, "docs", ".screenshots", ".tmp", "screenshots"),
        formatImageName: "{tag}.{browserName}",
      } satisfies VisualServiceOptions,
    ],
  ],

  async onPrepare() {
    // Ensure a fresh production web build exists since we expect `vite preview` to serve it.
    // Disable the PWA/service worker so it can't serve stale assets across test runs.
    spawnSync("pnpm", ["app:build"], {
      cwd: ROOT_PATH,
      stdio: "inherit",
      shell: true,
      env: { ...process.env, EMBROIDERLY_PWA: "false" },
    });

    // Serve the build for the duration of the whole test run.
    previewServer.start(process.execPath, [VITE_BIN_PATH, "preview", "--port", String(PREVIEW_PORT), "--strictPort"], {
      cwd: APP_PATH,
      stdio: [null, process.stdout, process.stderr],
    });
    await waitUntilReachable(PREVIEW_URL, 30000);
  },

  onComplete: previewServer.stop,
};

/** Manages the lifecycle of the `vite preview` process spawned for the duration of the WebdriverIO session. */
function createManagedProcess(label: string) {
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

async function waitUntilReachable(url: string, timeoutMs: number) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      await fetch(url);
      return;
    } catch {
      await setTimeout(250);
    }
  }
  throw new Error(`Timed out waiting for ${url} to become reachable.`);
}
