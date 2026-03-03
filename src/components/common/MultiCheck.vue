<template>
  <div class="relative w-full">
    <!-- 라벨 -->
    <label v-if="label" class="block mb-1 text-sm font-medium text-gray-700">
      {{ $t(label) }}
    </label>

    <!-- 선택 영역 -->
    <div
      @click.stop="toggle"
      class="border rounded px-3 py-2 cursor-pointer flex items-center justify-between min-h-[42px]"
    >
      <!-- 선택 값 표시 -->
      <div class="flex flex-wrap gap-1 flex-1">
        <template v-if="selectedItems.length">
          <span
            v-for="item in selectedItems"
            :key="item[idKey]"
            class="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded"
          >
            <i v-if="item.icon" :class="item.icon"></i>
            {{ $t(item[textKey]) }}
          </span>
        </template>

        <span v-else class="text-gray-400 text-sm">
          {{ placeholder }}
        </span>
      </div>

      <!-- 🔥 초기화 버튼 -->
      <button
        v-if="selectedItems.length"
        @click.stop="clearAll"
        type="button"
        class="ml-2 text-xs text-red-500 hover:text-red-600"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <!-- 드롭다운 -->
    <div
      v-if="open"
      class="absolute z-50 mt-1 w-full bg-white border rounded shadow max-h-60 overflow-y-auto"
    >
      <label
        v-for="item in items"
        :key="item[idKey]"
        class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
      >
        <input
          type="checkbox"
          :value="item[idKey]"
          v-model="innerValue"
          @change="emitChange"
        />
        <i v-if="item.icon" :class="item.icon"></i>
        {{ $t(item[textKey]) }}
      </label>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "MultiCheck",

  props: {
    label: String,
    placeholder: { type: String, default: "선택하세요." },
    items: { type: Array, default: () => [] },
    modelValue: { type: Array, default: () => [] },
    idKey: { type: String, default: "id" },
    textKey: { type: String, default: "name" },
  },

  emits: ["update:modelValue", "change"],

  data() {
    return {
      open: false,
      innerValue: [...this.modelValue],
    };
  },

  watch: {
    modelValue(val: any[]) {
      this.innerValue = [...val];
    },
  },

  computed: {
    selectedItems(): any[] {
      return this.items.filter((item: any) =>
        this.innerValue.includes(item[this.idKey]),
      );
    },
  },

  mounted() {
    document.addEventListener("click", this.handleClick);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClick);
  },

  methods: {
    toggle(e: Event) {
      e.stopPropagation();
      this.open = !this.open;
    },

    handleClick(e: any) {
      if (!this.$el.contains(e.target)) {
        this.open = false;
      }
    },

    emitChange() {
      this.$emit("update:modelValue", this.innerValue);
      this.$emit("change", this.innerValue);
    },

    clearAll() {
      this.innerValue = [];
      this.$emit("update:modelValue", []);
      this.$emit("change", []);
    },
  },
};
</script>
