import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { h } from "vue";

import Splitter from "./Splitter.vue";
import type { SplitterProps } from "./Splitter.vue";
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
      const screen = await page.render(Splitter, options);
      expect(screen.container.outerHTML).toMatchSnapshot();
    },
  );

  test.each([2, 3, 4])("inserts correct number of resize handles for %d panels", async (panelCount) => {
    const screen = await page.render(Splitter, {
      props: { direction: "horizontal" },
      slots: { default: createPanels(panelCount) },
    });
    expect(screen.getByRole("separator")).toHaveLength(panelCount - 1);
  });
});
