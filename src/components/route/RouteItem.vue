<template>
  <div class="relative group">
    <div
      ref="card"
      class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:border-gray-300 hover:shadow-xl"
    >
      <div class="flex justify-between items-start mb-3">
        <div class="flex-1 cursor-pointer min-w-0" @click="goDetail">
          <div class="flex items-center gap-2 mb-1">
            <h3
              class="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors"
            >
              {{ rout.gym.name }}
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="px-2 py-0.5 bg-slate-800 text-white text-[11px] font-black rounded shadow-sm"
            >
              LV.{{ rout.difficulty }}
            </span>
            <span class="text-sm font-medium text-gray-600 truncate">{{
              rout.route_name
            }}</span>
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
              <button @click.stop="handleBookmark" class="menu-btn">
                <i class="fa-regular fa-bookmark mr-2"></i>북마크
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

      <div class="flex flex-wrap gap-1.5 mb-4">
        <span class="badge-blue">
          <i class="fa-solid fa-mountain text-[10px] opacity-70"></i>
          {{ climb_type_map[rout.climb_type] }}
        </span>
        <span class="badge-gray">
          <i class="fa-solid fa-location-dot text-[10px] opacity-70"></i>
          {{ environment_map[rout.environment] }}
        </span>
      </div>

      <div
        class="prose prose-sm max-w-none text-gray-600 mb-4 line-clamp-3 leading-relaxed border-l-2 border-gray-100 pl-3 italic text-[13px]"
        v-html="rout.memo"
      ></div>

      <div v-if="rout.images?.length" class="flex flex-wrap gap-2 mt-2">
        <div
          v-for="img in rout.images"
          :key="img.id"
          class="relative overflow-hidden rounded-lg border border-gray-100 aspect-square w-20 group/img"
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
          <div class="relative max-w-[90%] max-h-[90%]">
            <img
              :src="selectedImage"
              class="rounded-xl shadow-2xl object-contain"
            />
            <button
              class="absolute -top-12 -right-4 text-white hover:text-gray-300 transition"
              @click="closeImage"
            >
              <i class="fa-solid fa-xmark text-3xl"></i>
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
  name: "RouteItem",
  components: {
    DateTime,
    BaseDropdown,
  },
  props: {
    rout: { type: Object, required: true },
    changeFlg: { type: Boolean, default: false },
    onDelete: Function,
    onBookmark: Function,
    onChange: Function,
  },
  emits: ["delete", "edit"],
  data() {
    return {
      open: false,
      climb_type_map: {
        LEAD: "리드",
        BOULDER: "볼더링",
      },
      environment_map: {
        INDOOR: "실내",
        OUTDOOR: "실외",
        NATURE: "자연",
      },
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
        path: `/locationDetail`,
        query: {
          gym_id: this.rout.gym_id,
          route_id: this.rout.id,
        },
      });
    },
    toggle() {
      this.open = !this.open;
    },
    handleBookmark() {
      this.open = false;
      this.onBookmark?.(this.rout);
    },
    handleChange() {
      this.open = false;
      this.onChange?.(this.rout);
    },
    handleDelete() {
      this.open = false;
      this.onDelete?.(this.rout);
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
.badge-blue {
  @apply inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-600 rounded-md border border-blue-100;
}

.badge-gray {
  @apply inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-gray-50 text-gray-500 rounded-md border border-gray-200;
}

/* 텍스트 내용 줄바꿈 및 스타일 */
.prose {
  word-break: break-all;
}

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
