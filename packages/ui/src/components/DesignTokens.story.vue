<template>
  <Story id="design-tokens" group="general" title="Design Tokens" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <div class="space-y-6">
        <h3 class="mb-3 text-lg font-semibold">Colors</h3>
        <div class="flex items-center gap-x-2">
          <span class="inline-block px-4 py-1.5 font-bold text-primary">Primary</span>
          <span class="inline-block px-4 py-1.5 font-bold text-error">Error</span>
          <span class="inline-block px-4 py-1.5 font-bold text-warning">Warning</span>
          <span class="inline-block px-4 py-1.5 font-bold text-success">Success</span>
          <span class="inline-block px-4 py-1.5 font-bold text-info">Info</span>
          <span class="inline-block px-4 py-1.5 font-bold text-help">Help</span>
        </div>

        <h3 class="mb-3 text-lg font-semibold">Text</h3>
        <div class="flex items-center gap-x-2">
          <span class="inline-block px-4 py-1.5 font-bold text-dimmed">Dimmed</span>
          <span class="inline-block px-4 py-1.5 font-bold text-muted">Muted</span>
          <span class="inline-block px-4 py-1.5 font-bold text-toned">Toned</span>
          <span class="inline-block px-4 py-1.5 font-bold text-default">Text</span>
          <span class="inline-block px-4 py-1.5 font-bold text-highlighted">Highlighted</span>
          <span class="inline-block rounded-md bg-inverted px-4 py-1.5 font-bold text-inverted">Inverted</span>
        </div>

        <h3 class="mb-3 text-lg font-semibold">Background</h3>
        <div class="flex items-center gap-x-2">
          <div class="inline-block rounded-md bg-default px-4 py-1.5 font-bold">Default</div>
          <div class="inline-block rounded-md bg-muted px-4 py-1.5 font-bold">Muted</div>
          <div class="inline-block rounded-md bg-elevated px-4 py-1.5 font-bold">Elevated</div>
          <div class="inline-block rounded-md bg-accented px-4 py-1.5 font-bold">Accented</div>
          <div class="inline-block rounded-md bg-inverted px-4 py-1.5 font-bold text-inverted">Inverted</div>
        </div>

        <h3 class="mb-3 text-lg font-semibold">Border</h3>
        <div class="flex items-center gap-x-2">
          <div class="inline-block rounded-md border border-default px-4 py-1.5 font-bold">Default</div>
          <div class="inline-block rounded-md border border-muted px-4 py-1.5 font-bold">Muted</div>
          <div class="inline-block rounded-md border border-accented px-4 py-1.5 font-bold">Accented</div>
          <div class="inline-block rounded-md border border-inverted px-4 py-1.5 font-bold">Inverted</div>
        </div>

        <h3 class="mb-3 text-lg font-semibold">Radius</h3>
        <div class="flex items-center gap-x-2">
          <div class="inline-block rounded-none border-2 px-4 py-1.5 font-bold">none</div>
          <div class="inline-block rounded-xs border-2 px-4 py-1.5 font-bold">xs</div>
          <div class="inline-block rounded-sm border-2 px-4 py-1.5 font-bold">sm</div>
          <div class="inline-block rounded-md border-2 px-4 py-1.5 font-bold">md</div>
          <div class="inline-block rounded-lg border-2 px-4 py-1.5 font-bold">lg</div>
          <div class="inline-block rounded-xl border-2 px-4 py-1.5 font-bold">xl</div>
          <div class="inline-block rounded-2xl border-2 px-4 py-1.5 font-bold">2xl</div>
          <div class="inline-block rounded-3xl border-2 px-4 py-1.5 font-bold">3xl</div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
