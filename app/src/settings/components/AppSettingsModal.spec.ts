import { App } from "@embroiderly/ui";

import { beforeEach, describe, expect, test } from "vitest";
import { commands, userEvent } from "vitest/browser";
import { defineComponent } from "vue";
import type { ComponentProps } from "vue-component-type-helpers";

import { useSettingsStore } from "~/settings/";
import { createMockEditorContext } from "~test-utils/mock-editor-context.ts";
import { renderComponent } from "~test-utils/render-component.ts";
import type { ComponentRenderOptions } from "~test-utils/render-component.ts";

import AppSettingsModal from "./AppSettingsModal.vue";

const platform = await commands.getPlatform();

describe("AppSettingsModal", () => {
  const AppSettingsModalWrapper = defineComponent({
    components: { App, AppSettingsModal },
    inheritAttrs: false,
    template: `<App><AppSettingsModal v-bind="$attrs" /></App>`,
  });

  function setupTest(options: { props?: ComponentProps<typeof AppSettingsModal> } & ComponentRenderOptions = {}) {
    return renderComponent(AppSettingsModalWrapper, {
      props: { open: true, ...options.props },
      pinia: options.pinia ?? true,
      editorContext: options.editorContext ?? true,
    });
  }

  test("renders correctly", async () => {
    const screen = await setupTest();

    await expect.element(screen.getByRole("dialog", { name: "Settings" })).toBeVisible();

    await expect.element(screen.getByRole("tab", { name: "Interface" })).toBeVisible();
    await expect.element(screen.getByRole("tab", { name: "Startup" })).toBeVisible();
    await expect.element(screen.getByRole("tab", { name: "Working Area" })).toBeVisible();
    await expect.element(screen.getByRole("tab", { name: "Updater" })).toBeVisible();
    await expect.element(screen.getByRole("tab", { name: "Telemetry" })).toBeVisible();
    await expect.element(screen.getByRole("tab", { name: "Other" })).toBeVisible();
  });

  describe("modifies Interface options", () => {
    let screen: Awaited<ReturnType<typeof renderComponent>>;
    let store: ReturnType<typeof useSettingsStore>;

    beforeEach(async () => {
      screen = await setupTest();
      store = useSettingsStore();
    });

    test("theme", async () => {
      expect(store.ui.theme).toBe("system");

      await userEvent.click(screen.getByText("System"));
      await userEvent.click(screen.getByRole("option", { name: "Dark" }));

      expect(store.ui.theme).toBe("dark");
    });

    test("scale", async () => {
      expect(store.ui.scale).toBe("medium");

      await userEvent.click(screen.getByText("Medium"));
      await userEvent.click(screen.getByRole("option", { name: "Larger" }));

      expect(store.ui.scale).toBe("x-large");
    });

    test("language", async () => {
      expect(store.ui.language).toBe("en");

      await userEvent.click(screen.getByText("English"));
      await userEvent.click(screen.getByRole("option", { name: "Українська" }));

      expect(store.ui.language).toBe("uk");
    });
  });

  describe("modifies Startup options", () => {
    let screen: Awaited<ReturnType<typeof renderComponent>>;
    let store: ReturnType<typeof useSettingsStore>;

    beforeEach(async () => {
      screen = await setupTest();
      store = useSettingsStore();

      await userEvent.click(screen.getByRole("tab", { name: "Startup" }));
    });

    test("open on startup", async () => {
      expect(store.startup.action).toBe("new-pattern");

      await userEvent.click(screen.getByText("New Pattern"));
      await userEvent.click(screen.getByRole("option", { name: "Nothing" }));

      expect(store.startup.action).toBe("nothing");
    });

    test("template input is disabled when Custom Template option is not set", async () => {
      const trigger = screen.getByRole("button", { name: "Choose file" });

      expect(store.startup.action).toBe("new-pattern");
      await expect.element(trigger).toBeDisabled();

      await userEvent.click(screen.getByText("New Pattern"));
      await userEvent.click(screen.getByRole("option", { name: "Custom Template" }));

      expect(store.startup.action).toBe("custom-template");
      await expect.element(trigger).not.toBeDisabled();
    });

    // `userEvent` upload is not available in Firefox, which is used on Linux.
    test.skipIf(platform === "linux")("custom template", async () => {
      await screen.unmount();

      const editorContext = createMockEditorContext();
      screen = await setupTest({
        editorContext,
        pinia: {
          initialState: {
            "embroiderly-settings": {
              startup: {
                action: "custom-template",
                patternTemplate: "old-template.embproj",
              },
            },
          },
        },
      });

      await userEvent.click(screen.getByRole("tab", { name: "Startup" }));

      await userEvent.upload(
        screen.baseElement.querySelector('input[type="file"]')!,
        "../testdata/patterns/pmaker/piggies.xsd",
      );

      expect(editorContext.files.deletePatternTemplate).toHaveBeenCalledWith("old-template.embproj");
      expect(editorContext.files.savePatternTemplate).toHaveBeenCalledWith("piggies.xsd", expect.any(Uint8Array));
    });
  });

  describe("modifies Working Area options", () => {
    let screen: Awaited<ReturnType<typeof renderComponent>>;
    let store: ReturnType<typeof useSettingsStore>;

    beforeEach(async () => {
      screen = await setupTest();
      store = useSettingsStore();

      await userEvent.click(screen.getByRole("tab", { name: "Working Area" }));
    });

    test("antialiasing", async () => {
      expect(store.canvas.renderOptions.antialias).toBe(true);

      await userEvent.click(screen.getByRole("checkbox", { name: "Antialiasing" }));

      expect(store.canvas.renderOptions.antialias).toBe(false);
    });

    test("wheel action", async () => {
      expect(store.canvas.viewportOptions.wheelAction).toBe("zoom");

      await userEvent.click(screen.getByText("Zoom"));
      await userEvent.click(screen.getByRole("option", { name: "Scroll" }));

      expect(store.canvas.viewportOptions.wheelAction).toBe("scroll");
    });

    test("layer layout", async () => {
      expect(store.canvas.patternOptions.layerLayout).toBe("layer-order");

      await userEvent.click(screen.getByText("By Layer Order"));
      await userEvent.click(screen.getByRole("option", { name: "By Stitch Type" }));

      expect(store.canvas.patternOptions.layerLayout).toBe("stitch-type");
    });
  });

  describe("modifies Updater options", () => {
    let screen: Awaited<ReturnType<typeof renderComponent>>;
    let store: ReturnType<typeof useSettingsStore>;

    beforeEach(async () => {
      screen = await setupTest();
      store = useSettingsStore();

      await userEvent.click(screen.getByRole("tab", { name: "Updater" }));
    });

    test("auto check", async () => {
      expect(store.updater.autoCheck).toBe(false);

      await userEvent.click(screen.getByRole("checkbox", { name: "Automatically check for updates" }));

      expect(store.updater.autoCheck).toBe(true);
    });

    test("clicking the Check for Updates button triggers updates check", async () => {
      await userEvent.click(screen.getByRole("button", { name: "Check for Updates" }));
      expect(store.checkForUpdates).toHaveBeenCalled();
    });
  });

  describe("modifies Telemetry options", () => {
    let screen: Awaited<ReturnType<typeof renderComponent>>;
    let store: ReturnType<typeof useSettingsStore>;

    beforeEach(async () => {
      screen = await setupTest();
      store = useSettingsStore();

      await userEvent.click(screen.getByRole("tab", { name: "Telemetry" }));
    });

    test("diagnostics", async () => {
      expect(store.telemetry.diagnostics).toBe(false);

      await userEvent.click(screen.getByRole("checkbox", { name: "Diagnostics" }));

      expect(store.telemetry.diagnostics).toBe(true);
    });

    test("metrics", async () => {
      expect(store.telemetry.metrics).toBe(false);

      await userEvent.click(screen.getByRole("checkbox", { name: "Metrics" }));

      expect(store.telemetry.metrics).toBe(true);
    });
  });

  describe("modifies Other options", () => {
    let screen: Awaited<ReturnType<typeof renderComponent>>;
    let store: ReturnType<typeof useSettingsStore>;

    beforeEach(async () => {
      screen = await setupTest();
      store = useSettingsStore();

      await userEvent.click(screen.getByRole("tab", { name: "Other" }));
    });

    test("auto save interval", async () => {
      expect(store.other.autoSaveInterval).toBe(15);

      await userEvent.fill(screen.getByRole("spinbutton"), "0");
      await userEvent.keyboard("{Enter}");

      expect(store.other.autoSaveInterval).toBe(0);
    });

    test("show Open demo pattern option", async () => {
      expect(store.other.showOpenDemoPatternOption).toBe(true);

      await userEvent.click(
        screen.getByRole("checkbox", { name: 'Show "Open demo pattern" option in the "File" menu' }),
      );

      expect(store.other.showOpenDemoPatternOption).toBe(false);
    });

    test("use palette item color for stitch tools", async () => {
      expect(store.other.usePaletteItemColorForStitchTools).toBe(true);

      await userEvent.click(screen.getByRole("checkbox", { name: "Use palette item color for stitch tools" }));

      expect(store.other.usePaletteItemColorForStitchTools).toBe(false);
    });
  });

  describe("handles Reset to defauls", () => {
    let screen: Awaited<ReturnType<typeof renderComponent>>;
    let store: ReturnType<typeof useSettingsStore>;

    beforeEach(async () => {
      screen = await setupTest();
      store = useSettingsStore();
    });

    test("clicking the Reset to defaults button open a confirm dialog", async () => {
      await userEvent.click(screen.getByRole("button", { name: "Reset to defaults" }));
      await expect.element(screen.getByRole("alertdialog", { name: "Settings Reset" })).toBeVisible();

      expect(store.$reset).not.toHaveBeenCalled();
    });

    test("rejecting the confirm dialog does not reset the store", async () => {
      await userEvent.click(screen.getByRole("button", { name: "Reset to defaults" }));
      await userEvent.click(screen.getByRole("button", { name: "No" }));

      expect(store.$reset).not.toHaveBeenCalled();
    });

    test("accepting the confirm dialog resets the store", async () => {
      await userEvent.click(screen.getByRole("button", { name: "Reset to defaults" }));
      await userEvent.click(screen.getByRole("button", { name: "Yes" }));

      expect(store.$reset).toHaveBeenCalled();
    });
  });
});
