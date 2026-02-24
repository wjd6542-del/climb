<template>
  <transition name="fade">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[9999] flex items-center justify-center"
    >
      <!-- overlay -->
      <div class="absolute inset-0 bg-black/50" @click="handleOverlayClick" />

      <div
        ref="modal"
        class="relative bg-white rounded-xl shadow-xl w-full"
        :class="widthClass"
        :style="modalStyle"
        @click.stop
      >
        <!-- header (drag handle) -->
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

        <!-- body -->
        <div class="px-5 py-4 max-h-[70vh] overflow-y-auto">
          <slot />
        </div>

        <!-- footer -->
        <div v-if="$slots.footer" class="px-5 py-4 border-t bg-gray-50">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "BaseModal",

  props: {
    modelValue: Boolean,
    title: String,
    width: {
      type: String,
      default: "md", // sm | md | lg | xl | full
    },
    closeOnOverlay: {
      type: Boolean,
      default: true,
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    draggable: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      offsetX: 0,
      offsetY: 0,
      isDragging: false,
      startX: 0,
      startY: 0,
    };
  },

  computed: {
    widthClass() {
      switch (this.width) {
        case "sm":
          return "max-w-sm";
        case "lg":
          return "max-w-3xl";
        case "xl":
          return "max-w-5xl";
        case "full":
          return "max-w-[95vw]";
        default:
          return "max-w-xl";
      }
    },

    modalStyle() {
      if (!this.draggable) return {};
      return {
        transform: `translate(${this.offsetX}px, ${this.offsetY}px)`,
      };
    },
  },

  methods: {
    close() {
      this.$emit("update:modelValue", false);
      this.$emit("close");
    },

    handleOverlayClick() {
      if (this.closeOnOverlay) {
        this.close();
      }
    },

    /* =========================
       🔥 Drag Logic
    ========================= */

    startDrag(e) {
      if (!this.draggable) return;

      this.isDragging = true;
      this.startX = e.clientX - this.offsetX;
      this.startY = e.clientY - this.offsetY;

      document.addEventListener("mousemove", this.onDrag);
      document.addEventListener("mouseup", this.stopDrag);
    },

    onDrag(e) {
      if (!this.isDragging) return;

      const modal = this.$refs.modal;
      if (!modal) return;

      let newX = e.clientX - this.startX;
      let newY = e.clientY - this.startY;

      const rect = modal.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      newX = Math.max(-rect.left, Math.min(newX, maxX - rect.left));
      newY = Math.max(-rect.top, Math.min(newY, maxY - rect.top));

      this.offsetX = newX;
      this.offsetY = newY;
    },

    stopDrag() {
      this.isDragging = false;
      document.removeEventListener("mousemove", this.onDrag);
      document.removeEventListener("mouseup", this.stopDrag);
    },
  },

  beforeUnmount() {
    document.removeEventListener("mousemove", this.onDrag);
    document.removeEventListener("mouseup", this.stopDrag);
  },
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active {
  transition: all 0.2s ease;
}
.scale-enter-from {
  transform: scale(0.95);
  opacity: 0;
}
</style>
