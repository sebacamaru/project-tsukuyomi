import adminHTML from "../ui/scenes/admin/admin.html?raw";
import "../ui/scenes/admin/admin.css";
import { Scene } from "../core/Scene.js";
import { adminService } from "../services/adminService.js";
import { store } from "../core/Store.js";
import { getAssetUrl } from "../utils/assetRegistry.js";
import { initLazyImages } from "../utils/lazyLoader.js";

export class AdminScene extends Scene {
  constructor() {
    super();
    this.users = [];
    this.quests = [];
    this.eggTypes = [];
    this.candyTypes = [];
    this.stoneTypes = [];
    this.chigoSpecies = [];
    this.currentCatalog = "egg-types";
    this.editingId = null;
  }

  async getHTML() {
    return adminHTML;
  }

  async initUI() {
    this.enterCutsceneMode();
    await this.loadData();
    this.setupEventListeners();
  }

  onExit() {
    this.exitCutsceneMode();
  }

  async loadData() {
    try {
      const [users, quests, eggTypes, candyTypes, stoneTypes, chigoSpecies] =
        await Promise.all([
          adminService.getUsers(),
          adminService.getQuests(),
          adminService.getEggTypes(),
          adminService.getCandyTypes(),
          adminService.getStoneTypes(),
          adminService.getChigoSpecies(),
        ]);

      this.users = users;
      this.quests = quests;
      this.eggTypes = eggTypes;
      this.candyTypes = candyTypes;
      this.stoneTypes = stoneTypes;
      this.chigoSpecies = chigoSpecies;

      this.populateUserSelect();
      this.populateQuestSelect();
      this.populateGiveSelects();
      this.renderCatalogList();
    } catch (error) {
      console.error("Error loading admin data:", error);
      this.showMessage("Error al cargar datos", "error");
    }
  }

