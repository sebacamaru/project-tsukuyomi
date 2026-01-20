import adminHTML from "../ui/scenes/admin/admin.html?raw";
import "../ui/scenes/admin/admin.css";
import { Scene } from "../core/Scene.js";
import { adminService } from "../services/adminService.js";
import { store } from "../core/Store.js";

export class AdminScene extends Scene {
  constructor() {
    super();
    this.users = [];
    this.quests = [];
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
      // Cargar usuarios y quests en paralelo
      const [users, quests] = await Promise.all([
        adminService.getUsers(),
        adminService.getQuests(),
      ]);

      this.users = users;
      this.quests = quests;

      this.populateUserSelect();
      this.populateQuestSelect();
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
        // Actualizar datos locales
        const userIndex = this.users.findIndex((u) => u.id === userId);
        if (userIndex !== -1) {
          this.users[userIndex] = result.user;
        }

        // Si es el usuario actual, actualizar store
        if (store.user?.id === userId) {
          store.user.current_quest_code = result.user.current_quest_code;
        }

        this.onUserChange(); // Refrescar info
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

    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      messageEl.textContent = "";
      messageEl.className = "admin__message";
    }, 3000);
  }
}
