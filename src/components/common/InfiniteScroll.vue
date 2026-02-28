<template>
  <div class="w-full">
    <slot />

    <div v-if="loading" class="text-center py-6 text-gray-400">
      불러오는 중...
    </div>

    <div v-if="!hasMore && !loading" class="text-center py-6 text-gray-300">
      마지막 데이터입니다
    </div>

    <!-- observer 영역 -->
    <div ref="sentinel" class="h-1"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  loading: Boolean,
  hasMore: Boolean,
});

const emit = defineEmits(["load-more"]);

const sentinel = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !props.loading && props.hasMore) {
        emit("load-more");
      }
    },
    { rootMargin: "200px" },
  );

  if (sentinel.value) {
    observer.observe(sentinel.value);
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
});
</script>
