---
id: app
group: layout
---

# App

Wraps the application to provide global configurations.

## Usage

This component implements Reka UI [`ConfigProvider`](https://reka-ui.com/docs/utilities/config-provider) and [`TooltipProvider`](https://reka-ui.com/docs/components/tooltip#provider) to provide global configuration to all components.

Wrap the entire application with the `App` component in the root file:

```vue
<template>
  <App>
    <!-- main template -->
  </App>
</template>
```
