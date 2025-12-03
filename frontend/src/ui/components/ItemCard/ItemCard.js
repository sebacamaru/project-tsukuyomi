import "./ItemCard.css";

/**
 * Componente reutilizable para mostrar un item con imagen y detalles
 */
export class ItemCard {
  constructor(item) {
    this.item = item;
  }

  /**
   * Renderiza el componente y retorna el elemento DOM
   */
  render() {
    const card = document.createElement("div");
    card.className = "item-card";
    card.dataset.itemId = this.item.id;

    card.innerHTML = `
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
    `;

    return card;
  }

  /**
   * Versión estática para rendering rápido (sin instanciar)
   */
  static renderHTML(item) {
    return `
      <div class="item-card" data-item-id="${item.id}">
        <img
          class="item-card__image lazy"
          data-src="${item.icon}"
          alt="${item.name}"
          width="64"
          height="64"
        />
        <div class="item-card__info">
          <h3 class="item-card__name">${item.name}</h3>
          <p class="item-card__price">${item.price}g</p>
        </div>
      </div>
    `;
  }
}
