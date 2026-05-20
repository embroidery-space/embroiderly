import { App } from "@embroiderly/ui";

import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent } from "vue";

import { BrandPaletteItem, PaletteItem, serializeBrandPalette } from "~/lib/pattern/";
import { createMockEditorContext as originalCreateMockEditorContext } from "~test-utils/mock-editor-context.ts";
import { renderComponent } from "~test-utils/render-component.ts";

import PaletteCatalog from "./PaletteCatalog.vue";

const CATALOG = [
  new BrandPaletteItem(0, { brand: "DMC", number: "310", name: "Black", color: "2C3225", blends: null }),
  new BrandPaletteItem(1, { brand: "DMC", number: "321", name: "Red", color: "B1272A", blends: null }),
  new BrandPaletteItem(2, { brand: "DMC", number: "436", name: "Tan", color: "CDA568", blends: null }),
];
const CATALOG_BYTES = serializeBrandPalette(CATALOG);

const TEST_PALITEM = new PaletteItem(0, {
  brand: "DMC",
  number: "310",
  name: "Black",
  color: "2C3225",
  blends: null,
  symbol: null,
});

const PaletteCatalogWrapper = defineComponent({
  components: { App, PaletteCatalog },
  inheritAttrs: false,
  template: `<App><PaletteCatalog v-bind="$attrs" /></App>`,
});

function createMockEditorContext() {
  const ctx = originalCreateMockEditorContext();
  ctx.files.getPalettesList.mockResolvedValue({ system: ["DMC"], custom: [] });
  ctx.files.loadPalette.mockResolvedValue(CATALOG_BYTES);
  return ctx;
}

describe("PaletteCatalog", () => {
  test("renders correctly", async () => {
    const screen = await renderComponent(PaletteCatalogWrapper, {
      editorContext: createMockEditorContext(),
      props: { palette: [] },
    });

    await expect.element(screen.getByText("Colors")).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Close" })).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Palette options" })).toBeVisible();

    const searchInput = screen.getByRole("textbox");
    await expect.element(searchInput).toBeVisible();
    await expect.element(searchInput).toHaveAttribute("placeholder", "Search...");

    expect(screen.getByRole("option").all()).toHaveLength(3);
  });

  test("search narrows the displayed options", async () => {
    const screen = await renderComponent(PaletteCatalogWrapper, {
      editorContext: createMockEditorContext(),
      props: { palette: [] },
    });

    const palitem310 = screen.getByRole("option", { name: /310/u });
    const palitem321 = screen.getByRole("option", { name: /321/u });
    const palitem436 = screen.getByRole("option", { name: /436/u });

    await expect.element(palitem310).toBeVisible();
    await expect.element(palitem321).toBeVisible();
    await expect.element(palitem436).toBeVisible();

    await userEvent.type(screen.getByRole("textbox"), "321");

    await expect.element(palitem321).toBeVisible();
    await expect.element(palitem310).not.toBeInTheDocument();
    await expect.element(palitem436).not.toBeInTheDocument();
  });

  test("option shows as selected when its brand/number matches a working-palette item", async () => {
    const screen = await renderComponent(PaletteCatalogWrapper, {
      editorContext: createMockEditorContext(),
      props: { palette: [TEST_PALITEM] },
    });
    await expect.element(screen.getByRole("option", { name: /310/u })).toHaveAttribute("aria-selected", "true");
  });

  test("double-clicking an option not in the working palette emits the addPaletteItem event", async () => {
    const onAddPaletteItem = vi.fn();

    const screen = await renderComponent(PaletteCatalogWrapper, {
      editorContext: createMockEditorContext(),
      props: { palette: [], onAddPaletteItem },
    });

    await userEvent.dblClick(screen.getByRole("option", { name: /310/u }));

    expect(onAddPaletteItem).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ brand: "DMC", number: "310" }));
  });

  test("double-clicking an option already in the working palette emits the removePaletteItem event", async () => {
    const onRemovePaletteItem = vi.fn();

    const screen = await renderComponent(PaletteCatalogWrapper, {
      editorContext: createMockEditorContext(),
      props: { palette: [TEST_PALITEM], onRemovePaletteItem },
    });

    await userEvent.dblClick(screen.getByRole("option", { name: /310/u }));

    expect(onRemovePaletteItem).toHaveBeenCalledExactlyOnceWith(0);
  });

  test("import menu button opens the dropdown menu", async () => {
    const screen = await renderComponent(PaletteCatalogWrapper, {
      editorContext: createMockEditorContext(),
      props: { palette: [] },
    });

    await screen.getByRole("button", { name: "Palette options" }).click();

    await expect.element(page.getByRole("menuitem", { name: "Import Palettes" })).toBeVisible();
  });

  test("emits close when the close button is clicked", async () => {
    const onClose = vi.fn();

    const screen = await renderComponent(PaletteCatalogWrapper, {
      editorContext: createMockEditorContext(),
      props: { palette: [], onClose },
    });

    await screen.getByRole("button", { name: "Close" }).click();

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
