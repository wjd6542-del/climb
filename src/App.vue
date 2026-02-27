<template>
  <RouterView v-slot="{ Component, route }">
    <transition name="layout" mode="out-in">
      <component :is="Component" :key="route.matched[0].path" />
    </transition>
  </RouterView>
</template>

<script lang="ts">
import { onMounted, getCurrentInstance } from "vue";
import { useI18nStore } from "@/stores/i18nStore";

export default {
  name: "App",
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

    return {};
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
