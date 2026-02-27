<template>
  <div class="page-wrapper">
    <!-- 중앙 정렬 래퍼만 추가 -->
    <div
      v-if="!post"
      class="min-h-[70vh] flex items-center justify-center px-4"
    >
      <div
        class="w-full max-w-xl text-center bg-white rounded-3xl shadow-2xl p-12 border border-gray-200"
      >
        <div class="flex flex-col items-center gap-8">
          <!-- 🔥 아이콘 -->
          <div
            class="w-28 h-28 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 text-5xl shadow-inner"
          >
            <i class="fa-solid fa-magnifying-glass"></i>
          </div>

          <!-- 타이틀 -->
          <h2 class="text-3xl font-bold text-gray-800">
            {{ $t("등록된 정보가 없습니다") }}
          </h2>
          <!-- 설명 -->
          <p class="text-gray-500 text-base leading-relaxed">
            {{ $t("요청하신 정보를 찾을 수 없습니다.") }}<br />
            {{ $t("삭제되었거나 존재하지 않는 데이터일 수 있습니다.") }}
          </p>

          <!-- 버튼 -->
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

        <div v-if="post">
          <PostItem :post="post" />
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import api from "@/lib/api.js";
import PostItem from "@/components/gymPost/PostItem.vue";

export default {
  name: "GymPostDetailPage",

  components: {
    PostItem,
  },

  data() {
    return {
      post: null as any,
      detail: null as any,
      routs: [] as any,
    };
  },

  methods: {
    // 메인정보
    async loadData(id: number) {
      try {
        const res = await api.post(`/api/gymPost/${id}`, { id });
        this.post = res.data;
      } catch (e) {
        console.error("로딩 실패", e);
      }
    },
  },

  async mounted() {
    const id = Number(this.$route.query.id);
    if (!id) return;
    await this.loadData(id);
  },
};
</script>
