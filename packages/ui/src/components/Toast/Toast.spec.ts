import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { defineComponent, nextTick } from "vue";

import Toast from "./Toast.vue";
import type { ToastProps } from "./Toast.vue";
import Toaster from "./Toaster.vue";

const ToastWrapper = defineComponent({
  components: { Toaster, Toast },
  inheritAttrs: false,
  template: `<Toaster :portal="false">
    <Toast v-bind="$attrs">
      <template v-for="(_, name) in $slots" #[name]="slotData">
        <slot :name="name" v-bind="slotData" />
      </template>
    </Toast>
  </Toaster>`,
});

describe("Toast", () => {
  const props: ToastProps = { open: true, title: "Toast" };

  test.each([
    ["with title", { props }],
    ["with description", { props: { ...props, description: "This is a toast" } }],
    ["with title and description", { props: { ...props, description: "This is a toast" } }],
    ["with actions", { props: { ...props, actions: [{ label: "Retry" }] } }],
    [
      "with actions and description",
      { props: { ...props, description: "Something went wrong.", actions: [{ label: "Retry" }] } },
    ],
    ["with color error", { props: { ...props, color: "error" as const } }],
    ["with color success", { props: { ...props, color: "success" as const } }],
    ["with color neutral", { props: { ...props, color: "neutral" as const } }],
    ["with class", { props: { ...props, class: "w-96" } }],
    ["with ui", { props: { ...props, ui: { title: "font-bold" } } }],
    ["with title slot", { props, slots: { title: () => "Title slot" } }],
    ["with description slot", { props, slots: { description: () => "Description slot" } }],
    ["with actions slot", { props, slots: { actions: () => "Actions slot" } }],
    ["with close slot", { props, slots: { close: () => "Close slot" } }],
  ] as [string, { props?: ToastProps; slots?: Record<string, () => string> }][])(
    "renders correctly %s",
    async (_, options) => {
      const screen = page.render(ToastWrapper, options);
      await nextTick();

      expect(screen.container.outerHTML).toMatchSnapshot();
    },
  );
});
