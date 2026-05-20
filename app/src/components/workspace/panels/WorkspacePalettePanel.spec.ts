import { App, Splitter, SplitterPanel } from "@embroiderly/ui";

import { NIL as NIL_UUID, v4 as uuidV4 } from "uuid";
import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent } from "vue";

import { BrandPaletteItem, Pattern, SortPaletteBy, serializeBrandPalette } from "~/lib/pattern/";
import { PaletteMode, useEditorStateStore, usePatternStore } from "~/stores/";
import { createMockEditorContext as originalCreateMockEditorContext } from "~test-utils/mock-editor-context.ts";
import { renderComponent } from "~test-utils/render-component.ts";

import WorkspacePalettePanel from "./WorkspacePalettePanel.vue";

const PALETTE = [
  { brand: "DMC", number: "310", name: "Black", color: "2C3225", blends: null, symbol: null },
  { brand: "DMC", number: "321", name: "Red", color: "B1272A", blends: null, symbol: null },
  { brand: "DMC", number: "436", name: "Tan", color: "CDA568", blends: null, symbol: null },
];

const CATALOG = [
  new BrandPaletteItem(0, { brand: "DMC", number: "310", name: "Black", color: "2C3225", blends: null }),
  new BrandPaletteItem(1, { brand: "DMC", number: "321", name: "Red", color: "B1272A", blends: null }),
  new BrandPaletteItem(2, { brand: "DMC", number: "436", name: "Tan", color: "CDA568", blends: null }),
];
const CATALOG_BYTES = serializeBrandPalette(CATALOG);

function createMockEditorContext() {
  const ctx = originalCreateMockEditorContext();
  ctx.files.getPalettesList.mockResolvedValue({ system: ["DMC"], custom: [] });
  ctx.files.loadPalette.mockResolvedValue(CATALOG_BYTES);
  // The stitch-symbols panel loads a default font on mount; stub the file actions so its `onMounted`
  // hook can run to completion without unhandled rejections.
  ctx.files.getFontsList.mockResolvedValue({ system: [], custom: [] });
  ctx.files.loadFontContent.mockResolvedValue(new Uint8Array());
  ctx.files.loadFontCodePoints.mockResolvedValue(new Uint32Array());
  return ctx;
}

const WorkspacePalettePanelWrapper = defineComponent({
  components: { App, Splitter, SplitterPanel, WorkspacePalettePanel },
  inheritAttrs: false,
  template: `
    <App>
      <Splitter direction="horizontal" class="size-full">
        <WorkspacePalettePanel
          v-bind="$attrs"
          collapsible
          :collapsed-size="10"
          :min-size="20"
          :default-size="30"
        />
        <SplitterPanel :default-size="70" />
      </Splitter>
    </App>
  `,
});

interface RenderOptions {
  patternId?: string;
  palette?: typeof PALETTE;
  paletteSettings?: Record<string, unknown>;
  editorState?: {
    palettePanelCollapsed?: boolean;
    selectedPaletteItemIndex?: number;
    paletteMode?: PaletteMode;
  };
}

function renderPanel({
  patternId = uuidV4(),
  palette = PALETTE,
  paletteSettings = {},
  editorState = {},
}: RenderOptions = {}) {
  return renderComponent(WorkspacePalettePanelWrapper, {
    editorContext: createMockEditorContext(),
    pinia: {
      initialState: {
        "embroiderly-pattern": {
          pattern: new Pattern({
            id: patternId,
            palette: {
              items: palette,
              positions: palette.map((_, i) => i),
              // The Palette constructor accepts `Partial<PaletteSettings>` and fills in defaults.
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              settings: paletteSettings as any,
            },
          }),
        },
        "embroiderly-pattern-editor-state": editorState,
      },
    },
  });
}

