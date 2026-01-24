import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";

import BlockUI from "./BlockUI.vue";

describe("BlockUI", () => {
  test("renders correctly when blocked", () => {
    const screen = page.render(BlockUI, {
      props: { blocked: true },
      slots: { default: () => "Content" },
    });
    expect(screen.container).toMatchSnapshot();
  });

  test("renders correctly when not blocked", () => {
    const screen = page.render(BlockUI, {
      props: { blocked: false },
      slots: { default: () => "Content" },
    });
    expect(screen.container).toMatchSnapshot();
  });
});
