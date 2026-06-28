import { fileURLToPath, URL } from "node:url";

import { includeIgnoreFile } from "@eslint/compat";
import eslintComments from "@eslint-community/eslint-plugin-eslint-comments";
import vueI18n from "@intlify/eslint-plugin-vue-i18n";
import vitest from "@vitest/eslint-plugin";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import { getDefaultSelectors as getDefaultBetterTailwindcssSelectors } from "eslint-plugin-better-tailwindcss/defaults";
import importX from "eslint-plugin-import-x";
import noOnlyTests from "eslint-plugin-no-only-tests";
import oxlint from "eslint-plugin-oxlint";
import vue from "eslint-plugin-vue";
import * as wdio from "eslint-plugin-wdio";
import yml from "eslint-plugin-yml";

export default defineConfigWithVueTs(
  // Common options.
  includeIgnoreFile(fileURLToPath(new URL(".gitignore", import.meta.url))),

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

  // I18n.
  {
    files: ["**/*.vue"],
    ignores: ["**/*.story.vue", "**/story/*.vue"],
    plugins: {
      "vue-i18n": vueI18n,
      "eslint-comments": eslintComments,
    },
    rules: {
      "vue-i18n/no-raw-text": [
        "error",
        {
          attributes: {
            "/.+/": [
              "title",
              "label",
              "description",
              "help",
              "hint",
              "aria-label",
              "aria-placeholder",
              "placeholder",
              "alt",
            ],
          },
        },
      ],
      "eslint-comments/no-restricted-disable": ["error", "vue-i18n/no-raw-text"],
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

  // Imports organization.
  {
    files: ["**/*.{js,ts,vue}"],
    plugins: { "import-x": importX },
    rules: {
      "import-x/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          pathGroups: [
            {
              pattern: "{@embroiderly/**,@tauri-apps/**}",
              group: "external",
              position: "before",
            },
            {
              pattern: "~*/**",
              group: "internal",
            },
            {
              pattern: "virtual:*",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc", // Value imports go first...
            orderImportKind: "desc", // ...then go type imports.
            caseInsensitive: true,
          },
        },
      ],
      "import-x/consistent-type-specifier-style": ["warn", "prefer-top-level"],
    },
  },

  // TailwindCSS classes validation.
  {
    files: ["app/src/**/*.vue"],
    extends: [betterTailwindcss.configs["recommended"]],
    settings: {
      "better-tailwindcss": {
        entryPoint: fileURLToPath(new URL("app/src/assets/styles/index.css", import.meta.url)),
        selectors: [
          ...getDefaultBetterTailwindcssSelectors(),
          {
            kind: "attribute",
            match: [{ type: "objectValues" }],
            name: "^v-bind:ui$",
          },
        ],
      },
    },
  },
  {
    files: ["packages/ui/src/**/*.vue", "packages/ui/src/**/*.theme.ts"],
    extends: [betterTailwindcss.configs["recommended"]],
    settings: {
      "better-tailwindcss": {
        entryPoint: fileURLToPath(new URL("packages/ui/src/index.css", import.meta.url)),
      },
    },
  },
  // Disable consistent line wrapping for app and UI story files.
  {
    files: ["app/src/**/*.vue", "packages/ui/src/**/*.story.vue"],
    rules: {
      "better-tailwindcss/enforce-consistent-line-wrapping": "off",
    },
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
