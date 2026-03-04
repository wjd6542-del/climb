<template>
  <div class="min-h-screen bg-gray-50">
    <Header />

    <main class="max-w-7xl mx-auto p-4 relative">
      <RouterView v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </RouterView>
    </main>
  </div>
</template>

<script lang="ts">
import Header from "@/components/layout/Header.vue";
export default {
  name: "DefaultLayout",

  components: {
    Header,
  },

  data() {
    return {};
  },
};
</script>
