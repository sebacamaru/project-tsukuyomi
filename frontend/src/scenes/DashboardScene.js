import dashboardHTML from "../ui/scenes/dashboard/dashboard.html?raw";
import "../ui/scenes/dashboard/dashboard.css";
import { Scene } from "../core/Scene.js";

export class DashboardScene extends Scene {
  async getHTML() {
    return dashboardHTML;
  }

  async initUI() {
    // Los links ahora usan rutas, el router los maneja automáticamente
  }
}
