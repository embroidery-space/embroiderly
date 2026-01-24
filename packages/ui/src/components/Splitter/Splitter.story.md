# Splitter

A component that divides your layout into resizable sections.

## Purpose

The `Splitter` component provides a way to create resizable panel layouts. It automatically inserts resize handles between panels, simplifying the API while maintaining full customization capabilities.

## Usage

```vue
<template>
  <Splitter direction="horizontal">
    <SplitterPanel :default-size="50">Panel 1</SplitterPanel>
    <SplitterPanel :default-size="50">Panel 2</SplitterPanel>
  </Splitter>
</template>
```
