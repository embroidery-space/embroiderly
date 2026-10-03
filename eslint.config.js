import { fileURLToPath, URL } from "node:url";

import vitest from "@vitest/eslint-plugin";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import noOnlyTests from "eslint-plugin-no-only-tests";
import oxlint from "eslint-plugin-oxlint";
import vue from "eslint-plugin-vue";
import * as wdio from "eslint-plugin-wdio";
import yml from "eslint-plugin-yml";
import { includeIgnoreFile } from "eslint/config";

export default defineConfigWithVueTs(
  // Common options.
  includeIgnoreFile(
    [
      fileURLToPath(new URL(".gitignore", import.meta.url)),
      fileURLToPath(new URL("packages/ui/.gitignore", import.meta.url)),
    ],
    { gitignoreResolution: true },
  ),

  // Vue.js configs.
  vue.configs["flat/recommended"],
  vueTsConfigs.recommended,
  {
    files: ["**/*.vue"],
    rules: {
      "vue/block-order": ["error", { order: ["script", "template", "style"] }],
      "vue/define-macros-order": [
        "error",
        { order: ["defineOptions", "defineModel", "defineProps", "defineEmits", "defineSlots"] },
      ],
      "vue/define-props-declaration": ["error", "type-based"],
      "vue/define-emits-declaration": ["error", "type-literal"],
    },
  },
  {
    files: ["packages/ui/**/*.{ts,vue}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",

      "vue/require-default-prop": "off",
      "vue/multi-word-component-names": "off",
      "vue/no-reserved-component-names": "off",

      "vue/require-explicit-slots": "error",
    },
  },

  // Testing.
  {
    files: ["**/*.test.ts", "**/*.spec.ts", "docs/.screenshots/specs/**/*.ts"],
    plugins: { "no-only-tests": noOnlyTests },
    rules: {
      "no-only-tests/no-only-tests": "error",
    },
  },
  {
    files: ["app/src/**/*.test.ts", "packages/**/*.spec.ts"],
    extends: [vitest.configs["recommended"]],
  },
  {
    files: ["app/src/**/*.spec.ts"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: 'CallExpression[callee.object.name="page"][callee.property.name="render"]',
          message:
            "Use a custom `renderComponent()` from `~test-utils/render-component.ts` utility instead of `page.render()`.",
        },
      ],
    },
  },
  {
    files: ["app/tests/e2e/**/*.ts", "docs/.screenshots/**/*.ts"],
    extends: [wdio.configs["flat/recommended"]],
  },

  // YAML validation.
  {
    files: ["**/*.yml"],
    extends: [yml.configs.standard, yml.configs.prettier],
    rules: {
      "yml/no-empty-mapping-value": "off",
    },
  },

  ...oxlint.buildFromOxlintConfigFile(".oxlintrc.json"),
  skipFormatting,
);
