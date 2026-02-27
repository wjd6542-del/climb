<template>
  <div v-if="bannerImage" class="w-full">
    <div
      @click="openUrl"
      class="group relative w-full aspect-[16/9] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer"
    >
      <img
        :src="`${apiUrl}${bannerImage.file_url}`"
        class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        alt="banner image"
      />

      <!-- 클릭 막지 않도록 pointer-events-none -->
      <div
        class="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-all duration-300 pointer-events-none"
      ></div>
    </div>
  </div>
</template>
<script>
export default {
  name: "BannerItem",
  props: {
    banner: { type: Object, required: true },
  },
  computed: {
    apiUrl() {
      return import.meta.env.VITE_API_URL;
    },
    bannerImage() {
      return this.banner.images?.[0] ?? null;
    },
  },
  methods: {
    openUrl() {
      if (!this.banner?.url) return;

      window.open(this.banner.url, "_blank", "noopener,noreferrer");
    },
  },
};
</script>
