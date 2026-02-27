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
        <i :class="tab.icon" class="me-1"></i>
        {{ $t(tab.label) }}
      </button>
    </div>

    <!-- 탭 영역 -->
    <div class="relative min-h-[300px]">
      <transition name="fade" mode="out-in">
        <component :is="currentComponent" :key="activeTab" />
      </transition>
    </div>
  </div>
</template>

<script>
import { markRaw } from "vue";

import Amenities from "@/components/setting/Amenities.vue";
import Types from "@/components/setting/Types.vue";
import Setting from "@/components/setting/Setting.vue";
import LangPack from "@/components/setting/LangPack.vue";
import BoulderColor from "@/components/setting/BoulderColor.vue";
import Difficulty from "@/components/setting/Difficulty.vue";
import Banner from "@/components/setting/Banner.vue";

/* 🔥 markRaw 로 컴포넌트 보호 */
const tabs = [
  {
    key: "amenities",
    label: "편의시설",
    icon: "fa-solid fa-hotel",
    component: markRaw(Amenities),
  },
  {
    key: "types",
    label: "타입",
    icon: "fa-solid fa-layer-group",
    component: markRaw(Types),
  },
  {
    key: "setting",
    label: "환경설정",
    icon: "fa-solid fa-gear",
    component: markRaw(Setting),
  },
  {
    key: "color",
    label: "색상",
    icon: "fa-solid fa-palette",
    component: markRaw(BoulderColor),
  },
  {
    key: "grade",
    label: "난이도",
    icon: "fa-solid fa-layer-group",
    component: markRaw(Difficulty),
  },
  {
    key: "banner",
    label: "베너",
    icon: "fa-solid fa-image",
    component: markRaw(Banner),
  },
  {
    key: "langPack",
    label: "다국어",
    icon: "fa-solid fa-globe",
    component: markRaw(LangPack),
  },
];

export default {
  name: "SettingPage",

  data() {
    return {
      activeTab: "amenities",
      activeIndex: 0,
    };
  },

  computed: {
    tabs() {
      return tabs; // reactive 아님
    },
    currentComponent() {
      return tabs.find((t) => t.key === this.activeTab)?.component;
    },
  },

  watch: {
    "$route.query.tab": {
      immediate: true,
      handler(val) {
        const target = tabs.find((t) => t.key === val);
        if (target) {
          this.activeTab = target.key;
          this.activeIndex = tabs.indexOf(target);
        }
      },
    },
  },

  methods: {
    changeTab(key, newIndex) {
      if (this.activeTab === key) return;

      this.activeTab = key;
      this.activeIndex = newIndex;

      this.$router.push({
        query: {
          ...this.$route.query,
          tab: key,
        },
      });
    },
  },
};
</script>
