import { TooltipProvider } from "reka-ui";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { defineComponent } from "vue";

import ToolToggleGroup from "./ToolToggleGroup.vue";
import type { ToolToggleGroupProps } from "./ToolToggleGroup.vue";

const COMPACT_ITEMS = [
  { icon: "lucide:square", tooltip: "Solid", value: "solid" },
  { icon: "lucide:grid-2x2", tooltip: "Stitches", value: "stitches" },
  { icon: "lucide:blend", tooltip: "Mixed", value: "mixed" },
];

const EXPANDED_ITEMS = [
  { icon: "lucide:square", label: "Solid", description: "View as solid squares", value: "solid" },
  { icon: "lucide:grid-2x2", label: "Stitches", description: "View as individual stitches", value: "stitches" },
  { icon: "lucide:blend", label: "Mixed", description: "Mixed display mode", value: "mixed" },
];

const ToolToggleGroupWrapper = defineComponent({
  components: { TooltipProvider, ToolToggleGroup },
  inheritAttrs: false,
  template: `
    <TooltipProvider>
      <ToolToggleGroup v-bind="$attrs" />
    </TooltipProvider>
  `,
});

describe("ToolToggleGroup", () => {
  test.each([
    ["with compact items", { props: { items: COMPACT_ITEMS } }],
    ["with expanded items", { props: { items: EXPANDED_ITEMS } }],
    ["with vertical orientation", { props: { items: COMPACT_ITEMS, orientation: "vertical" } }],
    ["when toggled on", { props: { items: COMPACT_ITEMS, modelValue: "solid" } }],
    ["when disabled", { props: { items: COMPACT_ITEMS, disabled: true } }],
    ["with class", { props: { items: COMPACT_ITEMS, class: "custom-class", modelValue: "solid" } }],
    ["with ui", { props: { items: COMPACT_ITEMS, ui: { root: "custom-root" }, modelValue: "solid" } }],
  ] as [string, { props?: ToolToggleGroupProps & { modelValue: string } }][])(
    "renders correctly %s",
    async (_, options) => {
      const screen = await page.render(ToolToggleGroupWrapper, options);
      expect(screen.container.outerHTML).toMatchSnapshot();
    },
  );
});
