class UserStore {
  constructor() {
    this.users = new Map();
  }

  add(userId, ws) {
    this.users.set(userId, ws);
  }

  get(userId) {
    return this.users.get(userId);
  }

  removeBySocket(ws) {
    for (const [id, socket] of this.users) {
      if (socket === ws) {
        this.users.delete(id);
        break;
      }
    }
  }
}

export const userStore = new UserStore();
