<template>
  <div>
    <div v-if="posts.length === 0" class="text-gray-500">
      <div class="p-5 rounded-xl border bg-white shadow-sm text-center">
        등록된 게시물이 없습니다
      </div>
    </div>

    <transition-group name="list" tag="div" class="space-y-3">
      <PostItem
        v-for="post in posts"
        :key="post.id"
        :post="post"
        :changeFlg="changeFlg"
        :onDelete="deleteHandler"
        :onChange="changeHandler"
      />
    </transition-group>
  </div>
</template>

<script>
import PostItem from "./PostItem.vue";

export default {
  props: {
    posts: {
      type: Array,
      required: true,
    },
    changeFlg: {
      type: Boolean,
    },
    deleteHandler: { type: Function },
    changeHandler: { type: Function },
  },
  emits: ["delete", "edit"],
  components: { PostItem },
};
</script>