  populateUserSelect() {
    const select = this.$("#user-select");
    select.innerHTML = '<option value="">-- Seleccionar usuario --</option>';

    this.users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = `${user.username} (${user.email})`;
      select.appendChild(option);
    });
  }

  populateQuestSelect() {
    const select = this.$("#quest-select");
    select.innerHTML =
      '<option value="">-- Todas completadas (null) --</option>';

    this.quests.forEach((quest) => {
      const option = document.createElement("option");
      option.value = quest.code;
      option.textContent = `${quest.code} - ${quest.name}`;
      select.appendChild(option);
    });
  }

  populateGiveSelects() {
    // Usuarios
    const userSelect = this.$("#give-user-select");
    userSelect.innerHTML =
      '<option value="">-- Seleccionar usuario --</option>';
    this.users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = `${user.username} (${user.email})`;
      userSelect.appendChild(option);
    });

    // Huevos
    const eggSelect = this.$("#give-egg-select");
    eggSelect.innerHTML =
      '<option value="">-- Seleccionar tipo de huevo --</option>';
    this.eggTypes.forEach((egg) => {
      const option = document.createElement("option");
      option.value = egg.id;
      option.textContent = `${egg.label} (${egg.name})`;
      eggSelect.appendChild(option);
    });

    // Caramelos
    const candySelect = this.$("#give-candy-select");
    candySelect.innerHTML =
      '<option value="">-- Seleccionar caramelo --</option>';
    this.candyTypes.forEach((candy) => {
      const option = document.createElement("option");
      option.value = candy.id;
      option.textContent = `${candy.label} (${candy.name})`;
      candySelect.appendChild(option);
    });

    // Piedras
    const stoneSelect = this.$("#give-stone-select");
    stoneSelect.innerHTML =
      '<option value="">-- Seleccionar piedra --</option>';
    this.stoneTypes.forEach((stone) => {
      const option = document.createElement("option");
      option.value = stone.id;
      option.textContent = `${stone.label} (${stone.name})`;
      stoneSelect.appendChild(option);
    });
  }

  setupEventListeners() {
    // Usuario seleccionado
    this.$("#user-select").addEventListener("change", () =>
      this.onUserChange(),
    );

    // Reset quest
    this.$("#reset-quest-btn").addEventListener("click", () =>
      this.onResetQuest(),
    );

    // Tabs de catálogo
    this.onClick(".catalog-tab", (e, tab) => {
      this.$$(".catalog-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      this.currentCatalog = tab.dataset.catalog;
      this.renderCatalogList();
      this.onCancelEdit();
    });

    // Guardar/Crear item del catálogo
    this.$("#save-catalog-btn").addEventListener("click", () =>
      this.onSaveCatalogItem(),
    );

    // Cancelar edición
    this.$("#cancel-catalog-btn").addEventListener("click", () =>
      this.onCancelEdit(),
    );

    // Event delegation para lista de catálogo
    this.$("#catalog-list-container").addEventListener("click", (e) => {
      const editBtn = e.target.closest(".catalog-row__btn--edit");
      const deleteBtn = e.target.closest(".catalog-row__btn--delete");

      if (editBtn) {
        this.onEditCatalogItem(parseInt(editBtn.dataset.id));
      } else if (deleteBtn) {
        this.onDeleteCatalogItem(parseInt(deleteBtn.dataset.id));
      }
    });

    // Dar huevo
    this.$("#give-egg-btn").addEventListener("click", () => this.onGiveEgg());

    // Dar caramelo
    this.$("#give-candy-btn").addEventListener("click", () =>
      this.onGiveCandy(),
    );

    // Dar piedra
    this.$("#give-stone-btn").addEventListener("click", () =>
      this.onGiveStone(),
    );
  }

  // ==================== CATÁLOGO ====================

  getCurrentCatalogData() {
    switch (this.currentCatalog) {
      case "egg-types":
        return this.eggTypes;
      case "candy-types":
        return this.candyTypes;
      case "stone-types":
        return this.stoneTypes;
      case "chigo-species":
        return this.chigoSpecies;
      default:
        return [];
    }
  }

  renderCatalogList() {
    const container = this.$("#catalog-list-container");
    const data = this.getCurrentCatalogData();

    if (data.length === 0) {
      container.innerHTML = '<p class="text-muted">No hay elementos</p>';
      return;
    }

    container.innerHTML = data
      .map((item) => {
        const iconUrl = getAssetUrl(item.icon) || item.icon;
        return `
        <div class="catalog-row" data-id="${item.id}">
          <img class="catalog-row__icon lazy" data-src="${iconUrl}" alt="${item.label}" onerror="this.src='https://via.placeholder.com/40'">
          <div class="catalog-row__info">
            <p class="catalog-row__name">${item.label}</p>
            <p class="catalog-row__meta">${item.name}${item.price ? ` | ${item.price}g` : ""}</p>
          </div>
          <div class="catalog-row__actions">
            <button class="catalog-row__btn catalog-row__btn--edit" data-id="${item.id}">Editar</button>
            <button class="catalog-row__btn catalog-row__btn--delete" data-id="${item.id}">X</button>
          </div>
        </div>
      `;
      })
      .join("");

    initLazyImages(this.root);
  }

  onEditCatalogItem(id) {
    const data = this.getCurrentCatalogData();
    const item = data.find((i) => i.id === id);
    if (!item) return;

    this.editingId = id;

    this.$("#catalog-name").value = item.name;
    this.$("#catalog-label").value = item.label;
    this.$("#catalog-description").value = item.description || "";
    this.$("#catalog-icon").value = item.icon || "";
    this.$("#catalog-price").value = item.price || "";

    this.$("#save-catalog-btn").textContent = "Guardar Cambios";
    this.$("#cancel-catalog-btn").classList.remove("hidden");
  }

  onCancelEdit() {
    this.editingId = null;
    this.clearCatalogForm();
    this.$("#save-catalog-btn").textContent = "Crear";
    this.$("#cancel-catalog-btn").classList.add("hidden");
  }

  clearCatalogForm() {
    this.$("#catalog-name").value = "";
    this.$("#catalog-label").value = "";
    this.$("#catalog-description").value = "";
    this.$("#catalog-icon").value = "";
    this.$("#catalog-price").value = "";
  }

  async onSaveCatalogItem() {
    const name = this.$("#catalog-name").value.trim();
    const label = this.$("#catalog-label").value.trim();
    const description = this.$("#catalog-description").value.trim();
    const icon = this.$("#catalog-icon").value.trim();
    const price = parseInt(this.$("#catalog-price").value) || 0;

    if (!name || !label) {
      this.showCatalogMessage("Name y label son requeridos", "error");
      return;
    }

    const saveBtn = this.$("#save-catalog-btn");
    saveBtn.disabled = true;
    saveBtn.textContent = "Guardando...";

    try {
      const data = { name, label, description, icon, price };
      let result;

      if (this.editingId) {
        result = await this.updateCatalogItem(this.editingId, data);
      } else {
        result = await this.createCatalogItem(data);
      }

      if (result.success) {
        this.showCatalogMessage(
          this.editingId ? "Actualizado" : "Creado",
          "success",
        );
        await this.reloadCurrentCatalog();
        this.renderCatalogList();
        this.onCancelEdit();
      } else {
        this.showCatalogMessage(result.error || "Error al guardar", "error");
      }
    } catch (error) {
      console.error("Error saving catalog item:", error);
      this.showCatalogMessage("Error de conexión", "error");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = this.editingId ? "Guardar Cambios" : "Crear";
    }
  }

  async createCatalogItem(data) {
    switch (this.currentCatalog) {
      case "egg-types":
        return adminService.createEggType(data);
      case "candy-types":
        return adminService.createCandyType(data);
      case "stone-types":
        return adminService.createStoneType(data);
      case "chigo-species":
        return adminService.createSpecies(data);
      default:
        return { success: false, error: "Catálogo no válido" };
    }
  }

  async updateCatalogItem(id, data) {
    switch (this.currentCatalog) {
      case "egg-types":
        return adminService.updateEggType(id, data);
      case "candy-types":
        return adminService.updateCandyType(id, data);
      case "stone-types":
        return adminService.updateStoneType(id, data);
      case "chigo-species":
        return adminService.updateSpecies(id, data);
      default:
        return { success: false, error: "Catálogo no válido" };
    }
  }

  async onDeleteCatalogItem(id) {
    const data = this.getCurrentCatalogData();
    const item = data.find((i) => i.id === id);
    if (!item) return;

    if (!confirm(`¿Eliminar "${item.label}"?`)) return;

    try {
      let result;
      switch (this.currentCatalog) {
        case "egg-types":
          result = await adminService.deleteEggType(id);
          break;
        case "candy-types":
          result = await adminService.deleteCandyType(id);
          break;
        case "stone-types":
          result = await adminService.deleteStoneType(id);
          break;
        case "chigo-species":
          result = await adminService.deleteSpecies(id);
          break;
      }

      if (result.success) {
        this.showCatalogMessage("Eliminado", "success");
        await this.reloadCurrentCatalog();
        this.renderCatalogList();

        if (this.editingId === id) {
          this.onCancelEdit();
        }
      } else {
        this.showCatalogMessage(result.error || "Error al eliminar", "error");
      }
    } catch (error) {
      console.error("Error deleting catalog item:", error);
      this.showCatalogMessage("Error de conexión", "error");
    }
  }

  async reloadCurrentCatalog() {
    switch (this.currentCatalog) {
      case "egg-types":
        this.eggTypes = await adminService.getEggTypes();
        break;
      case "candy-types":
        this.candyTypes = await adminService.getCandyTypes();
        break;
      case "stone-types":
        this.stoneTypes = await adminService.getStoneTypes();
        break;
      case "chigo-species":
        this.chigoSpecies = await adminService.getChigoSpecies();
        break;
    }
    this.populateGiveSelects();
  }

  showCatalogMessage(text, type = "info") {
    const messageEl = this.$("#catalog-message");
    messageEl.textContent = text;
    messageEl.className = `admin__message ${type}`;

    setTimeout(() => {
      messageEl.textContent = "";
      messageEl.className = "admin__message";
    }, 3000);
  }

  // ==================== DAR ITEMS ====================

  async onGiveEgg() {
    const userId = parseInt(this.$("#give-user-select").value);
    const eggTypeId = parseInt(this.$("#give-egg-select").value);

    if (!userId || !eggTypeId) {
      this.showGiveMessage("Selecciona usuario y tipo de huevo", "error");
      return;
    }

    const btn = this.$("#give-egg-btn");
    btn.disabled = true;
    btn.textContent = "Dando...";

    try {
      const result = await adminService.giveEggToUser(userId, eggTypeId);
      if (result.success) {
        this.showGiveMessage("Huevo asignado", "success");
      } else {
        this.showGiveMessage(result.error || "Error", "error");
      }
    } catch (error) {
      this.showGiveMessage("Error de conexión", "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Dar Huevo";
    }
  }

  async onGiveCandy() {
    const userId = parseInt(this.$("#give-user-select").value);
    const candyTypeId = parseInt(this.$("#give-candy-select").value);
    const quantity = parseInt(this.$("#give-candy-quantity").value) || 1;

    if (!userId || !candyTypeId) {
      this.showGiveMessage("Selecciona usuario y caramelo", "error");
      return;
    }

    const btn = this.$("#give-candy-btn");
    btn.disabled = true;
    btn.textContent = "Dando...";

    try {
      const result = await adminService.giveCandyToUser(
        userId,
        candyTypeId,
        quantity,
      );
      if (result.success) {
        this.showGiveMessage(`${quantity}x caramelos asignados`, "success");
      } else {
        this.showGiveMessage(result.error || "Error", "error");
      }
    } catch (error) {
      this.showGiveMessage("Error de conexión", "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Dar Caramelo";
    }
  }

  async onGiveStone() {
    const userId = parseInt(this.$("#give-user-select").value);
    const stoneTypeId = parseInt(this.$("#give-stone-select").value);
    const quantity = parseInt(this.$("#give-stone-quantity").value) || 1;

    if (!userId || !stoneTypeId) {
      this.showGiveMessage("Selecciona usuario y piedra", "error");
      return;
    }

    const btn = this.$("#give-stone-btn");
    btn.disabled = true;
    btn.textContent = "Dando...";

    try {
      const result = await adminService.giveStoneToUser(
        userId,
        stoneTypeId,
        quantity,
      );
      if (result.success) {
        this.showGiveMessage(`${quantity}x piedras asignadas`, "success");
      } else {
        this.showGiveMessage(result.error || "Error", "error");
      }
    } catch (error) {
      this.showGiveMessage("Error de conexión", "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Dar Piedra";
    }
  }

  showGiveMessage(text, type = "info") {
    const messageEl = this.$("#give-message");
    messageEl.textContent = text;
    messageEl.className = `admin__message ${type}`;

    setTimeout(() => {
      messageEl.textContent = "";
      messageEl.className = "admin__message";
    }, 3000);
  }

  // ==================== USUARIOS/QUESTS ====================

  onUserChange() {
    const userId = this.$("#user-select").value;
    const userInfo = this.$("#user-info");

    if (!userId) {
      userInfo.innerHTML =
        '<p class="text-muted">Selecciona un usuario para ver sus datos</p>';
      return;
    }

    const user = this.users.find((u) => u.id === parseInt(userId));
    if (!user) return;

    const isCurrentUser = store.user?.id === user.id;

    userInfo.innerHTML = `
      <p><strong>ID:</strong> ${user.id} ${isCurrentUser ? '<span class="badge">Tu usuario</span>' : ""}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Username:</strong> ${user.username}</p>
      <p><strong>Quest actual:</strong> ${user.current_quest_code || '<span class="text-muted">(ninguna)</span>'}</p>
    `;
  }

  async onResetQuest() {
    const userId = parseInt(this.$("#user-select").value);
    const questCode = this.$("#quest-select").value || null;

    if (!userId) {
      this.showMessage("Selecciona un usuario", "error");
      return;
    }

    const resetBtn = this.$("#reset-quest-btn");
    resetBtn.disabled = true;
    resetBtn.textContent = "Reseteando...";

    try {
      const result = await adminService.resetQuest(userId, questCode);

      if (result.success) {
        const userIndex = this.users.findIndex((u) => u.id === userId);
        if (userIndex !== -1) {
          this.users[userIndex] = result.user;
        }

        if (store.user?.id === userId) {
          store.user.current_quest_code = result.user.current_quest_code;
        }

        this.onUserChange();
        this.showMessage(
          `Quest reseteada a: ${questCode || "(ninguna)"}`,
          "success",
        );
      } else {
        this.showMessage(result.error || "Error al resetear", "error");
      }
    } catch (error) {
      console.error("Error resetting quest:", error);
      this.showMessage("Error de conexión", "error");
    } finally {
      resetBtn.disabled = false;
      resetBtn.textContent = "Guardar";
    }
  }

  showMessage(text, type = "info") {
    const messageEl = this.$("#admin-message");
    messageEl.textContent = text;
    messageEl.className = `admin__message ${type}`;

    setTimeout(() => {
      messageEl.textContent = "";
      messageEl.className = "admin__message";
    }, 3000);
  }
}
