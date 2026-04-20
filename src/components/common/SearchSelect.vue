<template>
  <div ref="wrapper" class="relative w-full">
    <div :class="triggerClasses" @click="toggle">
      <div class="flex-1 text-sm truncate">
        {{ selectedLabel || placeholder }}
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="modelValue !== null && modelValue !== ''"
          @click.stop="clear"
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
          ref="searchInput"
          v-model="keyword"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div class="max-h-60 overflow-y-auto">
        <div
          v-for="item in filteredOptions"
          :key="(item as any)[valueKey]"
          class="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer flex justify-between"
          @click="select(item)"
        >
          <span>
            <i v-if="(item as any).icon" :class="(item as any).icon"></i>
            {{ (item as any)[labelKey] }}</span
          >

          <i
            v-if="(item as any)[valueKey] === modelValue"
            class="fa-solid fa-check text-blue-500 text-xs"
          ></i>
        </div>

        <div
          v-if="filteredOptions.length === 0"
          class="px-3 py-2 text-sm text-gray-400"
        >
          {{ emptyText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs } from "vue";

interface Props {
  modelValue: string | number | null;
  options: any[];
  labelKey?: string;
  valueKey?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  labelKey: "label",
  valueKey: "value",
  placeholder: "선택하세요",
  searchPlaceholder: "검색...",
  emptyText: "검색 결과가 없습니다",
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  change: [value: string | number];
}>();

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();

const wrapper = ref<HTMLElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const open = ref(false);
const keyword = ref("");

const selectedLabel = computed(() => {
  const found = props.options.find(
    (o: any) => o[props.valueKey] === props.modelValue,
  );
  return found ? found[props.labelKey] : "";
});

const filteredOptions = computed(() => {
  if (!keyword.value) return props.options;
  return props.options.filter((o: any) =>
    String(o[props.labelKey]).toLowerCase().includes(keyword.value.toLowerCase()),
  );
});

const triggerClasses = computed(() => [
  "flex justify-between items-center px-3 py-2 rounded cursor-pointer transition-all",
  open.value
    ? "border-blue-500 ring-2 ring-blue-100"
    : "border border-gray-300 hover:border-gray-400",
  attrs.class as string | undefined,
]);

function toggle() {
  open.value = !open.value;
  keyword.value = "";
  nextTick(() => {
    if (open.value && searchInput.value) {
      searchInput.value.focus();
    }
  });
}

function select(item: any) {
  const value = item[props.valueKey];
  emit("update:modelValue", value);
  emit("change", value);
  open.value = false;
  keyword.value = "";
}

function clear() {
  emit("update:modelValue", "");
  emit("change", "");
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
