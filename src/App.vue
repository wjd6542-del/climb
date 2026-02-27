<template>
  <RouterView v-slot="{ Component, route }">
    <transition name="layout" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </RouterView>

  <!-- 기존 Alert -->
  <AlertModal
    :visible="alertStore.visible"
    :title="alertStore.title"
    :message="alertStore.message"
    :type="alertStore.type"
    @ok="alertStore.ok"
    @cancel="alertStore.cancel"
  />
</template>

<script lang="ts">
import { onMounted, getCurrentInstance } from "vue";
import { useI18nStore } from "@/stores/i18nStore";
import { alertStore } from "@/plugins/alert.store";
import AlertModal from "@/components/common/AlertModal.vue";

export default {
  name: "App",

  components: {
    AlertModal,
  },

  setup() {
    const i18n = useI18nStore();
    const { appContext } = getCurrentInstance() as any;

    onMounted(() => {
      i18n.initLocale();
      i18n.loadLangPacks();
    });

    appContext.config.globalProperties.$t = (key: string) => {
      return i18n.t(key);
    };

    return { alertStore };
  },
};
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
