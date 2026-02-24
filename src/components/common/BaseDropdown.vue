<template>
  <div class="relative inline-block" ref="root">
    <!-- Trigger -->
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

    <!-- Menu -->
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

<script>
export default {
  name: "BaseDropdown",

  props: {
    modelValue: [String, Number],
    items: { type: Array, required: true },
    placeholder: { type: String, default: "" },
  },

  emits: ["update:modelValue", "change"],

  data() {
    return {
      open: false,
    };
  },

  computed: {
    selectedLabel() {
      const found = this.items.find((item) => item.value === this.modelValue);
      return found ? found.label : "";
    },
  },

  methods: {
    toggle() {
      this.open = !this.open;
    },
    select(item) {
      this.$emit("update:modelValue", item.value);
      this.$emit("change", item.value);
      this.open = false;
    },
    handleClickOutside(e) {
      if (this.$refs.root && !this.$refs.root.contains(e.target)) {
        this.open = false;
      }
    },
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>
