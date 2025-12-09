// import "./pwa.js";
import { App } from "./core/App.js";
import { SceneManager } from "./core/SceneManager.js";
import { router } from "./core/Router.js";

async function start() {
  const app = new App();
  await app.init();

  // Registrar escenas - las rutas se generan automáticamente!
  // dashboard -> /
  // market -> /marketplace (usando el mapping interno)
  SceneManager.register(
    "dashboard",
    () => import("./scenes/DashboardScene.js"),
  );
  SceneManager.register("market", () => import("./scenes/MarketplaceScene.js"));

  // Si querés una ruta custom, pasá el tercer parámetro:
  // SceneManager.register("profile", () => import("./scenes/ProfileScene.js"), "/mi-perfil");

  // Inicializar router (esto carga la ruta inicial automáticamente)
  router.init(SceneManager);
}

start();
