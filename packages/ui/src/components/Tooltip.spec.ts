import { TooltipProvider } from "reka-ui";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { defineComponent, nextTick } from "vue";

import type { TooltipProps } from "./Tooltip.vue";
import Tooltip from "./Tooltip.vue";

const TooltipWrapper = defineComponent({
  components: { TooltipProvider, Tooltip },
  inheritAttrs: false,
  template: `<TooltipProvider>
  <Tooltip v-bind="$attrs">
    <button>Trigger</button>
  </Tooltip>
</TooltipProvider>`,
});

describe("Tooltip", () => {
  const props: TooltipProps = { text: "Tooltip", open: true, portal: false };

  test.each([
    ["with text", { props }],
    ["with class", { props: { ...props, class: "text-sm" } }],
  ] as [string, { props?: TooltipProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(TooltipWrapper, options);

    await nextTick();

    expect(screen.container).toMatchSnapshot();
  });
});
