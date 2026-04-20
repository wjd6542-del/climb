<template>
  <div class="page-wrapper">
    <div
      v-if="!post"
      class="min-h-[70vh] flex items-center justify-center px-4"
    >
      <div
        class="w-full max-w-xl text-center bg-white rounded-3xl shadow-2xl p-12 border border-gray-200"
      >
        <div class="flex flex-col items-center gap-8">
          <div
            class="w-28 h-28 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 text-5xl shadow-inner"
          >
            <i class="fa-solid fa-magnifying-glass"></i>
          </div>

          <h2 class="text-3xl font-bold text-gray-800">
            {{ $t("등록된 정보가 없습니다") }}
          </h2>
          <p class="text-gray-500 text-base leading-relaxed">
            {{ $t("요청하신 정보를 찾을 수 없습니다.") }}<br />
            {{ $t("삭제되었거나 존재하지 않는 데이터일 수 있습니다.") }}
          </p>

          <RouterLink
            to="/"
            class="inline-flex items-center gap-3 px-8 py-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all duration-200"
          >
            <i class="fa-solid fa-magnifying-glass"></i>
            {{ $t("메인으로") }}
          </RouterLink>
        </div>
      </div>
    </div>

    <div v-if="post" class="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <section
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div class="flex items-center justify-between mb-5">
          <h2
            class="text-lg font-semibold text-gray-800 flex items-center gap-2"
          >
            <i class="fa-solid fa-paper-plane text-blue-500"></i>
            {{ $t("정보") }}
          </h2>
        </div>

        <PostItem :post="post" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { gymPostService } from "@/api/gymPostService";
import PostItem from "@/components/gymPost/PostItem.vue";
import type { GymPost } from "@/types";

const route = useRoute();
const post = ref<GymPost | null>(null);

onMounted(async () => {
  const id = Number(route.query.id);
  if (!id) return;

  try {
    post.value = await gymPostService.get<GymPost>(id);
  } catch (e) {
    console.error("로딩 실패", e);
  }
});
</script>
