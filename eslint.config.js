import globals from "globals";
import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import vuePrettierEslintConfig from "@vue/eslint-config-prettier/skip-formatting";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import vueEslintParser from "vue-eslint-parser";
import htmlEslintParser from "@html-eslint/parser";

export default defineConfigWithVueTs(
  js.configs.recommended,
  vue.configs["flat/recommended"],
  {
    files: ["app/src/**/*.{js,ts,vue}", "crates/**/guest-js/**/*.{js,ts,vue}"],
    languageOptions: { ecmaVersion: "latest", globals: { ...globals.browser } },
    rules: { "no-console": ["warn"] },
  },
  { files: ["**/*.html"], languageOptions: { parser: htmlEslintParser } },
  { files: ["**/*.vue"], languageOptions: { parser: vueEslintParser } },
  {
    plugins: { "better-tailwindcss": betterTailwindcss },
    settings: {
      "better-tailwindcss": {
        entryPoint: "app/src/assets/styles.css",
      },
    },
    rules: {
      // Stylistic rules.
      "better-tailwindcss/enforce-consistent-line-wrapping": ["off"],
      "better-tailwindcss/enforce-consistent-class-order": ["warn", { order: "official" }],
      "better-tailwindcss/enforce-consistent-variable-syntax": ["warn"],
      "better-tailwindcss/enforce-consistent-important-position": ["warn"],
      "better-tailwindcss/enforce-shorthand-classes": ["warn"],
      "better-tailwindcss/no-duplicate-classes": ["warn"],
      "better-tailwindcss/no-deprecated-classes": ["warn"],
      "better-tailwindcss/no-unnecessary-whitespace": ["warn"],

      // Correctness rules.
      // For some reason, some Nuxt UI classes aren't recognized by the plugin.
      // So keep the `no-unregistered-classes` rule disabled for now.
      "better-tailwindcss/no-unregistered-classes": ["off"],
      "better-tailwindcss/no-conflicting-classes": ["off"],
      "better-tailwindcss/no-restricted-classes": ["off"],
    },
  },
  vuePrettierEslintConfig,
  vueTsConfigs.recommended,
);
