<template>
  <div class="flex flex-col items-center justify-between">
    <!-- This div is needed to correctly justify containers. -->
    <div></div>
    <UProgress v-if="patternsStore.loading" size="sm" :ui="{ root: 'absolute top-0', base: 'rounded-none' }" />

    <div class="flex min-w-1/2 flex-col gap-6 overflow-auto p-8">
      <span class="text-4xl">{{ $t("title-welcome") }}</span>

      <div>
        <i18n tag="p" path="message-get-started">
          <template #button-open="{ buttonOpenLabel }">
            <UButton variant="link" :label="buttonOpenLabel" class="p-0" @click="() => patternsStore.openPattern()" />
          </template>
          <template #button-create="{ buttonCreateLabel }">
            <UButton
              variant="link"
              :label="buttonCreateLabel"
              class="p-0"
              @click="() => patternsStore.openFabricModal()"
            />
          </template>
          <br />
        </i18n>
        <p>{{ $t("message-get-started-drag-and-drop") }}</p>
      </div>

      <div class="flex flex-wrap justify-between gap-4">
        <div class="flex flex-col gap-y-1">
          <span class="text-lg">{{ $t("label-start") }}</span>
          <div class="flex max-w-max flex-col gap-y-1">
            <UButton
              variant="ghost"
              icon="i-lucide:file-plus"
              :label="$t('label-start-create')"
              class="justify-start"
              @click="() => patternsStore.openFabricModal()"
            />
            <UButton
              variant="ghost"
              icon="i-lucide:file-up"
              :label="$t('label-start-open')"
              class="justify-start"
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
              class="
                rounded-md p-2 transition-colors duration-initial
                hover:cursor-pointer hover:bg-elevated
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
              "
              @click="handleInfoItemClick(item)"
            >
              <span class="flex items-center gap-2 font-medium text-primary">
                {{ item.title }}
                <UIcon v-if="item.url" name="i-lucide:external-link" />
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
          command: () => settingsStore.openSettingsModal(),
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
