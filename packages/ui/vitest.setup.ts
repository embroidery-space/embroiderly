import { addCollection } from "@iconify/vue";
import lucideIcons from "@iconify-json/lucide/icons.json";
import { beforeEach } from "vitest";

import "./src/index.css";

// Load Lucide icons offline.
addCollection(lucideIcons);

beforeEach(() => {
  // @ts-expect-error `vue3-snapshot-serializer` currently doesn't provide any typings.
  globalThis.vueSnapshots = {
    formatter: "classic",

    removeComments: true,
    regexToRemoveAttributes: /style/,

    stubs: ["style"],
  };
});
