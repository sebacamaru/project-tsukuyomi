import incubatorHTML from "../ui/scenes/incubator/incubator.html?raw";
import "../ui/scenes/incubator/incubator.css";
import { Scene } from "../core/Scene.js";
import { store } from "../core/Store.js";
import { eggService } from "../services/eggService.js";
import { getAssetUrl } from "../utils/assetRegistry.js";

export class IncubatorScene extends Scene {
  constructor() {
    super();
    this.backgroundClass = "incubator-background";
    this.currentEgg = null;
  }

  async getHTML() {
    return incubatorHTML;
  }

  async initUI() {
    await this.loadEgg();

    if (this.currentEgg) {
      this.showEgg();
      this.entity.egg.start("anim-wobble");
    }

    this.entity.button.onClick(() => this.onButtonPress());
  }

  async loadEgg() {
    await eggService.getUserEggs("incubating");
    const incubating = eggService.getIncubatingEggs();
    this.currentEgg = incubating[0] || null;
  }

  showEgg() {
    if (!this.currentEgg) return;

    const typeName = this.currentEgg.egg_type_name || "wild";
    const assetName = `egg-${typeName}.png`;
    const url = getAssetUrl(assetName) || getAssetUrl("sprite-egg.png");

    this.entity.egg.el.src = url;
    this.entity.egg.el.alt = `Huevo ${typeName}`;
  }

  async onButtonPress() {
    if (!this.currentEgg) {
      await this.entity.button.play("anim-press");
      return;
    }

    await this.runSequence([
      () => this.entity.button.play("anim-press"),
      () => this.turnLightsOn(),
      () => this.shakeEgg(3),
      () => this.openLid(),
      // TODO: () => this.hatchEgg(),
    ]);
  }

  async turnLightsOn() {
    await this.entities.lights.eachSequential((light) => {
      light.addClass("incubator__light--on");
    }, 200);
  }

  async shakeEgg(times) {
    this.entity.egg.stop();

    for (let i = 0; i < times; i++) {
      await this.entity.egg.play("anim-shake");
      if (i < times - 1) await this.delay(150);
    }
  }

  async openLid() {
    this.entity.egg.start("anim-glow");
    await this.entity.lid.play("anim-rotate");
    await this.delay(500);
    this.entity.egg.stop();
  }
}
