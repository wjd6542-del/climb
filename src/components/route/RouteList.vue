<template>
  <div>
    <div v-if="routs.length === 0" class="text-gray-500">
      <div class="p-5 rounded-xl border bg-white shadow-sm text-center">
        등록된 정보가 없습니다
      </div>
    </div>

    <transition-group name="list" tag="div" class="space-y-3">
      <RouteItem
        v-for="rout in routs"
        :key="rout.id"
        :rout="rout"
        :onDelete="deleteHandler"
        :onBookmark="bookmarkHandler"
        :onChange="changeHandler"
        :changeFlg="changeFlg"
      />
    </transition-group>
  </div>
</template>

<script>
import RouteItem from "./RouteItem.vue";

export default {
  props: {
    routs: {
      type: Array,
      required: true,
    },
    changeFlg: {
      type: Boolean,
    },
    deleteHandler: { type: Function },
    bookmarkHandler: { type: Function },
    changeHandler: { type: Function },
  },

  components: { RouteItem },
};
</script>
