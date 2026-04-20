<template>
  <div class="relative w-full flex items-start gap-1" ref="root">
    <div v-if="showQuickButtons" class="relative">
      <button
        @click.stop="toggleQuick"
        class="h-[40px] w-[40px] flex items-center justify-center border rounded hover:bg-gray-100 text-gray-600"
      >
        <i class="fa-solid fa-ellipsis-vertical"></i>
      </button>

      <div
        v-show="openQuick"
        class="absolute left-0 mt-2 w-28 bg-white border rounded shadow-md z-50"
      >
        <button
          class="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
          @click="setQuick('yesterday')"
        >
          어제
        </button>

        <button
          class="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
          @click="setQuick('today')"
        >
          오늘
        </button>

        <button
          class="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
          @click="setQuick('week')"
        >
          일주일
        </button>
      </div>
    </div>

    <div class="relative flex-1">
      <div class="flex h-[40px] border rounded-lg overflow-hidden bg-white">
        <input
          :value="formattedRange"
          @click="toggleCalendar"
          readonly
          :placeholder="placeholder"
          class="flex-1 px-3 py-2 text-sm outline-none cursor-pointer"
        />

        <button
          v-if="innerValue.start || innerValue.end"
          @click.stop="clearRange"
          class="px-3 h-[40px] border-l hover:bg-gray-100 text-red-500"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

        <button
          @click.stop="toggleCalendar"
          class="px-3 h-[40px] border-l hover:bg-gray-100 text-gray-600"
        >
          <i class="fa-regular fa-calendar"></i>
        </button>
      </div>

      <div
        v-show="openCalendar"
        class="absolute left-0 mt-2 z-50 bg-white border rounded-lg shadow-lg"
      >
        <DatePicker
          v-model.range="innerValue"
          mode="dateTime"
          :is24hr="true"
          :time-picker="{ minutesIncrement: minuteStep }"
          @update:modelValue="handleSelect"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { DatePicker } from "v-calendar";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface Props {
  modelValue?: DateRange;
  placeholder?: string;
  minuteStep?: number;
  showQuickButtons?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ start: null, end: null }),
  placeholder: "기간 선택",
  minuteStep: 10,
  showQuickButtons: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: DateRange];
  change: [];
}>();

const root = ref<HTMLElement | null>(null);
const openCalendar = ref(false);
const openQuick = ref(false);
const innerValue = reactive<{ start: Date | undefined; end: Date | undefined }>({
  start: undefined,
  end: undefined,
});

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      innerValue.start = undefined;
      innerValue.end = undefined;
      return;
    }
    innerValue.start = val.start ?? undefined;
    innerValue.end = val.end ?? undefined;
  },
  { immediate: true, deep: true },
);

const formattedRange = computed(() => {
  if (!innerValue.start || !innerValue.end) return "";

  const format = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  return `${format(innerValue.start)} ~ ${format(innerValue.end)}`;
});

function clearRange() {
  innerValue.start = undefined;
  innerValue.end = undefined;
  emit("update:modelValue", { start: null, end: null });
  emit("change");
  openCalendar.value = false;
  openQuick.value = false;
}

function toggleCalendar() {
  openCalendar.value = !openCalendar.value;
  openQuick.value = false;
}

function toggleQuick() {
  openQuick.value = !openQuick.value;
  openCalendar.value = false;
}

function handleSelect(val: any) {
  innerValue.start = val?.start;
  innerValue.end = val?.end;
  emit("update:modelValue", { start: val?.start ?? null, end: val?.end ?? null });
  emit("change");
}

function setQuick(type: "today" | "yesterday" | "week") {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);

  if (type === "today") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  } else if (type === "yesterday") {
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setHours(23, 59, 59, 999);
  } else if (type === "week") {
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  innerValue.start = start;
  innerValue.end = end;
  emit("update:modelValue", { start, end });
  emit("change");
  openQuick.value = false;
  openCalendar.value = false;
}

function handleOutside(event: MouseEvent) {
  if (!root.value?.contains(event.target as Node)) {
    openCalendar.value = false;
    openQuick.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleOutside, true));
onBeforeUnmount(() => document.removeEventListener("click", handleOutside, true));
</script>
