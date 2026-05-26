<script setup lang="ts">
import { Button, Icon, ScrollArea } from "@embroiderly/ui";
import { resolveResource } from "@tauri-apps/api/path";
import { openPath } from "@tauri-apps/plugin-opener";

import { computed } from "vue";

import { IconExternalLink, IconFileCreate, IconFileOpen } from "~/assets/icons/";
import { useEditorModals, useI18n } from "~/composables/";
import { Fabric } from "~/lib/pattern/";
import { usePatternFileStore } from "~/stores/";
import { useSettingsStore } from "~/stores/";

const patternFileStore = usePatternFileStore();
const settingsStore = useSettingsStore();

const modals = useEditorModals();

const { fluent } = useI18n();

interface InfoSection {
  title: string;
  items: InfoItemOptions[];
}

interface InfoItemOptions {
  title: string;
  text?: string;
  href?: string;
  target?: "_self" | "_blank" | "_parent" | "_top";
  command?: () => void;
}

const infoSections = computed<InfoSection[]>(() => [
  {
    title: fluent.$t("welcome-section-customization"),
    items: [
      {
        title: fluent.$t("welcome-customization-settings-title"),
        text: fluent.$t("welcome-customization-settings-descr"),
        command: settingsStore.openSettingsModal,
      },
    ],
  },
  {
    title: fluent.$t("welcome-section-info"),
    items: [
      __TAURI__
        ? {
            title: fluent.$t("welcome-info-docs-title"),
            text: fluent.$t("welcome-info-docs-descr"),
            async command() {
              const documentPath = await resolveResource(`help/embroiderly.${settingsStore.ui.language}.pdf`);
              await openPath(documentPath);
            },
          }
        : {
            title: fluent.$t("welcome-info-docs-title"),
            text: fluent.$t("welcome-info-docs-descr"),
            href: "https://docs.embroiderly.niusia.me",
            target: "_blank",
          },
    ],
  },
  {
    title: fluent.$t("welcome-section-help"),
    items: [
      { title: fluent.$t("welcome-help-tg"), href: "https://t.me/embroiderly", target: "_blank" },
      { title: fluent.$t("welcome-help-fb"), href: "https://facebook.com/groups/embroiderly", target: "_blank" },
    ],
  },
]);

async function openPattern() {
  const patternId = await patternFileStore.openPattern();
  if (patternId) patternFileStore.switchPattern(patternId);
}

function createPattern() {
  modals.patternCreationModal.open({
    fabric: new Fabric(),
    async onSave(fabric) {
      patternFileStore.switchPattern(await patternFileStore.createPattern(fabric));
    },
  });
}
</script>

<template>
  <ScrollArea data-testid="welcome-screen" type="auto" size="sm" class="flex flex-col">
    <div class="flex grow items-center justify-center overflow-hidden">
      <div class="flex w-full max-w-3xl flex-col gap-4 overflow-auto p-4 sm:gap-6 sm:p-6 lg:p-8">
        <span class="text-2xl sm:text-3xl lg:text-4xl">{{ $t("welcome") }}</span>

        <div>
          <i18n tag="p" path="welcome-get-started">
            <template #button-open="{ buttonOpenLabel }">
              <Button variant="link" :label="buttonOpenLabel" class="p-0" @click="openPattern" />
            </template>
            <template #button-create="{ buttonCreateLabel }">
              <Button variant="link" :label="buttonCreateLabel" class="p-0" @click="createPattern" />
            </template>
            <br />
          </i18n>
          <p>{{ $t("welcome-get-started-dnd") }}</p>
        </div>

        <div class="flex flex-wrap justify-between gap-4">
          <div class="flex flex-col gap-y-1">
            <span class="text-lg">{{ $t("welcome-section-starting") }}</span>
            <div class="flex max-w-max flex-col gap-y-1">
              <Button
                variant="ghost"
                :icon="IconFileCreate"
                :label="$t('welcome-create-pattern')"
                class="justify-start"
                @click="createPattern"
              />
              <Button
                variant="ghost"
                :icon="IconFileOpen"
                :label="$t('welcome-open-pattern')"
                class="justify-start"
                @click="openPattern"
              />
            </div>
          </div>

          <div class="flex flex-col gap-y-5">
            <div v-for="section in infoSections" :key="section.title" class="flex flex-col gap-1">
              <span class="text-lg">{{ section.title }}</span>
              <template v-for="item in section.items" :key="item.title">
                <a
                  v-if="item.href"
                  :href="item.href"
                  :target="item.target"
                  rel="noopener noreferrer"
                  class="block rounded-md p-2 transition-colors duration-initial hover:cursor-pointer hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <span class="flex items-center gap-2 font-medium text-primary">
                    {{ item.title }}
                    <Icon :name="IconExternalLink" />
                  </span>
                  <span v-if="item.text">{{ item.text }}</span>
                </a>
                <div
                  v-else
                  tabindex="0"
                  class="rounded-md p-2 transition-colors duration-initial hover:cursor-pointer hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  @click="item?.command"
                >
                  <span class="flex items-center gap-2 font-medium text-primary">{{ item.title }}</span>
                  <span v-if="item.text">{{ item.text }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full py-2 text-center text-xs">
      {{ $t("app-credits") }}
    </div>
  </ScrollArea>
</template>
