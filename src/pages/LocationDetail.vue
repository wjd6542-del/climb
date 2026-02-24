<template>
  <div class="page-wrapper">
    <!-- 중앙 정렬 래퍼만 추가 -->
    <div v-if="!gym" class="min-h-[70vh] flex items-center justify-center px-4">
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
            등록된 정보가 없습니다
          </h2>

          <!-- 설명 -->
          <p class="text-gray-500 text-base leading-relaxed">
            요청하신 장소 정보를 찾을 수 없습니다.<br />
            삭제되었거나 존재하지 않는 데이터일 수 있습니다.
          </p>

          <!-- 버튼 -->
          <RouterLink
            to="/search"
            class="inline-flex items-center gap-3 px-8 py-3 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 active:scale-95 transition-all duration-200"
          >
            <i class="fa-solid fa-magnifying-glass"></i>
            메인으로
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- 정상 데이터 -->
    <GymItem v-if="gym" :gym="gym" :detail="detail" />
  </div>
</template>

<script lang="ts">
import api from "@/lib/api.js";
import GymItem from "@/components/gym/GymItem.vue";

export default {
  name: "LocationDetail",

  components: {
    GymItem,
  },

  data() {
    return {
      gym: null as any,
      detail: null as any,
    };
  },

  async mounted() {
    const gymId = Number(this.$route.params.id);
    if (!gymId) return;
    await this.loadGym(gymId);
    await this.loadDetail(gymId);
  },

  methods: {
    async loadGym(id: number) {
      try {
        const res = await api.post(`/api/gyms/${id}`, { id });
        this.gym = res.data;
      } catch (e) {
        console.error("짐 정보 로딩 실패", e);
      }
    },

    async loadDetail(id: number) {
      try {
        const res = await api.post(`/api/gymDetail/getGym`, { gym_id: id });
        console.log(res.data);
        this.detail = res.data;
      } catch (e) {
        console.error("상세 정보 로딩 실패", e);
      }
    },
  },
};
</script>
