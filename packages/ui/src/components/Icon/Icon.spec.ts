import { expect, test, describe } from "vitest";
import { page } from "vitest/browser";

import Icon from "./Icon.vue";
import type { IconProps } from "./Icon.vue";

describe("Icon", () => {
  test.each([
    ["with icon", { props: { name: "lucide:rocket" } }],
    ["with class", { props: { name: "lucide:rocket", class: "size-8" } }],
  ] as [string, { props?: IconProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(Icon, options);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });
});
