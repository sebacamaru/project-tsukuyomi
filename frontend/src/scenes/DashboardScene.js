import dashboardHTML from "../ui/scenes/dashboard/dashboard.html?raw";
import "../ui/scenes/dashboard/dashboard.css";
import { Scene } from "../core/Scene.js";
import { store } from "../core/Store.js";
import { render } from "../utils/template.js";

export class DashboardScene extends Scene {
  constructor() {
    super();
    this.backgroundClass = "dashboard-background";
  }

  async getHTML() {
    return render(dashboardHTML, {
      user: store.user,
    });
  }

  async initUI() {
    // Los links ahora usan rutas, el router los maneja automáticamente
  }
}
