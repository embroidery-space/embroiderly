import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { h, nextTick } from "vue";

import type { SplitterProps } from "./Splitter.vue";
import Splitter from "./Splitter.vue";
import SplitterPanel from "./SplitterPanel.vue";

function createPanels(count: number) {
  return () => Array.from({ length: count }, (_, i) => h(SplitterPanel, { key: i }, () => `Panel ${i + 1}`));
}

describe("Splitter", () => {
  test.each([
    ["with horizontal direction", { props: { direction: "horizontal" }, slots: { default: createPanels(2) } }],
    ["with vertical direction", { props: { direction: "vertical" }, slots: { default: createPanels(2) } }],
    ["with three panels", { props: { direction: "horizontal" }, slots: { default: createPanels(3) } }],
  ] as [string, { props: SplitterProps; slots: { default: () => ReturnType<typeof h>[] } }][])(
    "renders correctly %s",
    async (_, options) => {
      const screen = page.render(Splitter, options);
      await nextTick();

      expect(screen.container).toMatchSnapshot();
    },
  );

  test.each([2, 3, 4])("inserts correct number of resize handles for %d panels", async (panelCount) => {
    const screen = page.render(Splitter, {
      props: { direction: "horizontal" },
      slots: { default: createPanels(panelCount) },
    });
    await nextTick();

    const handles = screen.getByRole("separator");

    expect(handles.length).toBe(panelCount - 1);
  });
});
