/**
 * Utilidades para verificar progreso de quests
 */

/**
 * Orden de las quests en la cadena principal.
 * Mantener actualizado cuando se agreguen nuevas quests.
 */
const QUEST_ORDER = ["set_username", "onboarding"];

/**
 * Verifica si una quest fue completada basandose en el current_quest_code
 * @param {Object} store - El store global
 * @param {string} questCode - Codigo de la quest a verificar
 * @returns {boolean}
 */
export function isQuestCompleted(store, questCode) {
  // En modo mock, todas las quests se consideran completadas
  if (import.meta.env.MODE === "mock") {
    return true;
  }

  const user = store.user;
  if (!user) return false;

  const currentQuestCode = user.current_quest_code;

  // Si no hay quest actual, todas fueron completadas
  if (!currentQuestCode) return true;

  const questIndex = QUEST_ORDER.indexOf(questCode);
  const currentIndex = QUEST_ORDER.indexOf(currentQuestCode);

  // Quest desconocida, asumir no completada
  if (questIndex === -1) return false;

  // Si la quest actual no esta en el orden, asumir completada
  if (currentIndex === -1) return true;

  // La quest esta completada si su indice es menor al de la quest actual
  return questIndex < currentIndex;
}
