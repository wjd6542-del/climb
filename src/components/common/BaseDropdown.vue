<template>
  <div class="relative inline-block" ref="root">
    <button
      type="button"
      @click="toggle"
      class="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition"
    >
      <slot name="trigger">
        {{ selectedLabel || placeholder }}
      </slot>
      <i class="fa-solid fa-chevron-down text-xs"></i>
    </button>

    <div
      v-if="open"
      class="absolute right-0 mt-2 w-36 bg-white border rounded shadow-lg z-50"
    >
      <div
        v-for="item in items"
        :key="item.value"
        class="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer flex justify-between"
        @click="select(item)"
      >
        <span>{{ item.label }}</span>
        <i
          v-if="item.value === modelValue"
          class="fa-solid fa-check text-blue-500 text-xs"
        ></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

interface DropdownItem {
  value: string | number;
  label: string;
}

interface Props {
  modelValue?: string | number;
  items: DropdownItem[];
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "",
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  change: [value: string | number];
}>();

const root = ref<HTMLElement | null>(null);
const open = ref(false);

const selectedLabel = computed(
  () => props.items.find((item) => item.value === props.modelValue)?.label ?? "",
);

function toggle() {
  open.value = !open.value;
}

function select(item: DropdownItem) {
  emit("update:modelValue", item.value);
  emit("change", item.value);
  open.value = false;
}

function handleClickOutside(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", handleClickOutside));
</script>
