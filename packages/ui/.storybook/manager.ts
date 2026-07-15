import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "Embroiderly UI",
    brandImage: "./app-logo.svg",
    brandUrl: "https://ui.embroiderly.niusia.me",
    brandTarget: "_self",
  }),
});
