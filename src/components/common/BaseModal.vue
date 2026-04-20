<template>
  <transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      <div class="absolute inset-0 bg-black/50" @click="handleOverlayClick" />

      <div
        ref="modal"
        class="relative bg-white rounded-xl shadow-xl w-full overflow-hidden"
        :class="widthClass"
        :style="modalStyle"
        @click.stop
      >
        <div
          v-if="$slots.header || title"
          class="flex items-center justify-between px-5 py-4 border-b select-none"
          :class="draggable ? 'cursor-move' : ''"
          @mousedown="startDrag"
        >
          <slot name="header">
            <h2 class="text-lg font-semibold">
              {{ title }}
            </h2>
          </slot>

          <button
            v-if="showClose"
            @click="close"
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div class="px-5 py-4 max-h-[70vh] overflow-y-auto">
          <slot />
        </div>

        <div
          v-if="$slots.footer"
          class="px-5 py-4 border-t bg-gray-50 rounded-b-xl"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";

interface Props {
  modelValue: boolean;
  title?: string;
  width?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlay?: boolean;
  showClose?: boolean;
  draggable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  width: "md",
  closeOnOverlay: true,
  showClose: true,
  draggable: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  close: [];
}>();

const modal = ref<HTMLElement | null>(null);
const offsetX = ref(0);
const offsetY = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);

const widthClass = computed(() => {
  switch (props.width) {
    case "sm":
      return "max-w-sm";
    case "md":
      return "max-w-md";
    case "lg":
      return "max-w-3xl";
    case "xl":
      return "max-w-5xl";
    case "full":
      return "max-w-[95vw]";
    default:
      return "max-w-xl";
  }
});

const modalStyle = computed(() => {
  if (!props.draggable) return {};
  return { transform: `translate(${offsetX.value}px, ${offsetY.value}px)` };
});

function close() {
  emit("update:modelValue", false);
  emit("close");
}

function handleOverlayClick() {
  if (props.closeOnOverlay) close();
}

function startDrag(e: MouseEvent) {
  if (!props.draggable) return;

  isDragging.value = true;
  startX.value = e.clientX - offsetX.value;
  startY.value = e.clientY - offsetY.value;

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
}

function onDrag(e: MouseEvent) {
  if (!isDragging.value || !modal.value) return;

  let newX = e.clientX - startX.value;
  let newY = e.clientY - startY.value;

  const rect = modal.value.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width;
  const maxY = window.innerHeight - rect.height;

  newX = Math.max(-rect.left, Math.min(newX, maxX - rect.left));
  newY = Math.max(-rect.top, Math.min(newY, maxY - rect.top));

  offsetX.value = newX;
  offsetY.value = newY;
}

function stopDrag() {
  isDragging.value = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
}

onBeforeUnmount(() => {
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
});
</script>
