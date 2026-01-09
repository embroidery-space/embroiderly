<template>
  <EditorWorkspaceLayout data-testid="welcome-screen">
    <div class="flex min-w-1/2 flex-col gap-6 overflow-auto p-8">
      <span class="text-4xl">{{ $t("welcome") }}</span>

      <div>
        <i18n tag="p" path="welcome-get-started">
          <template #button-open="{ buttonOpenLabel }">
            <UButton variant="link" :label="buttonOpenLabel" class="p-0" @click="openPattern" />
          </template>
          <template #button-create="{ buttonCreateLabel }">
            <UButton variant="link" :label="buttonCreateLabel" class="p-0" @click="createPattern" />
          </template>
          <br />
        </i18n>
        <p>{{ $t("welcome-get-started-dnd") }}</p>
      </div>

      <div class="flex flex-wrap justify-between gap-4">
        <div class="flex flex-col gap-y-1">
          <span class="text-lg">{{ $t("welcome-section-starting") }}</span>
          <div class="flex max-w-max flex-col gap-y-1">
            <UButton
              variant="ghost"
              icon="i-lucide:file-plus"
              :label="$t('welcome-create-pattern')"
              class="justify-start"
              @click="createPattern"
            />
            <UButton
              variant="ghost"
              icon="i-lucide:file-up"
              :label="$t('welcome-open-pattern')"
              class="justify-start"
              @click="openPattern"
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
              class="rounded-md p-2 transition-colors duration-initial hover:cursor-pointer hover:bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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

    <template #footer>
      <div class="w-full py-2 text-center text-xs">
        {{ $t("app-credits") }}
      </div>
    </template>
  </EditorWorkspaceLayout>
</template>

<script setup lang="ts">
  import { resolveResource } from "@tauri-apps/api/path";
  import { openPath, openUrl } from "@tauri-apps/plugin-opener";

  import { computed } from "vue";
  import { useRouter } from "vue-router";

  import { useEditorModals } from "#pattern-editor/composables/";
  import { Fabric } from "#pattern-editor/lib/pattern/";
  import { usePatternFileStore } from "#pattern-editor/stores/";
  import { useI18n } from "#shared/composables/";
  import { useSettingsStore } from "#shared/stores/";

  import { EditorWorkspaceLayout } from "./layout/";

  const router = useRouter();

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
    url?: string;
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
        {
          title: fluent.$t("welcome-info-docs-title"),
          text: fluent.$t("welcome-info-docs-descr"),
          async command() {
            const documentPath = await resolveResource(`help/embroiderly.${settingsStore.ui.language}.pdf`);
            await openPath(documentPath);
          },
        },
      ],
    },
    {
      title: fluent.$t("welcome-section-help"),
      items: [
        { title: fluent.$t("welcome-help-tg"), url: "https://t.me/embroiderly" },
        { title: fluent.$t("welcome-help-fb"), url: "https://facebook.com/groups/embroiderly" },
      ],
    },
  ]);

  function handleInfoItemClick(item: InfoItemOptions) {
    if (item.url) openUrl(item.url);
    if (item.command) item.command();
  }

  async function openPattern() {
    const patternId = await patternFileStore.openPattern();
    router.push({ name: "pattern-editor", params: { patternId } });
  }

  async function createPattern() {
    modals.fabricModal.open({
      fabric: Fabric.default(),
      async onSave(fabric) {
        const patternId = await patternFileStore.createPattern(fabric);
        router.push({ name: "pattern-editor", params: { patternId } });
      },
    });
  }
</script>
