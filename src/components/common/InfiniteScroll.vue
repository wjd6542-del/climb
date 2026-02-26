<template>
  <div class="w-full">
    <!-- 실제 리스트 영역 -->
    <slot />

    <!-- 로딩 표시 -->
    <div v-if="loading" class="flex justify-center py-6">
      <div
        class="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
      ></div>
    </div>

    <!-- 더 이상 없음 -->
    <div
      v-if="!hasMore && !loading"
      class="text-center text-sm text-gray-400 py-6"
    >
      마지막 데이터입니다
    </div>

    <!-- 바닥 감지용 -->
    <div ref="sentinel" class="h-2"></div>
  </div>
</template>

<script>
export default {
  name: "InfiniteScroll",

  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    hasMore: {
      type: Boolean,
      default: true,
    },
    threshold: {
      type: Number,
      default: 0.1,
    },
    rootMargin: {
      type: String,
      default: "0px 0px 200px 0px", // 미리 로딩
    },
  },

  emits: ["loadMore"],

  mounted() {
    this.createObserver();
  },

  beforeUnmount() {
    this.destroyObserver();
  },

  methods: {
    createObserver() {
      this.observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];

          if (entry.isIntersecting && !this.loading && this.hasMore) {
            this.$emit("loadMore");
          }
        },
        {
          threshold: this.threshold,
          rootMargin: this.rootMargin,
        },
      );

      this.observer.observe(this.$refs.sentinel);
    },

    destroyObserver() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    },
  },
};
</script>
