import { defineStore } from "pinia";

export const useBookmarkStore = defineStore("bookmark", {
  state: () => ({
    gyms: JSON.parse(localStorage.getItem("gymBookmarks") || "[]"),
  }),

  getters: {
    count: (state) => state.gyms.length,

    isBookmarked: (state) => (id) => state.gyms.some((gym) => gym.id === id),

    list: (state) => state.gyms,
  },

  actions: {
    save() {
      localStorage.setItem("gymBookmarks", JSON.stringify(this.gyms));
    },

    add(gym) {
      if (!this.gyms.some((v) => v.id === gym.id)) {
        this.gyms.push(gym);
        this.save();
      }
    },

    remove(id) {
      this.gyms = this.gyms.filter((v) => v.id !== id);
      this.save();
    },

    toggle(gym) {
      if (this.isBookmarked(gym.id)) {
        this.remove(gym.id);
      } else {
        this.add(gym);
      }
    },

    clear() {
      this.gyms = [];
      this.save();
    },
  },
});
