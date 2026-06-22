import path from "node:path";

import type { VisualServiceOptions } from "@wdio/visual-service";

import { config as webConfig } from "./wdio.web.conf";

export const config: WebdriverIO.Config = {
  ...webConfig,
  specs: ["./tests/e2e/specs/docs-screenshots.spec.ts"],
  services: [
    [
      "visual",
      {
        screenshotPath: path.join(process.cwd(), "tests", ".tmp", "screenshots"),
        formatImageName: "{tag}.{browserName}",
      } satisfies VisualServiceOptions,
    ],
  ],

  // We clear and set up the session before each test.
  before: undefined,
};
