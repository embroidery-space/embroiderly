import { App, Splitter, SplitterPanel } from "@embroiderly/ui";
import { clearMocks, mockIPC, mockWindows } from "@tauri-apps/api/mocks";

import { createTestingPinia } from "@pinia/testing";
import { NIL as NIL_UUID, v4 as uuidV4 } from "uuid";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent, nextTick } from "vue";

import { DisplayMode, Layer, Layers, Pattern } from "~/lib/pattern/";
import { useEditorStateStore, usePatternStore } from "~/stores/";

import WorkspaceCanvasPanel from "./WorkspaceCanvasPanel.vue";

const WorkspaceCanvasPanelWrapper = defineComponent({
  components: { App, Splitter, SplitterPanel, WorkspaceCanvasPanel },
  inheritAttrs: false,
  template: `
    <App>
      <Splitter direction="horizontal" class="size-full">
        <SplitterPanel :default-size="70" />
        <WorkspaceCanvasPanel
          v-bind="$attrs"
          collapsible
          :collapsed-size="10"
          :min-size="20"
          :default-size="30"
        />
      </Splitter>
    </App>
  `,
});

describe("WorkspaceCanvasPanel", () => {
  beforeEach(() => {
    mockWindows("main");
    mockIPC(() => {}, { shouldMockEvents: true });
  });

  afterEach(() => {
    clearMocks();
  });

  test("renders correctly in an expanded state", async () => {
    const screen = page.render(WorkspaceCanvasPanelWrapper, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: true,
            createSpy: vi.fn,
            initialState: {
              "embroiderly-pattern": {
                pattern: new Pattern({ id: uuidV4(), layers: new Layers([new Layer(0)]) }),
              },
            },
          }),
        ],
      },
    });
    await nextTick();

    // Display mode toggles.
    await expect.element(screen.getByRole("button", { name: "Mixed view" })).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Solid view" })).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Stitches view" })).toBeVisible();

    // Visibility toggles.
    await expect.element(screen.getByRole("button", { name: "Symbols" })).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Grid" })).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Rulers" })).toBeVisible();

    // Inline layers tree instead of popover button.
    await expect.element(screen.getByRole("tree")).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Layers" })).not.toBeInTheDocument();
  });

  test("renders correctly in a collapsed state", async () => {
    const screen = page.render(WorkspaceCanvasPanelWrapper, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: true,
            createSpy: vi.fn,
            initialState: {
              "embroiderly-pattern": {
                pattern: new Pattern({ id: uuidV4(), layers: new Layers([new Layer(0)]) }),
              },
            },
          }),
        ],
      },
    });
    await nextTick();

    // Change the state directly, so the panel size is automatically adjusted.
    useEditorStateStore().canvasPanelCollapsed = true;

    // Display mode toggles.
    await expect.element(screen.getByRole("button", { name: "Mixed view" })).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Solid view" })).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Stitches view" })).toBeVisible();

    // Visibility toggles.
    await expect.element(screen.getByRole("button", { name: "Symbols" })).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Grid" })).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Rulers" })).toBeVisible();

    // Layers popover button instead of inline tree.
    await expect.element(screen.getByRole("button", { name: "Layers" })).toBeVisible();
    await expect.element(screen.getByRole("tree")).not.toBeInTheDocument();
  });

  test("disabled when pattern is nil", async () => {
    const screen = page.render(WorkspaceCanvasPanelWrapper, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: true,
            createSpy: vi.fn,
            initialState: {
              "embroiderly-pattern": {
                pattern: new Pattern({ id: NIL_UUID, layers: new Layers([new Layer(0)]) }),
              },
            },
          }),
        ],
      },
    });
    await nextTick();

    // Display mode toggles.
    await expect.element(screen.getByRole("button", { name: "Mixed view" })).toBeDisabled();
    await expect.element(screen.getByRole("button", { name: "Solid view" })).toBeDisabled();
    await expect.element(screen.getByRole("button", { name: "Stitches view" })).toBeDisabled();

    // Visibility toggles.
    await expect.element(screen.getByRole("button", { name: "Symbols" })).toBeDisabled();
    await expect.element(screen.getByRole("button", { name: "Grid" })).toBeDisabled();
    await expect.element(screen.getByRole("button", { name: "Rulers" })).toBeDisabled();

    // Inline layers tree / layers popover button.
    const tree = screen.getByRole("tree");
    const button = screen.getByRole("button", { name: "Layers", includeHidden: true });

    useEditorStateStore().canvasPanelCollapsed = false;
    await expect.element(tree).toHaveAttribute("data-disabled");
    await expect.element(button).not.toBeInTheDocument();

    useEditorStateStore().canvasPanelCollapsed = true;
    await expect.element(button).toBeDisabled();
    await expect.element(tree).not.toBeInTheDocument();
  });

  describe("display mode toggles", () => {
    test("reflect current display mode", async () => {
      const screen = page.render(WorkspaceCanvasPanelWrapper, {
        global: {
          plugins: [
            createTestingPinia({
              stubActions: true,
              createSpy: vi.fn,
              initialState: {
                "embroiderly-pattern": {
                  pattern: new Pattern({
                    id: uuidV4(),
                    layers: new Layers([new Layer(0)]),
                    displaySettings: { displayMode: DisplayMode.Mixed },
                  }),
                },
              },
            }),
          ],
        },
      });
      await nextTick();

      await expect.element(screen.getByRole("button", { name: "Mixed view" })).toHaveAttribute("aria-pressed", "true");
      await expect.element(screen.getByRole("button", { name: "Solid view" })).toHaveAttribute("aria-pressed", "false");
      await expect
        .element(screen.getByRole("button", { name: "Stitches view" }))
        .toHaveAttribute("aria-pressed", "false");
    });

    test("clicking a toggle calls setDisplayMode with the correct value", async () => {
      const screen = page.render(WorkspaceCanvasPanelWrapper, {
        global: {
          plugins: [
            createTestingPinia({
              stubActions: true,
              createSpy: vi.fn,
              initialState: {
                "embroiderly-pattern": {
                  pattern: new Pattern({ id: uuidV4(), layers: new Layers([new Layer(0)]) }),
                },
              },
            }),
          ],
        },
      });
      await nextTick();

      await userEvent.click(screen.getByRole("button", { name: "Mixed view" }));

      const patternStore = usePatternStore();
      expect(patternStore.setDisplayMode).toHaveBeenCalledTimes(1);
      expect(patternStore.setDisplayMode).toHaveBeenCalledWith(DisplayMode.Mixed);
    });
  });

  describe("visibility toggles", () => {
    test("reflect current visibility settings", async () => {
      const screen = page.render(WorkspaceCanvasPanelWrapper, {
        global: {
          plugins: [
            createTestingPinia({
              stubActions: true,
              createSpy: vi.fn,
              initialState: {
                "embroiderly-pattern": {
                  pattern: new Pattern({
                    id: uuidV4(),
                    layers: new Layers([new Layer(0)]),
                    displaySettings: { showSymbols: true, showGrid: true, showRulers: true },
                  }),
                },
              },
            }),
          ],
        },
      });
      await nextTick();

      await expect.element(screen.getByRole("button", { name: "Symbols" })).toHaveAttribute("aria-pressed", "true");
      await expect.element(screen.getByRole("button", { name: "Grid" })).toHaveAttribute("aria-pressed", "true");
      await expect.element(screen.getByRole("button", { name: "Rulers" })).toHaveAttribute("aria-pressed", "true");
    });

    test("clicking Symbols toggle calls showSymbols", async () => {
      const screen = page.render(WorkspaceCanvasPanelWrapper, {
        global: {
          plugins: [
            createTestingPinia({
              stubActions: true,
              createSpy: vi.fn,
              initialState: {
                "embroiderly-pattern": {
                  pattern: new Pattern({ id: uuidV4(), layers: new Layers([new Layer(0)]) }),
                },
              },
            }),
          ],
        },
      });
      await nextTick();

      await userEvent.click(screen.getByRole("button", { name: "Symbols" }));

      expect(usePatternStore().showSymbols).toHaveBeenCalledTimes(1);
    });

    test("clicking Grid toggle calls showGrid", async () => {
      const screen = page.render(WorkspaceCanvasPanelWrapper, {
        global: {
          plugins: [
            createTestingPinia({
              stubActions: true,
              createSpy: vi.fn,
              initialState: {
                "embroiderly-pattern": {
                  pattern: new Pattern({ id: uuidV4(), layers: new Layers([new Layer(0)]) }),
                },
              },
            }),
          ],
        },
      });
      await nextTick();

      await userEvent.click(screen.getByRole("button", { name: "Grid" }));

      expect(usePatternStore().showGrid).toHaveBeenCalledTimes(1);
    });

    test("clicking Rulers toggle calls showRulers", async () => {
      const screen = page.render(WorkspaceCanvasPanelWrapper, {
        global: {
          plugins: [
            createTestingPinia({
              stubActions: true,
              createSpy: vi.fn,
              initialState: {
                "embroiderly-pattern": {
                  pattern: new Pattern({ id: uuidV4(), layers: new Layers([new Layer(0)]) }),
                },
              },
            }),
          ],
        },
      });
      await nextTick();

      await userEvent.click(screen.getByRole("button", { name: "Rulers" }));

      expect(usePatternStore().showRulers).toHaveBeenCalledTimes(1);
    });
  });

  describe.each([{ mode: "expanded" as const }, { mode: "collapsed" as const }])(
    "layer operations ($mode)",
    ({ mode }) => {
      async function setupLayerTest(layers: Layer[], selectedLayerIndex = 0) {
        const screen = page.render(WorkspaceCanvasPanelWrapper, {
          global: {
            plugins: [
              createTestingPinia({
                stubActions: true,
                createSpy: vi.fn,
                initialState: {
                  "embroiderly-pattern": {
                    pattern: new Pattern({ id: uuidV4(), layers: new Layers(layers) }),
                  },
                  "embroiderly-pattern-editor-state": { selectedLayerIndex },
                },
              }),
            ],
          },
        });
        await nextTick();

        if (mode === "collapsed") {
          useEditorStateStore().canvasPanelCollapsed = true;
          await userEvent.click(screen.getByRole("button", { name: "Layers" }));
        }

        return screen;
      }

      test("clicking Add Layer calls patternStore.addLayer", async () => {
        const screen = await setupLayerTest([new Layer(0, { name: "Layer A" })]);

        await userEvent.click(screen.getByRole("button", { name: "Add Layer" }));

        expect(usePatternStore().addLayer).toHaveBeenCalledTimes(1);
      });

      test("clicking Remove Layer shows confirm dialog", async () => {
        await setupLayerTest([new Layer(0, { name: "Layer A" }), new Layer(1, { name: "Layer B" })], 1);

        await userEvent.click(page.getByRole("button", { name: "Remove Layer" }));

        await expect.element(page.getByRole("alertdialog")).toBeVisible();
      });

      test("confirming removal calls patternStore.removeLayer with the selected layer index", async () => {
        await setupLayerTest([new Layer(0, { name: "Layer A" }), new Layer(1, { name: "Layer B" })], 1);

        await userEvent.click(page.getByRole("button", { name: "Remove Layer" }));
        await userEvent.click(page.getByRole("button", { name: "Yes" }));

        expect(usePatternStore().removeLayer).toHaveBeenCalledTimes(1);
        expect(usePatternStore().removeLayer).toHaveBeenCalledWith(1);
      });

      test("rejecting removal does not call patternStore.removeLayer", async () => {
        await setupLayerTest([new Layer(0, { name: "Layer A" }), new Layer(1, { name: "Layer B" })], 1);

        await userEvent.click(page.getByRole("button", { name: "Remove Layer" }));
        await userEvent.click(page.getByRole("button", { name: "No" }));

        expect(usePatternStore().removeLayer).not.toHaveBeenCalled();
      });

      test("double-clicking a layer name and submitting calls patternStore.renameLayer", async () => {
        const screen = await setupLayerTest([new Layer(0, { name: "My Layer" })]);

        const layer = screen.getByRole("treeitem", { name: "My Layer" });
        await userEvent.dblClick(layer.getByText("My Layer"));
        await userEvent.fill(layer.getByRole("textbox"), "New Name");
        await userEvent.keyboard("{Enter}");
        await nextTick();

        expect(usePatternStore().renameLayer).toHaveBeenCalledTimes(1);
        expect(usePatternStore().renameLayer).toHaveBeenCalledWith(0, "New Name");
      });

      test("clicking layer visibility button calls patternStore.updateLayerVisibility", async () => {
        const screen = await setupLayerTest([new Layer(0, { name: "Layer A" })]);

        // Click the treeitem first to dismiss any lingering tooltip from the Layers popover trigger button, then click the visibility button.
        await userEvent.click(screen.getByRole("treeitem", { name: "Layer A" }));
        await userEvent.click(screen.getByRole("treeitem", { name: "Layer A" }).getByRole("button").nth(1));

        expect(usePatternStore().updateLayerVisibility).toHaveBeenCalledTimes(1);
        expect(usePatternStore().updateLayerVisibility).toHaveBeenCalledWith(
          0,
          expect.objectContaining({ visible: false }),
        );
      });
    },
  );
});
