/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-recommended-vue", "stylelint-config-clean-order"],
  rules: {
    // CSS modules localize animation names; `global(name)` keeps a global `@keyframes` name.
    "function-no-unknown": [true, { ignoreFunctions: ["global"] }],
    "declaration-property-value-no-unknown": [true, { ignoreProperties: { animation: ["/^global\\(/"] } }],
  },
};
