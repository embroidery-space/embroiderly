import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { nextTick } from "vue";

import BlockUI from "./BlockUI.vue";

describe("BlockUI", () => {
  test("renders correctly when blocked", async () => {
    const screen = page.render(BlockUI, {
      props: { blocked: true },
      slots: { default: () => "Content" },
    });
    await nextTick();

    expect(screen.container).toMatchSnapshot();
  });

  test("renders correctly when not blocked", async () => {
    const screen = page.render(BlockUI, {
      props: { blocked: false },
      slots: { default: () => "Content" },
    });
    await nextTick();

    expect(screen.container).toMatchSnapshot();
  });
});
