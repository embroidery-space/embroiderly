<template>
  <div class="grid grid-flow-col grid-cols-2 grid-rows-2 gap-x-2">
    <FormFieldset :legend="$t('label-count-and-kind')">
      <UFormField :label="$t('label-count')" class="w-full">
        <USelect
          v-model="fabric.spi[0]"
          :items="fabricCounts"
          class="w-full"
          @update:model-value="fabric.spi[1] = $event"
        />
      </UFormField>
      <UFormField :label="$t('label-kind')" class="w-full">
        <USelect v-model="fabric.kind" :items="fabricKinds" class="w-full" />
      </UFormField>
    </FormFieldset>

    <FormFieldset :legend="$t('label-size')">
      <div class="flex gap-4 pb-2">
        <div>
          <UFormField :label="$t('label-width')" class="w-full">
            <UInputNumber
              v-model="fabricSizeFinal.width"
              orientation="vertical"
              :min="0.1"
              :step="fabricSizeMeasurement === 'inches' ? 0.1 : 1"
            />
          </UFormField>
          <UFormField :label="$t('label-height')" class="w-full">
            <UInputNumber
              v-model="fabricSizeFinal.height"
              orientation="vertical"
              :min="0.1"
              :step="fabricSizeMeasurement === 'inches' ? 0.1 : 1"
            />
          </UFormField>
        </div>
        <URadioGroup v-model="fabricSizeMeasurement" :items="fabricSizeOptions" class="mt-6" />
      </div>

      <p>
        {{
          $t("message-total-size", {
            width: fabricSizeFinal.width,
            height: fabricSizeFinal.height,
            widthInches: stitches2inches(fabricSizeFinal.width, fabric.spi[0]),
            heightInches: stitches2inches(fabricSizeFinal.height, fabric.spi[1]),
            widthMm: stitches2mm(fabricSizeFinal.width, fabric.spi[0]),
            heightMm: stitches2mm(fabricSizeFinal.height, fabric.spi[1]),
          })
        }}
      </p>
    </FormFieldset>

    <FormFieldset :legend="$t('label-color')" class="row-start-1 row-end-3 w-md">
      <PaletteList
        :model-value="{ name: fabric.name, color: fabric.color.toHex().substring(1).toUpperCase() }"
        :options="fabricColors"
        :option-value="({ name, color }) => ({ name, color })"
        :display-settings="FABRIC_COLORS_DISPLAY_SETTINGS"
        @update:model-value="
          (value) => {
            if (value) {
              fabric.name = value.name;
              fabric.color = new Color(value.color);
            }
          }
        "
      />
      <p class="mt-2">{{ $t("message-selected-color", { color: fabric.name }) }}</p>
    </FormFieldset>
  </div>
</template>

<script setup lang="ts">
  import { resolveResource } from "@tauri-apps/api/path";
  import { readTextFile } from "@tauri-apps/plugin-fs";
  import { computed, onMounted, reactive, ref, watch } from "vue";
  import { Color } from "pixi.js";
  import { inches2mm, mm2inches, size2stitches, stitches2inches, stitches2mm } from "~/utils/measurement";
  import { Fabric, PaletteItem, PaletteSettings } from "~/core/pattern/";

  const fabric = defineModel<Fabric>({ required: true });

  const fluent = useFluent();

  const fabricCounts = ref([14, 16, 18, 20]);

  const fabricSizeMeasurement = ref<"stitches" | "inches" | "mm">("stitches");
  const fabricSizeFinal = reactive({ width: fabric.value.width, height: fabric.value.height });
  const fabricSizeOptions = computed(() => [
    { label: fluent.$t("label-unit-stitches"), value: "stitches" },
    { label: fluent.$t("label-unit-inches"), value: "inches" },
    { label: fluent.$t("label-unit-mm"), value: "mm" },
  ]);

  watch(fabricSizeMeasurement, (newMeasurement, oldMeasurement) => {
    const { width, height } = fabricSizeFinal;
    switch (newMeasurement) {
      case "stitches": {
        if (oldMeasurement === "inches") {
          fabricSizeFinal.width = size2stitches(width, fabric.value.spi[0]);
          fabricSizeFinal.height = size2stitches(height, fabric.value.spi[1]);
        } else {
          fabricSizeFinal.width = size2stitches(mm2inches(width), fabric.value.spi[0]);
          fabricSizeFinal.height = size2stitches(mm2inches(height), fabric.value.spi[1]);
        }
        break;
      }
      case "inches": {
        if (oldMeasurement === "stitches") {
          fabricSizeFinal.width = stitches2inches(width, fabric.value.spi[0]);
          fabricSizeFinal.height = stitches2inches(height, fabric.value.spi[1]);
        } else {
          fabricSizeFinal.width = mm2inches(width);
          fabricSizeFinal.height = mm2inches(height);
        }
        break;
      }
      case "mm": {
        if (oldMeasurement === "stitches") {
          fabricSizeFinal.width = stitches2mm(width, fabric.value.spi[0]);
          fabricSizeFinal.height = stitches2mm(height, fabric.value.spi[1]);
        } else {
          fabricSizeFinal.width = inches2mm(width);
          fabricSizeFinal.height = inches2mm(height);
        }
        break;
      }
    }
  });

  watch(fabricSizeFinal, (size) => {
    const { width, height } = size;
    switch (fabricSizeMeasurement.value) {
      case "stitches": {
        fabric.value.width = width;
        fabric.value.height = height;
        break;
      }
      case "inches": {
        fabric.value.width = size2stitches(width, fabric.value.spi[0]);
        fabric.value.height = size2stitches(height, fabric.value.spi[1]);
        break;
      }
      case "mm": {
        fabric.value.width = size2stitches(mm2inches(width), fabric.value.spi[0]);
        fabric.value.height = size2stitches(mm2inches(height), fabric.value.spi[1]);
        break;
      }
    }
  });

  const fabricKinds = computed(() => [
    { label: fluent.$t("label-kind-aida"), value: "Aida" },
    { label: fluent.$t("label-kind-evenweave"), value: "Evenweave" },
    { label: fluent.$t("label-kind-linen"), value: "Linen" },
  ]);
  const fabricColors = ref<PaletteItem[]>([]);
  const FABRIC_COLORS_DISPLAY_SETTINGS = new PaletteSettings({
    columnsNumber: 8,
    colorOnly: true,
    showColorBrands: false,
    showColorNumbers: false,
    showColorNames: false,
  });

  onMounted(async () => {
    const fabricColorsPath = await resolveResource("resources/fabric-colors.json");
    const content = await readTextFile(fabricColorsPath);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fabricColors.value = JSON.parse(content).map((color: any) => new PaletteItem(color));
  });
</script>
