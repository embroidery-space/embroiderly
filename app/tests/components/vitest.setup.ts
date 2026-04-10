import "../../src/assets/styles.css";

import { FluentBundle, FluentResource } from "@fluent/bundle";
import { createFluentVue } from "fluent-vue";
import { config } from "vitest-browser-vue";

import enLocale from "virtual:en.ftl";

const bundle = new FluentBundle("en");
bundle.addResource(new FluentResource(enLocale));

config.global.plugins = [createFluentVue({ bundles: [bundle] })];
