<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <div class="max-w-7xl mx-auto flex gap-8 p-6">
      <!-- 왼쪽 영역 -->
      <aside
        class="hidden sm:block w-64 shrink-0 bg-white border rounded-2xl p-6 shadow-sm"
      >
        <div class="font-bold mb-5 text-gray-800">등산학교</div>

        <ul class="space-y-3 text-sm">
          <li class="hover:text-blue-500 cursor-pointer">공지</li>
          <li class="hover:text-blue-500 cursor-pointer">인기 암장</li>
          <li class="hover:text-blue-500 cursor-pointer">최근 활동</li>
        </ul>
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

export default {
  name: "HomeLayout",
  components: {
    Header,
  },
};
</script>
