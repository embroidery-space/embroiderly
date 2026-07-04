import type { BrowserCommand } from "vitest/node";

declare module "vitest/browser" {
  interface BrowserCommands {
    getPlatform: () => Promise<NodeJS.Platform>;
  }
}

export const getPlatform: BrowserCommand = () => process.platform;
