/**
 * Registro de acciones UI para QuestRunner
 * Cada accion se carga con lazy loading (dynamic import)
 */
export const actions = {
  egg_reveal: () => import("./EggReveal/EggReveal.js"),
};
