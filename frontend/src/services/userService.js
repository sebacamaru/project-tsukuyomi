import { store } from "../core/Store.js";

export const userService = {
  login(name) {
    store.user = { name };
  },
};
