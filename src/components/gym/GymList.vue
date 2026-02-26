<template>
  <div>
    <div v-if="gyms.length === 0" class="text-gray-500">
      <div class="p-5 rounded-xl border bg-white shadow-sm text-center">
        등록된 장소가 없습니다
      </div>
    </div>

    <transition-group name="list" tag="div" class="space-y-3">
      <GymItem
        v-for="gym in gyms"
        :key="gym.id"
        :gym="gym"
        :onDelete="deleteHandler"
        :onBookmark="bookmarkHandler"
        :onChange="changeHandler"
        :onDetail="detailHandler"
        :changeFlg="changeFlg"
        :mainFlg="mainFlg"
      />
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import GymItem from "./GymItem.vue";

defineProps({
  gyms: { type: Array, required: true },
  changeFlg: { type: Boolean, default: false },
  mainFlg: { type: Boolean, default: false },
  deleteHandler: { type: Function },
  bookmarkHandler: { type: Function },
  changeHandler: { type: Function },
  detailHandler: { type: Function },
});
</script>
