<template>
  <div class="flex items-center gap-4">
    <!-- 라벨 -->
    <span class="w-16 text-sm font-medium text-gray-700">
      {{ label }}
    </span>

    <!-- 인풋 그룹 -->
    <div class="flex items-center border rounded-md overflow-hidden bg-white">
      <!-- 영업시간 -->
      <template v-if="!localValue.is_closed">
        <input
          v-model="localValue.open_time"
          type="time"
          class="px-3 py-2 text-sm outline-none"
        />
        <span class="px-2 text-gray-400 border-l border-r">~</span>
        <input
          v-model="localValue.close_time"
          type="time"
          class="px-3 py-2 text-sm outline-none"
        />
      </template>

      <!-- 휴무 표시 -->
      <template v-else>
        <div class="px-6 py-2 text-sm text-gray-400">휴무</div>
      </template>
    </div>

    <!-- 휴무 토글 버튼 -->
    <button
      type="button"
      @click="localValue.is_closed = !localValue.is_closed"
      :class="[
        'px-3 py-1.5 text-sm rounded-md border transition',
        localValue.is_closed
          ? 'bg-gray-200 border-gray-300 text-gray-600'
          : 'bg-blue-50 border-blue-200 text-blue-600',
      ]"
    >
      {{ localValue.is_closed ? "영업" : "휴무" }}
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  label: String,
  modelValue: {
    type: Object,
    default: () => ({
      open_time: "",
      close_time: "",
      is_closed: false,
    }),
  },
});

const emit = defineEmits(["update:modelValue"]);

const localValue = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
</script>
