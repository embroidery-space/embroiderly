import { defineSetupVue3 } from "@histoire/plugin-vue";

import Placeholder from "./.histoire/Placeholder.vue";
import Wrapper from "./.histoire/Wrapper.vue";

import "./.histoire/styles.css";

export const setupVue3 = defineSetupVue3(({ app, addWrapper }) => {
  app.component("Placeholder", Placeholder);

  addWrapper(Wrapper);
});
