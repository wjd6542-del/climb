import { defineStore } from "pinia";
import type { BookmarkItem } from "@/types";

interface BookmarkState {
  gyms: BookmarkItem[];
  panelOpen: boolean;
}

export const useBookmarkStore = defineStore("bookmark", {
  state: (): BookmarkState => ({
    gyms: JSON.parse(localStorage.getItem("gymBookmarks") || "[]"),
    panelOpen: false,
  }),

  getters: {
    count: (state) => state.gyms.length,
    isBookmarked: (state) => (key: string) =>
      state.gyms.some((gym) => gym.key === key),
    list: (state) => state.gyms,
  },

  actions: {
    save() {
      localStorage.setItem("gymBookmarks", JSON.stringify(this.gyms));
    },

    add(gym: BookmarkItem) {
      if (!this.gyms.some((v) => v.key === gym.key)) {
        this.gyms.push(gym);
        this.save();
      }
    },

    remove(key: string) {
      this.gyms = this.gyms.filter((v) => v.key !== key);
      this.save();
    },

    toggle(gym: BookmarkItem) {
      if (this.isBookmarked(gym.key)) {
        this.remove(gym.key);
      } else {
        this.add(gym);
      }
    },

    clear() {
      this.gyms = [];
      this.save();
    },

    openPanel() {
      this.panelOpen = true;
      document.body.style.overflow = "hidden";
    },

    closePanel() {
      this.panelOpen = false;
      document.body.style.overflow = "";
    },

    togglePanel() {
      if (this.panelOpen) this.closePanel();
      else this.openPanel();
    },
  },
});
