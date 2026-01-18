import{i as e}from"./index-Do9XzL4n.js";import{t}from"./Scene-Bx4WwdoU.js";var n=`<div class="marketplace">\r
  <h1>Marketplace</h1>\r
  <p>Contenido del marketplace</p>\r
  <div id="marketItems"></div>\r
</div>\r
`;const r={async getItems(){if(console.warn(`holis...`),e.items.length)return e.items;try{let t=await fetch(`/api/items`);if(!t.ok)throw Error(`Failed to fetch items`);let n=await t.json();return e.items=n,n}catch(e){return console.error(`Error loading items:`,e),[]}}};var i=class{constructor(e){this.item=e}render(){let e=document.createElement(`div`);return e.className=`item-card`,e.dataset.itemId=this.item.id,e.innerHTML=`
      <img
        class="item-card__image lazy"
        data-src="${this.item.icon}"
        alt="${this.item.name}"
        width="64"
        height="64"
      />
      <div class="item-card__info">
        <h3 class="item-card__name">${this.item.name}</h3>
        <p class="item-card__price">${this.item.price}g</p>
      </div>
    `,e}static renderHTML(e){return`
      <div class="item-card" data-item-id="${e.id}">
        <img
          class="item-card__image lazy"
          data-src="${e.icon}"
          alt="${e.name}"
          width="64"
          height="64"
        />
        <div class="item-card__info">
          <h3 class="item-card__name">${e.name}</h3>
          <p class="item-card__price">${e.price}g</p>
        </div>
      </div>
    `}},a=class extends t{async getHTML(){return n}async initUI(){console.warn(`initUI`);let e=await r.getItems(),t=document.getElementById(`marketItems`);t.innerHTML=e.map(e=>i.renderHTML(e)).join(``),this.onClick(`.item-card`,(e,t)=>{let n=t.dataset.itemId;console.log(`Item clicked:`,n)})}};export{a as MarketplaceScene};