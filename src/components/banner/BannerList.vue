<template>
  <div>
    <div v-if="banners.length === 0" class="text-gray-500">
      <div class="p-5 rounded-xl border bg-white shadow-sm text-center">
        베너 정보가 없습니다
      </div>
    </div>

    <transition-group name="list" tag="div" class="space-y-3">
      <bannerItem
        v-for="banner in banners"
        :key="banner.id"
        :banner="banner"
        :changeFlg="changeFlg"
        :onDelete="deleteHandler"
        :onChange="changeHandler"
      />
    </transition-group>
  </div>
</template>

<script>
import BannerItem from "./BannerItem.vue";

export default {
  props: {
    banners: {
      type: Array,
      required: true,
    },
    changeFlg: {
      type: Boolean,
    },
    deleteHandler: { type: Function },
    changeHandler: { type: Function },
  },
  components: { BannerItem },
};
</script>
