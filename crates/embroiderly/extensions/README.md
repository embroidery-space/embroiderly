# Browser Extensions (Windows-only)

Place here builds of those browser extensions that you want to use during development.

It is recommended to add [Vue.js DevTools](https://devtools.vuejs.org) and [Pixi.js DevTools](https://pixijs.io/devtools) extensions.
You can place their builds in the `extensions/vuejs-devtools` and `extensions/pixijs-devtools` directories, respectively.

You can then run the application with `cargo tauri dev --features debug` to enable these extensions.
