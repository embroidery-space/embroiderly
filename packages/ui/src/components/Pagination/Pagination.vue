<script setup lang="ts">
import { useForwardPropsEmits } from "reka-ui";
import type { PaginationRootEmits, PaginationRootProps } from "reka-ui";
import { Pagination } from "reka-ui/namespaced";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { useLocale } from "../../composables/useLocale.ts";
import Button from "../Button/Button.vue";
import ButtonIcon from "../ButtonIcon/ButtonIcon.vue";

export type PaginationProps = PaginationRootProps;
export type PaginationEmits = PaginationRootEmits;

const props = defineProps<PaginationProps>();
const emit = defineEmits<PaginationEmits>();

const forwarded = useForwardPropsEmits(props, emit);

const { icons } = useComponentIcons();
const locale = useLocale();
</script>

<template>
  <Pagination.Root v-bind="forwarded" data-slot="root">
    <Pagination.List data-slot="list" :class="$style.list">
      <template #default="{ items }">
        <Pagination.First as-child>
          <ButtonIcon
            square
            variant="outline"
            color="neutral"
            :icon="icons.chevronsLeft"
            data-slot="first"
            :tooltip="locale.messages.pagination.firstPage"
          />
        </Pagination.First>

        <Pagination.Prev as-child>
          <ButtonIcon
            square
            variant="outline"
            color="neutral"
            :icon="icons.chevronLeft"
            data-slot="prev"
            :tooltip="locale.messages.pagination.prevPage"
          />
        </Pagination.Prev>

        <template v-for="(item, index) in items" :key="`${item.type}-${item.type === 'page' ? item.value : index}`">
          <Pagination.ListItem v-if="item.type === 'page'" as-child :value="item.value">
            <Button
              square
              :variant="item.value === props.page ? 'solid' : 'outline'"
              :color="item.value === props.page ? 'primary' : 'neutral'"
              :label="String(item.value)"
              data-slot="item"
              :class="$style.item"
            />
          </Pagination.ListItem>
          <Pagination.Ellipsis v-else as-child>
            <Button
              square
              variant="outline"
              color="neutral"
              :icon="icons.ellipsis"
              :disabled="disabled"
              data-slot="ellipsis"
            />
          </Pagination.Ellipsis>
        </template>

        <Pagination.Next as-child>
          <ButtonIcon
            square
            variant="outline"
            color="neutral"
            :icon="icons.chevronRight"
            data-slot="next"
            :tooltip="locale.messages.pagination.nextPage"
          />
        </Pagination.Next>

        <Pagination.Last as-child>
          <ButtonIcon
            square
            variant="outline"
            color="neutral"
            :icon="icons.chevronsRight"
            data-slot="last"
            :tooltip="locale.messages.pagination.lastPage"
          />
        </Pagination.Last>
      </template>
    </Pagination.List>
  </Pagination.Root>
</template>

<style module>
.list {
  display: flex;
  gap: calc(var(--spacing) * 1);
  align-items: center;
}

.item {
  width: calc(var(--spacing) * 7);
  height: calc(var(--spacing) * 7);
}
</style>
