<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-6xl mx-auto px-6">
      <!-- 🔎 검색 영역 -->
      <div class="mb-14">
        <div class="relative max-w-3xl mx-auto">
          <input
            v-model="keyword"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="장소명, 게시물 제목으로 검색해보세요"
            class="w-full h-16 pl-14 pr-6 text-lg rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition"
          />
          <i
            class="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl"
          ></i>
        </div>
      </div>

      <!-- 좌우 영역 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- 왼쪽 영역 -->
        <section
          class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div class="flex items-center justify-between mb-6">
            <h3
              class="text-lg font-semibold text-gray-800 flex items-center gap-2"
            >
              <i class="fa-regular fa-newspaper text-blue-500"></i>
              정보공유
            </h3>
            <span class="text-xs text-gray-400"
              >최신 {{ list.length || 0 }}건
            </span>
          </div>

          <PostList :posts="list" />
        </section>

        <!-- 오른쪽 영역 -->
        <section
          class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div class="flex items-center justify-between mb-6">
            <h3
              class="text-lg font-semibold text-gray-800 flex items-center gap-2"
            >
              <i class="fa-solid fa-location-dot text-red-500"></i>
              장소정보
            </h3>
            <span class="text-xs text-gray-400">
              최신 {{ gymList.length || 0 }}건
            </span>

            <!-- 🔥 맵 토글 버튼 -->
            <button
              @click="openMapModal = !openMapModal"
              class="px-2 py-1.5 text-sm rounded-lg border flex items-center gap-2 transition"
            >
              <i class="fa-solid fa-map"></i> 지도보기
            </button>
          </div>

          <GymList :gyms="gymList" />
        </section>

        <!-- 난이도 영역 -->
        <section
          class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div class="flex items-center justify-between mb-6">
            <h3
              class="text-lg font-semibold text-gray-800 flex items-center gap-2"
            >
              <i class="fa-solid fa-mountain text-green-500"></i>
              난이도 정보
            </h3>
            <span class="text-xs text-gray-400"
              >최신 {{ routList.length || 0 }}건
            </span>
          </div>
          <!-- 난이도 정보 -->
          <RouteList :routs="routList" />
        </section>

        <!-- 위치정보 영역 -->
        <section
          class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div class="flex items-center justify-between mb-6">
            <h3
              class="text-lg font-semibold text-gray-800 flex items-center gap-2"
            >
              <i class="fa-regular fa-map text-yellow-500"></i>
              위치정보
            </h3>
            <span class="text-xs text-gray-400"
              >총 {{ markerList.length || 0 }}건
            </span>
          </div>
          <!-- 시도 리스트 -->
          <div class="space-y-3">
            <v-chart
              class="w-full h-[350px]"
              :option="chartOption"
              autoresize
            />
          </div>
        </section>
      </div>
    </div>

    <!-- 맵모달 -->
    <BaseModal v-model="openMapModal" :title="'지도 확인'" width="full">
      <template #header>
        <h2 class="text-lg font-semibold">
          <i class="fa-solid fa-map"></i> 지도 확인
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

<script lang="ts">
import api from "@/lib/api.js";
import PostList from "@/components/gymPost/PostList.vue";
import GymList from "@/components/gym/GymList.vue";
import RouteList from "@/components/route/RouteList.vue";
import KakaoMap from "@/components/common/KakaoMap.vue";
import BaseModal from "@/components/common/BaseModal.vue";

export default {
  name: "MainPage",

  components: {
    PostList,
    GymList,
    RouteList,
    KakaoMap,
    BaseModal,
  },

  data() {
    return {
      gymList: [],
      markerList: [],
      list: [],
      sidoList: [],
      routList: [],
      chartOption: null,
      keyword: "", // 🔥 추가
      openMapModal: false,
    };
  },

  computed: {},

  methods: {
    async handleSearch() {
      await Promise.all([this.loadGymsList(), this.loadGymPostList()]);
    },
    // 리스트 검색
    async loadGymsList() {
      try {
        const res = await api.post("/api/gyms/list", {
          take: 5,
          keyword: this.keyword,
        });
        this.gymList = res.data;
      } catch (e) {
        console.error("장소정보 로드 실패", e);
      }
    },

    // 리스트 검색
    async loadGymPostList() {
      try {
        const res = await api.post("/api/gymPost/list", {
          take: 5,
          keyword: this.keyword,
        });
        this.list = res.data;
      } catch (e) {
        console.error("게시물 정보 로딩 실패", e);
      }
    },

    // 리스트 검색
    async loadMarkerList() {
      try {
        const res = await api.post("/api/gyms/list", {});
        this.markerList = res.data;
      } catch (e) {
        console.error("게시물 정보 로딩 실패", e);
      }
    },

    async loadSidoList() {
      const res = await api.post("/api/gyms/sidoGroup");
      this.sidoList = res.data;

      // 정렬 처리
      this.sidoList.sort((a, b) => a.count - b.count);

      this.chartOption = {
        tooltip: {
          trigger: "axis",
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
        },

        series: [
          {
            name: "",
            type: "pie",
            radius: ["30%", "55%"],
            center: ["50%", "40%"], // 살짝 아래로
            label: {
              show: true,
              formatter: (params) => {
                return `${params.name} (${params.value})`;
              },
            },
            data: this.sidoList.map((d) => ({
              value: d.count,
              name: d.sido,
            })),
          },
        ],
      };
    },

    async loadRoutList() {
      const res = await api.post("/api/route/list", { take: 5 });
      this.routList = res.data;
    },
  },

  async mounted() {
    await this.loadGymsList();
    await this.loadGymPostList();
    await this.loadMarkerList();
    await this.loadSidoList();
    await this.loadRoutList();
  },
};
</script>
