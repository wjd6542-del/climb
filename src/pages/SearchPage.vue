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
              <i class="fa-solid fa-location-dot text-green-500"></i>
              장소정보
            </h3>
            <span class="text-xs text-gray-400">
              최신 {{ gymList.length || 0 }}건
            </span>
          </div>

          <GymList :gyms="gymList" />
        </section>

        <!-- 지도 영역 -->
        <section
          class="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
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
          <!-- 지도 -->
          <KakaoMap
            :markers="markerList"
            class="h-[500px] rounded-2xl shadow-xl"
          />
        </section>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import api from "@/lib/api.js";
import PostList from "@/components/gymPost/PostList.vue";
import GymList from "@/components/gym/GymList.vue";
import KakaoMap from "@/components/common/KakaoMap.vue";

export default {
  name: "InfoSearch",

  components: {
    PostList,
    GymList,
    KakaoMap,
  },

  data() {
    return {
      gymList: [],
      markerList: [],
      list: [],
      keyword: "", // 🔥 추가
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
  },
  async mounted() {
    await this.loadGymsList();
    await this.loadGymPostList();
    await this.loadMarkerList();
  },
};
</script>
