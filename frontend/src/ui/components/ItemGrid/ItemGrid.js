import "./itemGrid.css";
import { getAssetUrl } from "../../../utils/assetRegistry.js";
import { initLazyImages } from "../../../utils/lazyLoader.js";

/**
 * ItemGrid - Componente reutilizable para mostrar grids de items con tooltip
 *
 * Uso:
 *   const grid = new ItemGrid({
 *     container: "#inventoryItems",
 *     items: normalizedItems,
 *     onItemClick: (item) => console.log("Clicked", item),
 *     showQuantity: true
 *   });
 *   grid.render();
 *
 *   // Actualizar items
 *   grid.setItems(newItems);
 *
 *   // Filtrar
 *   grid.filter("potion");
 *
 *   // Cleanup
 *   grid.destroy();
 */
export class ItemGrid {
  /**
   * @param {Object} options
   * @param {string|HTMLElement} options.container - Selector o elemento contenedor
   * @param {Array} options.items - Array de items a mostrar
   * @param {Function} [options.onItemClick] - Callback cuando se hace click en un item
   * @param {boolean} [options.showQuantity=true] - Mostrar badge de cantidad
   * @param {string} [options.emptyMessage="Sin items"] - Mensaje cuando no hay items
   * @param {HTMLElement} [options.emptyElement] - Elemento para mostrar mensaje vacío
   * @param {HTMLElement} [options.lazyLoadRoot] - Root para lazy loading (default: container)
   */
  constructor(options) {
    this.container =
      typeof options.container === "string"
        ? document.querySelector(options.container)
        : options.container;

    this.items = options.items || [];
    this.filteredItems = [...this.items];
    this.onItemClick = options.onItemClick || null;
    this.showQuantity = options.showQuantity !== false;
    this.emptyMessage = options.emptyMessage || "Sin items";
    this.emptyElement = options.emptyElement || null;
    this.lazyLoadRoot = options.lazyLoadRoot || this.container;

    this.tooltip = null;
    this.activeItem = null;
    this.isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    this.hideTooltipTimeout = null;

    // Track listeners for cleanup
    this.listeners = [];

    this.init();
  }

  init() {
    this.createTooltip();
    this.setupEvents();
  }

  // ==========================================
  // TOOLTIP
  // ==========================================

  createTooltip() {
    const tooltipHTML = `
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
    `;

    document.body.insertAdjacentHTML("beforeend", tooltipHTML);
    this.tooltip = document.body.lastElementChild;
  }

  setupEvents() {
    if (this.isMobile) {
      this.setupMobileEvents();
    } else {
      this.setupDesktopEvents();
    }

    // Hide on scroll
    const sceneOutlet = document.getElementById("scene-outlet");
    if (sceneOutlet) {
      this.on(sceneOutlet, "scroll", () => this.hideTooltip());
    }
  }

  setupMobileEvents() {
    // Tap on item to show/toggle
    this.on(this.container, "click", (e) => {
      const item = e.target.closest(".item-grid__item");
      if (!item) return;

      e.preventDefault();
      e.stopPropagation();

      if (this.activeItem === item) {
        this.hideTooltip();
      } else {
        this.showTooltip(item);
      }

      // Call user callback
      if (this.onItemClick) {
        const itemData = this.getItemData(item);
        if (itemData) this.onItemClick(itemData, item);
      }
    });

    // Tap outside to close
    this.on(document, "click", (e) => {
      if (
        !e.target.closest(".item-grid__item") &&
        !e.target.closest(".item-grid-tooltip")
      ) {
        this.hideTooltip();
      }
    });
  }

