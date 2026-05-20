import { App } from "@embroiderly/ui";

import { describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { defineComponent } from "vue";

import { PaletteItem, PaletteSettings } from "~/lib/pattern/";
import { renderComponent } from "~test-utils/render-component.ts";

import PaletteList from "./PaletteList.vue";

const PALETTE = [
  new PaletteItem(0, { brand: "DMC", number: "310", name: "Black", color: "2C3225", blends: null, symbol: null }),
  new PaletteItem(1, { brand: "DMC", number: "321", name: "Red", color: "B1272A", blends: null, symbol: null }),
  new PaletteItem(2, { brand: "DMC", number: "436", name: "Tan", color: "CDA568", blends: null, symbol: null }),
];

const DEFAULT_DISPLAY_SETTINGS = new PaletteSettings({
  columnsNumber: 2,
  colorOnly: false,
  showColorBrands: true,
  showColorNumbers: true,
  showColorNames: true,
  showStitchSymbols: false,
});

const PaletteListWrapper = defineComponent({
  components: { App, PaletteList },
  inheritAttrs: false,
  template: `
    <App>
      <PaletteList v-bind="$attrs">
        <template v-for="(_, name) in $slots" #[name]="slotProps">
          <slot :name="name" v-bind="slotProps ?? {}" />
        </template>
      </PaletteList>
    </App>
  `,
});

describe("PaletteList", () => {
  test("renders one option per item", async () => {
    const screen = await renderComponent(PaletteListWrapper, {
      props: { options: PALETTE, displaySettings: DEFAULT_DISPLAY_SETTINGS },
    });

    expect(screen.getByRole("option").all()).toHaveLength(3);

    await expect.element(screen.getByRole("option", { name: /310/u })).toBeVisible();
    await expect.element(screen.getByRole("option", { name: /321/u })).toBeVisible();
    await expect.element(screen.getByRole("option", { name: /436/u })).toBeVisible();
  });

  test("renders the empty-state message when options is empty", async () => {
    const screen = await renderComponent(PaletteListWrapper, {
      props: { options: [], displaySettings: DEFAULT_DISPLAY_SETTINGS },
    });

    expect(screen.getByRole("option").all()).toHaveLength(0);

    await expect.element(screen.getByText("The palette is empty")).toBeVisible();
  });

  test("renders options in the custom grid", async () => {
    await renderComponent(PaletteListWrapper, {
      props: { options: PALETTE, displaySettings: new PaletteSettings({ columnsNumber: 4 }) },
    });

    const group = document.querySelector<HTMLElement>('[role="group"]');
    expect(group).not.toBeNull();

    // The custom `--palette-cols` CSS property is set as an inline style on the listbox root.
    // `getComputedStyle` on the group picks it up via CSS cascade from its ancestor.
    expect(window.getComputedStyle(group!).getPropertyValue("--palette-cols").trim()).toBe("4");
  });

  test("single-select: clicking an option emits update:modelValue with the option-value form", async () => {
    const onUpdateModelValue = vi.fn();

    const screen = await renderComponent(PaletteListWrapper, {
      props: {
        options: PALETTE,
        optionValue: (pi: PaletteItem) => pi.index,
        displaySettings: DEFAULT_DISPLAY_SETTINGS,
        "onUpdate:modelValue": onUpdateModelValue,
      },
    });

    await userEvent.click(screen.getByRole("option").nth(2));

    expect(onUpdateModelValue).toHaveBeenCalledWith(2);
  });

  test("multi-select: clicking two options accumulates the values", async () => {
    const onUpdateModelValue = vi.fn();

    const screen = await renderComponent(PaletteListWrapper, {
      props: {
        multiple: true,
        options: PALETTE,
        optionValue: (pi: PaletteItem) => pi.index,
        displaySettings: DEFAULT_DISPLAY_SETTINGS,
        "onUpdate:modelValue": onUpdateModelValue,
      },
    });

    await userEvent.click(screen.getByRole("option").nth(0));
    await userEvent.click(screen.getByRole("option").nth(2));

    expect(onUpdateModelValue).toHaveBeenLastCalledWith([0, 2]);
  });

  test("forwards option-dblclick with palitem and palindex", async () => {
    const onOptionDblclick = vi.fn();

    const screen = await renderComponent(PaletteListWrapper, {
      props: {
        options: PALETTE,
        optionValue: (pi: PaletteItem) => pi.index,
        displaySettings: DEFAULT_DISPLAY_SETTINGS,
        onOptionDblclick,
      },
    });

    await userEvent.dblClick(screen.getByRole("option").nth(1));

    expect(onOptionDblclick).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ palitem: PALETTE[1], palindex: 1 }),
    );
  });

  test("disabled prop prevents selection", async () => {
    const onUpdateModelValue = vi.fn();

    const screen = await renderComponent(PaletteListWrapper, {
      props: {
        options: PALETTE,
        displaySettings: DEFAULT_DISPLAY_SETTINGS,
        disabled: true,
        "onUpdate:modelValue": onUpdateModelValue,
      },
    });

    await userEvent.click(screen.getByRole("option").nth(0));

    expect(onUpdateModelValue).not.toHaveBeenCalled();
  });

  describe("filter input", () => {
    test("shows the filter input when filterInput is truthy", async () => {
      const screen = await renderComponent(PaletteListWrapper, {
        props: {
          options: PALETTE,
          displaySettings: DEFAULT_DISPLAY_SETTINGS,
          filterInput: { placeholder: "Search..." },
        },
      });
      await expect.element(screen.getByRole("textbox")).toBeVisible();
    });

    test("emits update:filterValue on typing in the filter input", async () => {
      const onUpdateFilterValue = vi.fn();

      const screen = await renderComponent(PaletteListWrapper, {
        props: {
          options: PALETTE,
          displaySettings: DEFAULT_DISPLAY_SETTINGS,
          filterInput: true,
          "onUpdate:filterValue": onUpdateFilterValue,
        },
      });

      await userEvent.fill(screen.getByRole("textbox"), "DMC");

      expect(onUpdateFilterValue).toHaveBeenCalledWith("DMC");
    });
  });

  describe("slots", () => {
    test("renders header slot", async () => {
      const screen = await renderComponent(PaletteListWrapper, {
        props: { options: PALETTE, displaySettings: DEFAULT_DISPLAY_SETTINGS },
        slots: { header: `<button>Header Button</button>` },
      });
      await expect.element(screen.getByRole("button", { name: "Header Button" })).toBeVisible();
    });

    test("renders option slot", async () => {
      const screen = await renderComponent(PaletteListWrapper, {
        props: { options: PALETTE, displaySettings: DEFAULT_DISPLAY_SETTINGS },
        slots: { option: `<template #option="{ option }"><span>NUMBER:{{ option.number }}</span></template>` },
      });

      expect(screen.getByRole("option").all()).toHaveLength(3);

      await expect.element(screen.getByText("NUMBER:310")).toBeVisible();
      await expect.element(screen.getByText("NUMBER:321")).toBeVisible();
      await expect.element(screen.getByText("NUMBER:436")).toBeVisible();
    });

    test("renders footer slot", async () => {
      const screen = await renderComponent(PaletteListWrapper, {
        props: { options: PALETTE, displaySettings: DEFAULT_DISPLAY_SETTINGS },
        slots: { footer: `<button>Footer Button</button>` },
      });
      await expect.element(screen.getByRole("button", { name: "Footer Button" })).toBeVisible();
    });
  });
});
