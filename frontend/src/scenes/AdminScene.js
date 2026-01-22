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
    this.items = [];
    this.editingItemId = null;
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
      const [users, quests, items] = await Promise.all([
        adminService.getUsers(),
        adminService.getQuests(),
        adminService.getItems(),
      ]);

      this.users = users;
      this.quests = quests;
      this.items = items;

      this.populateUserSelect();
      this.populateQuestSelect();
      this.renderItemsList();
    } catch (error) {
      console.error("Error loading admin data:", error);
      this.showMessage("Error al cargar datos", "error");
    }
  }

  populateUserSelect() {
    const select = document.getElementById("user-select");
    select.innerHTML = '<option value="">-- Seleccionar usuario --</option>';

    this.users.forEach((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = `${user.username} (${user.email})`;
      select.appendChild(option);
    });
  }

  populateQuestSelect() {
    const select = document.getElementById("quest-select");
    select.innerHTML =
      '<option value="">-- Todas completadas (null) --</option>';

    this.quests.forEach((quest) => {
      const option = document.createElement("option");
      option.value = quest.code;
      option.textContent = `${quest.code} - ${quest.name}`;
      select.appendChild(option);
    });
  }

  setupEventListeners() {
    // Cambio de usuario seleccionado
    const userSelect = document.getElementById("user-select");
    userSelect.addEventListener("change", () => this.onUserChange());

    // Click en resetear quest
    const resetBtn = document.getElementById("reset-quest-btn");
    resetBtn.addEventListener("click", () => this.onResetQuest());

    // Click en borrar todos los items
    const deleteItemsBtn = document.getElementById("delete-items-btn");
    deleteItemsBtn.addEventListener("click", () => this.onDeleteAllItems());

    // Click en guardar item
    const saveItemBtn = document.getElementById("save-item-btn");
    saveItemBtn.addEventListener("click", () => this.onSaveItem());

    // Click en cancelar edicion
    const cancelItemBtn = document.getElementById("cancel-item-btn");
    cancelItemBtn.addEventListener("click", () => this.onCancelEdit());

    // Event delegation para botones de items
    const itemsContainer = document.getElementById("items-list-container");
    itemsContainer.addEventListener("click", (e) => {
      const editBtn = e.target.closest(".item-row__btn--edit");
      const deleteBtn = e.target.closest(".item-row__btn--delete");

      if (editBtn) {
        const id = parseInt(editBtn.dataset.id);
        this.onEditItem(id);
      } else if (deleteBtn) {
        const id = parseInt(deleteBtn.dataset.id);
        this.onDeleteItem(id);
      }
    });
  }

  renderItemsList() {
    const container = document.getElementById("items-list-container");

    if (this.items.length === 0) {
      container.innerHTML = '<p class="text-muted">No hay items</p>';
      return;
    }

    container.innerHTML = this.items
      .map((item) => {
        const iconUrl = getAssetUrl(item.icon) || item.icon;
        return `
      <div class="item-row" data-id="${item.id}">
        <img class="item-row__icon lazy" data-src="${iconUrl}" alt="${item.label}" onerror="this.src='https://via.placeholder.com/40'">
        <div class="item-row__info">
          <p class="item-row__name">${item.label}</p>
          <p class="item-row__meta">${item.name} | ${item.type}</p>
        </div>
        <span class="item-row__price">${item.price}g</span>
        <div class="item-row__actions">
          <button class="item-row__btn item-row__btn--edit" data-id="${item.id}">Editar</button>
          <button class="item-row__btn item-row__btn--delete" data-id="${item.id}">X</button>
        </div>
      </div>
    `;
      })
      .join("");

    initLazyImages(this.root);
  }

  onEditItem(id) {
    const item = this.items.find((i) => i.id === id);
    if (!item) return;

    this.editingItemId = id;

    document.getElementById("item-name").value = item.name;
    document.getElementById("item-label").value = item.label;
    document.getElementById("item-description").value = item.description || "";
    document.getElementById("item-price").value = item.price;
    document.getElementById("item-icon").value = item.icon;
    document.getElementById("item-type").value = item.type;
    document.getElementById("item-edit-id").value = id;

    document.getElementById("save-item-btn").textContent = "Guardar Cambios";
    document.getElementById("cancel-item-btn").classList.remove("hidden");
  }

  onCancelEdit() {
    this.editingItemId = null;
    this.clearItemForm();
    document.getElementById("save-item-btn").textContent = "Crear Item";
    document.getElementById("cancel-item-btn").classList.add("hidden");
  }

  clearItemForm() {
    document.getElementById("item-name").value = "";
    document.getElementById("item-label").value = "";
    document.getElementById("item-description").value = "";
    document.getElementById("item-price").value = "";
    document.getElementById("item-icon").value = "";
    document.getElementById("item-type").value = "misc";
    document.getElementById("item-edit-id").value = "";
  }

  async onSaveItem() {
    const name = document.getElementById("item-name").value.trim();
    const label = document.getElementById("item-label").value.trim();
    const description = document
      .getElementById("item-description")
      .value.trim();
    const price = parseInt(document.getElementById("item-price").value) || 0;
    const icon = document.getElementById("item-icon").value.trim();
    const type = document.getElementById("item-type").value;

    if (!name || !label || !icon) {
      this.showItemMessage("Name, label e icon son requeridos", "error");
      return;
    }

    const saveBtn = document.getElementById("save-item-btn");
    saveBtn.disabled = true;
    saveBtn.textContent = "Guardando...";

    try {
      const data = { name, label, description, price, icon, type };
      let result;

      if (this.editingItemId) {
        result = await adminService.updateItem(this.editingItemId, data);
      } else {
        result = await adminService.createItem(data);
      }

      if (result.success) {
        this.showItemMessage(
          this.editingItemId ? "Item actualizado" : "Item creado",
          "success",
        );
        this.items = await adminService.getItems();
        this.renderItemsList();
        this.onCancelEdit();
      } else {
        this.showItemMessage(result.error || "Error al guardar", "error");
      }
    } catch (error) {
      console.error("Error saving item:", error);
      this.showItemMessage("Error de conexion", "error");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = this.editingItemId
        ? "Guardar Cambios"
        : "Crear Item";
    }
  }

  async onDeleteItem(id) {
    const item = this.items.find((i) => i.id === id);
    if (!item) return;

    if (!confirm(`¿Eliminar "${item.label}"?`)) return;

    try {
      const result = await adminService.deleteItem(id);

      if (result.success) {
        this.showItemMessage("Item eliminado", "success");
        this.items = await adminService.getItems();
        this.renderItemsList();

        if (this.editingItemId === id) {
          this.onCancelEdit();
        }
      } else {
        this.showItemMessage(result.error || "Error al eliminar", "error");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      this.showItemMessage("Error de conexion", "error");
    }
  }

  showItemMessage(text, type = "info") {
    const messageEl = document.getElementById("item-form-message");
    messageEl.textContent = text;
    messageEl.className = `admin__message ${type}`;

    setTimeout(() => {
      messageEl.textContent = "";
      messageEl.className = "admin__message";
    }, 3000);
  }

  onUserChange() {
    const userId = document.getElementById("user-select").value;
    const userInfo = document.getElementById("user-info");

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
    const userSelect = document.getElementById("user-select");
    const questSelect = document.getElementById("quest-select");
    const userId = parseInt(userSelect.value);
    const questCode = questSelect.value || null;

    if (!userId) {
      this.showMessage("Selecciona un usuario", "error");
      return;
    }

    const resetBtn = document.getElementById("reset-quest-btn");
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
      this.showMessage("Error de conexion", "error");
    } finally {
      resetBtn.disabled = false;
      resetBtn.textContent = "Guardar";
    }
  }

  showMessage(text, type = "info") {
    const messageEl = document.getElementById("admin-message");
    messageEl.textContent = text;
    messageEl.className = `admin__message ${type}`;

    setTimeout(() => {
      messageEl.textContent = "";
      messageEl.className = "admin__message";
    }, 3000);
  }

  async onDeleteAllItems() {
    if (
      !confirm(
        "¿Estás seguro? Se borrarán TODOS los items de la base de datos.",
      )
    ) {
      return;
    }

    const deleteBtn = document.getElementById("delete-items-btn");
    deleteBtn.disabled = true;
    deleteBtn.textContent = "Borrando...";

    try {
      const result = await adminService.deleteAllItems();

      if (result.success) {
        this.showItemMessage("Todos los items han sido eliminados", "success");
        this.items = [];
        this.renderItemsList();
      } else {
        this.showItemMessage(result.error || "Error al borrar items", "error");
      }
    } catch (error) {
      console.error("Error deleting items:", error);
      this.showItemMessage("Error de conexion", "error");
    } finally {
      deleteBtn.disabled = false;
      deleteBtn.textContent = "Borrar todos los items";
    }
  }
}
