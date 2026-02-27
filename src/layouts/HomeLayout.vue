<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <div class="max-w-7xl mx-auto flex gap-8 p-3">
      <!-- 왼쪽 영역 -->
      <aside
        class="hidden sm:block w-64 shrink-0 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm"
      >
        <div class="mb-6">
          <!-- 상단 : 아이콘 + 타이틀 -->
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 flex items-center justify-center rounded-2xl bg-green-100 text-green-700 shadow-sm"
            >
              <i class="fa-solid fa-mountain text-2xl"></i>
            </div>

            <div class="text-xl font-extrabold tracking-tight text-gray-900">
              {{ $t("등산학교") }}
            </div>
          </div>

          <!-- 하단 : 뱃지 영역 -->
          <!-- 뱃지 영역 -->
          <div class="flex flex-nowrap gap-2 mt-3 whitespace-nowrap">
            <span
              class="px-2 py-0.5 text-[10px] font-semibold bg-green-50 text-green-700 rounded-full"
            >
              {{ $t("전문교육") }}
            </span>

            <span
              class="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded-full"
            >
              {{ $t("클라이밍") }}
            </span>

            <span
              class="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 rounded-full"
            >
              {{ $t("산악 트레이닝") }}
            </span>
          </div>

          <!-- 구분선 -->
          <div class="mt-5 h-px bg-gray-200"></div>
        </div>

        <!-- 배너 영역 -->
        <div>
          <BannerList :banners="banners" />
        </div>
      </aside>

      <!-- 페이지 영역 -->
      <main class="flex-1 relative">
        <RouterView v-slot="{ Component, route }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import Header from "@/components/layout/Header.vue";
import BannerList from "@/components/banner/BannerList.vue";
import api from "@/lib/api.js";

export default {
  name: "HomeLayout",
  components: {
    Header,
    BannerList,
  },

  data() {
    return {
      banners: [],
    };
  },

  methods: {
    // 베너 리스트
    async loadBanner() {
      const res = await api.post("/api/banner/list", { take: 10 });
      this.banners = res.data;
    },
  },
  async mounted() {
    this.loadBanner();
  },
};
</script>
