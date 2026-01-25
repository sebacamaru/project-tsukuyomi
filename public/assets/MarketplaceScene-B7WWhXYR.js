import{l as e,o as t,s as n}from"./index-J6hCYXs1.js";import{t as r}from"./Scene-B1xf0tf_.js";import{t as i}from"./assetRegistry-BotFMTB-.js";var a=`<div class="marketplace">
    <header class="marketplace__header">
        <h1>Marketplace</h1>
        <div class="marketplace__gold"><span id="goldAmount">0</span>g</div>
    </header>
    <div id="marketItems" class="marketplace__content"></div>
</div>
`;const o={async getCandyTypes(){return n.getBuyableCandyTypes()},async getStoneTypes(){return t.getBuyableStoneTypes()},async getAllBuyableItems(){let[e,t]=await Promise.all([this.getCandyTypes(),this.getStoneTypes()]);return{candies:e,stones:t}},async buyCandy(e,t=1){return n.buyCandy(e,t)},async buyStone(e,n=1){return t.buyStone(e,n)}};var s=class extends r{constructor(){super(),this.candies=[],this.stones=[]}async getHTML(){return a}async initUI(){await this.loadItems(),this.updateGold(),this.setupEventListeners()}async loadItems(){let{candies:e,stones:t}=await o.getAllBuyableItems();this.candies=e||[],this.stones=t||[],this.renderItems()}renderItems(){let e=this.$(`#marketItems`),t=``;this.candies.length>0&&(t+=`
        <section class="marketplace__section">
          <h2 class="marketplace__section-title">Caramelos</h2>
          <div class="marketplace__grid">
            ${this.candies.map(e=>this.renderItem(e,`candy`)).join(``)}
          </div>
        </section>
      `),this.stones.length>0&&(t+=`
        <section class="marketplace__section">
          <h2 class="marketplace__section-title">Piedras Elementales</h2>
          <div class="marketplace__grid">
            ${this.stones.map(e=>this.renderItem(e,`stone`)).join(``)}
          </div>
        </section>
      `),t||=`<p class="marketplace__empty">No hay items disponibles</p>`,e.innerHTML=t,this.initLazyImages()}setupEventListeners(){this.onClick(`.item-card__buy-btn`,async(e,t)=>{let n=t.closest(`.item-card`),r=parseInt(n.dataset.itemId),i=n.dataset.itemType;await this.handleBuy(r,i,t)})}async handleBuy(e,t,n){n.disabled=!0,n.textContent=`Comprando...`;let r;t===`candy`?r=await o.buyCandy(e,1):t===`stone`&&(r=await o.buyStone(e,1)),r?.success?(this.updateGold(),this.showMessage(`Compra exitosa!`,`success`),n.disabled=!1,n.textContent=`Comprar`):(this.showMessage(r?.error||`Error al comprar`,`error`),n.disabled=!1,n.textContent=`Comprar`)}updateGold(){let t=this.$(`#goldAmount`);t&&(t.textContent=e.gold.toLocaleString())}initLazyImages(){this.root.querySelectorAll(`.item-card__image.lazy`).forEach(e=>{e.dataset.src&&(e.src=e.dataset.src,e.classList.remove(`lazy`))})}renderItem(e,t){let n=e.label||e.name,r=i(e.icon)||e.icon,a=e.description||``;return`
      <div class="item-card" data-item-id="${e.id}" data-item-type="${t}">
        <img
          class="item-card__image lazy"
          data-src="${r}"
          alt="${n}"
          width="64"
          height="64"
        />
        <div class="item-card__info">
          <h3 class="item-card__name">${n}</h3>
          ${a?`<p class="item-card__description">${a}</p>`:``}
          <p class="item-card__price">${e.price}g</p>
        </div>
        <button class="item-card__buy-btn button button--small">
          Comprar
        </button>
      </div>
    `}showMessage(e,t){console.log(`[${t}] ${e}`)}};export{s as MarketplaceScene};