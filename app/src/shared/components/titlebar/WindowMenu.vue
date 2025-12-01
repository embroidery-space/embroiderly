<template>
  <RMenubarRoot class="flex grow items-center gap-x-2">
    <RMenubarMenu v-for="(item, index) in items" :key="index">
      <template v-if="item.visible !== false">
        <RMenubarTrigger as-child :disabled="item.disabled">
          <UButton
            :label="item.label"
            variant="ghost"
            color="neutral"
            trailing-icon="i-lucide:chevron-down"
            :ui="{ base: 'px-2 py-1 text-default font-normal data-[state=open]:text-primary' }"
          />
        </RMenubarTrigger>

        <RMenubarPortal>
          <RMenubarContent
            align="start"
            :side-offset="8"
            class="min-w-32 rounded-sm border border-default bg-default shadow-lg data-[state=closed]:animate-[scale-out_100ms_ease-in] data-[state=open]:animate-[scale-in_100ms_ease-out]"
          >
            <RMenubarGroup v-if="item.children" class="p-1">
              <template v-for="(childGroup, groupIndex) in normalizeChildren(item.children)" :key="groupIndex">
                <!-- Separator between child groups -->
                <RMenubarSeparator v-if="groupIndex > 0" class="-mx-1 my-1 h-px bg-border" />

                <template v-for="(child, childIndex) in childGroup" :key="childIndex">
                  <!-- Nested sub-menu -->
                  <RMenubarSub v-if="child.children">
                    <RMenubarSubTrigger
                      :disabled="child.disabled"
                      class="group relative flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-default transition-colors outline-none select-none hover:bg-elevated/50 hover:text-highlighted data-disabled:cursor-not-allowed data-disabled:opacity-75 data-highlighted:bg-elevated/50 data-highlighted:text-highlighted data-[state=open]:bg-elevated/50"
                    >
                      <span class="flex-1 truncate">{{ child.label }}</span>
                      <UIcon name="i-lucide:chevron-right" class="ml-auto size-4 shrink-0" />
                    </RMenubarSubTrigger>

                    <RMenubarPortal>
                      <RMenubarSubContent
                        :side-offset="2"
                        class="min-w-32 rounded-md border border-default bg-default p-1 shadow-lg data-[state=closed]:animate-[scale-out_100ms_ease-in] data-[state=open]:animate-[scale-in_100ms_ease-out]"
                      >
                        <template
                          v-for="(subGroup, subGroupIndex) in normalizeChildren(child.children)"
                          :key="subGroupIndex"
                        >
                          <!-- Separator between sub-menu groups -->
                          <RMenubarSeparator v-if="subGroupIndex > 0" class="my-1 h-px bg-border" />

                          <RMenubarItem
                            v-for="(subChild, subChildIndex) in subGroup"
                            :key="subChildIndex"
                            :disabled="subChild.disabled"
                            class="group relative flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-default transition-colors outline-none select-none hover:bg-elevated/50 hover:text-highlighted data-disabled:cursor-not-allowed data-disabled:opacity-75 data-highlighted:bg-elevated/50 data-highlighted:text-highlighted"
                            @select="subChild.onSelect"
                          >
                            <span class="flex-1 truncate">{{ subChild.label }}</span>
                            <div v-if="subChild.kbds" class="ml-auto flex gap-0.5">
                              <UKbd v-for="(kbd, kbdIndex) in subChild.kbds" :key="kbdIndex" :value="kbd" size="sm" />
                            </div>
                          </RMenubarItem>
                        </template>
                      </RMenubarSubContent>
                    </RMenubarPortal>
                  </RMenubarSub>

                  <!-- Regular menu item -->
                  <RMenubarItem
                    v-else
                    :disabled="child.disabled"
                    class="group relative flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-default transition-colors outline-none select-none hover:bg-elevated/50 hover:text-highlighted data-disabled:cursor-not-allowed data-disabled:opacity-75 data-highlighted:bg-elevated/50 data-highlighted:text-highlighted"
                    @select="child.onSelect"
                  >
                    <span class="flex-1 truncate">{{ child.label }}</span>
                    <div v-if="child.kbds" class="ml-auto flex gap-0.5">
                      <UKbd v-for="(kbd, kbdIndex) in child.kbds" :key="kbdIndex" :value="kbd" size="sm" />
                    </div>
                  </RMenubarItem>
                </template>
              </template>
            </RMenubarGroup>
          </RMenubarContent>
        </RMenubarPortal>
      </template>
    </RMenubarMenu>
  </RMenubarRoot>
</template>

<script setup lang="ts">
  export interface WindowMenuItem {
    label: string;
    kbds?: string[];
    disabled?: boolean;
    visible?: boolean;
    onSelect?: (e: Event) => void;
    children?: WindowMenuItem[] | WindowMenuItem[][];
  }

  interface Props {
    items: WindowMenuItem[];
  }

  defineProps<Props>();

  /**
   * Normalizes children to always be a 2D array for consistent rendering.
   * Single array becomes a single group, 2D array remains as-is.
   */
  function normalizeChildren(children: WindowMenuItem[] | WindowMenuItem[][]): WindowMenuItem[][] {
    if (children.length === 0) return [];
    return Array.isArray(children[0]) ? (children as WindowMenuItem[][]) : [children as WindowMenuItem[]];
  }
</script>
