<template>
  <div class="page-wrapper">
    <div v-if="!gym" class="min-h-[70vh] flex items-center justify-center px-4">
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

    <div v-if="gym" class="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <section
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div class="flex items-center justify-between mb-5">
          <h2
            class="text-lg font-semibold text-gray-800 flex items-center gap-2"
          >
            <i class="fa-solid fa-location-dot text-blue-500"></i>
            {{ $t("장소") }}
          </h2>
        </div>

        <GymItem :gym="gym" :detail="detail" :mainFlg="true" />
      </section>

      <section
        class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div class="flex items-center justify-between mb-5">
          <h2
            class="text-lg font-semibold text-gray-800 flex items-center gap-2"
          >
            <i class="fa-solid fa-layer-group text-red-500"></i>
            {{ $t("난이도") }}
          </h2>
        </div>

        <RouteList :routs="routs" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

import { gymService } from "@/api/gymService";
import { gymDetailService } from "@/api/gymDetailService";
import { routeService } from "@/api/routeService";

import GymItem from "@/components/gym/GymItem.vue";
import RouteList from "@/components/route/RouteList.vue";

import type { Gym, GymDetail, Route } from "@/types";

const route = useRoute();

const gym = ref<Gym | null>(null);
const detail = ref<GymDetail | null>(null);
const routs = ref<Route[]>([]);

onMounted(async () => {
  const gym_id = Number(route.query.gym_id);
  const route_id = Number(route.query.route_id);
  if (!gym_id) return;

  try {
    gym.value = await gymService.get<Gym>(gym_id);
  } catch (e) {
    console.error("짐 정보 로딩 실패", e);
  }

  try {
    detail.value = await gymDetailService.getGym<GymDetail>(gym_id);
  } catch (e) {
    console.error("상세 정보 로딩 실패", e);
  }

  try {
    routs.value = await routeService.list<Route[]>({ gym_id, route_id });
  } catch (e) {
    console.error("난이도 정보 로딩 실패", e);
  }
});
</script>
