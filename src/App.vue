<template>
  <div class="min-h-screen bg-gray-50">
    <Header @open-bookmark="bookmarkOpen = true" />

    <main class="max-w-5xl mx-auto p-4 relative">
      <RouterView v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </RouterView>
    </main>
  </div>

  <!-- 🔥 북마크 오버레이 -->
  <transition name="fade">
    <div
      v-if="bookmarkOpen"
      class="fixed inset-0 bg-black/40 z-40"
      @click="closeBookmark"
    ></div>
  </transition>

  <!-- 🔥 북마크 슬라이드 패널 -->
  <transition name="slide">
    <div
      v-if="bookmarkOpen"
      class="fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white shadow-2xl z-50 flex flex-col"
    >
      <!-- 헤더 -->
      <div class="p-4 border-b flex justify-between items-center">
        <h3 class="font-semibold text-lg">
          <i class="fa-regular fa-bookmark"></i> 북마크
        </h3>
        <button @click="closeBookmark">
          <i class="fa-solid fa-xmark text-gray-500 hover:text-black"></i>
        </button>
      </div>

      <!-- 리스트 영역 -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <BookmarkList @close="closeBookmark" />
      </div>
    </div>
  </transition>

  <!-- 기존 Alert -->
  <AlertModal
    :visible="alertStore.visible"
    :title="alertStore.title"
    :message="alertStore.message"
    :type="alertStore.type"
    @ok="alertStore.ok"
    @cancel="alertStore.cancel"
  />

  <!-- 🔥 위로가기 버튼 -->
  <transition name="fade">
    <button
      v-if="showScrollTop && !bookmarkOpen"
      @click="scrollToTop"
      class="fixed bottom-8 right-8 z-[9999] w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-110 transition-all duration-200 flex items-center justify-center"
    >
      <i class="fa-solid fa-arrow-up"></i>
    </button>
  </transition>
</template>
<script lang="ts">
import { ref, watch, onMounted, onUnmounted, getCurrentInstance } from "vue";
import Header from "@/components/layout/Header.vue";
import AlertModal from "@/components/common/AlertModal.vue";
import BookmarkList from "@/components/common/BookmarkList.vue";
import { alertStore } from "@/plugins/alert.store";
import { useI18nStore } from "@/stores/i18nStore";

export default {
  name: "App",

  components: {
    Header,
    AlertModal,
    BookmarkList,
  },

  setup() {
    const bookmarkOpen = ref(false);
    const showScrollTop = ref(false);
    const i18n = useI18nStore();
    const { appContext } = getCurrentInstance() as any;

    const closeBookmark = () => {
      bookmarkOpen.value = false;
    };

    const handleScroll = () => {
      showScrollTop.value = window.scrollY > 300;
    };

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    onMounted(() => {
      i18n.initLocale();
      i18n.loadLangPacks();
      window.addEventListener("scroll", handleScroll);
    });

    onUnmounted(() => {
      window.removeEventListener("scroll", handleScroll);
    });

    appContext.config.globalProperties.$t = (key: string) => {
      const locale = i18n.locale;
      return i18n.t(key);
    };

    watch(bookmarkOpen, (val) => {
      document.body.style.overflow = val ? "hidden" : "";
    });

    return {
      bookmarkOpen,
      closeBookmark,
      alertStore,
      showScrollTop,
      scrollToTop,
    };
  },
};
</script>

<style>
/* 페이지 전환 */
.page-enter-active,
.page-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 오버레이 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 슬라이드 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
