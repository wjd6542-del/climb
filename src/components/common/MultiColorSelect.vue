<template>
  <div ref="wrapper" class="relative w-full">
    <!-- 라벨 -->
    <label v-if="label" class="block mb-1 text-sm font-medium text-gray-700">
      {{ label }}
    </label>

    <!-- 트리거 -->
    <div :class="triggerClasses" @click.stop="toggle">
      <!-- 선택된 값들 -->
      <div class="flex flex-wrap gap-2 flex-1">
        <template v-if="selectedItems.length">
          <span
            v-for="item in selectedItems"
            :key="item[valueKey]"
            class="flex items-center gap-2 px-2 py-1 text-xs bg-blue-500 text-white rounded"
          >
            <!-- 색상 박스 -->
            <span
              class="w-3 h-3 rounded border border-white"
              :style="{ backgroundColor: item.code || item[valueKey] }"
            ></span>

            {{ item[labelKey] }}
          </span>
        </template>

        <span v-else class="text-gray-400 text-sm">
          {{ placeholder }}
        </span>
      </div>

      <!-- 우측 버튼 -->
      <div class="flex items-center gap-2">
        <!-- 전체 초기화 -->
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

    <!-- 드롭다운 -->
    <div
      v-if="open"
      class="absolute left-0 mt-1 w-full bg-white border rounded shadow-lg z-[9999]"
    >
      <!-- 검색 -->
      <div class="p-2 border-b">
        <input
          v-model="keyword"
          type="text"
          placeholder="검색..."
          class="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- 리스트 -->
      <div class="max-h-60 overflow-y-auto">
        <label
          v-for="item in filteredOptions"
          :key="item[valueKey]"
          class="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
        >
          <input
            type="checkbox"
            :value="item[valueKey]"
            v-model="innerValue"
            @change="emitChange"
          />

          <!-- 색상 박스 -->
          <span
            class="w-4 h-4 rounded border border-gray-300"
            :style="{ backgroundColor: item.code || item[valueKey] }"
          ></span>

          <span>{{ item[labelKey] }}</span>
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

<script>
export default {
  name: "MultiColorSelect",

  props: {
    label: String,
    placeholder: {
      type: String,
      default: "색상을 선택하세요",
    },
    options: { type: Array, required: true },
    modelValue: { type: Array, default: () => [] },
    labelKey: { type: String, default: "label" },
    valueKey: { type: String, default: "value" },
    colorKey: { type: String, default: "code" },
  },

  emits: ["update:modelValue", "change"],

  data() {
    return {
      open: false,
      keyword: "",
      innerValue: [...this.modelValue],
    };
  },

  watch: {
    modelValue(val) {
      this.innerValue = [...val];
    },
  },

  computed: {
    selectedItems() {
      return this.options.filter((o) =>
        this.innerValue.includes(o[this.valueKey]),
      );
    },

    filteredOptions() {
      if (!this.keyword) return this.options;

      return this.options.filter((o) =>
        String(o[this.labelKey])
          .toLowerCase()
          .includes(this.keyword.toLowerCase()),
      );
    },

    triggerClasses() {
      return [
        "flex justify-between items-center px-3 py-2 rounded cursor-pointer transition-all min-h-[42px]",
        this.open
          ? "border-blue-500 ring-2 ring-blue-100"
          : "border border-gray-300 hover:border-gray-400",
      ];
    },
  },

  mounted() {
    document.addEventListener("click", this.handleClickOutside, true);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside, true);
  },

  methods: {
    toggle() {
      this.open = !this.open;
    },

    emitChange() {
      this.$emit("update:modelValue", this.innerValue);
      this.$emit("change", this.innerValue);
    },

    clearAll() {
      this.innerValue = [];
      this.emitChange();
      this.open = false;
    },

    handleClickOutside(e) {
      if (!this.$refs.wrapper.contains(e.target)) {
        this.open = false;
      }
    },
  },
};
</script>
