import { MessageBox } from "../ui/components/MessageBox/MessageBox.js";
import { questService } from "../services/questService.js";
import { authService } from "../services/authService.js";
import { inventoryService } from "../services/inventoryService.js";
import { store } from "./Store.js";
import { app } from "../main.js";
import { actions } from "../ui/actions/index.js";

/**
 * Carga dinámicamente un archivo JSON de quest
 */
export async function loadQuest(questCode) {
  const module = await import(`../data/quests/${questCode}.json`);
  return module.default;
}

/**
 * QuestRunner - Motor de ejecución de quests
 * Interpreta los JSON de quests y ejecuta el flujo de diálogos
 */
export class QuestRunner {
  constructor(questData, scene) {
    this.questData = questData;
    this.dialogues = questData.dialogues;
    this.scene = scene;
    this.dialogueMap = new Map();

    // Construir mapa de diálogos por ID
    this.dialogues.forEach((d) => {
      this.dialogueMap.set(d.id, d);
    });

    // Variables de contexto (ej: username elegido)
    this.context = {};
  }

  /**
   * Ejecuta la quest desde el inicio
   */
  async run() {
    let currentId = this.dialogues[0].id;

    while (currentId) {
      const dialogue = this.dialogueMap.get(currentId);
      if (!dialogue) {
        console.error(`Dialogue not found: ${currentId}`);
        break;
      }
      currentId = await this.processDialogue(dialogue);
    }
  }

  /**
   * Procesa un diálogo individual
   */
  async processDialogue(dialogue) {
    // Mostrar diálogo si tiene texto (ANTES de la acción)
    if (dialogue.text) {
      const text = this.replaceVariables(dialogue.text);

      if (dialogue.options && dialogue.options.length > 0) {
        // Diálogo con opciones
        const result = await MessageBox.show({
          speaker: dialogue.speaker,
          text: text,
          options: dialogue.options.map((opt) => ({
            text: opt.text,
            value: opt.value,
            icon: opt.icon,
          })),
        });

        if (result) {
          // Buscar la opción seleccionada y retornar su next
          const selectedOption = dialogue.options.find(
            (opt) => opt.value === result.value,
          );
          return selectedOption?.next || dialogue.next || null;
        }
        return null;
      } else {
        // Diálogo simple
        await MessageBox.alert(text, dialogue.speaker);
      }
    }

    // Ejecutar acción si existe (DESPUÉS del texto)
    if (dialogue.action) {
      const shouldContinue = await this.handleAction(dialogue);
      // Si la acción es complete_quest, terminamos
      if (dialogue.action === "complete_quest") {
        return null;
      }
      // Si la acción falló, no continuar
      if (!shouldContinue) {
        return dialogue.next || null;
      }
    }

    return dialogue.next || null;
  }

  /**
   * Maneja las acciones especiales
   */
  async handleAction(dialogue) {
    const actionName = dialogue.action;

    // Acciones UI registradas (lazy loaded)
    if (actions[actionName]) {
      try {
        const module = await actions[actionName]();
        // Obtener la clase exportada (primera export del modulo)
        const ActionClass = module[Object.keys(module)[0]];
        const instance = new ActionClass(
          { runner: this, context: this.context, store, scene: this.scene },
          dialogue.actionData,
        );
        return await instance.show();
      } catch (error) {
        console.error(`Error loading action "${actionName}":`, error);
        return true;
      }
    }

    // Acciones legacy (built-in)
    switch (actionName) {
      case "input_username":
        return await this.handleInputUsername();

      case "create_monster":
        return await this.handleCreateMonster(dialogue.actionData);

      case "complete_quest":
        return await this.handleCompleteQuest();

      default:
        console.warn(`Unknown action: ${actionName}`);
        return true;
    }
  }

  /**
   * Muestra input para elegir username
   */
  async handleInputUsername() {
    let username = null;
    let isValid = false;

    while (!isValid) {
      username = await this.showUsernameInput("Escribe tu nombre:");

      if (!username) {
        // Usuario canceló
        return false;
      }

      // Validar formato
      if (username.length < 3) {
        await MessageBox.alert(
          "El nombre debe tener al menos 3 caracteres.",
          "Profesor Cacho",
        );
        continue;
      }

      if (username.length > 20) {
        await MessageBox.alert(
          "El nombre no puede tener mas de 20 caracteres.",
          "Profesor Cacho",
        );
        continue;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        await MessageBox.alert(
          "El nombre solo puede contener letras, numeros y guiones bajos.",
          "Profesor Cacho",
        );
        continue;
      }

      // Verificar disponibilidad en el servidor (excluir al usuario actual)
      const available = await questService.checkUsername(
        username,
        store.user.id,
      );

      if (!available) {
        await MessageBox.alert(
          "Ese nombre ya esta en uso. Intenta con otro.",
          "Profesor Cacho",
        );
        continue;
      }

      // Guardar en el servidor
      const result = await questService.setUsername(store.user.id, username);

      if (result.success) {
        // Actualizar store local y persistir en localStorage
        store.user.username = username;
        authService.updateSession();
        this.context.username = username;
        isValid = true;
      } else {
        await MessageBox.alert(
          "Hubo un error al guardar el nombre. Intenta de nuevo.",
          "Profesor Cacho",
        );
      }
    }

    return true;
  }

