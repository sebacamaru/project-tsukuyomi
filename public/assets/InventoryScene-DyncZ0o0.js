import{a as e,c as t,l as n,o as r,s as i}from"./index-J6hCYXs1.js";import{n as a,t as o}from"./Scene-B1xf0tf_.js";import{t as s}from"./assetRegistry-BotFMTB-.js";var c=`<div class="inventory">
    <div class="container">
        <div class="inventory__header">
            <h1>Inventario</h1>
            <div class="inventory__gold">
                <span class="gold-icon"></span>
                <span id="goldAmount">0</span>g
            </div>
        </div>

        <div class="inventory__tabs">
            <button class="tab active" data-type="all">Todos</button>
            <button class="tab" data-type="egg">Huevos</button>
            <button class="tab" data-type="stone">Piedras</button>
            <button class="tab" data-type="candy">Caramelos</button>
            <button class="tab" data-type="chigo">Chigos</button>
        </div>

        <div id="inventoryItems" class="inventory__grid">
            <!-- Items se cargan dinamicamente -->
        </div>

        <div id="emptyMessage" class="inventory__empty hidden">
            <p>No tienes items en tu inventario.</p>
        </div>
    </div>
</div>
`,l=class{constructor(e){this.container=typeof e.container==`string`?document.querySelector(e.container):e.container,this.items=e.items||[],this.filteredItems=[...this.items],this.onItemClick=e.onItemClick||null,this.showQuantity=e.showQuantity!==!1,this.emptyMessage=e.emptyMessage||`Sin items`,this.emptyElement=e.emptyElement||null,this.lazyLoadRoot=e.lazyLoadRoot||this.container,this.tooltip=null,this.activeItem=null,this.isMobile=`ontouchstart`in window||navigator.maxTouchPoints>0,this.hideTooltipTimeout=null,this.listeners=[],this.init()}init(){this.createTooltip(),this.setupEvents()}createTooltip(){document.body.insertAdjacentHTML(`beforeend`,`
      <div class="item-grid-tooltip" role="tooltip" aria-hidden="true">
        <div class="item-grid-tooltip__header">
          <span class="item-grid-tooltip__name"></span>
          <span class="item-grid-tooltip__type"></span>
        </div>
        <p class="item-grid-tooltip__description"></p>
        <div class="item-grid-tooltip__footer">
          <span class="item-grid-tooltip__price"></span>
        </div>
        <div class="item-grid-tooltip__arrow"></div>
      </div>
    `),this.tooltip=document.body.lastElementChild}setupEvents(){this.isMobile?this.setupMobileEvents():this.setupDesktopEvents();let e=document.getElementById(`scene-outlet`);e&&this.on(e,`scroll`,()=>this.hideTooltip())}setupMobileEvents(){this.on(this.container,`click`,e=>{let t=e.target.closest(`.item-grid__item`);if(t&&(e.preventDefault(),e.stopPropagation(),this.activeItem===t?this.hideTooltip():this.showTooltip(t),this.onItemClick)){let e=this.getItemData(t);e&&this.onItemClick(e,t)}}),this.on(document,`click`,e=>{!e.target.closest(`.item-grid__item`)&&!e.target.closest(`.item-grid-tooltip`)&&this.hideTooltip()})}setupDesktopEvents(){this.on(this.container,`mouseenter`,e=>{let t=e.target.closest(`.item-grid__item`);t&&(clearTimeout(this.hideTooltipTimeout),this.showTooltip(t))},!0),this.on(this.container,`mouseleave`,e=>{e.target.closest(`.item-grid__item`)&&(this.hideTooltipTimeout=setTimeout(()=>this.hideTooltip(),100))},!0),this.on(this.container,`focusin`,e=>{let t=e.target.closest(`.item-grid__item`);t&&this.showTooltip(t)}),this.on(this.container,`focusout`,()=>this.hideTooltip()),this.onItemClick&&this.on(this.container,`click`,e=>{let t=e.target.closest(`.item-grid__item`);if(t){let e=this.getItemData(t);e&&this.onItemClick(e,t)}})}showTooltip(e){let t=this.getItemData(e);t&&(this.activeItem&&this.activeItem.classList.remove(`active`),this.activeItem=e,e.classList.add(`active`),this.populateTooltip(t),this.tooltip.classList.add(`visible`),this.isMobile&&this.tooltip.classList.add(`mobile`),this.tooltip.setAttribute(`aria-hidden`,`false`),this.positionTooltip(e))}hideTooltip(){this.activeItem&&=(this.activeItem.classList.remove(`active`),null),this.tooltip&&(this.tooltip.classList.remove(`visible`,`mobile`),this.tooltip.setAttribute(`aria-hidden`,`true`))}populateTooltip(e){let t=this.tooltip.querySelector(`.item-grid-tooltip__name`),n=this.tooltip.querySelector(`.item-grid-tooltip__type`),r=this.tooltip.querySelector(`.item-grid-tooltip__description`),i=this.tooltip.querySelector(`.item-grid-tooltip__price`),a=this.tooltip.querySelector(`.item-grid-tooltip__footer`);t.textContent=e.label||e.name,n.textContent=this.getTypeLabel(e.type),n.className=`item-grid-tooltip__type item-grid-tooltip__type--${e.type}`,r.textContent=e.description||`Sin descripción`,e.price&&e.price>0?(i.textContent=`${e.price}g`,a.classList.remove(`hidden`)):a.classList.add(`hidden`)}getTypeLabel(e){return{potion:`Pocion`,egg:`Huevo`,candy:`Caramelo`,stone:`Piedra`,chigo:`Chigo`,misc:`Otro`}[e]||e}positionTooltip(e){let t=this.tooltip,n=e.getBoundingClientRect(),r=t.getBoundingClientRect(),i=window.innerWidth,a=window.innerHeight,o=n.top,s=a-n.bottom,c=n.left,l=i-n.right,u=r.width||220,d=r.height||120,f=`top`,p,m;o>=d+12+8?(f=`top`,p=n.top-d-12):s>=d+12+8?(f=`bottom`,p=n.bottom+12):l>=u+12+8?(f=`right`,p=n.top+n.height/2-d/2,m=n.right+12):c>=u+12+8?(f=`left`,p=n.top+n.height/2-d/2,m=n.left-u-12):(f=`top`,p=Math.max(8,n.top-d-12)),(f===`top`||f===`bottom`)&&(m=n.left+n.width/2-u/2,m<8?m=8:m+u>i-8&&(m=i-u-8)),(f===`left`||f===`right`)&&(p<8?p=8:p+d>a-8&&(p=a-d-8)),t.style.top=`${p}px`,t.style.left=`${m}px`,t.setAttribute(`data-position`,f),this.positionArrow(n,m,p,f,u,d)}positionArrow(e,t,n,r,i,a){let o=this.tooltip.querySelector(`.item-grid-tooltip__arrow`);if(r===`top`||r===`bottom`){let n=e.left+e.width/2-t-6;n=Math.max(16,Math.min(n,i-28)),o.style.left=`${n}px`,o.style.right=``,o.style.top=``,o.style.bottom=``}else{let t=e.top+e.height/2-n-6;t=Math.max(16,Math.min(t,a-28)),o.style.top=`${t}px`,o.style.bottom=``,o.style.left=``,o.style.right=``}}render(){if(this.container){if(this.hideTooltip(),this.filteredItems.length===0){this.container.innerHTML=``,this.emptyElement&&this.emptyElement.classList.remove(`hidden`);return}this.emptyElement&&this.emptyElement.classList.add(`hidden`),this.container.innerHTML=this.filteredItems.map(e=>this.renderItem(e)).join(``),a(this.lazyLoadRoot)}}renderItem(e){let t=e.label||e.name,n=s(e.icon)||e.icon,r=this.showQuantity?`<span class="item-grid__quantity">${e.quantity}</span>`:``;return`
      <div class="item-grid__item"
           data-inventory-id="${e.id}"
           data-item-id="${e.item_id}"
           data-uuid="${e.uuid||``}"
           tabindex="0"
           role="button"
           aria-label="${t}">
        <img
          class="item-grid__sprite lazy"
          data-src="${n}"
          alt="${t}"
          width="64"
          height="64"
        />
        ${r}
      </div>
    `}setItems(e){this.items=e||[],this.filteredItems=[...this.items],this.render()}filter(e){e===`all`?this.filteredItems=[...this.items]:this.filteredItems=this.items.filter(t=>t.type===e),this.render()}getItemData(e){let t=parseInt(e.dataset.inventoryId);return this.items.find(e=>e.id===t)}on(e,t,n,r=!1){e.addEventListener(t,n,r),this.listeners.push({element:e,event:t,handler:n,useCapture:r})}destroy(){this.hideTooltipTimeout&&clearTimeout(this.hideTooltipTimeout),this.listeners.forEach(({element:e,event:t,handler:n,useCapture:r})=>{e.removeEventListener(t,n,r)}),this.listeners=[],this.tooltip&&=(this.tooltip.remove(),null),this.activeItem=null}},u=class extends o{constructor(){super(),this.itemGrid=null,this.allItems=[]}async getHTML(){return c}async initUI(){await this.loadInventory(),this.updateGold(),this.allItems=this.normalizeInventory(),this.itemGrid=new l({container:this.$(`#inventoryItems`),items:this.allItems,showQuantity:!0,emptyElement:this.$(`#emptyMessage`),lazyLoadRoot:this.root}),this.itemGrid.render(),this.onClick(`.tab`,(e,t)=>{this.$$(`.tab`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),this.itemGrid.filter(t.dataset.type)})}async loadInventory(){await Promise.all([t.getUserEggs(),i.getUserCandies(),r.getUserStones(),e.getUserChigos()])}normalizeInventory(){let e=[];return(n.eggs||[]).filter(e=>e.status===`inventory`).forEach(t=>{e.push({id:t.id,uuid:t.uuid,type:`egg`,name:t.type_name,label:t.type_label||t.type_name,description:t.type_description||`Un huevo misterioso`,icon:t.icon,quantity:1,price:0,_original:t})}),(n.candies||[]).forEach(t=>{t.quantity>0&&e.push({id:t.candy_type_id,type:`candy`,name:t.name,label:t.label||t.name,description:t.description||`Un caramelo para tu chigo`,icon:t.icon,quantity:t.quantity,price:t.price||0,_original:t})}),(n.stones||[]).forEach(t=>{t.quantity>0&&e.push({id:t.stone_type_id,type:`stone`,name:t.name,label:t.label||t.name,description:t.description||`Una piedra elemental`,icon:t.icon,quantity:t.quantity,price:t.price||0,_original:t})}),(n.chigos||[]).forEach(t=>{e.push({id:t.id,uuid:t.uuid,type:`chigo`,name:t.species_name,label:t.nickname||t.species_label||t.species_name,description:`Lv.${t.level||1} - HP:${t.hp} ATK:${t.atk} DEF:${t.def} SPD:${t.spd}`,icon:t.icon,quantity:1,price:0,_original:t})}),e}updateGold(){let e=this.$(`#goldAmount`);e&&(e.textContent=n.gold.toLocaleString())}onExit(){this.itemGrid&&=(this.itemGrid.destroy(),null),super.onExit()}};export{u as InventoryScene};