<script setup lang="ts">
import { Button, InputDimensions, FormField, FormFieldSet, RadioGroup, Select } from "@embroiderly/ui";

import { Color } from "pixi.js";
import { computed, onMounted, ref } from "vue";
import type { Ref } from "vue";

import { PaletteList } from "~/components/palette/";
import { useEditor, useEditorModals, useI18n } from "~/composables/";
import { Fabric, PaletteSettings, FabricColor, deserializeFabricColors } from "~/lib/pattern/";

import { FabricSize, MeasurementUnit } from "../size.ts";

const fabric = defineModel<Fabric>({ required: true });

const { files } = useEditor();
const { fluent } = useI18n();
const modals = useEditorModals();

const fabricColorOptions: Ref<FabricColor[]> = ref([]);
const fabricCountOptions = ref([14, 16, 18, 20]);
const fabricSizeOptions = computed(() => [
  { label: fluent.$t("unit-stitches"), value: MeasurementUnit.Stitches },
  { label: fluent.$t("unit-inches"), value: MeasurementUnit.Inches },
  { label: fluent.$t("unit-mm"), value: MeasurementUnit.Mm },
]);
const fabricKindOptions = computed(() => [
  { label: fluent.$t("fabric-kind-aida"), value: "Aida" },
  { label: fluent.$t("fabric-kind-evenweave"), value: "Evenweave" },
  { label: fluent.$t("fabric-kind-linen"), value: "Linen" },
]);

const selectedUnit = ref<MeasurementUnit>(MeasurementUnit.Stitches);

const size = computed(() => new FabricSize(fabric.value.width, fabric.value.height, fabric.value.spi));
const sizeInUnit = computed(() => size.value.in(selectedUnit.value));
const sizeInInches = computed(() => size.value.in(MeasurementUnit.Inches));
const sizeInMm = computed(() => size.value.in(MeasurementUnit.Mm));

// The physical size of one stitch in the selected unit, per axis.
// It is used as the input step so arrows/typing always move by a whole stitch.
const step = computed(() => new FabricSize(1, 1, fabric.value.spi).in(selectedUnit.value));

function setDimension(dimension: "width" | "height", value: number) {
  const next = FabricSize.from({ ...sizeInUnit.value, [dimension]: value }, selectedUnit.value, fabric.value.spi);
  fabric.value.width = next.width;
  fabric.value.height = next.height;
}

async function openFabricColorsModal() {
  await modals.fabricColorsModal.open({ colors: fabricColorOptions.value }).result;
  fabricColorOptions.value = deserializeFabricColors(await files.loadFabricColors());
}

onMounted(async () => {
  fabricColorOptions.value = deserializeFabricColors(await files.loadFabricColors());
});
</script>

<template>
  <div :class="$style.root">
    <FormFieldSet :legend="$t('fabric-count-and-kind')">
      <FormField :label="$t('fabric-count')">
        <Select
          v-model="fabric.spi[0]"
          :items="fabricCountOptions"
          data-testid="fabric-count-select"
          @update:model-value="fabric.spi[1] = $event as number"
        />
      </FormField>

      <FormField :label="$t('fabric-kind')">
        <Select v-model="fabric.kind" :items="fabricKindOptions" data-testid="fabric-kind-select" />
      </FormField>
    </FormFieldSet>

    <FormFieldSet :legend="$t('fabric-size')" :class="$style.size">
      <InputDimensions
        :width="sizeInUnit.width"
        :height="sizeInUnit.height"
        data-testid="fabric-dimensions-input"
        :width-field-options="{ label: $t('fabric-width') }"
        :height-field-options="{ label: $t('fabric-height') }"
        :width-input-options="{
          min: 0.1,
          step: step.width,
          stepSnapping: false,
          formatOptions: { maximumFractionDigits: selectedUnit === MeasurementUnit.Inches ? 2 : 0 },
        }"
        :height-input-options="{
          min: 0.1,
          step: step.height,
          stepSnapping: false,
          formatOptions: { maximumFractionDigits: selectedUnit === MeasurementUnit.Inches ? 2 : 0 },
        }"
        @update:width="setDimension('width', $event!)"
        @update:height="setDimension('height', $event!)"
      />

      <RadioGroup
        v-model="selectedUnit"
        data-testid="fabric-unit-radio-group"
        :items="fabricSizeOptions"
        orientation="horizontal"
      />

      <p :class="$style.text">
        {{
          $t("fabric-total-size", {
            width: size.width,
            height: size.height,
            widthInches: sizeInInches.width,
            heightInches: sizeInInches.height,
            widthMm: sizeInMm.width,
            heightMm: sizeInMm.height,
          })
        }}
      </p>
    </FormFieldSet>

    <FormFieldSet :legend="$t('fabric-color')" :class="$style.color">
      <PaletteList
        :model-value="{ name: fabric.name, color: fabric.color.toHex().substring(1).toUpperCase() }"
        :options="fabricColorOptions"
        :option-value="(color) => ({ name: color.name, color: color.color.toHex().substring(1).toUpperCase() })"
        :display-settings="new PaletteSettings({ columnsNumber: 8, colorOnly: true })"
        data-testid="fabric-colors-listbox"
        @update:model-value="
          (value) => {
            const item = Array.isArray(value) ? value[0] : value;
            if (item) {
              fabric.name = item.name;
              fabric.color = new Color(item.color);
            }
          }
        "
      />
      <div :class="$style.selected">
        <p :class="$style.text">{{ $t("fabric-selected-color", { color: fabric.name }) }}</p>
        <Button
          variant="link"
          color="neutral"
          :label="$t('fabric-colors')"
          :class="$style.link"
          @click="openFabricColorsModal"
        />
      </div>
    </FormFieldSet>
  </div>
</template>

<style module>
.root {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  column-gap: calc(var(--spacing) * 4);

  @media (width >= 48rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.size > :not(:last-child) {
  margin-block-end: calc(var(--spacing) * 2);
}

.text {
  font-size: var(--text-sm);
  line-height: var(--text-sm--line-height);
}

.color {
  @media (width >= 48rem) {
    grid-column: 1 / -1;
  }
}

.selected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: calc(var(--spacing) * 2);
}

/* Outweighs the size variants of `Button`. */
button.link[data-slot="base"] {
  padding: 0;
}
</style>
