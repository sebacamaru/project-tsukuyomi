// import "./pwa.js";
import { App } from "./core/App.js";
import { SceneManager } from "./core/SceneManager.js";
import { router } from "./core/Router.js";
import { authService } from "./services/authService.js";

// Instancia global de la app para acceso desde otros módulos
export let app = null;

async function start() {
  app = new App();

  // Restaurar sesión ANTES de inicializar la app para que el navbar tenga los datos
  authService.restoreSession();

  await app.init();

  // Registrar escenas - las rutas se generan automáticamente!
  // dashboard -> /
  // market -> /marketplace (usando el mapping interno)
  SceneManager.register(
    "dashboard",
    () => import("./scenes/DashboardScene.js"),
  );
  SceneManager.register("market", () => import("./scenes/MarketplaceScene.js"));
  SceneManager.register(
    "professor",
    () => import("./scenes/ProfessorScene.js"),
  );
  SceneManager.register(
    "login",
    () => import("./scenes/LoginScene.js"),
    "/login",
  );
  SceneManager.register(
    "register",
    () => import("./scenes/RegisterScene.js"),
    "/register",
  );
  SceneManager.register(
    "admin",
    () => import("./scenes/AdminScene.js"),
    "/admin",
  );
  SceneManager.register(
    "inventory",
    () => import("./scenes/InventoryScene.js"),
  );
  SceneManager.register(
    "incubator",
    () => import("./scenes/IncubatorScene.js"),
  );

  // Si querés una ruta custom, pasá el tercer parámetro:
  // SceneManager.register("profile", () => import("./scenes/ProfileScene.js"), "/mi-perfil");

  // Inicializar router (esto carga la ruta inicial automáticamente)
  router.init(SceneManager);
}

start();
