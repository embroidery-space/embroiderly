import { describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { BrandPaletteItem, serializeBrandPalette } from "~/lib/pattern/";
import { createMockEditorContext as originalCreateMockEditorContext } from "~test-utils/mock-editor-context.ts";
import { renderComponent } from "~test-utils/render-component.ts";

import PaletteSelect from "./PaletteSelect.vue";

const PALETTE_DMC = [
  new BrandPaletteItem(0, { brand: "DMC", number: "310", name: "Black", color: "2C3225", blends: null }),
];
const PALETTE_DMC_BYTES = serializeBrandPalette(PALETTE_DMC);

const PALETTE_ANCHOR = [
  new BrandPaletteItem(0, { brand: "Anchor", number: "403", name: "Black", color: "252520", blends: null }),
];
const PALETTE_ANCHOR_BYTES = serializeBrandPalette(PALETTE_ANCHOR);

function createMockEditorContext() {
  const ctx = originalCreateMockEditorContext();
  ctx.files.getPalettesList.mockResolvedValue({ system: ["DMC", "Anchor"], custom: ["MyPalette"] });
  ctx.files.loadPalette.mockResolvedValue(PALETTE_DMC_BYTES);
  return ctx;
}

describe("PaletteSelect", () => {
  test("on mount, loads the palette list and the default palette", async () => {
    const editorContext = createMockEditorContext();

    await renderComponent(PaletteSelect, { editorContext });

    expect(editorContext.files.getPalettesList).toHaveBeenCalled();
    expect(editorContext.files.loadPalette).toHaveBeenCalledWith("system", "DMC");
  });

  test("renders grouped palette options in the menu", async () => {
    const screen = await renderComponent(PaletteSelect, { editorContext: createMockEditorContext() });

    await userEvent.click(screen.getByRole("button"));

    await expect.element(screen.getByText("System")).toBeVisible();
    await expect.element(screen.getByRole("option", { name: "DMC" })).toBeVisible();
    await expect.element(screen.getByRole("option", { name: "Anchor" })).toBeVisible();

    await expect.element(screen.getByText("Custom")).toBeVisible();
    await expect.element(screen.getByRole("option", { name: "MyPalette" })).toBeVisible();
  });

  test("emits onPaletteSelected and onPaletteLoaded when selecting the palette option", async () => {
    const editorContext = createMockEditorContext();
    editorContext.files.loadPalette
      .mockResolvedValueOnce(PALETTE_DMC_BYTES)
      .mockResolvedValueOnce(PALETTE_ANCHOR_BYTES);

    const onPaletteSelected = vi.fn();
    const onPaletteLoaded = vi.fn();

    const screen = await renderComponent(PaletteSelect, {
      editorContext,
      props: { onPaletteSelected, onPaletteLoaded },
    });
    const trigger = screen.getByRole("button");

    // Open and select "Anchor".
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("option", { name: "Anchor" }));

    // Wait for the load to finish.
    await expect.element(trigger).not.toHaveAttribute("aria-busy", "true");

    expect(onPaletteSelected).toHaveBeenCalledWith("system", "Anchor");
    expect(onPaletteLoaded).toHaveBeenCalledWith(PALETTE_ANCHOR);
  });

  test("repeated selection of the same key does not trigger the palette loading", async () => {
    const editorContext = createMockEditorContext();
    editorContext.files.loadPalette
      .mockResolvedValueOnce(PALETTE_DMC_BYTES) // auto-load
      .mockResolvedValueOnce(PALETTE_ANCHOR_BYTES) // 1st selection
      .mockResolvedValueOnce(PALETTE_DMC_BYTES); // 2nd selection, should be cache-hit

    const screen = await renderComponent(PaletteSelect, { editorContext });
    const trigger = screen.getByRole("button");

    // Select Anchor.
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole("option", { name: "Anchor" }));
    await expect.element(trigger).not.toHaveAttribute("aria-busy", "true");

    // Select DMC again (cache hit).
    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByRole("option", { name: "DMC" }));
    await expect.element(screen.getByRole("button")).not.toHaveAttribute("aria-busy", "true");

    expect(editorContext.files.loadPalette).toHaveBeenCalledTimes(2);
  });
});
