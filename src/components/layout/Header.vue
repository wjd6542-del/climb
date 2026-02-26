<template>
  <header class="bg-white border-b shadow-sm relative z-50">
    <div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
      <!-- 로고 -->
      <RouterLink
        to="/search"
        class="flex items-center gap-2 font-bold text-lg hover:text-blue-600 transition"
      >
        <i class="fa-solid fa-mountain"></i>
        <span class="hidden sm:inline">{{ $t("클라이밍") }} GO</span>
      </RouterLink>

      <!-- 🔥 데스크탑 네비 -->
      <nav class="hidden md:flex gap-6 text-sm font-medium items-center">
        <template v-for="menu in menus" :key="menu.label">
          <RouterLink
            v-if="menu.type === 'route'"
            :to="menu.to"
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
            @click="$emit(menu.event)"
          >
            <i :class="menu.icon"></i>
            {{ $t(menu.label) }}

            <span
              v-if="bookmarkStore?.count > 0"
              class="absolute -top-2 -right-3 text-xs bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
            >
              {{ bookmarkStore.count }}
            </span>
          </button>
        </template>

        <!-- 언어 -->
        <BaseDropdown v-model="currentLocale" :items="languages">
          <template #trigger>
            <div
              class="flex items-center gap-2 text-gray-600 hover:text-blue-500"
            >
              <i class="fa-solid fa-globe"></i>
              {{ languages.find((l) => l.value === currentLocale)?.label }}
            </div>
          </template>
        </BaseDropdown>
      </nav>

      <!-- 🔥 모바일 햄버거 -->
      <button
        class="md:hidden text-xl text-gray-700"
        @click="mobileOpen = !mobileOpen"
      >
        <i class="fa-solid" :class="mobileOpen ? 'fa-xmark' : 'fa-bars'"></i>
      </button>
    </div>

    <!-- 🔥 모바일 메뉴 -->
    <div v-show="mobileOpen" class="md:hidden bg-white border-t shadow-md">
      <div class="flex flex-col p-4 gap-4 text-sm">
        <template v-for="menu in menus" :key="'m-' + menu.label">
          <RouterLink
            v-if="menu.type === 'route'"
            :to="menu.to"
            class="flex items-center gap-3 text-gray-700 hover:text-blue-600"
            @click="mobileOpen = false"
          >
            <i :class="menu.icon"></i>
            {{ $t(menu.label) }}
          </RouterLink>

          <button
            v-else
            class="flex items-center gap-3 text-gray-700 hover:text-blue-600"
            @click="handleMobileAction(menu.event)"
          >
            <i :class="menu.icon"></i>
            {{ $t(menu.label) }}
          </button>
        </template>

        <!-- 언어 선택 -->
        <BaseDropdown v-model="currentLocale" :items="languages" />
      </div>
    </div>
  </header>
</template>
<script>
import BaseDropdown from "@/components/common/BaseDropdown.vue";
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { useI18nStore } from "@/stores/i18nStore";

export default {
  name: "Header",

  components: {
    BaseDropdown,
  },

  emits: ["open-bookmark"],

  setup() {
    const bookmarkStore = useBookmarkStore();
    const i18nStore = useI18nStore();
    return { bookmarkStore, i18nStore };
  },

  data() {
    return {
      menus: [
        {
          type: "route",
          to: "/search",
          label: "통합검색",
          icon: "fa-solid fa-magnifying-glass",
        },
        {
          type: "route",
          to: "/location",
          label: "장소",
          icon: "fa-solid fa-location-dot",
        },
        {
          type: "route",
          to: "/grade",
          label: "난이도",
          icon: "fa-solid fa-layer-group",
        },
        {
          type: "route",
          to: "/share",
          label: "정보",
          icon: "fa-solid fa-paper-plane",
        },
        {
          type: "route",
          to: "/setting",
          label: "설정",
          icon: "fa-solid fa-gear",
        },
        {
          type: "action",
          label: "북마크",
          icon: "fa-regular fa-bookmark",
          event: "open-bookmark",
        },
      ],

      languages: [
        { value: "ko", label: "한국어" },
        { value: "en", label: "English" },
        { value: "ja", label: "日本語" },
        { value: "zh", label: "中文" },
      ],
      mobileOpen: false,
    };
  },

  computed: {
    currentLocale: {
      get() {
        return this.i18nStore.locale;
      },
      set(val) {
        this.i18nStore.setLocale(val);
      },
    },
  },

  methods: {
    handleMobileAction(eventName) {
      this.$emit(eventName);
      this.mobileOpen = false;
    },
  },
};
</script>

<style scoped>
header {
  backdrop-filter: blur(6px);
}
</style>
