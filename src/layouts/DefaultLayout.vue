<template>
  <div class="min-h-screen bg-gray-50">
    <Header @open-bookmark="bookmarkOpen = true" />

    <main class="max-w-7xl mx-auto p-4 relative">
      <RouterView v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </RouterView>
    </main>

    <!-- 북마크 오버레이 -->
    <transition name="fade">
      <div
        v-if="bookmarkOpen"
        class="fixed inset-0 bg-black/40 z-40"
        @click="bookmarkOpen = false"
      />
    </transition>

    <!-- 북마크 패널 -->
    <transition name="slide">
      <div
        v-if="bookmarkOpen"
        class="fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white shadow-2xl z-50 flex flex-col"
      >
        <div class="p-4 border-b flex justify-between items-center">
          <h3 class="font-semibold text-lg">
            <i class="fa-regular fa-bookmark"></i> 북마크
          </h3>
          <button @click="bookmarkOpen = false">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          <BookmarkList />
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Header from "@/components/layout/Header.vue";
import BookmarkList from "@/components/common/BookmarkList.vue";

export default {
  name: "DefaultLayout",

  components: {
    Header,
    BookmarkList,
  },

  data() {
    return {
      bookmarkOpen: false,
    };
  },

  watch: {
    bookmarkOpen(val: boolean) {
      document.body.style.overflow = val ? "hidden" : "";
    },
  },
};
</script>
