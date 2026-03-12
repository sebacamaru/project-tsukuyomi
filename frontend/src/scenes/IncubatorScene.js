import spritesHTML from "../ui/scenes/incubator/incubator-sprites.html?raw";
import "../ui/scenes/incubator/incubator.css";
import { Scene } from "../core/Scene.js";
import { SpriteSwiper } from "../utils/spriteSwiper.js";
import { eggService } from "../services/eggService.js";

export class IncubatorScene extends Scene {
  constructor() {
    super();
    this.backgroundClass = "incubator-background";
    this.currentEgg = null;
  }

  async getSpriteHTML() {
    return spritesHTML;
  }

  async initUI() {
    await this.loadEgg();
    this.startBouncingEgg();
    this.entity.button.onClick(() => this.onButtonPress());
    this.entity.egg.onClick(() => this.entity.egg.playOver("anim-egg-tap"));

    this._actionSwiper = new SpriteSwiper(this.entity.actionSlider.el, {
      itemWidth: 24,
      itemCount: 4,
      scaleFn: () => this._spriteScale || 1,
      onSnap: (index) => this.onActionSelected(index),
      hitArea: { left: -20, top: -15, width: 64, height: 32 },
    });
  }

  onExit() {
    this._actionSwiper?.destroy();
    this._actionSwiper = null;
    super.onExit();
  }

  onActionSelected(index) {
    const names = ["HUMIDIFY", "DRY", "COLD", "HEAT"];
    console.log(`Action selected: ${index} (${names[index] || "unknown"})`);
  }

  async loadEgg() {
    await eggService.getUserEggs("incubating");
    const incubating = eggService.getIncubatingEggs();
    this.currentEgg = incubating[0] || null;
  }

  async onButtonPress() {
    if (this._buttonPressed) return;
    this._buttonPressed = true;

    await this.runSequence([
      () => this.entity.button.play("anim-press"),
      () => {
        this._actionSwiper.disable();
        this.entity.button.addClass("pressed");
      },
      () => this.shutdownAlerts(),
      () => this.shakeEgg(1),
      () => this.startBouncingEgg(),
      () => this.entity.charging.start("anim-fade-in"),
    ]);
  }

  async shakeEgg(times) {
    for (let i = 0; i < times; i++) {
      this.entity.spriteRenderer.play("anim-incubator-shake");
      await this.entity.egg.playOver("anim-egg-shake");
    }
  }

  async startBouncingEgg() {
    this.entity.egg.start("anim-egg-bounce");
  }

  async shutdownAlerts() {
    this.entity.lights.fadeOut(1000);
    this.entity.led.fadeOut(1000);
  }
}
