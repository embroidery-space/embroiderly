import { propertyGroups as cleanOrderPropertyGroups } from "stylelint-config-clean-order";

/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-config-recommended-vue", "stylelint-config-clean-order"],
  rules: {
    // CSS modules localize animation names; `global(name)` keeps a global `@keyframes` name.
    "function-no-unknown": [true, { ignoreFunctions: ["global"] }],
    "declaration-property-value-no-unknown": [true, { ignoreProperties: { animation: ["/^global\\(/"] } }],

    "no-unknown-animations": true,
    "no-unknown-custom-media": true,

    "import-notation": "string",
    "alpha-value-notation": "percentage",

    "font-weight-notation": ["numeric", { ignore: ["relative"] }],
    "unit-disallowed-list": ["cm", "mm", "Q", "in", "pc", "pt"],

    "custom-property-empty-line-before": null,

    "order/properties-order": cleanOrderPropertyGroups.map((properties) => ({ properties, emptyLineBefore: "always" })),
  },
};
