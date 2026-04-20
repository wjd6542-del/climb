import { defineStore } from "pinia";
import { langPackService } from "@/api/langPackService";
import type { LangCode, LocalizedName } from "@/types";

interface I18nState {
  locale: LangCode;
  defaultLocale: LangCode;
  langPacks: Record<string, LocalizedName>;
}

interface LangPackApiRow {
  id: number;
  name: LocalizedName;
  is_active: "y" | "n";
}

export const useI18nStore = defineStore("i18n", {
  state: (): I18nState => ({
    locale: "ko",
    defaultLocale: "ko",
    langPacks: {},
  }),

  getters: {
    t:
      (state) =>
      (key: string): string => {
        const pack = state.langPacks[key];
        if (!pack) return key;
        return pack[state.locale] ?? key;
      },
  },

  actions: {
    setLocale(newLocale: LangCode) {
      this.locale = newLocale;
      localStorage.setItem("locale", newLocale);
    },

    async loadLangPacks() {
      const data = await langPackService.list<LangPackApiRow[]>();
      const map: Record<string, LocalizedName> = {};
      data.forEach((item) => {
        if (item.is_active === "y") {
          map[item.name.ko] = item.name;
        }
      });
      this.langPacks = map;
    },

    initLocale() {
      const saved = localStorage.getItem("locale") as LangCode | null;
      if (saved) this.locale = saved;
    },
  },
});
