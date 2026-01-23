<template>
  <Story id="design-tokens" group="general" title="Design Tokens" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <div class="space-y-6">
        <h3 class="text-lg font-semibold mb-3">Colors</h3>
        <div class="flex gap-x-2 items-center">
          <span class="text-primary font-bold px-4 py-1.5 inline-block">Primary</span>
          <span class="text-error font-bold px-4 py-1.5 inline-block">Error</span>
          <span class="text-warning font-bold px-4 py-1.5 inline-block">Warning</span>
          <span class="text-success font-bold px-4 py-1.5 inline-block">Success</span>
          <span class="text-info font-bold px-4 py-1.5 inline-block">Info</span>
          <span class="text-help font-bold px-4 py-1.5 inline-block">Help</span>
        </div>

        <h3 class="text-lg font-semibold mb-3">Text</h3>
        <div class="flex gap-x-2 items-center">
          <span class="text-dimmed font-bold px-4 py-1.5 inline-block">Dimmed</span>
          <span class="text-muted font-bold px-4 py-1.5 inline-block">Muted</span>
          <span class="text-toned font-bold px-4 py-1.5 inline-block">Toned</span>
          <span class="text-default font-bold px-4 py-1.5 inline-block">Text</span>
          <span class="text-highlighted font-bold px-4 py-1.5 inline-block">Highlighted</span>
          <span class="text-inverted bg-inverted font-bold px-4 py-1.5 inline-block rounded-md">Inverted</span>
        </div>

        <h3 class="text-lg font-semibold mb-3">Background</h3>
        <div class="flex gap-x-2 items-center">
          <div class="bg-default font-bold px-4 py-1.5 inline-block rounded-md">Default</div>
          <div class="bg-muted font-bold px-4 py-1.5 inline-block rounded-md">Muted</div>
          <div class="bg-elevated font-bold px-4 py-1.5 inline-block rounded-md">Elevated</div>
          <div class="bg-accented font-bold px-4 py-1.5 inline-block rounded-md">Accented</div>
          <div class="bg-inverted text-inverted font-bold px-4 py-1.5 inline-block rounded-md">Inverted</div>
        </div>

        <h3 class="text-lg font-semibold mb-3">Border</h3>
        <div class="flex gap-x-2 items-center">
          <div class="border border-default font-bold px-4 py-1.5 inline-block rounded-md">Default</div>
          <div class="border border-muted font-bold px-4 py-1.5 inline-block rounded-md">Muted</div>
          <div class="border border-accented font-bold px-4 py-1.5 inline-block rounded-md">Accented</div>
          <div class="border border-inverted font-bold px-4 py-1.5 inline-block rounded-md">Inverted</div>
        </div>

        <h3 class="text-lg font-semibold mb-3">Radius</h3>
        <div class="flex gap-x-2 items-center">
          <div class="font-bold px-4 py-1.5 inline-block border-2 rounded-none">none</div>
          <div class="font-bold px-4 py-1.5 inline-block border-2 rounded-xs">xs</div>
          <div class="font-bold px-4 py-1.5 inline-block border-2 rounded-sm">sm</div>
          <div class="font-bold px-4 py-1.5 inline-block border-2 rounded-md">md</div>
          <div class="font-bold px-4 py-1.5 inline-block border-2 rounded-lg">lg</div>
          <div class="font-bold px-4 py-1.5 inline-block border-2 rounded-xl">xl</div>
          <div class="font-bold px-4 py-1.5 inline-block border-2 rounded-2xl">2xl</div>
          <div class="font-bold px-4 py-1.5 inline-block border-2 rounded-3xl">3xl</div>
        </div>
      </div>
    </Variant>
  </Story>
</template>
