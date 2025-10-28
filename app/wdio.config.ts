import { ChildProcess, spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, URL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

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

  specs: ["./tests/specs/**/*.ts"],

  maxInstances: 1,
  capabilities: [
    {
      // @ts-expect-error These are custom Tauri options which are not present in WebdriverIO.
      "tauri:options": {
        application: "../target/debug/embroiderly",
      },
    },
  ],

  reporters: ["spec"],
  framework: "mocha",
  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },

  onPrepare: () => {
    // Ensure the fresh Microsoft Edge Driver is installed on Windows.
    if (os.platform() === "win32" && !fs.existsSync(path.join(root, "msedgedriver.exe"))) {
      spawnSync(path.resolve(os.homedir(), ".cargo", "bin", "msedgedriver-tool"), [], {
        cwd: root,
        stdio: [null, process.stdout, process.stderr],
      });
    }

    // Ensure the Tauri project is built since we expect this binary to exist for the webdriver sessions.
    spawnSync("pnpm", ["tauri", "build", "--debug", "--no-bundle"], {
      stdio: "inherit",
      shell: true,
    });
  },

  beforeSession: () => {
    // Ensure we are running `tauri-driver` before the session starts so that we can proxy the webdriver requests.
    const nativeDriverArgs = os.platform() === "win32" ? ["--native-driver", path.join(root, "msedgedriver.exe")] : [];
    tauriDriver = spawn(path.resolve(os.homedir(), ".cargo", "bin", "tauri-driver"), [...nativeDriverArgs], {
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

  afterSession: () => {
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
