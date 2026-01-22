import{a as e,o as t}from"./index-BbzHd__1.js";import{n,t as r}from"./Scene-BuxfXckF.js";import{t as i}from"./assetRegistry-nONwpp3R.js";var a=`<div class="inventory">
    <div class="container">
        <div class="inventory__header">
            <h1>Mi Inventario</h1>
            <div class="inventory__gold">
                <span class="gold-icon"></span>
                <span id="goldAmount">0</span>g
            </div>
        </div>

        <div class="inventory__tabs">
            <button class="tab active" data-type="all">Todos</button>
            <button class="tab" data-type="potion">Pociones</button>
            <button class="tab" data-type="egg">Huevos</button>
            <button class="tab" data-type="misc">Otros</button>
        </div>

        <div id="inventoryItems" class="inventory__grid">
            <!-- Items se cargan dinamicamente -->
        </div>

        <div id="emptyMessage" class="inventory__empty hidden">
            <p>No tienes items en tu inventario</p>
        </div>
    </div>
</div>
`,o=class extends r{async getHTML(){return a}async initUI(){await e.loadInventory(),this.updateGold(),this.renderItems(`all`),this.onClick(`.tab`,(e,t)=>{this.$$(`.tab`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),this.renderItems(t.dataset.type)}),this.onClick(`.inventory-item`,(e,n)=>{let r=n.dataset.itemId,i=t.inventory.find(e=>e.item_id===Number(r));i&&console.log(`Item seleccionado:`,i)})}updateGold(){let e=this.$(`#goldAmount`);e&&(e.textContent=t.gold.toLocaleString())}renderItems(e){let r=this.$(`#inventoryItems`),i=this.$(`#emptyMessage`);if(!r)return;let a=t.inventory||[];if(e!==`all`&&(a=a.filter(t=>t.type===e)),a.length===0){r.innerHTML=``,i?.classList.remove(`hidden`);return}i?.classList.add(`hidden`),r.innerHTML=a.map(e=>this.renderItem(e)).join(``),n(this.root)}renderItem(e){let t=e.label||e.name,n=i(e.icon)||e.icon;return`
      <div class="item-card inventory-item" data-item-id="${e.item_id}">
        <span class="inventory-item__quantity">${e.quantity}</span>
        <img
          class="item-card__image lazy"
          data-src="${n}"
          alt="${t}"
          width="64"
          height="64"
        />
        <div class="item-card__info">
          <h3 class="item-card__name">${t}</h3>
          ${e.description?`<p class="inventory-item__description">${e.description}</p>`:``}
        </div>
      </div>
    `}};export{o as InventoryScene};