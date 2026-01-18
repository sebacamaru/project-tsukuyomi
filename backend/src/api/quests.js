import { asyncHandler } from "../utils/errorHandler.js";
import { getQuests, getQuestByCode } from "../db/schema/quests.js";

export function registerQuests(router) {
  // GET todas las quests
  router.get("/api/quests", asyncHandler(async () => {
    const quests = getQuests();
    return Response.json(quests);
  }));

  // GET quest por código
  router.get("/api/quests/:code", asyncHandler(async (req) => {
    const { code } = req.params;
    const quest = getQuestByCode(code);

    if (!quest) {
      return Response.json({ error: "Quest not found" }, { status: 404 });
    }

    return Response.json(quest);
  }));
}
