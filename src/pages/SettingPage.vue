<template>
  <div class="page-wrapper">
    <h1 class="text-xl font-bold mb-2">{{ $t("설정") }}</h1>

    <!-- 탭 헤더 -->
    <div class="flex border-b mb-4">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="changeTab(tab.key)"
        class="px-4 py-2 text-sm border-b-2 -mb-px transition"
        :class="
          activeTab === tab.key
            ? 'border-blue-500 text-blue-600 font-medium'
            : 'border-transparent text-gray-500 hover:text-gray-700'
        "
      >
        <i :class="tab.icon" class="me-1"></i>
        {{ $t(tab.label) }}
      </button>
    </div>

    <div class="relative min-h-[300px]">
      <transition name="fade" mode="out-in">
        <component :is="currentComponent" :key="activeTab" />
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, markRaw } from "vue";
import { useRoute, useRouter } from "vue-router";

import Amenities from "@/components/setting/Amenities.vue";
import Types from "@/components/setting/Types.vue";
import Setting from "@/components/setting/Setting.vue";
import LangPack from "@/components/setting/LangPack.vue";
import BoulderColor from "@/components/setting/BoulderColor.vue";
import Difficulty from "@/components/setting/Difficulty.vue";
import Banner from "@/components/setting/Banner.vue";

const tabs = [
  { key: "amenities", label: "편의시설", icon: "fa-solid fa-hotel", component: markRaw(Amenities) },
  { key: "types", label: "타입", icon: "fa-solid fa-layer-group", component: markRaw(Types) },
  { key: "setting", label: "환경설정", icon: "fa-solid fa-gear", component: markRaw(Setting) },
  { key: "color", label: "색상", icon: "fa-solid fa-palette", component: markRaw(BoulderColor) },
  { key: "grade", label: "난이도", icon: "fa-solid fa-layer-group", component: markRaw(Difficulty) },
  { key: "banner", label: "베너", icon: "fa-solid fa-image", component: markRaw(Banner) },
  { key: "langPack", label: "다국어", icon: "fa-solid fa-globe", component: markRaw(LangPack) },
];

const route = useRoute();
const router = useRouter();
const activeTab = ref("amenities");

const currentComponent = computed(
  () => tabs.find((t) => t.key === activeTab.value)?.component,
);

watch(
  () => route.query.tab,
  (val) => {
    const target = tabs.find((t) => t.key === val);
    if (target) activeTab.value = target.key;
  },
  { immediate: true },
);

function changeTab(key: string) {
  if (activeTab.value === key) return;
  activeTab.value = key;
  router.push({ query: { ...route.query, tab: key } });
}
</script>
