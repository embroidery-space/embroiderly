import fs from "node:fs";
import path from "node:path";
import { setTimeout } from "node:timers/promises";

import { FluentBundle, FluentResource } from "@fluent/bundle";
import type { FluentVariable } from "@fluent/bundle";
import sharp from "sharp";

import { PatternEditorPage } from "../shared/pages/";

type Theme = "light" | "dark" | "system";
type Scale = "xx-small" | "x-small" | "small" | "medium" | "large" | "x-large" | "xx-large";
type Language = "en" | "uk";

interface UiOptions {
  theme: Theme;
  scale: Scale;
  language: Language;
}

async function setAppUi(ui?: Partial<UiOptions>) {
  await browser.execute((ui) => {
    const settings = JSON.parse(localStorage.getItem("embroiderly-settings") || "{}");
    localStorage.setItem("embroiderly-settings", JSON.stringify({ ...settings, ui: { ...settings.ui, ...ui } }));
  }, ui);
  await browser.refresh();
  await setTimeout(1000);

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

let bundle: FluentBundle | undefined;
function $t(language: string, key: string, args?: Record<string, FluentVariable>) {
  if (bundle?.locales[0] !== language) {
    const filePath = path.resolve(process.cwd(), "src", "assets", "locales", `${language}.ftl`);
    const fileContent = fs.readFileSync(filePath, "utf-8");

    bundle = new FluentBundle(language);
    bundle.addResource(new FluentResource(fileContent));
  }

  const message = bundle.getMessage(key);
  if (!message || !message.value) return key;

  return bundle.formatPattern(message.value, args);
}

for (const language of ["en", "uk"] as const) {
  describe(`Embroiderly Screenshots (${language})`, () => {
    async function openDemoPattern() {
      await $(`button*=${$t(language, "app-menu-file")}`).click();
      await $(`//div[@role="menuitem"][contains(., "${$t(language, "app-menu-file-open-demo")}")]`).click();
      await $(`//div[@role="menuitem"][contains(., "${$t(language, "demo-pattern-piggies")}")]`).click();
    }

    async function enterPaletteEditingMode() {
      await $(`aria/${$t(language, "palette-edit")}`).click();
      await $(`//div[@role="listbox"][.//div[@role="group"]][.//div[@role="option"]]`).waitForDisplayed();
      await setTimeout(100); // Wait for canvas to adjust its size.
    }

    async function openPatternInfo() {
      await $(`button*=${$t(language, "app-menu-pattern")}`).click();
      await $(`//div[@role="menuitem"][contains(., "${$t(language, "pattern-info")}")]`).click();
      await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "pattern-info")}"]]`).waitForDisplayed();
    }

    async function openGridProperties() {
      await $(`button*=${$t(language, "app-menu-pattern")}`).click();
      await $(`//div[@role="menuitem"][contains(., "${$t(language, "grid-properties")}")]`).click();
      await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "grid-properties")}"]]`).waitForDisplayed();
    }

    async function openFabricProperties() {
      await $(`button*=${$t(language, "app-menu-pattern")}`).click();
      await $(`//div[@role="menuitem"][contains(., "${$t(language, "fabric-properties")}")]`).click();
      await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "fabric-properties")}"]]`).waitForDisplayed();
    }

    async function openPdfExport() {
      await $(`button*=${$t(language, "app-menu-file")}`).click();
      await $(`//div[@role="menuitem"][contains(., "${$t(language, "app-menu-file-export")}")]`).click();
      await $(`//div[@role="menuitem"][contains(., "PDF")]`).click();
      await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "pdf-export")}"]]`).waitForDisplayed();
    }

    beforeEach(async () => {
      await browser.reloadSession();
      await browser.url("/");

      await browser.setViewport({ width: 1920, height: 1080, devicePixelRatio: 1 });

      await browser.execute(() => {
        localStorage.setItem("embroiderly-tour-offered", "true");
        localStorage.setItem("embroiderly-telemetry-prompt-shown", "true");
      });
      await setAppUi({ theme: "system", scale: "x-large", language });

      await setTimeout(1000);
      await PatternEditorPage.forceCloseAllPatterns();
    });

    describe("Overview", () => {
      const PREVIEW_DEST = path.join(process.cwd(), "..", "docs", "public", "images", language, "overview");

      async function stitchImagesDiagonally(dark: string, light: string, output: string) {
        const width = 1920;
        const height = 1080;

        const topLeftTriangle = await sharp(dark)
          .resize(width, height)
          .composite([
            {
              input: Buffer.from(`
                <svg width="${width}" height="${height}">
                  <polygon points="0,0 ${width},0 0,${height}" fill="white" />
                </svg>
              `),
              blend: "dest-in",
            },
          ])
          .toBuffer();

        await sharp(light)
          .resize(width, height)
          .composite([
            {
              input: topLeftTriangle,
              blend: "over",
            },
          ])
          .toFile(output);
      }

      it("Welcome Screen", async () => {
        await setAppUi({ theme: "dark" });
        const dark = (await browser.saveFullPageScreen("overview-welcome-screen-dark")) as {
          fileName: string;
          path: string;
        };

        await setAppUi({ theme: "light" });
        const light = (await browser.saveFullPageScreen("overview-welcome-screen-light")) as {
          fileName: string;
          path: string;
        };

        await stitchImagesDiagonally(
          path.join(dark.path, dark.fileName),
          path.join(light.path, light.fileName),
          path.join(PREVIEW_DEST, "welcome-screen.png"),
        );
      });

      it("Pattern Editor", async () => {
        await openDemoPattern();

        await setAppUi({ theme: "dark" });
        const dark = (await browser.saveFullPageScreen("overview-pattern-editor-dark")) as {
          fileName: string;
          path: string;
        };

        await setAppUi({ theme: "light" });
        const light = (await browser.saveFullPageScreen("overview-pattern-editor-light")) as {
          fileName: string;
          path: string;
        };

        await stitchImagesDiagonally(
          path.join(dark.path, dark.fileName),
          path.join(light.path, light.fileName),
          path.join(PREVIEW_DEST, "pattern-editor.png"),
        );
      });

      it("Palette Editing", async () => {
        await openDemoPattern();

        await setAppUi({ theme: "dark" });
        await enterPaletteEditingMode();
        const dark = (await browser.saveFullPageScreen("overview-palette-editing-dark")) as {
          fileName: string;
          path: string;
        };

        await setAppUi({ theme: "light" });
        await enterPaletteEditingMode();
        const light = (await browser.saveFullPageScreen("overview-palette-editing-light")) as {
          fileName: string;
          path: string;
        };

        await stitchImagesDiagonally(
          path.join(dark.path, dark.fileName),
          path.join(light.path, light.fileName),
          path.join(PREVIEW_DEST, "palette-editing.png"),
        );
      });

      it("Pattern Info", async () => {
        await openDemoPattern();

        await setAppUi({ theme: "dark" });
        await openPatternInfo();
        const dark = (await browser.saveFullPageScreen("overview-pattern-info-dark")) as {
          fileName: string;
          path: string;
        };

        await setAppUi({ theme: "light" });
        await openPatternInfo();
        const light = (await browser.saveFullPageScreen("overview-pattern-info-light")) as {
          fileName: string;
          path: string;
        };

        await stitchImagesDiagonally(
          path.join(dark.path, dark.fileName),
          path.join(light.path, light.fileName),
          path.join(PREVIEW_DEST, "pattern-info.png"),
        );
      });

      it("Fabric Properties", async () => {
        await openDemoPattern();

        await setAppUi({ theme: "dark" });
        await openFabricProperties();
        const dark = (await browser.saveFullPageScreen("overview-fabric-properties-dark")) as {
          fileName: string;
          path: string;
        };

        await setAppUi({ theme: "light" });
        await openFabricProperties();
        const light = (await browser.saveFullPageScreen("overview-fabric-properties-light")) as {
          fileName: string;
          path: string;
        };

        await stitchImagesDiagonally(
          path.join(dark.path, dark.fileName),
          path.join(light.path, light.fileName),
          path.join(PREVIEW_DEST, "fabric-properties.png"),
        );
      });

      it("Grid Properties", async () => {
        await openDemoPattern();

        await setAppUi({ theme: "dark" });
        await openGridProperties();
        const dark = (await browser.saveFullPageScreen("overview-grid-properties-dark")) as {
          fileName: string;
          path: string;
        };

        await setAppUi({ theme: "light" });
        await openGridProperties();
        const light = (await browser.saveFullPageScreen("overview-grid-properties-light")) as {
          fileName: string;
          path: string;
        };

        await stitchImagesDiagonally(
          path.join(dark.path, dark.fileName),
          path.join(light.path, light.fileName),
          path.join(PREVIEW_DEST, "grid-properties.png"),
        );
      });

      it("PDF Export", async () => {
        await openDemoPattern();

        await setAppUi({ theme: "dark" });
        await openPdfExport();
        const dark = (await browser.saveFullPageScreen("overview-pdf-export-dark")) as {
          fileName: string;
          path: string;
        };

        await setAppUi({ theme: "light" });
        await openPdfExport();
        const light = (await browser.saveFullPageScreen("overview-pdf-export-light")) as {
          fileName: string;
          path: string;
        };

        await stitchImagesDiagonally(
          path.join(dark.path, dark.fileName),
          path.join(light.path, light.fileName),
          path.join(PREVIEW_DEST, "pdf-export.png"),
        );
      });
    });

    describe("Guides", () => {
      const GUIDE_DEST = path.join(process.cwd(), "..", "docs", "public", "images", language, "guide");

      describe("Pattern Options", () => {
        before(() => fs.mkdirSync(path.join(GUIDE_DEST, "pattern-options"), { recursive: true }));

        it("Pattern Menu", async () => {
          await openDemoPattern();
          await $(`button*=${$t(language, "app-menu-pattern")}`).click();

          const screen = (await browser.saveFullPageScreen("guide-pattern-options-pattern-menu")) as {
            fileName: string;
            path: string;
          };
          await sharp(path.join(screen.path, screen.fileName))
            .extract({ left: 0, top: 0, width: 600, height: 400 })
            .toFile(path.join(GUIDE_DEST, "pattern-options/pattern-menu.png"));
        });

        it("Pattern Info", async () => {
          await openDemoPattern();
          await openPatternInfo();

          await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "pattern-info")}"]]`).saveScreenshot(
            path.join(GUIDE_DEST, "pattern-options/pattern-info-modal.png"),
          );
        });

        it("Fabric Properties", async () => {
          await openDemoPattern();
          await openFabricProperties();

          await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "fabric-properties")}"]]`).saveScreenshot(
            path.join(GUIDE_DEST, "pattern-options/fabric-modal.png"),
          );
        });

        it("Grid Properties", async () => {
          await openDemoPattern();
          await openGridProperties();

          await $(`//div[@role="dialog"][.//h2[text()="${$t(language, "grid-properties")}"]]`).saveScreenshot(
            path.join(GUIDE_DEST, "pattern-options/grid-modal.png"),
          );
        });
      });
    });
  });
}
