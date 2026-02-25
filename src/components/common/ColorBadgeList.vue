<template>
  <div class="flex flex-wrap gap-2">
    <div
      v-for="color in colors"
      :key="color.id || color.code"
      class="relative group flex items-center gap-2 px-3 py-1 text-xs font-medium border shadow-sm transition"
      :class="[shapeClass, 'cursor-pointer hover:scale-105']"
      :style="badgeStyle(color)"
      @click="handleClick(color)"
    >
      <!-- 이름 -->
      <span class="truncate">
        {{ color.name }}
      </span>

      <!-- 삭제 버튼 -->
      <button
        v-if="removable"
        @click.stop="handleRemove(color)"
        class="absolute -top-2 -right-2 w-4 h-4 text-[10px] flex items-center justify-center rounded-full bg-white border shadow opacity-0 group-hover:opacity-100 transition text-gray-500 hover:text-red-500"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  colors: {
    type: Array,
    default: () => [],
  },
  shape: {
    type: String,
    default: "round", // round | square | circle
  },
  removable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["remove", "click"]);

const shapeClass = computed(() => {
  if (props.shape === "circle") return "rounded-full";
  if (props.shape === "square") return "rounded-none";
  return "rounded-md";
});

function badgeStyle(color) {
  return {
    backgroundColor: hexToRgba(color.code, 0.1),
    borderColor: color.code,
    color: color.code,
  };
}

function handleRemove(color) {
  emit("remove", color);
}

function handleClick(color) {
  emit("click", color);
}

/* 🔥 배경 연하게 처리 */
function hexToRgba(hex, alpha) {
  if (!hex) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
</script>
