import globals from "globals";
import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import vuePrettierEslintConfig from "@vue/eslint-config-prettier/skip-formatting";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import unocss from "@unocss/eslint-config/flat";

export default defineConfigWithVueTs(
  js.configs.recommended,
  vue.configs["flat/recommended"],
  {
    files: ["src/**/*.ts", "src/**/*.vue"],
    languageOptions: { ecmaVersion: "latest", globals: { ...globals.browser } },
    rules: { "no-console": ["warn"] },
  },
  {
    files: ["scripts/**/*.js"],
    languageOptions: { ecmaVersion: "latest", globals: { ...globals.node } },
  },
  vuePrettierEslintConfig,
  vueTsConfigs.recommended,
  unocss,
);
