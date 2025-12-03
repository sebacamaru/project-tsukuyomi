import { store } from "../core/Store.js";

export const marketplaceService = {
  async getItems() {
    if (store.items.length) return store.items;

    try {
      const res = await fetch("/src/data/items.json");
      if (!res.ok) throw new Error("Failed to fetch items");
      const json = await res.json();
      store.items = json;
      return json;
    } catch (error) {
      console.error("Error loading items:", error);
      return [];
    }
  },
};