  setupDesktopEvents() {
    // Hover events with delegation
    this.on(
      this.container,
      "mouseenter",
      (e) => {
        const item = e.target.closest(".item-grid__item");
        if (item) {
          clearTimeout(this.hideTooltipTimeout);
          this.showTooltip(item);
        }
      },
      true,
    );

    this.on(
      this.container,
      "mouseleave",
      (e) => {
        const item = e.target.closest(".item-grid__item");
        if (item) {
          this.hideTooltipTimeout = setTimeout(() => this.hideTooltip(), 100);
        }
      },
      true,
    );

    // Keyboard support
    this.on(this.container, "focusin", (e) => {
      const item = e.target.closest(".item-grid__item");
      if (item) this.showTooltip(item);
    });

    this.on(this.container, "focusout", () => this.hideTooltip());

    // Click handler (for user callback)
    if (this.onItemClick) {
      this.on(this.container, "click", (e) => {
        const item = e.target.closest(".item-grid__item");
        if (item) {
          const itemData = this.getItemData(item);
          if (itemData) this.onItemClick(itemData, item);
        }
      });
    }
  }

  showTooltip(itemElement) {
    const itemData = this.getItemData(itemElement);
    if (!itemData) return;

    // Update active state
    if (this.activeItem) {
      this.activeItem.classList.remove("active");
    }
    this.activeItem = itemElement;
    itemElement.classList.add("active");

    // Populate tooltip
    this.populateTooltip(itemData);

    // Show and position
    this.tooltip.classList.add("visible");
    if (this.isMobile) {
      this.tooltip.classList.add("mobile");
    }
    this.tooltip.setAttribute("aria-hidden", "false");

    this.positionTooltip(itemElement);
  }

  hideTooltip() {
    if (this.activeItem) {
      this.activeItem.classList.remove("active");
      this.activeItem = null;
    }

    if (this.tooltip) {
      this.tooltip.classList.remove("visible", "mobile");
      this.tooltip.setAttribute("aria-hidden", "true");
    }
  }

  populateTooltip(item) {
    const nameEl = this.tooltip.querySelector(".item-grid-tooltip__name");
    const typeEl = this.tooltip.querySelector(".item-grid-tooltip__type");
    const descEl = this.tooltip.querySelector(
      ".item-grid-tooltip__description",
    );
    const priceEl = this.tooltip.querySelector(".item-grid-tooltip__price");
    const footerEl = this.tooltip.querySelector(".item-grid-tooltip__footer");

    nameEl.textContent = item.label || item.name;

    typeEl.textContent = this.getTypeLabel(item.type);
    typeEl.className = `item-grid-tooltip__type item-grid-tooltip__type--${item.type}`;

    descEl.textContent = item.description || "Sin descripción";

    if (item.price && item.price > 0) {
      priceEl.textContent = `${item.price}g`;
      footerEl.classList.remove("hidden");
    } else {
      footerEl.classList.add("hidden");
    }
  }

  getTypeLabel(type) {
    const labels = {
      egg: "Huevo",
      candy: "Caramelo",
      stone: "Piedra",
      chigo: "Chigo",
      misc: "Otro",
    };
    return labels[type] || type;
  }

