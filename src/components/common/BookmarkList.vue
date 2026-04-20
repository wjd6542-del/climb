<template>
  <div name="list" class="space-y-3">
    <div class="relative">
      <input
        v-model="keyword"
        type="text"
        placeholder="이름 또는 주소 검색"
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <i
        class="fa-solid fa-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      ></i>
    </div>

    <div
      v-if="filteredList.length === 0"
      class="p-5 rounded-xl border bg-white shadow-sm text-center"
    >
      검색 결과가 없습니다.
    </div>

    <transition-group name="list" tag="div" class="space-y-3">
      <div
        v-for="item in filteredList"
        :key="item.id"
        class="p-3 border rounded-lg hover:bg-gray-50 flex justify-between items-center"
      >
        <div @click="move(item)" class="cursor-pointer">
          <div class="font-medium">{{ item.name }}</div>
          <div class="text-xs text-gray-500">
            <p>주소 : {{ item.address }}</p>
            <p v-if="item.address_detail">상세 : {{ item.address_detail }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            title="주소 복사"
            class="text-gray-500 hover:text-blue-600"
            @click.stop="copyAddress(item)"
          >
            <i class="fa-regular fa-copy"></i>
          </button>

          <button
            title="북마크 삭제"
            class="text-red-500 hover:text-red-700"
            @click.stop="removeItem(item)"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import type { BookmarkItem } from "@/types";

const emit = defineEmits<{ close: [] }>();

const bookmarkStore = useBookmarkStore();
const router = useRouter();
const toast = useToast();
const keyword = ref("");

const filteredList = computed(() => {
  if (!keyword.value.trim()) return bookmarkStore.list;
  const search = keyword.value.toLowerCase();
  return bookmarkStore.list.filter(
    (item) =>
      item.name?.toLowerCase().includes(search) ||
      item.address?.toLowerCase().includes(search),
  );
});

async function copyAddress(item: BookmarkItem) {
  try {
    await navigator.clipboard.writeText(item.address ?? "");
    toast.success("주소가 클립보드에 복사되었습니다");
  } catch {
    toast.error("복사에 실패했습니다");
  }
}

function removeItem(data: BookmarkItem) {
  bookmarkStore.remove(data.key);
  toast.success(`${data.name} 북마크가 삭제 처리 되었습니다`);
}

function move(data: BookmarkItem) {
  router.push({
    path: `/locationDetail`,
    query: {
      gym_id: data.id,
      route_id: data.route_id ?? undefined,
    },
  });
  emit("close");
}
</script>
