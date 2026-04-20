<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <div class="max-w-7xl mx-auto flex gap-8 p-3">
      <aside
        class="hidden sm:block w-64 shrink-0 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm"
      >
        <div class="mb-6">
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

          <div class="mt-5 h-px bg-gray-200"></div>
        </div>

        <div>
          <BannerList :banners="banners" />
        </div>
      </aside>

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

<script setup lang="ts">
import { onMounted, ref } from "vue";

import Header from "@/components/layout/Header.vue";
import BannerList from "@/components/banner/BannerList.vue";
import { bannerService } from "@/api/bannerService";
import type { Banner } from "@/types";

const banners = ref<Banner[]>([]);

onMounted(async () => {
  try {
    banners.value = await bannerService.list<Banner[]>({ take: 10 });
  } catch (e) {
    console.error("배너 로딩 실패", e);
  }
});
</script>
