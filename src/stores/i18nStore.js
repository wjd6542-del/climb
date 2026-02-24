/**
 * 언어팩 상태관리
 */
import { defineStore } from "pinia";
import api from "@/lib/api";

export const useI18nStore = defineStore("i18n", {
  state: () => ({
    locale: "ko",
    defaultLocale: "ko",
    langPacks: [], // DB에서 가져온 LangPack
  }),

  getters: {
    activeLangPacks: (state) =>
      state.langPacks.filter((item) => item.is_active === "y"),

    // 공통 번역 함수
    t: (state) => (key) => {
      const pack = state.langPacks[key];
      if (!pack) return key;

      return pack[state.locale] ?? key;
    },
  },

  actions: {
    setLocale(newLocale) {
      this.locale = newLocale;
      localStorage.setItem("locale", newLocale);
    },

    async loadLangPacks() {
      const res = await api.post("/api/langPack/list");
      const map = {};
      res.data.forEach((item) => {
        if (item.is_active === "y") {
          map[item.name.ko] = item.name;
        }
      });
      this.langPacks = map;
    },

    initLocale() {
      const saved = localStorage.getItem("locale");
      if (saved) this.locale = saved;
    },
  },
});
