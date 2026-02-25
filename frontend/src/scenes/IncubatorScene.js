import spritesHTML from "../ui/scenes/incubator/incubator-sprites.html?raw";
import "../ui/scenes/incubator/incubator.css";
import { Scene } from "../core/Scene.js";
import { eggService } from "../services/eggService.js";
import { getAssetUrl } from "../utils/assetRegistry.js";

export class IncubatorScene extends Scene {
  constructor() {
    super();
    this.useSpriteRenderer = true;
    this.backgroundClass = "incubator-background";
    this.currentEgg = null;
  }

  async getSpriteHTML() {
    return spritesHTML;
  }

  async initUI() {
    this.entity.machine.el.src = getAssetUrl("spr-incubator.png");
    this.entity.button.el.src = getAssetUrl("spr-incubator-button.png");

    await this.loadEgg();
    this.entity.button.onClick(() => this.onButtonPress());
  }

  async loadEgg() {
    await eggService.getUserEggs("incubating");
    const incubating = eggService.getIncubatingEggs();
    this.currentEgg = incubating[0] || null;
  }

  async onButtonPress() {
    console.warn("Hiciste click en el botón");
    if (!this.currentEgg) {
      await this.entity.button.play("anim-press");
      return;
    }

    await this.runSequence([
      () => this.entity.button.play("anim-press"),
      () => this.shakeEgg(3),
    ]);
  }

  async shakeEgg(times) {
    // TODO: implementar con sprite de egg
  }
}
