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

<script>
export default {
  name: "ScrollTop",
  data() {
    return {
      visible: false,
    };
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      this.visible = window.scrollY > 300;
    },
    scrollTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
  },
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
