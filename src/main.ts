import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate";
import { PrimeVue } from "@primevue/core";
import { Tooltip, ConfirmationService, DialogService } from "primevue";

import "uno.css";
import { NordTheme } from "./assets/theme";

import { fluent } from "./fluent";
import { initLogger } from "./logger";
import App from "./App.vue";

initLogger();

const pinia = createPinia();
pinia.use(piniaPluginPersistedState);

const app = createApp(App);
app.use(pinia);
app.use(fluent);
app.use(PrimeVue, {
  theme: {
    preset: NordTheme,
    options: {
      cssLayer: {
        // The name of the CSS layer where the Primevue styles should be injected.
        name: "components",
        // The order of the CSS layers injected by UnoCSS.
        order: "base, icons, shortcuts, components, utilities",
      },
    },
  },
});
app.use(ConfirmationService);
app.use(DialogService);
app.directive("tooltip", Tooltip);

app.config.errorHandler = (err, _instance, info) => {
  error(`Error (${info}): ${err}`);
};
app.config.warnHandler = (msg, _instance, trace) => {
  warn(`Warning: ${msg}.\nTrace: ${trace}`);
};

app.mount("#app");
