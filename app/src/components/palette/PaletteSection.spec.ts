import { describe, expect, test, vi } from "vitest";

import { renderComponent } from "~test-utils/render-component.ts";

import PaletteSection from "./PaletteSection.vue";

describe("PaletteSection", () => {
  test("renders the title and the slot content", async () => {
    const screen = await renderComponent(PaletteSection, {
      props: { title: "Some Title" },
      slots: { default: "Lorem ipsum..." },
    });

    await expect.element(screen.getByText("Some Title")).toBeVisible();
    await expect.element(screen.getByText("Lorem ipsum...")).toBeVisible();
  });

  test("emits close when the close button is clicked", async () => {
    const onClose = vi.fn();

    const screen = await renderComponent(PaletteSection, {
      props: { title: "Test", onClose },
    });

    await screen.getByRole("button", { name: "Close" }).click();

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
