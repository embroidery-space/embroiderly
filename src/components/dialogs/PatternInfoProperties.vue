<template>
  <Fluid class="w-xl flex flex-col gap-y-2">
    <FormElement id="title" float :label="$t('label-pattern-title')">
      <InputText v-model="patternInfo.title" />
    </FormElement>
    <FormElement id="author" float :label="$t('label-pattern-author')">
      <InputText v-model="patternInfo.author" />
    </FormElement>
    <FormElement id="copyright" float :label="$t('label-pattern-copyright')">
      <InputText v-model="patternInfo.copyright" />
    </FormElement>
    <FormElement id="description" float :label="$t('label-pattern-description')">
      <Textarea v-model="patternInfo.description" auto-resize />
    </FormElement>
  </Fluid>

  <DialogFooter :save="() => dialogRef.close({ patternInfo })" class="mt-5" />
</template>

<script setup lang="ts">
  import { inject, reactive, type Ref } from "vue";
  import { Fluid, InputText, Textarea } from "primevue";
  import type { DynamicDialogInstance } from "primevue/dynamicdialogoptions";
  import { PatternInfo } from "#/schemas";

  import FormElement from "../form/FormElement.vue";
  import DialogFooter from "./DialogFooter.vue";

  const dialogRef = inject<Ref<DynamicDialogInstance>>("dialogRef")!;

  // Copy the data from the dialog reference to a reactive object.
  const patternInfo = reactive<PatternInfo>(new PatternInfo(Object.assign({}, dialogRef.value.data!.patternInfo)));
</script>
