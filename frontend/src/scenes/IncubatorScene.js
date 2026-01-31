import incubatorHTML from "../ui/scenes/incubator/incubator.html?raw";
import "../ui/scenes/incubator/incubator.css";
import { Scene } from "../core/Scene.js";

export class IncubatorScene extends Scene {
  constructor() {
    super();
    this.backgroundClass = "incubator-background";
  }

  async getHTML() {
    return incubatorHTML;
  }

  async initUI() {
    // TODO: Cargar huevos en incubacion
  }

  onExit() {
    super.onExit();
  }
}
