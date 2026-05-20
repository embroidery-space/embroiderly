import { describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { PaletteSettings } from "~/lib/pattern/";
import { renderComponent } from "~test-utils/render-component.ts";

import PaletteDisplaySettings from "./PaletteDisplaySettings.vue";

const DEFAULT_SETTINGS = new PaletteSettings({
  columnsNumber: 2,
  colorOnly: false,
  showStitchSymbols: false,
  stitchSymbolsOnContrastBackground: false,
  showColorBrands: true,
  showColorNumbers: true,
  showColorNames: true,
});

describe("PaletteDisplaySettings", () => {
  test("renders correctly", async () => {
    const screen = await renderComponent(PaletteDisplaySettings, {
      props: { settings: DEFAULT_SETTINGS },
    });

    await expect.element(screen.getByText("Display Settings")).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Close" })).toBeVisible();

    await expect.element(screen.getByRole("spinbutton", { name: "Number of columns" })).toBeVisible();
    await expect.element(screen.getByRole("switch", { name: "Color only" })).toBeVisible();
    await expect.element(screen.getByRole("checkbox", { name: "Show stitch symbols" })).toBeVisible();
    await expect.element(screen.getByRole("checkbox", { name: "Contrasting stitch symbols" })).toBeVisible();
    await expect.element(screen.getByRole("checkbox", { name: "Show thread brands" })).toBeVisible();
    await expect.element(screen.getByRole("checkbox", { name: "Show color numbers" })).toBeVisible();
    await expect.element(screen.getByRole("checkbox", { name: "Show color names" })).toBeVisible();
  });

  test("emits the close event when the close button is clicked", async () => {
    const onClose = vi.fn();

    const screen = await renderComponent(PaletteDisplaySettings, {
      props: { settings: DEFAULT_SETTINGS, onClose },
    });

    await screen.getByRole("button", { name: "Close" }).click();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("toggling the colorOnly switch emits the update:settings event", async () => {
    const onUpdateSettings = vi.fn();

    const screen = await renderComponent(PaletteDisplaySettings, {
      props: { settings: DEFAULT_SETTINGS, "onUpdate:settings": onUpdateSettings },
    });

    await screen.getByRole("switch", { name: "Color only" }).click();

    expect(onUpdateSettings).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ colorOnly: true }));
  });

  test("clicking a checkbox emits update:settings with the toggled value", async () => {
    const onUpdateSettings = vi.fn();

    const screen = await renderComponent(PaletteDisplaySettings, {
      props: { settings: DEFAULT_SETTINGS, "onUpdate:settings": onUpdateSettings },
    });

    await screen.getByRole("checkbox", { name: "Show stitch symbols" }).click();

    expect(onUpdateSettings).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ showStitchSymbols: true }));
  });

  test.only("changing the columns number emits update:settings with the new value", async () => {
    const onUpdateSettings = vi.fn();

    const screen = await renderComponent(PaletteDisplaySettings, {
      props: { settings: DEFAULT_SETTINGS, "onUpdate:settings": onUpdateSettings },
    });

    await userEvent.fill(screen.getByRole("spinbutton", { name: "Number of columns" }), "1");

    expect(onUpdateSettings).toHaveBeenCalledWith(expect.objectContaining({ columnsNumber: 1 }));
  });

  test("disables all checkboxes when colorOnly is true", async () => {
    const screen = await renderComponent(PaletteDisplaySettings, {
      props: { settings: new PaletteSettings({ ...DEFAULT_SETTINGS, colorOnly: true }) },
    });

    await expect.element(screen.getByRole("checkbox", { name: "Show stitch symbols" })).toBeDisabled();
    await expect.element(screen.getByRole("checkbox", { name: "Contrasting stitch symbols" })).toBeDisabled();
    await expect.element(screen.getByRole("checkbox", { name: "Show thread brands" })).toBeDisabled();
    await expect.element(screen.getByRole("checkbox", { name: "Show color numbers" })).toBeDisabled();
    await expect.element(screen.getByRole("checkbox", { name: "Show color names" })).toBeDisabled();
  });
});
