<script setup lang="ts">
import { Button, Icon } from "@embroiderly/ui";
import { resolveResource } from "@tauri-apps/api/path";
import { openPath } from "@tauri-apps/plugin-opener";

import { computed } from "vue";

import { IconExternalLink, IconFileCreate, IconFileOpen } from "~/assets/icons/";
import { useEditorModals, useI18n } from "~/composables/";
import { Fabric } from "~/lib/pattern/";
import { useSettingsStore } from "~/settings/";
import { usePatternFileStore } from "~/stores/";

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
        text: fluent.$t("welcome-customization-settings-description"),
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
            text: fluent.$t("welcome-info-docs-description"),
            async command() {
              const documentPath = await resolveResource(`help/embroiderly.${settingsStore.ui.language}.pdf`);
              await openPath(documentPath);
            },
          }
        : {
            title: fluent.$t("welcome-info-docs-title"),
            text: fluent.$t("welcome-info-docs-description"),
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
  modals.fabricModal.open({
    fabric: new Fabric(),
    mode: "create",
    async onSave(fabric) {
      patternFileStore.switchPattern(await patternFileStore.createPattern(fabric));
    },
  });
}
</script>

<template>
  <div data-testid="welcome-screen" :class="$style.root">
    <div :class="$style.main">
      <div :class="$style.content">
        <span :class="$style.title">{{ $t("welcome") }}</span>

        <div>
          <i18n tag="p" path="welcome-get-started">
            <template #button-open="{ buttonOpenLabel }">
              <Button variant="link" :label="buttonOpenLabel" :class="$style.link" @click="openPattern" />
            </template>
            <template #button-create="{ buttonCreateLabel }">
              <Button variant="link" :label="buttonCreateLabel" :class="$style.link" @click="createPattern" />
            </template>
          </i18n>
          <p>{{ $t("welcome-get-started-dnd") }}</p>
        </div>

        <div :class="$style.sections">
          <div :class="$style.section">
            <span :class="$style.heading">{{ $t("welcome-section-starting") }}</span>
            <div :class="$style.actions">
              <Button
                variant="ghost"
                :icon="IconFileCreate"
                :label="$t('welcome-create-pattern')"
                :class="$style.action"
                @click="createPattern"
              />
              <Button
                variant="ghost"
                :icon="IconFileOpen"
                :label="$t('welcome-open-pattern')"
                :class="$style.action"
                @click="openPattern"
              />
            </div>
          </div>

          <div :class="$style.info">
            <div v-for="section in infoSections" :key="section.title" :class="$style.infoSection">
              <span :class="$style.heading">{{ section.title }}</span>
              <template v-for="item in section.items" :key="item.title">
                <a
                  v-if="item.href"
                  :href="item.href"
                  :target="item.target"
                  rel="noopener noreferrer"
                  :class="$style.item"
                >
                  <span :class="$style.itemTitle">
                    {{ item.title }}
                    <Icon :name="IconExternalLink" />
                  </span>
                  <span v-if="item.text">{{ item.text }}</span>
                </a>
                <div v-else tabindex="0" :class="$style.item" @click="item?.command">
                  <span :class="$style.itemTitle">{{ item.title }}</span>
                  <span v-if="item.text">{{ item.text }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <i18n tag="p" path="app-credits" :class="$style.credits">
      <template #tryzub>
        <!-- eslint-disable-next-line vue-i18n/no-raw-text -->
        <span :class="$style.tryzub">A</span>
      </template>
    </i18n>
  </div>
</template>

<style module>
.root {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.main {
  display: flex;
  flex-grow: 1;
  align-items: center;
  justify-content: center;

  padding: calc(var(--spacing) * 4);

  @media (width >= 40rem) {
    padding: calc(var(--spacing) * 6);
  }
}

.content {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
  min-width: 50%;

  @media (width >= 40rem) {
    gap: calc(var(--spacing) * 6);
  }
}

.title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-medium);
  line-height: var(--text-2xl--line-height);

  @media (width >= 40rem) {
    font-size: var(--text-3xl);
    line-height: var(--text-3xl--line-height);
  }

  @media (width >= 64rem) {
    font-size: var(--text-4xl);
    line-height: var(--text-4xl--line-height);
  }
}

button.link[data-slot="base"] {
  padding: 0;
  font-size: var(--text-base);
  line-height: var(--text-base--line-height);
}

.sections {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 4);
  justify-content: space-between;
}

.section {
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--spacing) * 1);
}

.heading {
  font-size: var(--text-lg);
  line-height: var(--text-lg--line-height);
}

.actions {
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--spacing) * 1);
  max-width: max-content;
}

button.action[data-slot="base"] {
  justify-content: flex-start;
  font-size: var(--text-base);
  line-height: var(--text-base--line-height);
}

.info {
  display: flex;
  flex-direction: column;
  row-gap: calc(var(--spacing) * 5);
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 1);
}

.item {
  display: block;

  padding: calc(var(--spacing) * 2);
  border-radius: var(--radius-md);

  transition-timing-function: var(--default-transition-timing-function);
  transition-duration: initial;
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke;

  &:hover {
    cursor: pointer;
    background-color: var(--background-color-elevated);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

.item-title {
  display: flex;
  gap: calc(var(--spacing) * 2);
  align-items: center;

  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
}

.credits {
  margin-block: calc(var(--spacing) * 2);

  font-size: var(--text-xs);
  line-height: var(--text-xs--line-height);
  text-align: center;
  vertical-align: middle;
}

.tryzub {
  font-size: var(--text-lg);
  font-feature-settings: "ss14";
  font-weight: var(--font-weight-semibold);
  line-height: var(--text-lg--line-height);
}
</style>
