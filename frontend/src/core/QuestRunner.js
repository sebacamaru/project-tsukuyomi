import { MessageBox } from "../ui/components/MessageBox/MessageBox.js";
import { questService } from "../services/questService.js";
import { store } from "./Store.js";

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
    this.dialogues.forEach(d => {
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
    // Ejecutar acción si existe (antes del texto)
    if (dialogue.action) {
      const shouldContinue = await this.handleAction(dialogue);
      // Si la acción es complete_quest, terminamos
      if (dialogue.action === "complete_quest") {
        return null;
      }
      // Si la acción falló y no tiene texto, no continuar
      if (!shouldContinue && !dialogue.text) {
        return dialogue.next || null;
      }
    }

    // Mostrar diálogo si tiene texto
    if (dialogue.text) {
      const text = this.replaceVariables(dialogue.text);

      if (dialogue.options && dialogue.options.length > 0) {
        // Diálogo con opciones
        const result = await MessageBox.show({
          speaker: dialogue.speaker,
          text: text,
          options: dialogue.options.map(opt => ({
            text: opt.text,
            value: opt.value,
            icon: opt.icon
          }))
        });

        if (result) {
          // Buscar la opción seleccionada y retornar su next
          const selectedOption = dialogue.options.find(opt => opt.value === result.value);
          return selectedOption?.next || dialogue.next || null;
        }
        return null;
      } else {
        // Diálogo simple
        await MessageBox.alert(text, dialogue.speaker);
      }
    }

    return dialogue.next || null;
  }

  /**
   * Maneja las acciones especiales
   */
  async handleAction(dialogue) {
    switch (dialogue.action) {
      case "input_username":
        return await this.handleInputUsername();

      case "create_monster":
        return await this.handleCreateMonster(dialogue.actionData);

      case "complete_quest":
        return await this.handleCompleteQuest();

      default:
        console.warn(`Unknown action: ${dialogue.action}`);
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
      username = await this.showUsernameInput();

      if (!username) {
        // Usuario canceló
        return false;
      }

      // Validar formato
      if (username.length < 3) {
        await MessageBox.alert("El nombre debe tener al menos 3 caracteres.", "Profesor Cacho");
        continue;
      }

      if (username.length > 20) {
        await MessageBox.alert("El nombre no puede tener mas de 20 caracteres.", "Profesor Cacho");
        continue;
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        await MessageBox.alert("El nombre solo puede contener letras, numeros y guiones bajos.", "Profesor Cacho");
        continue;
      }

      // Verificar disponibilidad en el servidor
      const available = await questService.checkUsername(username);

      if (!available) {
        await MessageBox.alert("Ese nombre ya esta en uso. Intenta con otro.", "Profesor Cacho");
        continue;
      }

      // Guardar en el servidor
      const result = await questService.setUsername(store.user.id, username);

      if (result.success) {
        // Actualizar store local
        store.user.username = username;
        this.context.username = username;
        isValid = true;
      } else {
        await MessageBox.alert("Hubo un error al guardar el nombre. Intenta de nuevo.", "Profesor Cacho");
      }
    }

    return true;
  }

  /**
   * Muestra el input de username personalizado
   */
  async showUsernameInput() {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.className = "message-box-overlay active";
      overlay.innerHTML = `
        <div class="message-box">
          <div class="message-box__content">
            <div class="message-box__speaker">Profesor Cacho</div>
            <div class="message-box__text">Escribe tu nombre:</div>
            <div class="username-input-container">
              <input type="text" class="username-input" maxlength="20" placeholder="Tu nombre..." autofocus />
              <div class="username-input-buttons">
                <button class="username-btn username-btn--cancel">Cancelar</button>
                <button class="username-btn username-btn--confirm">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      `;

      const input = overlay.querySelector(".username-input");
      const confirmBtn = overlay.querySelector(".username-btn--confirm");
      const cancelBtn = overlay.querySelector(".username-btn--cancel");

      const cleanup = () => {
        overlay.classList.remove("active");
        setTimeout(() => overlay.remove(), 300);
      };

      confirmBtn.addEventListener("click", () => {
        const value = input.value.trim();
        cleanup();
        resolve(value || null);
      });

      cancelBtn.addEventListener("click", () => {
        cleanup();
        resolve(null);
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const value = input.value.trim();
          cleanup();
          resolve(value || null);
        }
      });

      document.body.appendChild(overlay);
      input.focus();
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
   * Completa la quest actual
   */
  async handleCompleteQuest() {
    const result = await questService.completeQuest(store.user.id);

    if (result.success) {
      // Actualizar el current_quest_code en el store
      store.user.current_quest_code = result.user.current_quest_code;
      return true;
    }

    console.error("Failed to complete quest:", result);
    return false;
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
