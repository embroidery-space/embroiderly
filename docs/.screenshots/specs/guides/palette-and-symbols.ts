import path from "node:path";

import sharp from "sharp";

import { actions } from "../../utils/actions";
import { $t, LANGUAGES } from "../../utils/i18n";
import { guideDest } from "../../utils/screenshots";
import { prepareSession } from "../../utils/session";

for (const language of LANGUAGES) {
  describe(`Embroiderly Screenshots (${language}) > Guides > Palette & Symbols`, () => {
    const {
      openDemoPattern,
      openPalettePanel,
      enterPaletteEditingMode,
      togglePaletteMenuItem,
      openPaletteContextMenu,
    } = actions(language);

    beforeEach(() => prepareSession({ language, viewport: { width: 1920, height: 1080 / 2 } }));

    async function savePanel(name: string) {
      await $(`aria/${$t(language, "palette-panel")}`).saveScreenshot(
        path.join(guideDest(language, "palette-and-symbols"), name),
      );
    }

    async function saveContextMenu(name: string) {
      const rect = await browser.execute(() => {
        const root = document.querySelector("[data-reka-menu-content]");
        if (!root) return null;

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        // Traverse root menu and any opened submenus.
        for (const menu of [root, ...Array.from(root.querySelectorAll("[data-reka-menu-content]"))]) {
          const r = menu.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) continue;

          minX = Math.min(minX, r.left);
          minY = Math.min(minY, r.top);
          maxX = Math.max(maxX, r.right);
          maxY = Math.max(maxY, r.bottom);
        }

        // If it is still Infinity, it means all menus had 0 dimensions (e.g., invisible).
        if (minX === Infinity) return null;

        const padding = 32;
        return {
          // Capture the beginning of the palette...
          left: 0,
          top: 60,
          // ...and extend to the end of the context menu.
          width: Math.min(window.innerWidth, Math.ceil(maxX + padding)),
          height: Math.min(window.innerHeight, Math.ceil(maxY + padding)) - 60,
        };
      });
      console.log(rect);
      if (!rect) throw new Error(`Context menu not found or has zero dimensions for ${name}`);

      const screen = (await browser.saveFullPageScreen("guide-palette-and-symbols-context-menu")) as {
        fileName: string;
        path: string;
      };
      await sharp(path.join(screen.path, screen.fileName))
        .extract(rect)
        .toFile(path.join(guideDest(language, "palette-and-symbols"), name));
    }

    it("Palette Panel Overview", async () => {
      await openDemoPattern();
      await openPalettePanel();

      await savePanel("palette-panel-overview.png");
    });

    it("Editing Mode", async () => {
      await openDemoPattern();
      await openPalettePanel();
      await enterPaletteEditingMode();
      await togglePaletteMenuItem("palette-catalog"); // Close palette catalog.

      await savePanel("editing-mode.png");
    });

    it("Regular Mode Context Menu", async () => {
      await browser.setViewport({ width: 1920, height: 1080, devicePixelRatio: 1 });

      await openDemoPattern();
      await openPalettePanel();
      await openPaletteContextMenu("palette-panel");

      await saveContextMenu("ctxmenu-regular.png");
    });

    it("Editing Mode Context Menu", async () => {
      await browser.setViewport({ width: 1920, height: 1080, devicePixelRatio: 1 });

      await openDemoPattern();
      await openPalettePanel();
      await enterPaletteEditingMode();
      await togglePaletteMenuItem("palette-catalog"); // Close palette catalog.
      await openPaletteContextMenu("palette-panel");

      await saveContextMenu("ctxmenu-editing.png");
    });

    it("Palette Catalog", async () => {
      await openDemoPattern();
      await openPalettePanel();
      await enterPaletteEditingMode();

      await savePanel("palette-catalog.png");
    });

    it("Palette Catalog Menu", async () => {
      await openDemoPattern();
      await openPalettePanel();
      await enterPaletteEditingMode();

      await $(`aria/${$t(language, "palette-catalog-menu")}`).click();

      await savePanel("palette-catalog-menu.png");
    });

    it("Palette Catalog Search", async () => {
      await openDemoPattern();
      await openPalettePanel();
      await enterPaletteEditingMode();

      await $(`aria/${$t(language, "palette-catalog")}`)
        .$(`input`)
        .setValue("black");

      await savePanel("palette-catalog-search.png");
    });

    it("Palette Selector", async () => {
      await openDemoPattern();
      await openPalettePanel();
      await enterPaletteEditingMode();

      await $(`button*=DMC`).click();

      await savePanel("palette-selector.png");
    });

    it("Stitch Symbols", async () => {
      await openDemoPattern();
      await openPalettePanel();
      await enterPaletteEditingMode();
      await togglePaletteMenuItem("palette-catalog"); // Close palette catalog.
      await togglePaletteMenuItem("stitch-symbols"); // Open stitch symbols.

      await savePanel("stitch-symbols.png");
    });

    it("Stitch Symbols Menu", async () => {
      await openDemoPattern();
      await openPalettePanel();
      await enterPaletteEditingMode();
      await togglePaletteMenuItem("palette-catalog"); // Close palette catalog.
      await togglePaletteMenuItem("stitch-symbols"); // Open stitch symbols.

      await $(`aria/${$t(language, "stitch-symbols-menu")}`).click();

      await savePanel("stitch-symbols-menu.png");
    });

    it("Font Selector", async () => {
      await openDemoPattern();
      await openPalettePanel();
      await enterPaletteEditingMode();
      await togglePaletteMenuItem("palette-catalog"); // Close palette catalog.
      await togglePaletteMenuItem("stitch-symbols"); // Open stitch symbols.

      await $(`button*=Ursasoftware`).click();

      await savePanel("font-selector.png");
    });

    it("Symbol Menu", async () => {
      await openDemoPattern();
      await openPalettePanel();
      await enterPaletteEditingMode();
      await togglePaletteMenuItem("palette-catalog"); // Close palette catalog.
      await togglePaletteMenuItem("stitch-symbols"); // Open stitch symbols.
      await openPaletteContextMenu("stitch-symbols");

      await savePanel("symbol-menu.png");
    });

    it("Display Settings", async () => {
      await openDemoPattern();
      await openPalettePanel();
      await enterPaletteEditingMode();
      await togglePaletteMenuItem("palette-catalog"); // Close palette catalog.
      await togglePaletteMenuItem("palette-display-options"); // Open display settings.

      await savePanel("display-settings.png");
    });
  });
}
