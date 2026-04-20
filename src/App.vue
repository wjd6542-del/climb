<template>
  <RouterView v-slot="{ Component, route }">
    <transition name="layout" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </RouterView>

  <AlertModal
    :visible="alertStore.visible"
    :title="alertStore.title"
    :message="alertStore.message"
    :type="alertStore.type"
    @ok="alertStore.ok"
    @cancel="alertStore.cancel"
  />

  <ScrollTop />

  <transition name="fade">
    <div
      v-if="bookmark.panelOpen"
      class="fixed inset-0 bg-black/40 z-40"
      @click="bookmark.closePanel()"
    />
  </transition>

  <transition name="slide">
    <div
      v-if="bookmark.panelOpen"
      class="fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white shadow-2xl z-50 flex flex-col"
    >
      <div class="p-4 border-b flex justify-between items-center">
        <h3 class="font-semibold text-lg">
          <i class="fa-regular fa-bookmark"></i> 북마크
        </h3>
        <button @click="bookmark.closePanel()">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4">
        <BookmarkList />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { onMounted, getCurrentInstance } from "vue";
import { useI18nStore } from "@/stores/i18nStore";
import { alertStore } from "@/plugins/alert.store";
import { useBookmarkStore } from "@/stores/bookmarkStore";

import AlertModal from "@/components/common/AlertModal.vue";
import BookmarkList from "@/components/common/BookmarkList.vue";
import ScrollTop from "@/components/common/ScrollTop.vue";

const i18n = useI18nStore();
const bookmark = useBookmarkStore();

const instance = getCurrentInstance();
if (instance) {
  instance.appContext.config.globalProperties.$t = (key: string) => i18n.t(key);
}

onMounted(() => {
  i18n.initLocale();
  i18n.loadLangPacks();
});
</script>

<style>
.layout-enter-active,
.layout-leave-active {
  transition: opacity 0.2s ease;
}

.layout-enter-from,
.layout-leave-to {
  opacity: 0;
}
</style>
