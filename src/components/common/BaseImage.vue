<template>
  <div class="w-full">
    <input
      ref="fileInput"
      type="file"
      :multiple="multiple"
      accept="image/*"
      class="hidden"
      @change="onFileChange"
    />

    <div
      @click="triggerFile"
      class="w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50 transition"
    >
      <div class="flex flex-col items-center gap-2 text-gray-500">
        <i class="fa-solid fa-image text-2xl"></i>
        <p class="text-sm font-medium">{{ placeholder }}</p>
        <p class="text-xs text-gray-400">클릭하여 이미지 선택</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Props {
  multiple?: boolean;
  placeholder?: string;
}

withDefaults(defineProps<Props>(), {
  multiple: true,
  placeholder: "이미지를 업로드하세요",
});

const emit = defineEmits<{ change: [event: Event] }>();

const fileInput = ref<HTMLInputElement | null>(null);

function triggerFile() {
  fileInput.value?.click();
}

function onFileChange(e: Event) {
  emit("change", e);
  (e.target as HTMLInputElement).value = "";
}
</script>
