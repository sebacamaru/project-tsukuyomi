var e=class e{static isActive=!1;constructor(e){this.speaker=e.speaker||``,this.text=e.text||``,this.options=e.options||[],this.onSelect=e.onSelect||(()=>{}),this.onClose=e.onClose||(()=>{}),this.typewriterSpeed=e.typewriterSpeed||30,this.enableTypewriter=e.enableTypewriter!==!1,this.closable=e.closable!==!1,this.element=null,this.textElement=null,this.typewriterTimeout=null,this.isTyping=!1,this.fullText=this.text,this.currentCharIndex=0,this.resolvePromise=null}render(){let e=document.createElement(`div`);return e.className=`message-box-overlay`,e.innerHTML=`
      <div class="message-box">
        <div class="message-box__content">
          ${this.speaker?`
            <div class="message-box__speaker">${this.speaker}</div>
          `:``}
          <div class="message-box__text"></div>
          ${this.options.length>0?`
            <div class="message-box__options">
              ${this.options.map((e,t)=>`
                <button class="message-box__option" data-index="${t}" data-value="${e.value||e.text}">
                  ${e.icon?`<span class="option-icon">${e.icon}</span>`:``}
                  <span class="option-text">${e.text}</span>
                </button>
              `).join(``)}
            </div>
          `:``}
          ${this.closable&&this.options.length===0?`
            <div class="message-box__close-hint">
              <span>Tap o [Enter] para continuar</span>
            </div>
          `:``}
        </div>
      </div>
    `,this.element=e,this.textElement=e.querySelector(`.message-box__text`),this._attachEvents(),e}_attachEvents(){this.element.querySelectorAll(`.message-box__option`).forEach(e=>{e.addEventListener(`click`,t=>{if(this.isTyping){this._skipTypewriter();return}let n=e.dataset.value,r=parseInt(e.dataset.index);this._handleSelect(n,r)})}),this.closable&&this.options.length===0&&(this.element.addEventListener(`click`,e=>{this.isTyping?this._skipTypewriter():(e.target.classList.contains(`message-box-overlay`)||e.target.closest(`.message-box__text`))&&this._handleClose()}),this._keyHandler=e=>{(e.key===`Enter`||e.key===` `)&&(e.preventDefault(),this.isTyping?this._skipTypewriter():this._handleClose())},document.addEventListener(`keydown`,this._keyHandler)),this.textElement&&this.textElement.addEventListener(`click`,()=>{this.isTyping&&this._skipTypewriter()})}async show(){return e.isActive?new Promise(e=>e(null)):new Promise(t=>{this.resolvePromise=t,e.isActive=!0,this.element||this.render(),document.body.appendChild(this.element),requestAnimationFrame(()=>{this.element.classList.add(`active`)}),this.enableTypewriter?this._startTypewriter():(this.textElement.textContent=this.fullText,this._showOptions())})}_startTypewriter(){this.isTyping=!0,this.currentCharIndex=0,this.textElement.textContent=``;let e=()=>{this.currentCharIndex<this.fullText.length?(this.textElement.textContent+=this.fullText[this.currentCharIndex],this.currentCharIndex++,this.typewriterTimeout=setTimeout(e,this.typewriterSpeed)):(this.isTyping=!1,this._showOptions())};e()}_skipTypewriter(){this.typewriterTimeout&&clearTimeout(this.typewriterTimeout),this.isTyping=!1,this.textElement.textContent=this.fullText,this._showOptions()}_showOptions(){let e=this.element.querySelector(`.message-box__options`);e&&e.classList.add(`visible`)}_handleSelect(e,t){let n=this.options[t];this.onSelect&&this.onSelect(e,n,t),this.hide(),this.resolvePromise&&this.resolvePromise({value:e,option:n,index:t})}_handleClose(){this.onClose&&this.onClose(),this.hide(),this.resolvePromise&&this.resolvePromise(null)}hide(){e.isActive=!1,this.typewriterTimeout&&clearTimeout(this.typewriterTimeout),this._keyHandler&&document.removeEventListener(`keydown`,this._keyHandler),this.element.classList.remove(`active`),setTimeout(()=>{this.element&&this.element.parentNode&&this.element.parentNode.removeChild(this.element)},300)}static async show(t){return await new e(t).show()}static async alert(t,n=``){return await e.show({text:t,speaker:n,options:[],closable:!0})}static async confirm(t,n=``){let r=await e.show({text:t,speaker:n,options:[{text:`Sí`,value:!0},{text:`No`,value:!1}]});return r?r.value:!1}};export{e as t};