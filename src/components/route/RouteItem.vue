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
              {{ rout.gym?.name }}
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="px-2 py-0.5 bg-slate-800 text-white text-[11px] font-black rounded shadow-sm"
            >
              LV.{{ rout.difficulty }}
            </span>
            <span class="text-sm font-medium text-gray-600 truncate">
              {{ rout.route_name }}
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
          {{ CLIMB_TYPE_MAP[rout.climb_type as keyof typeof CLIMB_TYPE_MAP] }}
        </span>
        <span class="badge-gray">
          <i class="fa-solid fa-location-dot text-[10px] opacity-70"></i>
          {{ ENVIRONMENT_MAP[rout.environment as keyof typeof ENVIRONMENT_MAP] }}
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

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import type { Route } from "@/types";

const CLIMB_TYPE_MAP = { LEAD: "리드", BOULDER: "볼더링" } as const;
const ENVIRONMENT_MAP = { INDOOR: "실내", OUTDOOR: "실외", NATURE: "자연" } as const;

const props = defineProps<{
  rout: Route;
  changeFlg?: boolean;
  onDelete?: (route: Route) => void;
  onBookmark?: (route: Route) => void;
  onChange?: (route: Route) => void;
}>();

const router = useRouter();
const apiUrl = import.meta.env.VITE_API_URL;

const open = ref(false);
const selectedImage = ref<string | null>(null);

function goDetail() {
  router.push({
    path: `/locationDetail`,
    query: { gym_id: props.rout.gym_id, route_id: props.rout.id },
  });
}

function toggle() {
  open.value = !open.value;
}

function handleBookmark() {
  open.value = false;
  props.onBookmark?.(props.rout);
}

function handleChange() {
  open.value = false;
  props.onChange?.(props.rout);
}

function handleDelete() {
  open.value = false;
  props.onDelete?.(props.rout);
}

function openImage(url: string) {
  selectedImage.value = url;
  document.body.style.overflow = "hidden";
}

function closeImage() {
  selectedImage.value = null;
  document.body.style.overflow = "";
}
</script>

<style scoped>
.badge-blue {
  @apply inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-600 rounded-md border border-blue-100;
}

.badge-gray {
  @apply inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-gray-50 text-gray-500 rounded-md border border-gray-200;
}

.prose {
  word-break: break-all;
}

.menu-btn {
  @apply w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center active:bg-gray-100;
}
</style>
