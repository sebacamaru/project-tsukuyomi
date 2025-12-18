import "./Navbar.css";

/**
 * Componente Navbar
 */
export class Navbar {
  constructor(items = []) {
    this.items = items;
    this.currentRoute = window.location.pathname;
  }

  /**
   * Renderiza el componente y retorna el elemento DOM
   */
  render() {
    const nav = document.createElement("nav");
    nav.className = "navbar";
    nav.id = "main-nav";

    // Encontrar el item activo
    const activeItem =
      this.items.find((item) => this.isActive(item.route)) || this.items[0];

    const title = document.createElement("div");
    title.className = "navbar__title";
    title.innerHTML = `<h1>${activeItem.label}</h1>`;

    const container = document.createElement("div");
    container.className = "navbar__container";

    this.items.forEach((item) => {
      const navItem = this.createNavItem(item);
      container.appendChild(navItem);
    });

    nav.appendChild(title);
    nav.appendChild(container);

    return nav;
  }

  /**
   * Crea un item de navegación individual
   */
  createNavItem(item) {
    const link = document.createElement("a");
    link.href = item.route;
    link.className = "navbar__item";
    link.dataset.route = item.route;

    // Marcar como activo si coincide con la ruta actual
    if (this.isActive(item.route)) {
      link.classList.add("navbar__item--active");
    }

    link.innerHTML = `
      <div class="navbar__icon">
        ${item.icon}
      </div>
      <span class="navbar__label">${item.label}</span>
    `;

    // Event listener para navegación
    link.addEventListener("click", (e) => {
      e.preventDefault();
      this.navigate(item.route);
    });

    return link;
  }

  /**
   * Verifica si una ruta está activa
   */
  isActive(route) {
    if (route === "/") {
      return this.currentRoute === "/";
    }
    return this.currentRoute.startsWith(route);
  }

  /**
   * Navega a una nueva ruta
   */
  navigate(route) {
    // Actualizar la ruta actual
    this.currentRoute = route;

    // Actualizar el estado activo de los items
    const items = document.querySelectorAll(".navbar__item");
    items.forEach((item) => {
      const itemRoute = item.dataset.route;
      if (this.isActive(itemRoute)) {
        item.classList.add("navbar__item--active");
      } else {
        item.classList.remove("navbar__item--active");
      }
    });

    // Actualizar el título con el item activo
    const activeItem = this.items.find((item) => this.isActive(item.route));
    if (activeItem) {
      const titleElement = document.querySelector(".navbar__title h1");
      if (titleElement) {
        titleElement.textContent = activeItem.label;
      }
    }

    // Emitir evento de navegación para que el router lo maneje
    window.dispatchEvent(new CustomEvent("navigate", { detail: { route } }));
  }

  /**
   * Actualiza los items del navbar
   */
  updateItems(newItems) {
    this.items = newItems;
    const navElement = document.querySelector("#main-nav");
    if (navElement) {
      const newNav = this.render();
      navElement.replaceWith(newNav);
    }
  }

  /**
   * Versión estática para rendering rápido
   */
  static renderHTML(items = [], currentRoute = "/") {
    // Encontrar el item activo
    const activeItem =
      items.find((item) => {
        if (item.route === "/") {
          return currentRoute === "/";
        }
        return currentRoute.startsWith(item.route);
      }) || items[0];

    const itemsHTML = items
      .map((item) => {
        const isActive =
          item.route === "/"
            ? currentRoute === "/"
            : currentRoute.startsWith(item.route);
        const activeClass = isActive ? " navbar__item--active" : "";

        return `
        <a href="${item.route}" class="navbar__item${activeClass}" data-route="${item.route}">
          <div class="navbar__icon">
            ${item.icon}
          </div>
          <span class="navbar__label">${item.label}</span>
        </a>
      `;
      })
      .join("");

    return `
      <nav class="navbar" id="main-nav">
        <div class="navbar__title">
          <h1>${activeItem ? activeItem.label : "Navbar"}</h1>
        </div>
        <div class="navbar__container">
          ${itemsHTML}
        </div>
      </nav>
    `;
  }
}
