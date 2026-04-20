<template>
  <div ref="wrapper" class="relative w-full">
    <label v-if="label" class="block mb-1 text-sm font-medium text-gray-700">
      {{ $t(label) }}
    </label>

    <div :class="triggerClasses" @click.stop="toggle">
      <div class="flex flex-wrap gap-2 flex-1">
        <template v-if="selectedItems.length">
          <span
            v-for="item in selectedItems"
            :key="(item as any)[valueKey]"
            class="flex items-center gap-2 px-2 py-1 text-xs bg-blue-500 text-white rounded"
          >
            <span
              class="w-3 h-3 rounded border border-white"
              :style="{ backgroundColor: (item as any).code || (item as any)[valueKey] }"
            ></span>
            {{ (item as any)[labelKey] }}
          </span>
        </template>

        <span v-else class="text-gray-400 text-sm">
          {{ placeholder }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="innerValue.length"
          @click.stop="clearAll"
          class="text-gray-400 hover:text-red-500 text-sm"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

        <i
          class="fa-solid fa-chevron-down text-xs transition-transform duration-200"
          :class="open ? 'rotate-180 text-blue-500' : 'text-gray-400'"
        ></i>
      </div>
    </div>

    <div
      v-if="open"
      class="absolute left-0 mt-1 w-full bg-white border rounded shadow-lg z-[9999]"
    >
      <div class="p-2 border-b">
        <input
          v-model="keyword"
          type="text"
          placeholder="검색..."
          class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="max-h-60 overflow-y-auto">
        <label
          v-for="item in filteredOptions"
          :key="(item as any)[valueKey]"
          class="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
        >
          <input
            type="checkbox"
            :value="(item as any)[valueKey]"
            v-model="innerValue"
            @change="emitChange"
          />

          <span
            class="w-4 h-4 rounded border border-gray-300"
            :style="{ backgroundColor: (item as any).code || (item as any)[valueKey] }"
          ></span>

          <span>{{ $t((item as any)[labelKey]) }}</span>
        </label>

        <div
          v-if="filteredOptions.length === 0"
          class="px-3 py-2 text-sm text-gray-400"
        >
          검색 결과가 없습니다
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

interface Props {
  label?: string;
  placeholder?: string;
  options: any[];
  modelValue?: any[];
  labelKey?: string;
  valueKey?: string;
  colorKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
  placeholder: "색상을 선택하세요",
  modelValue: () => [],
  labelKey: "label",
  valueKey: "value",
  colorKey: "code",
});

const emit = defineEmits<{
  "update:modelValue": [value: any[]];
  change: [value: any[]];
}>();

const wrapper = ref<HTMLElement | null>(null);
const open = ref(false);
const keyword = ref("");
const innerValue = ref<any[]>([...props.modelValue]);

watch(
  () => props.modelValue,
  (val) => {
    innerValue.value = [...val];
  },
);

const selectedItems = computed(() =>
  innerValue.value
    .map((val) => props.options.find((o: any) => o[props.valueKey] === val))
    .filter(Boolean),
);

const filteredOptions = computed(() => {
  if (!keyword.value) return props.options;
  return props.options.filter((o: any) =>
    String(o[props.labelKey]).toLowerCase().includes(keyword.value.toLowerCase()),
  );
});

const triggerClasses = computed(() => [
  "flex justify-between items-center px-3 py-2 rounded cursor-pointer transition-all min-h-[42px]",
  open.value
    ? "border-blue-500 ring-2 ring-blue-100"
    : "border border-gray-300 hover:border-gray-400",
]);

function toggle() {
  open.value = !open.value;
}

function emitChange() {
  emit("update:modelValue", innerValue.value);
  emit("change", innerValue.value);
}

function clearAll() {
  innerValue.value = [];
  emitChange();
  open.value = false;
}

function handleClickOutside(e: MouseEvent) {
  if (!wrapper.value?.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside, true));
onBeforeUnmount(() =>
  document.removeEventListener("click", handleClickOutside, true),
);
</script>
