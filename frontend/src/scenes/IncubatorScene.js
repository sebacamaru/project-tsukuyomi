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
    this.entity.button.onClick(() => this.onButtonPress());

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
    // if (!this.currentEgg) {
    //   await this.entity.button.play("anim-press");
    //   return;
    // }

    await this.runSequence([
      () => console.log("holis1"),
      () => this.entity.button.play("anim-press"),
      () => {
        console.log("holis2");
        this._actionSwiper.disable();
        this.entity.charging.start("anim-fade-in");
        this.entity.button.addClass("pressed");
      },
      () => this.shakeEgg(3),
    ]);
  }

  async shakeEgg(times) {
    // TODO: implementar con sprite de egg
  }
}
