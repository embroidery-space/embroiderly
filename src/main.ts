import { createApp } from "vue";

import PrimeVue from "primevue/config";
import { Tooltip, ConfirmationService, DialogService, ToastService } from "primevue";

import "virtual:uno.css";
import { NordTheme } from "./assets/theme/";

import { pinia } from "./stores/";
import { ShortcutsDirective } from "./directives/";
import { fluent } from "./fluent.ts";
import { initLogger } from "./logger.ts";
import App from "./App.vue";

initLogger();

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
  pt: {
    dialog: { root: { style: { maxWidth: "90%" } } },
    confirmdialog: {
      message: {
        style: {
          // This is needed to allow line breaks (`\n`) in the confirmation dialog message.
          whiteSpace: "pre-line",
        },
      },
    },
  },
});
app.use(ConfirmationService);
app.use(DialogService);
app.use(ToastService);
app.directive("tooltip", Tooltip);
app.directive("shortcuts", ShortcutsDirective);

app.config.errorHandler = (err, _instance, info) => {
  error(`Error (${info}): ${err}`);
};
app.config.warnHandler = (msg, _instance, trace) => {
  warn(`Warning: ${msg}.\nTrace: ${trace}`);
};

app.mount("#app");
