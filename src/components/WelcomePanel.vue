<template>
  <div class="flex flex-col items-center justify-between">
    <!-- This div is needed to correctly justify containers. -->
    <div></div>

    <div class="max-size-full min-w-1/2 flex flex-col gap-6 overflow-auto p-8">
      <span class="text-4xl">{{ $t("title-welcome") }}</span>

      <i18n tag="span" path="message-get-started">
        <template #button-open="{ buttonOpenLabel }">
          <Button variant="link" :label="buttonOpenLabel" class="p-0" @click="() => patternsStore.openPattern()" />
        </template>
        <template #button-create="{ buttonCreateLabel }">
          <Button variant="link" :label="buttonCreateLabel" class="p-0" @click="() => patternsStore.createPattern()" />
        </template>
      </i18n>

      <div class="flex flex-wrap justify-between gap-4">
        <div class="flex flex-col gap-y-1">
          <span class="text-lg">{{ $t("label-start") }}</span>
          <div class="max-w-max flex flex-col gap-y-1">
            <Button
              text
              icon="i-prime:file-plus"
              :label="$t('label-start-create')"
              pt:root:class="justify-start"
              @click="() => patternsStore.createPattern()"
            />
            <Button
              text
              icon="i-prime:file-arrow-up"
              :label="$t('label-start-open')"
              pt:root:class="justify-start"
              @click="() => patternsStore.openPattern()"
            />
          </div>
        </div>

        <div class="flex flex-col gap-y-5">
          <div v-for="section in infoSections" :key="section.title" class="flex flex-col gap-1">
            <span class="text-lg">{{ section.title }}</span>
            <div
              v-for="item in section.items"
              :key="item.title"
              tabindex="0"
              class="info-item"
              @click="handleInfoItemClick(item)"
            >
              <span class="flex items-center gap-2" :style="{ color: dt('primary.text.color') }">
                {{ item.title }}
                <i v-if="item.url" class="i-prime:external-link"></i>
              </span>
              <span v-if="item.text">{{ item.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full py-2 text-center text-xs">
      {{ $t("message-credits") }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { openUrl } from "@tauri-apps/plugin-opener";
  import { computed } from "vue";
  import { dt } from "@primeuix/themes";
  import { Button } from "primevue";
  import { useFluent } from "fluent-vue";
  import { useSettingsStore } from "#/stores/settings";
  import { usePatternsStore } from "#/stores/patterns";

  const settingsStore = useSettingsStore();
  const patternsStore = usePatternsStore();

  const fluent = useFluent();

  const infoSections = computed<InfoSection[]>(() => [
    {
      title: fluent.$t("label-customize"),
      items: [
        {
          title: fluent.$t("label-customize-settings"),
          text: fluent.$t("message-customize-settings"),
          command: () => settingsStore.openSettings(),
        },
      ],
    },
    {
      title: fluent.$t("label-learn-more"),
      items: [
        {
          title: fluent.$t("label-learn-more-documentation"),
          text: fluent.$t("message-learn-more-documentation"),
          url: "https://embroiderly.niusia.me",
        },
      ],
    },
    {
      title: fluent.$t("label-get-help"),
      items: [{ title: fluent.$t("label-get-help-telegram"), url: "https://t.me/embroiderly" }],
    },
  ]);

  function handleInfoItemClick(item: InfoItemOptions) {
    if (item.url) openUrl(item.url);
    if (item.command) item.command();
  }

  interface InfoSection {
    title: string;
    items: InfoItemOptions[];
  }

  interface InfoItemOptions {
    title: string;
    text?: string;
    url?: string;
    command?: () => void;
  }
</script>

<style scoped>
  .info-item {
    border-radius: var(--p-content-border-radius);
    padding-inline: 0.625rem; /* .px-2.5 */
    padding-block: 0.5rem; /* .py-2 */
    transition: background-color var(--p-transition-duration);
  }

  .info-item:hover {
    cursor: pointer;
    background-color: var(--p-content-hover-background);
  }

  .info-item:focus-visible {
    box-shadow: var(--p-focus-ring-shadow);
    outline: var(--p-focus-ring-width) var(--p-focus-ring-style) var(--p-primary-color);
    outline-offset: var(--p-focus-ring-offset);
  }
</style>
