import { TooltipProvider } from "reka-ui";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { defineComponent } from "vue";

import Tooltip from "./Tooltip.vue";
import type { TooltipProps } from "./Tooltip.vue";

const TooltipWrapper = defineComponent({
  components: { TooltipProvider, Tooltip },
  inheritAttrs: false,
  template: `
    <TooltipProvider>
      <Tooltip v-bind="$attrs">
        <button>Trigger</button>
      </Tooltip>
    </TooltipProvider>
  `,
});

describe("Tooltip", () => {
  const props: TooltipProps & { open?: boolean } = {
    text: "Tooltip",
    open: true,
    portal: false,
  };

  test.each([
    ["with text", { props }],
    ["with shortcut", { props: { ...props, shortcut: "Ctrl+Z" } }],
    ["with shortcut only", { props: { ...props, text: undefined, shortcut: "Ctrl+S" } }],
    ["with class", { props: { ...props, class: "text-sm" } }],
  ] as [string, { props?: TooltipProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(TooltipWrapper, options);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });
});
