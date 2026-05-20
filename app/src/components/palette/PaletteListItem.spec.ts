import { App } from "@embroiderly/ui";

import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent } from "vue";

import { PaletteItem, PaletteSettings } from "~/lib/pattern/";
import { renderComponent } from "~test-utils/render-component.ts";

import PaletteListItem from "./PaletteListItem.vue";

const PaletteListItemWrapper = defineComponent({
  components: { App, PaletteListItem },
  inheritAttrs: false,
  template: `<App><PaletteListItem v-bind="$attrs"><slot /></PaletteListItem></App>`,
});

const TEST_PALITEM = new PaletteItem(0, {
  brand: "DMC",
  number: "310",
  name: "Black",
  color: "2C3225",
  blends: null,
  symbol: null,
});

const DEFAULT_DISPLAY_SETTINGS = new PaletteSettings({
  colorOnly: false,
  showColorBrands: true,
  showColorNumbers: true,
  showColorNames: true,
  showStitchSymbols: false,
});

function getSwatch(screen: Awaited<ReturnType<typeof renderComponent>>) {
  return screen.container.querySelector<HTMLElement>("div[style]")!;
}

describe("PaletteListItem", () => {
  test("renders the colored swatch", async () => {
    const screen = await renderComponent(PaletteListItemWrapper, {
      props: { paletteItem: TEST_PALITEM, selected: false, displaySettings: DEFAULT_DISPLAY_SETTINGS },
    });
    const swatch = getSwatch(screen);

    await expect.element(swatch).toHaveStyle(`background-color: ${TEST_PALITEM.hex}`);
    await expect.element(swatch).toHaveStyle(`color: ${TEST_PALITEM.contrastColor}`);
  });

  test("shows a contrasting outline when selected", async () => {
    const screen = await renderComponent(PaletteListItemWrapper, {
      props: { paletteItem: TEST_PALITEM, selected: false, displaySettings: DEFAULT_DISPLAY_SETTINGS },
    });
    const swatch = getSwatch(screen);

    await expect.element(swatch).toHaveStyle("outline-color: transparent");

    screen.rerender({ selected: true });

    await expect.element(swatch).toHaveStyle(`outline-color: ${TEST_PALITEM.contrastColor}`);
  });

  test("renders the composed title when colorOnly is false", async () => {
    const screen = await renderComponent(PaletteListItemWrapper, {
      props: { paletteItem: TEST_PALITEM, selected: false, displaySettings: DEFAULT_DISPLAY_SETTINGS },
    });
    await expect.element(screen.getByText(TEST_PALITEM.getTitle(DEFAULT_DISPLAY_SETTINGS))).toBeVisible();
  });

  test("hides the title when colorOnly is true", async () => {
    const screen = await renderComponent(PaletteListItemWrapper, {
      props: { paletteItem: TEST_PALITEM, selected: false, displaySettings: new PaletteSettings({ colorOnly: true }) },
    });
    await expect.element(screen.getByText(TEST_PALITEM.getTitle(DEFAULT_DISPLAY_SETTINGS))).not.toBeVisible();
  });

  test("renders the tooltip on hover", async () => {
    const screen = await renderComponent(PaletteListItemWrapper, {
      props: { paletteItem: TEST_PALITEM, selected: false, displaySettings: DEFAULT_DISPLAY_SETTINGS },
    });

    await userEvent.hover(getSwatch(screen));

    await expect
      .element(page.getByRole("tooltip", { name: TEST_PALITEM.getTitle(), includeHidden: true }))
      .toBeInTheDocument();
  });

  test("renders the default slot content before the title", async () => {
    const screen = await renderComponent(PaletteListItemWrapper, {
      props: { paletteItem: TEST_PALITEM, selected: false, displaySettings: DEFAULT_DISPLAY_SETTINGS },
      slots: { default: `<span data-testid="symbol-slot">♠</span>` },
    });
    await expect.element(screen.getByTestId("symbol-slot")).toBeVisible();
  });
});
