<template>
  <div class="page-wrapper">
    <h1 class="text-xl font-bold mb-2">{{ $t("설정") }}</h1>

    <!-- 탭 헤더 -->
    <div class="flex border-b mb-4">
      <button
        v-for="(tab, idx) in tabs"
        :key="tab.key"
        @click="changeTab(tab.key, idx)"
        class="px-4 py-2 text-sm border-b-2 -mb-px transition"
        :class="
          activeTab === tab.key
            ? 'border-blue-500 text-blue-600 font-medium'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        "
      >
        <i :class="tab.icon" class="me-1"></i>{{ $t(tab.label) }}
      </button>
    </div>

    <!-- 슬라이드 영역 -->
    <div class="relative min-h-[300px]">
      <transition name="fade" mode="out-in">
        <component :is="currentComponent" :key="activeTab" class="w-full" />
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import Amenities from "@/components/setting/Amenities.vue";
import Types from "@/components/setting/Types.vue";
import Setting from "@/components/setting/Setting.vue";
import LangPack from "@/components/setting/LangPack.vue";
import BoulderColor from "@/components/setting/BoulderColor.vue";
import Difficulty from "@/components/setting/Difficulty.vue";

const tabs = [
  {
    key: "amenities",
    label: "편의시설",
    icon: "fa-solid fa-hotel",
    component: Amenities,
  },
  {
    key: "types",
    label: "타입",
    icon: "fa-solid fa-layer-group",
    component: Types,
  },
  {
    key: "setting",
    label: "환경설정",
    icon: "fa-solid fa-gear",
    component: Setting,
  },
  {
    key: "color",
    label: "색상",
    icon: "fa-solid fa-palette",
    component: BoulderColor,
  },
  {
    key: "grade",
    label: "난이도",
    icon: "fa-solid fa-layer-group",
    component: Difficulty,
  },

  {
    key: "langPack",
    label: "다국어",
    icon: "fa-solid fa-globe",
    component: LangPack,
  },
];

const activeTab = ref("amenities");
const activeIndex = ref(0);
const direction = ref("left");

const currentComponent = computed(
  () => tabs.find((t) => t.key === activeTab.value)?.component,
);

function changeTab(key, newIndex) {
  direction.value = newIndex > activeIndex.value ? "left" : "right";
  activeIndex.value = newIndex;
  activeTab.value = key;
}
</script>
