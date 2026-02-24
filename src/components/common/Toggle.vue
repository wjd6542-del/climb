<template>
  <button
    @click="toggle"
    class="flex items-center gap-1 px-2 py-1.5 rounded-full border text-sm"
    :class="
      active
        ? 'bg-blue-500 text-white border-blue-500'
        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
    "
  >
    <i v-if="icon" :class="icon"></i>
    <span>{{ label }}</span>
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  label: String,
  value: [String, Number, Boolean],
  icon: String,
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

const active = computed(() => props.modelValue.includes(props.value));

const toggle = () => {
  emit(
    "update:modelValue",
    active.value
      ? props.modelValue.filter((v) => v !== props.value)
      : [...props.modelValue, props.value],
  );
};
</script>