  positionTooltip(targetElement) {
    const tooltip = this.tooltip;
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const gap = 12;
    const padding = 8;

    const spaceAbove = targetRect.top;
    const spaceBelow = viewportHeight - targetRect.bottom;
    const spaceLeft = targetRect.left;
    const spaceRight = viewportWidth - targetRect.right;

    const tooltipWidth = tooltipRect.width || 220;
    const tooltipHeight = tooltipRect.height || 120;

    let position = "top";
    let top, left;

    // Determine position
    if (spaceAbove >= tooltipHeight + gap + padding) {
      position = "top";
      top = targetRect.top - tooltipHeight - gap;
    } else if (spaceBelow >= tooltipHeight + gap + padding) {
      position = "bottom";
      top = targetRect.bottom + gap;
    } else if (spaceRight >= tooltipWidth + gap + padding) {
      position = "right";
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.right + gap;
    } else if (spaceLeft >= tooltipWidth + gap + padding) {
      position = "left";
      top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.left - tooltipWidth - gap;
    } else {
      position = "top";
      top = Math.max(padding, targetRect.top - tooltipHeight - gap);
    }

    // Calculate horizontal for top/bottom
    if (position === "top" || position === "bottom") {
      left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;

      if (left < padding) {
        left = padding;
      } else if (left + tooltipWidth > viewportWidth - padding) {
        left = viewportWidth - tooltipWidth - padding;
      }
    }

    // Clamp vertical for left/right
    if (position === "left" || position === "right") {
      if (top < padding) {
        top = padding;
      } else if (top + tooltipHeight > viewportHeight - padding) {
        top = viewportHeight - tooltipHeight - padding;
      }
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.setAttribute("data-position", position);

    this.positionArrow(
      targetRect,
      left,
      top,
      position,
      tooltipWidth,
      tooltipHeight,
    );
  }

  positionArrow(
    targetRect,
    tooltipLeft,
    tooltipTop,
    position,
    tooltipWidth,
    tooltipHeight,
  ) {
    const arrow = this.tooltip.querySelector(".item-grid-tooltip__arrow");

    if (position === "top" || position === "bottom") {
      const targetCenterX = targetRect.left + targetRect.width / 2;
      let arrowLeft = targetCenterX - tooltipLeft - 6;
      arrowLeft = Math.max(16, Math.min(arrowLeft, tooltipWidth - 28));

      arrow.style.left = `${arrowLeft}px`;
      arrow.style.right = "";
      arrow.style.top = "";
      arrow.style.bottom = "";
    } else {
      const targetCenterY = targetRect.top + targetRect.height / 2;
      let arrowTop = targetCenterY - tooltipTop - 6;
      arrowTop = Math.max(16, Math.min(arrowTop, tooltipHeight - 28));

      arrow.style.top = `${arrowTop}px`;
      arrow.style.bottom = "";
      arrow.style.left = "";
      arrow.style.right = "";
    }
  }

  // ==========================================
  // RENDERING
  // ==========================================

  render() {
    if (!this.container) return;

    this.hideTooltip();

    if (this.filteredItems.length === 0) {
      this.container.innerHTML = "";
      if (this.emptyElement) {
        this.emptyElement.classList.remove("hidden");
      }
      return;
    }

    if (this.emptyElement) {
      this.emptyElement.classList.add("hidden");
    }

    this.container.innerHTML = this.filteredItems
      .map((item) => this.renderItem(item))
      .join("");

    initLazyImages(this.lazyLoadRoot);
  }

  renderItem(item) {
    const displayName = item.label || item.name;
    const iconUrl = getAssetUrl(item.icon) || item.icon;
    const quantityBadge = this.showQuantity
      ? `<span class="item-grid__quantity">${item.quantity}</span>`
      : "";

    return `
      <div class="item-grid__item"
           data-inventory-id="${item.id}"
           data-item-id="${item.item_id}"
           data-uuid="${item.uuid || ""}"
           tabindex="0"
           role="button"
           aria-label="${displayName}">
        <img
          class="item-grid__sprite lazy"
          data-src="${iconUrl}"
          alt="${displayName}"
          width="64"
          height="64"
        />
        ${quantityBadge}
      </div>
    `;
  }

  // ==========================================
  // PUBLIC API
  // ==========================================

  /**
   * Actualiza los items y re-renderiza
   */
  setItems(items) {
    this.items = items || [];
    this.filteredItems = [...this.items];
    this.render();
  }

  /**
   * Filtra items por tipo
   * @param {string} type - Tipo a filtrar ("all" para mostrar todos)
   */
  filter(type) {
    if (type === "all") {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter((item) => item.type === type);
    }
    this.render();
  }

  /**
   * Obtiene los datos del item desde el elemento DOM
   */
  getItemData(itemElement) {
    const inventoryId = itemElement.dataset.inventoryId;
    return this.items.find((i) => String(i.id) === inventoryId);
  }

  // ==========================================
  // UTILITIES
  // ==========================================

  on(element, event, handler, useCapture = false) {
    element.addEventListener(event, handler, useCapture);
    this.listeners.push({ element, event, handler, useCapture });
  }

  /**
   * Limpia el componente (listeners, tooltip)
   */
  destroy() {
    if (this.hideTooltipTimeout) {
      clearTimeout(this.hideTooltipTimeout);
    }

    // Remove all listeners
    this.listeners.forEach(({ element, event, handler, useCapture }) => {
      element.removeEventListener(event, handler, useCapture);
    });
    this.listeners = [];

    // Remove tooltip
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }

    this.activeItem = null;
  }
}
