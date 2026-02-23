import { beforeEach } from "vitest";

import "./src/index.css";

beforeEach(() => {
  // @ts-expect-error `vue3-snapshot-serializer` currently doesn't provide any typings.
  globalThis.vueSnapshots = {
    formatter: "classic",

    removeComments: true,
    regexToRemoveAttributes: /style/,
  };
});
