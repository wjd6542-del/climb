<template>
  <div>
    <div
      ref="card"
      class="relative rounded-xl border bg-white shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-out hover:border-gray-400"
    >
      <div class="p-4">
        <!-- 상단 -->
        <div class="flex justify-between items-start mb-1">
          <h3 class="font-semibold text-lg" @click="goDetail">
            {{ post.title }}
          </h3>
          <div class="flex items-center gap-3">
            <span class="text-xs text-gray-500">
              ⭐ {{ post.rating.toFixed(1) }}
            </span>

            <!-- 🔥 공용 드롭다운 -->
            <BaseDropdown
              v-if="changeFlg"
              :items="actionItems"
              @change="handleAction"
            >
              <template #trigger>
                <button
                  class="text-gray-500 hover:text-gray-700"
                  @click.stop
                ></button>
              </template>
            </BaseDropdown>
          </div>
        </div>

        <!-- 내용 -->
        <div class="prose max-w-none text-sm mb-2" v-html="post.content"></div>

        <div class="text-sm text-gray-500 mb-2">장소 : {{ post.gym.name }}</div>

        <div class="text-sm text-gray-500 mb-2">
          <i class="fa-solid fa-calendar"></i>
          <DateTime :value="post.created_at" />
        </div>

        <!-- 이미지 -->
        <div v-if="post.images?.length" class="flex flex-wrap gap-3 mt-3">
          <img
            v-for="img in post.images"
            :key="img.id"
            :src="`${apiUrl}${img.file_url}`"
            class="w-[100px] h-[100px] object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
            @click="openImage(`${apiUrl}${img.file_url}`)"
          />
        </div>
      </div>
    </div>

    <!-- 🔥 Teleport 모달 -->
    <Teleport to="body">
      <div
        v-if="selectedImage"
        class="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]"
        @click.self="closeImage"
      >
        <img
          :src="selectedImage"
          class="max-w-[90%] max-h-[90%] object-contain rounded-lg shadow-2xl"
        />

        <button
          class="absolute top-6 right-6 text-white text-3xl"
          @click="closeImage"
        >
          ✕
        </button>
      </div>
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
  },

  emits: ["delete", "edit"],

  data() {
    return {
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
      this.$router.push(`/shareDetail/${this.post.id}`);
    },

    handleAction(action) {
      if (action === "edit") {
        this.$emit("edit", this.post);
      }
      if (action === "delete") {
        this.$emit("delete", this.post);
      }
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
