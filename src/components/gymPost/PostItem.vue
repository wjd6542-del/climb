<template>
  <div class="relative group">
    <div
      ref="card"
      class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl"
    >
      <div class="flex justify-between items-start mb-3">
        <div class="flex-1 cursor-pointer min-w-0" @click="goDetail">
          <div class="flex items-center gap-2 mb-1">
            <h3
              class="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors"
            >
              {{ post.title }}
            </h3>
          </div>
          <div class="flex items-center gap-3">
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-xs font-bold rounded-md border border-amber-100"
            >
              <i class="fa-solid fa-star text-[10px]"></i>
              {{ post.rating.toFixed(1) }}
            </span>
            <span class="text-xs text-gray-400 flex items-center gap-1">
              <i class="fa-regular fa-clock text-[11px]"></i>
              <DateTime :value="post.created_at" />
            </span>
          </div>
        </div>

        <div v-if="changeFlg" class="relative shrink-0" ref="dropdown">
          <button
            @click.stop="toggle"
            class="p-2 rounded-xl hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
          >
            <i
              class="fa-solid fa-ellipsis-vertical text-gray-400 group-hover:text-gray-600"
            ></i>
          </button>

          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div
              v-if="open"
              class="absolute right-0 mt-2 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1"
            >
              <div class="h-[1px] bg-gray-100 my-1"></div>
              <button @click.stop="handleChange" class="menu-btn text-blue-600">
                <i class="fa-regular fa-pen-to-square mr-2"></i>수정
              </button>
              <button
                @click.stop="handleDelete"
                class="menu-btn text-red-500 hover:bg-red-50"
              >
                <i class="fa-regular fa-trash-can mr-2"></i>삭제
              </button>
            </div>
          </transition>
        </div>
      </div>

      <div class="mb-3">
        <span
          class="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg"
        >
          <i class="fa-solid fa-location-dot text-[11px]"></i>
          {{ post.gym.name }}
        </span>
      </div>

      <div
        class="prose prose-sm max-w-none text-gray-600 mb-4 line-clamp-2 leading-relaxed text-[14px]"
        v-html="post.content"
      ></div>

      <div v-if="post.images?.length" class="flex flex-wrap gap-2 mt-2">
        <div
          v-for="img in post.images"
          :key="img.id"
          class="relative overflow-hidden rounded-xl border border-gray-100 aspect-square w-20 group/img shadow-sm"
        >
          <img
            :src="`${apiUrl}${img.file_url}`"
            class="w-full h-full object-cover cursor-pointer transition duration-300 group-hover/img:scale-110 group-hover/img:brightness-90"
            @click="openImage(`${apiUrl}${img.file_url}`)"
          />
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="selectedImage"
          class="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999]"
          @click.self="closeImage"
        >
          <div
            class="relative max-w-[90%] max-h-[90%] flex flex-col items-center"
          >
            <img
              :src="selectedImage"
              class="rounded-xl shadow-2xl object-contain max-h-[85vh]"
            />
            <button
              class="mt-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
              @click="closeImage"
            >
              <i class="fa-solid fa-xmark text-2xl"></i>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import DateTime from "@/components/common/DateTime.vue";
import BaseDropdown from "@/components/common/BaseDropdown.vue";

export default {
  name: "PostItem",
  components: {
    DateTime,
    BaseDropdown,
  },
  props: {
    post: { type: Object, required: true },
    changeFlg: { type: Boolean, default: false },
    onChange: Function,
    onDelete: Function,
  },
  emits: ["delete", "edit"],
  data() {
    return {
      open: false,
      selectedImage: null,
      actionItems: [
        {
          value: "edit",
          label: "수정",
          icon: "fa-solid fa-pen-to-square",
        },
        {
          value: "delete",
          label: "삭제",
          icon: "fa-solid fa-trash",
          danger: true,
        },
      ],
    };
  },
  computed: {
    apiUrl() {
      return import.meta.env.VITE_API_URL;
    },
  },
  methods: {
    goDetail() {
      this.$router.push({
        path: `/shareDetail`,
        query: {
          id: this.post.id,
        },
      });
    },
    toggle() {
      this.open = !this.open;
    },
    handleChange() {
      this.open = false;
      this.onChange?.(this.post);
    },
    handleDelete() {
      this.open = false;
      this.onDelete?.(this.post);
    },
    openImage(url) {
      this.selectedImage = url;
      document.body.style.overflow = "hidden";
    },
    closeImage() {
      this.selectedImage = null;
      document.body.style.overflow = "";
    },
  },
};
</script>

<style scoped>
/* 줄바꿈 및 본문 가독성 */
.prose {
  word-break: break-all;
}
/* 드롭다운 메뉴 버튼 */
.menu-btn {
  @apply w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center active:bg-gray-100;
}
</style>
