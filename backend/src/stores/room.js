class RoomStore {
  constructor() {
    this.rooms = new Map(); // battleId → { players: [], ready: {} }
  }

  create(battleId, players) {
    this.rooms.set(battleId, {
      players, // array de userIds
      ready: {}, // userId: true/false
    });
  }

  setReady(battleId, userId) {
    const room = this.rooms.get(battleId);
    room.ready[userId] = true;

    return (
      Object.values(room.ready).length === room.players.length &&
      Object.values(room.ready).every((r) => r === true)
    );
  }

  get(battleId) {
    return this.rooms.get(battleId);
  }
}

export const roomStore = new RoomStore();
