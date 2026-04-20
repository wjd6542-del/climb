<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-6xl mx-auto px-6">
      <!-- 검색 -->
      <div class="mb-14">
        <div class="relative max-w-3xl mx-auto">
          <input
            v-model="keyword"
            @keyup.enter="handleSearch"
            type="text"
            :placeholder="$t('장소명, 게시물 제목으로 검색')"
            class="w-full h-16 pl-14 pr-6 text-lg rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
          />
          <i
            class="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl"
          ></i>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <h3
              class="text-lg font-semibold text-gray-800 flex items-center gap-2"
            >
              <i class="fa-regular fa-newspaper text-blue-500"></i>
              {{ $t("정보") }}
            </h3>
            <span class="text-xs text-gray-400">
              {{ $t("최신") }} {{ postList.length || 0 }}{{ $t("건") }}
            </span>
          </div>

          <PostList :posts="postList" />
        </section>

        <section class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <h3
              class="text-lg font-semibold text-gray-800 flex items-center gap-2"
            >
              <i class="fa-solid fa-location-dot text-red-500"></i>
              {{ $t("장소") }}
            </h3>

            <span class="text-xs text-gray-400">
              {{ $t("최신") }} {{ gymList.length || 0 }}{{ $t("건") }}
            </span>

            <button
              @click="openMapModal = !openMapModal"
              class="px-2 py-1.5 text-sm rounded-lg border flex items-center gap-2 transition"
            >
              <i class="fa-solid fa-map"></i>
              {{ $t("지도") }}
            </button>
          </div>

          <GymList :gyms="gymList" />
        </section>

        <section class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <h3
              class="text-lg font-semibold text-gray-800 flex items-center gap-2"
            >
              <i class="fa-solid fa-mountain text-green-500"></i>
              {{ $t("난이도") }}
            </h3>
            <span class="text-xs text-gray-400">
              {{ $t("최신") }} {{ routeList.length || 0 }}{{ $t("건") }}
            </span>
          </div>

          <RouteList :routs="routeList" />
        </section>

        <section class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div class="flex items-center justify-between mb-6">
            <h3
              class="text-lg font-semibold text-gray-800 flex items-center gap-2"
            >
              <i class="fa-regular fa-map text-yellow-500"></i>
              {{ $t("위치") }}
            </h3>
            <span class="text-xs text-gray-400">
              {{ $t("총") }} {{ markerList.length || 0 }}{{ $t("건") }}
            </span>
          </div>

          <div class="space-y-3">
            <v-chart
              v-if="chartOption"
              class="w-full h-[350px]"
              :option="chartOption"
              autoresize
            />
          </div>
        </section>
      </div>
    </div>

    <!-- 맵 모달 -->
    <BaseModal v-model="openMapModal" :title="$t('지도')" width="full">
      <template #header>
        <h2 class="text-lg font-semibold">
          <i class="fa-solid fa-map"></i>
          {{ $t("지도") }}
        </h2>
      </template>

      <div class="space-y-4">
        <KakaoMap
          :markers="markerList"
          class="h-[800px] rounded-2xl shadow-xl"
        />
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

import { gymService } from "@/api/gymService";
import { gymPostService } from "@/api/gymPostService";
import { routeService } from "@/api/routeService";

import PostList from "@/components/gymPost/PostList.vue";
import GymList from "@/components/gym/GymList.vue";
import RouteList from "@/components/route/RouteList.vue";
import KakaoMap from "@/components/common/KakaoMap.vue";
import BaseModal from "@/components/common/BaseModal.vue";

import type { Gym, GymPost, Route, SidoGroupItem } from "@/types";

const gymList = ref<Gym[]>([]);
const markerList = ref<Gym[]>([]);
const postList = ref<GymPost[]>([]);
const routeList = ref<Route[]>([]);
const chartOption = ref<Record<string, any> | null>(null);
const keyword = ref("");
const openMapModal = ref(false);

async function loadGymsList() {
  try {
    gymList.value = await gymService.list<Gym[]>({ take: 5, keyword: keyword.value });
  } catch (e) {
    console.error("장소정보 로드 실패", e);
  }
}

async function loadGymPostList() {
  try {
    postList.value = await gymPostService.list<GymPost[]>({
      take: 5,
      keyword: keyword.value,
    });
  } catch (e) {
    console.error("게시물 정보 로딩 실패", e);
  }
}

async function loadMarkerList() {
  try {
    markerList.value = await gymService.list<Gym[]>({});
  } catch (e) {
    console.error("마커 정보 로딩 실패", e);
  }
}

async function loadSidoList() {
  const sidos = await gymService.sidoGroup<SidoGroupItem[]>();
  sidos.sort((a, b) => a.count - b.count);

  chartOption.value = {
    tooltip: { trigger: "axis" },
    grid: { left: "3%", right: "4%", bottom: "3%" },
    series: [
      {
        name: "",
        type: "pie",
        radius: ["30%", "55%"],
        center: ["50%", "40%"],
        label: {
          show: true,
          formatter: (params: any) => `${params.name} (${params.value})`,
        },
        data: sidos.map((d) => ({ value: d.count, name: d.sido })),
      },
    ],
  };
}

async function loadRouteList() {
  routeList.value = await routeService.list<Route[]>({ take: 5 });
}

async function handleSearch() {
  await Promise.all([loadGymsList(), loadGymPostList()]);
}

onMounted(async () => {
  await Promise.all([
    loadGymsList(),
    loadGymPostList(),
    loadMarkerList(),
    loadSidoList(),
    loadRouteList(),
  ]);
});
</script>
