<template>
  <teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      @click="onBackdropClick"
    >
      <div class="w-[360px] rounded-lg bg-white shadow-lg" @click.stop>
        <div class="px-4 py-3 border-b font-semibold">{{ title }}</div>
        <div class="px-4 py-4 text-sm text-gray-700 whitespace-pre-line">
          {{ message }}
        </div>
        <div class="flex justify-end gap-2 px-4 py-3 border-t">
          <button
            v-if="type === 'confirm'"
            class="px-3 py-1.5 text-sm rounded bg-gray-200 hover:bg-gray-300"
            @click="emit('cancel')"
          >
            취소
          </button>
          <button
            class="px-3 py-1.5 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
            @click="emit('ok')"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean;
  title?: string;
  message?: string;
  type?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{ ok: []; cancel: [] }>();

function onBackdropClick() {
  emit(props.type === "confirm" ? "cancel" : "ok");
}
</script>
