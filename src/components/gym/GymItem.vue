<template>
  <div
    :class="[
      'rounded-2xl border transition-all duration-300',
      gym.is_active === 'n'
        ? 'bg-gray-100 border-gray-300 opacity-70'
        : 'bg-white hover:shadow-xl hover:-translate-y-1',
    ]"
  >
    <div class="p-6 space-y-4">
      <!-- 🔹 상단 영역 -->
      <div class="flex justify-between items-start">
        <div class="flex-1 cursor-pointer" @click="goDetail">
          <h3 class="font-semibold text-lg tracking-tight">
            {{ gym.name }}
          </h3>

          <p class="text-sm text-gray-500 mt-1">
            {{ gym.address }} {{ gym.address_detail }}
          </p>

          <!-- 타입 -->
          <div v-if="gym.gymTypeMap?.length" class="flex flex-wrap gap-2 mt-3">
            <div
              v-for="item in gym.gymTypeMap"
              :key="item.type_id"
              class="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
            >
              <i :class="item.GymType.icon" class="text-gray-500"></i>
              <span>{{ item.GymType.name }}</span>
            </div>
          </div>

          <!-- 편의시설 -->
          <div
            v-if="gym.gymAmenityMaps?.length"
            class="flex flex-wrap gap-2 mt-2"
          >
            <div
              v-for="item in gym.gymAmenityMaps"
              :key="item.amenity_id"
              class="flex items-center gap-1 px-3 py-1 text-xs bg-gray-50 text-gray-600 rounded-full"
            >
              <i :class="item.amenity.icon" class="text-gray-400"></i>
              <span>{{ item.amenity.text }}</span>
            </div>
          </div>

          <!-- 볼더링 색상-->
          <div
            v-if="gym.gymBoulderColors?.length"
            class="flex flex-wrap gap-2 mt-2"
          >
            <ColorBadgeList
              :colors="gym.gymBoulderColors.map((item) => item.boulderColor)"
              shape="circle"
            />
          </div>
        </div>

        <!-- 드롭다운 -->
        <div v-if="changeFlg" class="relative ml-4" ref="dropdown">
          <button
            @click.stop="toggle"
            class="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <i class="fa-solid fa-ellipsis-vertical text-gray-500"></i>
          </button>

          <div
            v-if="open"
            class="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow-lg z-50"
          >
            <button
              @click.stop="handleBookmark"
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              북마크
            </button>

            <button
              @click.stop="handleDetail"
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              상세
            </button>

            <button
              @click.stop="handleChange"
              class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
            >
              수정
            </button>

            <button
              @click.stop="handleDelete"
              class="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
            >
              삭제
            </button>
          </div>
        </div>
      </div>

      <!-- 🔹 세부 영역 -->
      <template v-if="detail">
        <div class="pt-5 border-t space-y-4">
          <!-- 가격 -->
          <div v-if="detail.day_pass_price">
            <div
              class="px-4 py-1.5 bg-blue-50 text-blue-700 font-semibold rounded-lg text-sm inline-block"
            >
              일일 {{ detail.day_pass_price.toLocaleString() }}원
            </div>
          </div>

          <!-- 설명 -->
          <div
            v-if="detail.description"
            class="text-sm text-gray-600 leading-relaxed line-clamp-4"
            v-html="detail.description"
          ></div>

          <!-- 이미지 -->
          <div v-if="detail.images?.length" class="grid grid-cols-5 gap-3">
            <img
              v-for="img in detail.images"
              :key="img.id"
              :src="`${apiUrl}${img.file_url}`"
              class="w-full h-[120px] object-cover rounded-xl cursor-pointer transition hover:brightness-110"
              @click="openImage(`${apiUrl}${img.file_url}`)"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- 🔹 이미지 모달 -->
    <Teleport to="body">
      <div
        v-if="selectedImage"
        class="fixed inset-0 bg-black/80 flex items-center justify-center z-[99999]"
        @click.self="closeImage"
      >
        <img
          :src="selectedImage"
          class="max-w-[90%] max-h-[90%] object-contain rounded-xl shadow-2xl"
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
import ColorBadgeList from "@/components/common/ColorBadgeList.vue";

export default {
  name: "GymItem",

  components: {
    ColorBadgeList,
  },

  props: {
    gym: { type: Object, required: true },
    detail: { type: Object },
    changeFlg: { type: Boolean, default: false },
    onDelete: Function,
    onBookmark: Function,
    onChange: Function,
    onDetail: Function,
  },

  data() {
    return {
      open: false,
      selectedImage: null,
    };
  },

  computed: {
    apiUrl() {
      return import.meta.env.VITE_API_URL;
    },
  },

  methods: {
    goDetail() {
      this.$router.push(`/locationDetail/${this.gym.id}`);
    },

    toggle() {
      this.open = !this.open;
    },

    handleBookmark() {
      this.open = false;
      this.onBookmark?.(this.gym);
    },

    handleChange() {
      this.open = false;
      this.onChange?.(this.gym);
    },

    handleDetail() {
      this.open = false;
      this.onDetail?.(this.gym);
    },

    handleDelete() {
      this.open = false;
      this.onDelete?.(this.gym);
    },

    handleClickOutside(e) {
      if (!this.$refs.dropdown) return;
      if (!this.$refs.dropdown.contains(e.target)) {
        this.open = false;
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

  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>