describe("WorkspacePalettePanel", () => {
  describe("regular mode", () => {
    test("shows the palette size and the edit button", async () => {
      const screen = await renderPanel();

      await expect.element(screen.getByText(/Palette:.*3.*colors/u)).toBeVisible();
      await expect.element(screen.getByRole("button", { name: "Edit Palette" })).toBeVisible();
    });

    test("hides the palette size label when collapsed but keeps the edit button", async () => {
      const screen = await renderPanel();

      useEditorStateStore().palettePanelCollapsed = true;

      await expect.element(screen.getByText(/Palette:.*3.*colors/u)).not.toBeVisible();
      await expect.element(screen.getByRole("button", { name: "Edit Palette" })).toBeVisible();
    });

    test("disables interactions when the pattern is nil", async () => {
      const screen = await renderPanel({ patternId: NIL_UUID });

      await expect.element(screen.getByRole("button", { name: "Edit Palette" })).toBeDisabled();
      // Listbox `data-disabled` is set on the wrapper element (`data-slot="root"`), not on the inner element that carries `role="listbox"`.
      // @ts-expect-error `expect.element` works correctly with regular `HTMLElement`s.
      await expect.element(screen.container.querySelector('[data-slot="root"]')!).toHaveAttribute("data-disabled");
    });

    test("selects a palette item when an option is clicked", async () => {
      const screen = await renderPanel();
      const editorState = useEditorStateStore();

      expect(editorState.selectedPaletteItemIndex).toBe(undefined);

      await userEvent.click(screen.getByRole("option").nth(0));

      expect(editorState.selectedPaletteItemIndex).toBe(0);
    });
  });

  describe("mode transitions", () => {
    test("enters editing mode when the edit button is clicked", async () => {
      const screen = await renderPanel();

      await userEvent.click(screen.getByRole("button", { name: "Edit Palette" }));

      await expect.element(screen.getByRole("button", { name: "Save Palette" })).toBeVisible();
      await expect.element(screen.getByRole("button", { name: "Edit Palette" })).not.toBeInTheDocument();

      expect(useEditorStateStore().paletteMode).toBe(PaletteMode.Editing);
    });

    test("returns to regular mode when the save button is clicked", async () => {
      const screen = await renderPanel({ editorState: { paletteMode: PaletteMode.Editing } });

      await userEvent.click(screen.getByRole("button", { name: "Save Palette" }));

      await expect.element(screen.getByText(/Palette:.*3.*colors/u)).toBeVisible();
      await expect.element(screen.getByRole("button", { name: "Save Palette" })).not.toBeInTheDocument();

      expect(useEditorStateStore().paletteMode).toBe(PaletteMode.Regular);
    });

    test("returns to regular mode when Escape is pressed", async () => {
      const screen = await renderPanel({ editorState: { paletteMode: PaletteMode.Editing } });

      await userEvent.click(screen.getByRole("listbox"));
      await userEvent.keyboard("{Escape}");

      await expect.element(screen.getByRole("button", { name: "Save Palette" })).not.toBeInTheDocument();
      await expect.element(screen.getByRole("button", { name: "Edit Palette" })).toBeVisible();

      expect(useEditorStateStore().paletteMode).toBe(PaletteMode.Regular);
    });
  });

  describe("regular context menu", () => {
    test("opens with Edit Palette and Display Settings entries", async () => {
      const screen = await renderPanel();

      await userEvent.click(screen.getByRole("listbox"), { button: "right" });

      await expect.element(screen.getByRole("menuitem", { name: "Edit Palette" })).toBeVisible();
      await expect.element(screen.getByRole("menuitem", { name: "Display Settings" })).toBeVisible();
      await expect.element(screen.getByRole("menuitem", { name: "Save Palette" })).not.toBeInTheDocument();
    });

    test("opens the catalog when Edit Palette is selected", async () => {
      const screen = await renderPanel();

      await userEvent.click(screen.getByRole("listbox"), { button: "right" });
      await userEvent.click(screen.getByRole("menuitem", { name: "Edit Palette" }));

      await expect.element(screen.getByRole("button", { name: "Save Palette" })).toBeVisible();
      await expect.element(screen.getByText("Colors")).toBeVisible();

      expect(useEditorStateStore().paletteMode).toBe(PaletteMode.Editing);
    });

    test("persists the columns number setting after the menu closes", async () => {
      const screen = await renderPanel();

      await userEvent.click(screen.getByRole("listbox"), { button: "right" });
      await userEvent.hover(screen.getByRole("menuitem", { name: "Display Settings" }));
      await userEvent.hover(screen.getByRole("menuitem", { name: "Number of columns" }));
      await userEvent.click(screen.getByRole("menuitemcheckbox", { name: "4" }));

      await userEvent.keyboard("{Escape}");

      expect(usePatternStore().updatePaletteDisplaySettings).toHaveBeenCalledWith(
        expect.objectContaining({ columnsNumber: 4 }),
      );
    });

    test("persists the Color only setting after the menu closes", async () => {
      const screen = await renderPanel({ paletteSettings: { colorOnly: false } });

      await userEvent.click(screen.getByRole("listbox"), { button: "right" });
      await userEvent.hover(screen.getByRole("menuitem", { name: "Display Settings" }));
      await userEvent.click(screen.getByRole("menuitemcheckbox", { name: "Color only" }));

      await userEvent.keyboard("{Escape}");

      expect(usePatternStore().updatePaletteDisplaySettings).toHaveBeenCalledWith(
        expect.objectContaining({ colorOnly: true }),
      );
    });

    test("disables stitch symbol options when Color only is enabled", async () => {
      const screen = await renderPanel({ paletteSettings: { colorOnly: true } });

      await userEvent.click(screen.getByRole("listbox"), { button: "right" });
      await userEvent.hover(screen.getByRole("menuitem", { name: "Display Settings" }));

      await expect
        .element(screen.getByRole("menuitemcheckbox", { name: "Show stitch symbols" }))
        .toHaveAttribute("data-disabled");
    });
  });

  describe("editing context menu", () => {
    test("opens with Sort By, Delete All and Save Palette entries", async () => {
      const screen = await renderPanel({ editorState: { paletteMode: PaletteMode.Editing } });

      await userEvent.click(screen.getByRole("listbox"), { button: "right" });

      await expect.element(screen.getByRole("menuitem", { name: "Sort By" })).toBeVisible();
      await expect.element(screen.getByRole("menuitem", { name: "Delete All" })).toBeVisible();
      await expect.element(screen.getByRole("menuitem", { name: "Save Palette" })).toBeVisible();
    });

    test("sorts the palette by brand and number", async () => {
      const screen = await renderPanel({ editorState: { paletteMode: PaletteMode.Editing } });

      await userEvent.click(screen.getByRole("listbox"), { button: "right" });
      await userEvent.hover(screen.getByRole("menuitem", { name: "Sort By" }));
      await userEvent.click(screen.getByRole("menuitem", { name: "Brand & Number" }));

      expect(usePatternStore().sortPaletteBy).toHaveBeenCalledExactlyOnceWith(SortPaletteBy.BrandAndNumber);
    });

    test("removes the selected palette item", async () => {
      const screen = await renderPanel({
        editorState: { paletteMode: PaletteMode.Editing, selectedPaletteItemIndex: 1 },
      });

      await userEvent.click(screen.getByRole("listbox"), { button: "right" });
      await userEvent.click(screen.getByRole("menuitem", { name: /Delete.*1.*Selected/u }));

      expect(usePatternStore().removePaletteItem).toHaveBeenCalledExactlyOnceWith(1);
    });

    test("disables Delete Selected when no palette item is selected", async () => {
      const screen = await renderPanel({ editorState: { paletteMode: PaletteMode.Editing } });

      await userEvent.click(screen.getByRole("listbox"), { button: "right" });

      await expect.element(screen.getByRole("menuitem", { name: "Delete Selected" })).toHaveAttribute("data-disabled");
    });

    test("removes all palette items", async () => {
      const screen = await renderPanel({ editorState: { paletteMode: PaletteMode.Editing } });

      await userEvent.click(screen.getByRole("listbox"), { button: "right" });
      await userEvent.click(screen.getByRole("menuitem", { name: "Delete All" }));

      expect(usePatternStore().removePaletteItem).toHaveBeenCalledExactlyOnceWith(0, 1, 2);
    });

    test("returns to regular mode when Save Palette is selected", async () => {
      const screen = await renderPanel({ editorState: { paletteMode: PaletteMode.Editing } });

      await userEvent.click(screen.getByRole("listbox"), { button: "right" });
      await userEvent.click(screen.getByRole("menuitem", { name: "Save Palette" }));

      await expect.element(screen.getByRole("button", { name: "Edit Palette" })).toBeVisible();

      expect(useEditorStateStore().paletteMode).toBe(PaletteMode.Regular);
    });
  });

  describe("editing mode dropdown menu", () => {
    test("shows panel toggles for Display Settings, Colors and Symbols", async () => {
      const screen = await renderPanel({ editorState: { paletteMode: PaletteMode.Editing } });

      await userEvent.click(screen.getByRole("button", { name: "Palette menu" }));

      await expect.element(screen.getByRole("menuitem", { name: "Display Settings" })).toBeVisible();
      await expect.element(screen.getByRole("menuitem", { name: "Colors" })).toBeVisible();
      await expect.element(screen.getByRole("menuitem", { name: "Symbols" })).toBeVisible();
    });

    test("toggles the inline Display Settings panel", async () => {
      const screen = await renderPanel({ editorState: { paletteMode: PaletteMode.Editing } });

      await userEvent.click(screen.getByRole("button", { name: "Palette menu" }));
      await userEvent.click(screen.getByRole("menuitem", { name: "Display Settings" }));

      await expect.element(screen.getByText("Display Settings")).toBeVisible();

      await userEvent.click(screen.getByRole("button", { name: "Close" }));

      await expect.element(screen.getByText("Display Settings")).not.toBeInTheDocument();
    });

    test("toggles the inline Colors panel", async () => {
      const screen = await renderPanel({ editorState: { paletteMode: PaletteMode.Editing } });

      await userEvent.click(screen.getByRole("button", { name: "Palette menu" }));
      await userEvent.click(screen.getByRole("menuitem", { name: "Colors" }));

      await expect.element(screen.getByText("Colors")).toBeVisible();

      await userEvent.click(screen.getByRole("button", { name: "Close" }));

      await expect.element(screen.getByText("Colors")).not.toBeInTheDocument();
    });

    test("toggles the inline Symbols panel", async () => {
      const screen = await renderPanel({ editorState: { paletteMode: PaletteMode.Editing } });

      await userEvent.click(screen.getByRole("button", { name: "Palette menu" }));
      await userEvent.click(screen.getByRole("menuitem", { name: "Symbols" }));

      // Use the exact search, as there are other labels (e.g. `No symbols`), since no symbol font is actually loaded.
      await expect.element(screen.getByText("Symbols", { exact: true })).toBeVisible();

      // Query the first button. The another is related to the error toast.
      await userEvent.click(screen.getByRole("button", { name: "Close" }).first());

      await expect.element(screen.getByText("Symbols", { exact: true })).not.toBeInTheDocument();
    });
  });

  describe("catalog interaction", () => {
    test("adds a catalog item to the palette on double-click", async () => {
      const screen = await renderPanel({ palette: [PALETTE[0]!] });

      await userEvent.click(screen.getByRole("button", { name: "Edit Palette" }));

      const option = screen.getByRole("option", { name: /321/u });
      await expect.element(option).toBeVisible();

      await userEvent.dblClick(option);

      expect(usePatternStore().addPaletteItem).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ brand: "DMC", number: "321" }),
      );
    });

    test("preserves the existing selection when adding a palette item", async () => {
      const screen = await renderPanel({
        palette: [PALETTE[0]!],
        editorState: { selectedPaletteItemIndex: 0 },
      });

      await userEvent.click(screen.getByRole("button", { name: "Edit Palette" }));

      const option = screen.getByRole("option", { name: /321/u });
      await expect.element(option).toBeVisible();

      await userEvent.dblClick(option);

      expect(useEditorStateStore().selectedPaletteItemIndex).toBe(0);
    });
  });
});
