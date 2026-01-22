import{o as e}from"./index-BbzHd__1.js";import{t}from"./Scene-BuxfXckF.js";import{t as n}from"./assetRegistry-nONwpp3R.js";var r=`<div class="marketplace">\r
  <h1>Marketplace</h1>\r
  <p>Contenido del marketplace</p>\r
  <div id="marketItems"></div>\r
</div>\r
`;const i={async getItems(){if(console.warn(`holis...`),e.items.length)return e.items;try{let t=await fetch(`/api/items`);if(!t.ok)throw Error(`Failed to fetch items`);let n=await t.json();return e.items=n,n}catch(e){return console.error(`Error loading items:`,e),[]}}};var a=class extends t{async getHTML(){return r}async initUI(){let e=await i.getItems(),t=document.getElementById(`marketItems`);t.innerHTML=e.map(e=>this.renderItem(e)).join(``),this.onClick(`.item-card`,(e,t)=>{let n=t.dataset.itemId;console.log(`Item clicked:`,n)})}renderItem(e){let t=e.label||e.name,r=n(e.icon)||e.icon;return`
      <div class="item-card" data-item-id="${e.id}">
        <img
          class="item-card__image lazy"
          data-src="${r}"
          alt="${t}"
          width="64"
          height="64"
        />
        <div class="item-card__info">
          <h3 class="item-card__name">${t}</h3>
          <p class="item-card__price">${e.price}g</p>
        </div>
      </div>
    `}};export{a as MarketplaceScene};