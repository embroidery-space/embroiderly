import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { nextTick } from "vue";

import Tabs from "./Tabs.vue";
import type { TabsItem, TabsProps, TabsSlots } from "./Tabs.vue";

describe("Tabs", () => {
  const sizes = ["sm", "md", "lg"] as const;
  const orientations = ["horizontal", "vertical"] as const;

  const items: TabsItem[] = [
    { label: "Tab1", content: "Content for Tab1" },
    { label: "Tab2", content: "Content for Tab2" },
    { label: "Tab3", content: "Content for Tab3", slot: "custom" },
  ];

  test.each([
    ["with items", { props: { items } }],
    ...orientations.map((orientation) => [`with orientation ${orientation}`, { props: { items, orientation } }]),
    ...sizes.map((size) => [`with size ${size}`, { props: { items, size } }]),
    ["without content", { props: { items, content: false } }],
    ["with unmountOnHide false", { props: { items, unmountOnHide: false } }],
    ["with class", { props: { items, class: "w-96" } }],
    ["with ui", { props: { items, ui: { content: "w-full ring ring-default" } } }],
    ["with leading slot", { props: { items }, slots: { leading: () => "Leading slot" } }],
    ["with default slot", { props: { items }, slots: { default: () => "Default slot" } }],
    ["with trailing slot", { props: { items }, slots: { trailing: () => "Trailing slot" } }],
    ["with content slot", { props: { items }, slots: { content: () => "Content slot" } }],
    ["with custom slot", { props: { items }, slots: { custom: () => "Custom slot" } }],
  ] as [string, { props?: TabsProps; slots?: Partial<TabsSlots> }][])("renders correctly %s", async (_, options) => {
    // @ts-expect-error Partial slots type is not compatible with `ComponentRenderOptions`.
    const screen = page.render(Tabs, options);
    await nextTick();

    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:modelValue on trigger click", async () => {
      const screen = page.render(Tabs, { props: { items } });
      await nextTick();

      const triggers = screen.getByRole("tab", { name: "Tab2" });
      await userEvent.click(triggers.element());

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });
  });
});