  /**
   * Muestra el input de username personalizado (sin speaker, centrado)
   * @param {string} promptText - Texto opcional a mostrar encima del input
   */
  async showUsernameInput(promptText = "") {
    return new Promise((resolve) => {
      const currentUsername = store.user?.username || "";
      const textHtml = promptText
        ? `<p class="username-input-box__text">${promptText}</p>`
        : "";

      const overlay = document.createElement("div");
      overlay.className = "message-box-overlay message-box-overlay--centered";
      overlay.innerHTML = `
        <div class="message-box username-input-box">
          <div class="username-input-container">
            ${textHtml}
            <input type="text" class="input" value="${currentUsername}" maxlength="20" placeholder="Tu nombre..." />
            <button class="button">Confirmar</button>
          </div>
        </div>
      `;

      const input = overlay.querySelector(".input");
      const confirmBtn = overlay.querySelector(".button");

      const cleanup = () => {
        overlay.classList.remove("active");
        setTimeout(() => overlay.remove(), 300);
      };

      const confirm = () => {
        const value = input.value.trim();
        if (value) {
          cleanup();
          resolve(value);
        }
      };

      confirmBtn.addEventListener("click", confirm);

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          confirm();
        }
      });

      document.body.appendChild(overlay);

      // Trigger animation after append
      requestAnimationFrame(() => {
        overlay.classList.add("active");
        input.focus();
        input.select();
      });
    });
  }

  /**
   * Crea el monstruo starter
   */
  async handleCreateMonster(actionData) {
    // TODO: Implementar cuando tengamos el sistema de monstruos del usuario
    console.log("Creating monster:", actionData);
    this.context.starterType = actionData?.type;
    return true;
  }

  /**
   * Calcula el delay en minutos para la siguiente quest
   * @returns {number} Minutos de delay (0 si no hay delay)
   */
  parseDelay() {
    const delay = this.questData.nextQuestDelay;
    if (!delay) return 0;

    const isDebug = this.questData.debug === true;
    const multiplier = isDebug ? 1 : 60; // debug: minutos, producción: horas

    if (typeof delay === "number") {
      return delay * multiplier;
    }

    if (typeof delay === "string" && delay.includes("-")) {
      const [min, max] = delay.split("-").map(Number);
      const value = Math.random() * (max - min) + min;
      return Math.round(value * multiplier);
    }

    return 0;
  }

  /**
   * Completa la quest actual
   */
  async handleCompleteQuest() {
    const delayMinutes = this.parseDelay();
    const result = await questService.completeQuest(
      store.user.id,
      delayMinutes,
    );

    if (result.success) {
      // // Mostrar recompensas si las hay
      // if (
      //   result.rewards &&
      //   (result.rewards.gold > 0 || result.rewards.items?.length > 0)
      // ) {
      //   await this.showRewards(result.rewards);
      // }

      // Recargar inventario desde servidor
      await inventoryService.loadInventory();

      // Actualizar el current_quest_code y next_quest_available_at en el store
      store.user.current_quest_code = result.user.current_quest_code;
      store.user.next_quest_available_at = result.user.next_quest_available_at;
      store.user.gold = result.user.gold;
      authService.updateSession();

      // Actualizar el badge del navbar (esto también programa el timer automático)
      if (app) {
        app.updateProfessorBadge();
      }

      return true;
    }

    console.error("Failed to complete quest:", result);
    return false;
  }

  /**
   * Muestra las recompensas obtenidas al completar una quest
   */
  async showRewards(rewards) {
    let message = "";

    if (rewards.gold > 0) {
      message += `+${rewards.gold} oro\n`;
    }

    if (rewards.items?.length > 0) {
      for (const item of rewards.items) {
        message += `+${item.quantity}x ${item.name}\n`;
      }
    }

    if (message) {
      await MessageBox.alert(message.trim(), "Recompensas");
    }
  }

  /**
   * Reemplaza variables en el texto (ej: {username})
   */
  replaceVariables(text) {
    return text.replace(/\{(\w+)\}/g, (match, variable) => {
      // Buscar en contexto local
      if (this.context[variable] !== undefined) {
        return this.context[variable];
      }
      // Buscar en store.user
      if (store.user && store.user[variable] !== undefined) {
        return store.user[variable];
      }
      return match;
    });
  }
}
