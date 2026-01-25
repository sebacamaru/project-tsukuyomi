import{t as e}from"./assetRegistry-BotFMTB-.js";var t=class{constructor(e,t){this.context=e,this.data=t||{},this.element=null,this._keyHandler=null}render(){let t=document.createElement(`div`);return t.className=`egg-reveal`,t.innerHTML=`
      <div class="egg-reveal__content">
        <div class="egg-reveal__egg-container">
          <img class="egg-reveal__egg" src="${e(`sprite-egg.png`)}" alt="Huevo misterioso" />
          <div class="egg-reveal__glow"></div>
        </div>
        ${this.data.text?`<p class="egg-reveal__text">${this.data.text}</p>`:``}
      </div>
      <span class="egg-reveal__hint">Tap o [Enter] para continuar</span>
    `,this.element=t,t}async show(){return new Promise(e=>{document.body.appendChild(this.render()),requestAnimationFrame(()=>{this.element.classList.add(`active`)});let t=()=>{this._keyHandler&&document.removeEventListener(`keydown`,this._keyHandler),this.element.classList.remove(`active`),setTimeout(()=>{this.element&&this.element.parentNode&&this.element.parentNode.removeChild(this.element),e(!0)},300)};this.element.addEventListener(`click`,t),this._keyHandler=e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),t())},document.addEventListener(`keydown`,this._keyHandler)})}};export{t as EggReveal};