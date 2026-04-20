<template>
  <header class="bg-white border-b shadow-sm relative z-50">
    <div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
      <RouterLink
        to="/search"
        class="flex items-center gap-2 font-bold text-lg hover:text-blue-600 transition"
      >
        <i class="fa-solid fa-mountain"></i>
        <span class="hidden sm:inline">{{ $t("클라이밍") }} GO</span>
      </RouterLink>

      <nav class="hidden md:flex gap-6 text-sm font-medium items-center">
        <template v-for="menu in menus" :key="menu.label">
          <RouterLink
            v-if="menu.type === 'route'"
            :to="menu.to!"
            v-slot="{ isActive }"
          >
            <span
              class="flex items-center gap-2 pb-1 cursor-pointer transition"
              :class="
                isActive
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-blue-500'
              "
            >
              <i :class="menu.icon"></i>
              {{ $t(menu.label) }}
            </span>
          </RouterLink>

          <button
            v-else
            class="relative flex items-center gap-2 text-gray-600 hover:text-blue-500 transition"
            @click="handleAction(menu)"
          >
            <i :class="menu.icon"></i>
            {{ $t(menu.label) }}

            <span
              v-if="bookmarkStore.count > 0"
              class="absolute -top-2 -right-3 text-xs bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
            >
              {{ bookmarkStore.count }}
            </span>
          </button>
        </template>

        <BaseDropdown v-model="currentLocale" :items="languages">
          <template #trigger>
            <div class="flex items-center gap-2 text-gray-600 hover:text-blue-500">
              <i class="fa-solid fa-globe"></i>
              {{ languages.find((l) => l.value === currentLocale)?.label }}
            </div>
          </template>
        </BaseDropdown>
      </nav>

      <button
        class="md:hidden text-xl text-gray-700"
        @click="mobileOpen = !mobileOpen"
      >
        <i class="fa-solid" :class="mobileOpen ? 'fa-xmark' : 'fa-bars'"></i>
      </button>
    </div>

    <div v-show="mobileOpen" class="md:hidden bg-white border-t shadow-md">
      <div class="flex flex-col p-4 gap-4 text-sm">
        <template v-for="menu in menus" :key="'m-' + menu.label">
          <RouterLink
            v-if="menu.type === 'route'"
            :to="menu.to!"
            class="flex items-center gap-3 text-gray-700 hover:text-blue-600"
            @click="mobileOpen = false"
          >
            <i :class="menu.icon"></i>
            {{ $t(menu.label) }}
          </RouterLink>

          <button
            v-else
            class="flex items-center gap-3 text-gray-700 hover:text-blue-600"
            @click="handleMobileAction(menu)"
          >
            <i :class="menu.icon"></i>
            {{ $t(menu.label) }}
          </button>
        </template>

        <BaseDropdown v-model="currentLocale" :items="languages" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import BaseDropdown from "@/components/common/BaseDropdown.vue";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { useI18nStore } from "@/stores/i18nStore";
import type { LangCode } from "@/types";

type Menu = {
  type: "route" | "action";
  to?: string;
  label: string;
  icon: string;
  action?: string;
};

const bookmarkStore = useBookmarkStore();
const i18nStore = useI18nStore();

const menus: Menu[] = [
  { type: "route", to: "/search", label: "통합검색", icon: "fa-solid fa-magnifying-glass" },
  { type: "route", to: "/location", label: "장소", icon: "fa-solid fa-location-dot" },
  { type: "route", to: "/grade", label: "난이도", icon: "fa-solid fa-layer-group" },
  { type: "route", to: "/share", label: "정보", icon: "fa-regular fa-newspaper" },
  { type: "route", to: "/setting", label: "설정", icon: "fa-solid fa-gear" },
  { type: "action", label: "북마크", icon: "fa-solid fa-bookmark", action: "bookmark" },
];

const languages = [
  { value: "ko", label: "한국어" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "zh", label: "中文" },
];

const mobileOpen = ref(false);

const currentLocale = computed<string | number>({
  get: () => i18nStore.locale,
  set: (val) => i18nStore.setLocale(val as LangCode),
});

function handleAction(menu: Menu) {
  if (menu.action === "bookmark") {
    bookmarkStore.openPanel();
  }
}

function handleMobileAction(menu: Menu) {
  handleAction(menu);
  mobileOpen.value = false;
}
</script>

<style scoped>
header {
  backdrop-filter: blur(6px);
}
</style>
