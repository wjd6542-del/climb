<template>
  <div ref="wrapper" class="relative w-full">
    <label v-if="label" class="block mb-1 text-sm font-medium text-gray-700">
      {{ $t(label) }}
    </label>

    <div
      @click="toggle"
      class="border rounded px-3 py-2 cursor-pointer flex items-center justify-between min-h-[42px]"
    >
      <div class="flex flex-wrap gap-1 flex-1">
        <template v-if="selectedItems.length">
          <span
            v-for="item in selectedItems"
            :key="(item as any)[idKey]"
            class="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded"
          >
            <i v-if="(item as any).icon" :class="(item as any).icon"></i>
            {{ $t((item as any)[textKey]) }}
          </span>
        </template>

        <span v-else class="text-gray-400 text-sm">
          {{ placeholder }}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="selectedItems.length"
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
      class="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-y-auto"
    >
      <label
        v-for="item in items"
        :key="(item as any)[idKey]"
        class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
      >
        <input
          type="checkbox"
          :value="(item as any)[idKey]"
          v-model="innerValue"
          @change="emitChange"
        />
        <i v-if="(item as any).icon" :class="(item as any).icon"></i>
        {{ $t((item as any)[textKey]) }}
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from "vue";

interface Props {
  label?: string;
  placeholder?: string;
  items?: any[];
  modelValue?: any[];
  idKey?: string;
  textKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: "",
  placeholder: "선택하세요.",
  items: () => [],
  modelValue: () => [],
  idKey: "id",
  textKey: "name",
});

const emit = defineEmits<{
  "update:modelValue": [value: any[]];
  change: [value: any[]];
}>();

const wrapper = ref<HTMLElement | null>(null);
const open = ref(false);
const innerValue = ref<any[]>([...props.modelValue]);

watch(
  () => props.modelValue,
  (val) => {
    innerValue.value = [...val];
  },
);

const selectedItems = computed(() =>
  props.items.filter((item: any) => innerValue.value.includes(item[props.idKey])),
);

function toggle() {
  open.value = !open.value;
}

function handleClick(e: MouseEvent) {
  if (!wrapper.value?.contains(e.target as Node)) {
    open.value = false;
  }
}

function emitChange() {
  emit("update:modelValue", innerValue.value);
  emit("change", innerValue.value);
}

function clearAll() {
  innerValue.value = [];
  emit("update:modelValue", []);
  emit("change", []);
}

onMounted(() => document.addEventListener("mousedown", handleClick));
onBeforeUnmount(() => document.removeEventListener("mousedown", handleClick));
</script>
