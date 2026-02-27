import{c as e}from"./index-zi4sCZYj.js";import{t}from"./Scene-DWeb6wuE.js";var n=`<div class="incubator-spr__incubator"></div>
<div data-entity="egg" class="incubator-spr__egg"></div>
<div class="incubator-div__indicator">
    <div class="wrapper">
        <div class="srp__actions"></div>
        <div class="srp__mask"></div>
    </div>
</div>
<div data-entity="button" class="incubator-spr__button"></div>
`,r=class extends t{constructor(){super(),this.backgroundClass=`incubator-background`,this.currentEgg=null}async getSpriteHTML(){return n}async initUI(){await this.loadEgg(),this.entity.button.onClick(()=>this.onButtonPress())}async loadEgg(){await e.getUserEggs(`incubating`),this.currentEgg=e.getIncubatingEggs()[0]||null}async onButtonPress(){if(console.warn(`Hiciste click en el botón`),!this.currentEgg){await this.entity.button.play(`anim-press`);return}await this.runSequence([()=>this.entity.button.play(`anim-press`),()=>this.shakeEgg(3)])}async shakeEgg(e){}};export{r as IncubatorScene};