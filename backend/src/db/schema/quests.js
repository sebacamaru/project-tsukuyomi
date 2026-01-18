import { db } from "../index.js";

export const getQuests = () => {
  return db.query("SELECT * FROM quests").all();
};

export const getQuestByCode = (code) => {
  return db.query("SELECT * FROM quests WHERE code = ?").get(code);
};

export const getNextQuest = (currentQuestCode) => {
  return db.query("SELECT * FROM quests WHERE prerequisite_quest_code = ?").get(currentQuestCode);
};
