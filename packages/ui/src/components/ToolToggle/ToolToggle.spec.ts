import { TooltipProvider } from "reka-ui";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { defineComponent } from "vue";

import ToolToggle from "./ToolToggle.vue";
import type { ToolToggleProps } from "./ToolToggle.vue";

const ToolToggleWrapper = defineComponent({
  components: { TooltipProvider, ToolToggle },
  inheritAttrs: false,
  template: `
    <TooltipProvider>
      <ToolToggle v-bind="$attrs" />
    </TooltipProvider>
  `,
});

describe("ToolToggle", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ["with icon only", { props: { icon: "lucide:eye" } }],
    ["with tooltip", { props: { icon: "lucide:eye", tooltip: "Show" } }],
    ["with label", { props: { icon: "lucide:eye", label: "Show symbols" } }],
    [
      "with label and description",
      {
        props: {
          icon: "lucide:eye",
          label: "Show symbols",
          description: "Toggle symbol visibility",
        },
      },
    ],
    ["with shortcut", { props: { icon: "lucide:eye", tooltip: "Show", shortcut: "S" } }],
    ["when toggled on", { props: { icon: "lucide:eye", modelValue: true } }],
    ["when disabled", { props: { icon: "lucide:eye", disabled: true } }],
    ...sizes.map((size) => [`with size ${size}`, { props: { icon: "lucide:eye", size } }]),
    ["with class", { props: { icon: "lucide:eye", class: "custom-class" } }],
    ["with ui", { props: { icon: "lucide:eye", ui: { base: "custom-base" } } }],
  ] as [string, { props?: ToolToggleProps & { modelValue: boolean } }][])(
    "renders correctly %s",
    async (_, options) => {
      const screen = await page.render(ToolToggleWrapper, options);
      expect(screen.container.outerHTML).toMatchSnapshot();
    },
  );
});
