import { defineSetupVue3 } from "@histoire/plugin-vue";

import Wrapper from "./.histoire/Wrapper.vue";

import "./.histoire/styles.css";

export const setupVue3 = defineSetupVue3(({ addWrapper }) => {
  addWrapper(Wrapper);
});
