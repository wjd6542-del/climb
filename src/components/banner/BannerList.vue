<template>
  <div>
    <div v-if="banners.length === 0" class="text-gray-500">
      <div class="p-5 rounded-xl border bg-white shadow-sm text-center">
        베너 정보가 없습니다
      </div>
    </div>

    <transition-group name="list" tag="div" class="space-y-3">
      <BannerItem
        v-for="banner in banners"
        :key="banner.id"
        :banner="banner"
      />
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import BannerItem from "./BannerItem.vue";
import type { Banner } from "@/types";

defineProps<{
  banners: Banner[];
  changeFlg?: boolean;
  deleteHandler?: (banner: Banner) => void;
  changeHandler?: (banner: Banner) => void;
}>();
</script>
