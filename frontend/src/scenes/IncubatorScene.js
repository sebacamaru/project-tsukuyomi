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
    this.setLedNotification("alert");
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
      () => this.entity.glass.addClass("active"),
      () => this.entity.charging.start("anim-fade-in"),
      () => {
        this.entity.temperature.animateNumber(24);
        this.entity.humidity.animateNumber(68);
      },
      () => this.delay(3000),
      () => this.setLedNotification("excellent", 6000),
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

  static LED_STATES = ["led-alert", "led-excellent", "led-meh", "led-good"];

  setLedNotification(state, duration = 0) {
    if (this._ledTimeout) {
      clearTimeout(this._ledTimeout);
      this._ledTimeout = null;
    }
    const el = this.entity.led;
    for (const s of IncubatorScene.LED_STATES) el.removeClass(s);
    if (state) {
      const cls = state.startsWith("led-") ? state : `led-${state}`;
      el.show();
      el.addClass(cls);
      if (duration > 0) {
        this._ledTimeout = setTimeout(() => {
          this._ledTimeout = null;
          el.fadeOut(300);
        }, duration);
      }
    }
  }
}
