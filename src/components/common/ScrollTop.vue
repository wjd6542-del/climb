<template>
  <transition name="fade">
    <button
      v-if="visible"
      @click="scrollTop"
      class="fixed bottom-6 right-6 z-50 w-11 h-11 flex items-center justify-center rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:-translate-y-0.5 transition"
    >
      <i class="fa-solid fa-arrow-up"></i>
    </button>
  </transition>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const visible = ref(false);

function handleScroll() {
  visible.value = window.scrollY > 300;
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

onMounted(() => window.addEventListener("scroll", handleScroll, { passive: true }));
onBeforeUnmount(() => window.removeEventListener("scroll", handleScroll));
</script>
