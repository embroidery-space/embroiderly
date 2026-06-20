import { spawnSync } from "node:child_process";
import path from "node:path";
import { setTimeout } from "node:timers/promises";

import {
  ROOT_PATH,
  closeDefaultPattern,
  createManagedProcess,
  disableAnimationsInCI,
  getPlatformBrowserName,
  setupViewport,
  sharedConfig,
  suppressPrompts,
} from "./wdio.shared.conf";

const APP_PATH = path.join(ROOT_PATH, "app");
const VITE_BIN_PATH = path.join(APP_PATH, "node_modules", "vite", "bin", "vite.js");

const PREVIEW_PORT = 1430;
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;

const previewServer = createManagedProcess("vite");
previewServer.bindProcessCleanup();

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

function buildCapabilities(): WebdriverIO.Capabilities {
  const browserName = getPlatformBrowserName();

  // Run headless in CI. Safari doesn't support headless mode, but CI never targets macOS.
  if (!process.env.CI) return { browserName };
  if (browserName === "MicrosoftEdge") return { browserName, "ms:edgeOptions": { args: ["--headless=new"] } };
  if (browserName === "firefox") return { browserName, "moz:firefoxOptions": { args: ["-headless"] } };
  return { browserName };
}

export const config: WebdriverIO.Config = {
  ...sharedConfig,

  baseUrl: PREVIEW_URL,
  capabilities: [buildCapabilities()],

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

  async before() {
    // The browser starts blank, unlike the desktop app which auto-loads on session start.
    await browser.url("/");
    await setupViewport();

    // Set the suppression flags, then reload so the app reads them on startup (otherwise the
    // tour/telemetry prompts may already be scheduled from this first, unconfigured load).
    await suppressPrompts();
    await browser.refresh();

    await disableAnimationsInCI();

    // Close an initial default pattern (it is auto-opened on startup).
    await closeDefaultPattern();
  },

  onComplete: previewServer.stop,
};
