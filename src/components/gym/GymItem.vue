<template>
  <div
    :class="[
      'group rounded-2xl border transition-all duration-300',
      gym.is_active === 'n'
        ? 'bg-gray-100 border-gray-300 opacity-70'
        : 'bg-white hover:shadow-2xl hover:-translate-y-1 border-gray-100',
    ]"
  >
    <div class="p-6">
      <div class="flex justify-between items-start gap-4">
        <div class="flex-1 cursor-pointer min-w-0" @click="goDetail">
          <div class="flex items-center gap-2 mb-1">
            <h3 class="font-bold text-xl tracking-tight text-gray-900 truncate">
              {{ gym.name }}
            </h3>
            <span
              v-if="gym.is_active === 'n'"
              class="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase"
              >보수중</span
            >
          </div>

          <p class="text-sm text-gray-500 flex items-center gap-1">
            <i class="fa-solid fa-location-dot text-[11px] text-gray-400"></i>
            {{ gym.address }} {{ gym.address_detail }}
          </p>
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
              <button @click.stop="handleBookmark" class="menu-btn">
                <i class="fa-regular fa-bookmark mr-2"></i>북마크
              </button>
              <button @click.stop="handleDetail" class="menu-btn">
                <i class="fa-regular fa-file-lines mr-2"></i>상세
              </button>
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

      <!-- 🔥 정보 영역 -->
      <div class="mt-6 space-y-5">
        <!-- 1️⃣ 타입 + 편의시설 -->
        <div
          v-if="gym.gymTypeMap?.length || gym.gymAmenityMaps?.length"
          class="flex flex-wrap gap-2"
        >
          <span
            v-for="item in gym.gymTypeMap"
            :key="item.type_id"
            class="tag-primary"
          >
            <i :class="item.GymType.icon" class="mr-1 opacity-70"></i>
            {{ item.GymType.name }}
          </span>

          <span
            v-for="item in gym.gymAmenityMaps"
            :key="item.amenity_id"
            class="tag-secondary"
          >
            <i :class="item.amenity.icon" class="mr-1 opacity-60"></i>
            {{ item.amenity.text }}
          </span>
        </div>

        <!-- 2️⃣ ROUTE COLOR -->
        <div
          v-if="gym.gymBoulderColors?.length && mainFlg"
          class="bg-slate-50 p-4 rounded-2xl border border-slate-100"
        >
          <div class="group-label mb-3">Route Color</div>
          <ColorBadgeList
            :colors="gym.gymBoulderColors.map((item) => item.boulderColor)"
            shape="circle"
          />
        </div>

        <!-- 3️⃣ ROUTES -->
        <div
          v-if="gym.gymDifficulties?.length && mainFlg"
          class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4"
        >
          <!-- LEAD -->
          <div
            v-if="gym.gymDifficulties.some((d) => d.difficulty.code === 'LEAD')"
          >
            <div class="text-[11px] font-bold text-blue-500 mb-2">LEAD</div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="item in gym.gymDifficulties.filter(
                  (d) => d.difficulty.code === 'LEAD',
                )"
                :key="'l-' + item.difficulty.id"
                class="tag-secondary"
              >
                {{ item.difficulty.name }}
              </span>
            </div>
          </div>

          <!-- BOULDER -->
          <div
            v-if="
              gym.gymDifficulties.some((d) => d.difficulty.code === 'BOULDER')
            "
          >
            <div class="text-[11px] font-bold text-purple-500 mb-2">
              BOULDER
            </div>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="item in gym.gymDifficulties.filter(
                  (d) => d.difficulty.code === 'BOULDER',
                )"
                :key="'b-' + item.difficulty.id"
                class="tag-secondary"
              >
                {{ item.difficulty.name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <template v-if="detail">
        <div class="mt-6 pt-6 border-t border-dashed border-gray-200 space-y-6">
          <div
            v-if="detail.day_pass_price"
            class="flex items-center justify-between bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50"
          >
            <span class="text-sm font-bold text-blue-900">일일 이용권</span>
            <span class="text-lg font-black text-blue-600">
              {{ detail.day_pass_price.toLocaleString()
              }}<span class="text-sm font-normal ml-0.5">원</span>
            </span>
          </div>

          <div v-if="detail.description">
            <div class="group-label mb-2 flex items-center gap-2">
              <i class="fa-solid fa-quote-left text-[10px] text-gray-400"></i>
              Information
            </div>
            <div
              class="text-sm text-gray-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap"
              v-html="detail.description"
            ></div>
          </div>

          <div v-if="detail.images?.length">
            <div class="group-label mb-3">Gallery</div>
            <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              <div
                v-for="(img, idx) in detail.images"
                :key="img.id"
                class="relative aspect-square group/img overflow-hidden rounded-xl border border-gray-200"
              >
                <img
                  :src="`${apiUrl}${img.file_url}`"
                  class="w-full h-full object-cover transition duration-500 group-hover/img:scale-110 cursor-pointer"
                  @click="openImage(`${apiUrl}${img.file_url}`)"
                />
                <div
                  class="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors pointer-events-none"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="selectedImage"
          class="fixed inset-0 bg-black/90 flex items-center justify-center z-[99999] backdrop-blur-sm"
          @click.self="closeImage"
        >
          <img
            :src="selectedImage"
            class="max-w-[95%] max-h-[90%] object-contain rounded-lg shadow-2xl"
          />
          <button
            class="absolute top-8 right-8 text-white/70 hover:text-white transition-colors"
            @click="closeImage"
          >
            <i class="fa-solid fa-xmark text-4xl"></i>
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import ColorBadgeList from "@/components/common/ColorBadgeList.vue";

export default {
  name: "GymItem",
  components: { ColorBadgeList },
  props: {
    gym: { type: Object, required: true },
    detail: { type: Object },
    changeFlg: { type: Boolean, default: false },
    mainFlg: { type: Boolean, default: false },
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
      this.$router.push({
        path: `/locationDetail`,
        query: {
          gym_id: this.gym.id,
        },
      });
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

<style scoped>
/* 섹션 라벨 디자인 */
.group-label {
  @apply text-[10px] font-bold tracking-widest text-gray-400 uppercase italic;
}

/* 메인 성격 태그 (진한 색상) */
.tag-primary {
  @apply inline-flex items-center px-2.5 py-1 text-[11px] font-bold bg-gray-800 text-white rounded-lg shadow-sm shadow-gray-200;
}

/* 보조 성격 태그 (연한 색상) */
.tag-secondary {
  @apply inline-flex items-center px-2.5 py-1 text-[11px] font-medium bg-white text-gray-600 border border-gray-200 rounded-lg;
}

/* 드롭다운 메뉴 버튼 */
.menu-btn {
  @apply w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center active:bg-gray-100;
}
</style>
