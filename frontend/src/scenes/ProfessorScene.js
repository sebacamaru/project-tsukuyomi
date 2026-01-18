import professorHTML from "../ui/scenes/professor/professor.html?raw";
import "../ui/scenes/professor/professor.css";
import { Scene } from "../core/Scene.js";
import { MessageBox } from "../ui/components/MessageBox/MessageBox.js";
import "../ui/components/MessageBox/MessageBox.css";
import { QuestRunner, loadQuest } from "../core/QuestRunner.js";
import { questService } from "../services/questService.js";
import { store } from "../core/Store.js";

export class ProfessorScene extends Scene {
  constructor() {
    super();
    this.backgroundClass = "professor-background";
  }

  async getHTML() {
    return professorHTML;
  }

  async onEnterComplete() {
    await this.checkAndRunQuests();
  }

  async checkAndRunQuests() {
    let user = store.user;

    this.enterCutsceneMode();
    await this.delay(500);

    // Refrescar datos del usuario desde el backend
    user = await questService.getUser(user.id);
    store.user = user;

    // Obtener quest actual del usuario
    const currentQuestCode = user.current_quest_code;

    // Si no tiene quest activa, mostrar saludo normal
    if (!currentQuestCode) {
      await MessageBox.alert(
        `Hola de nuevo, ${user.username}! Que bueno verte por aqui.`,
        "Profesor Cacho",
      );
      this.exitCutsceneMode();
      return;
    }

    // Verificar si la quest actual corresponde a esta escena
    const quest = await questService.getQuest(currentQuestCode);

    if (!quest || quest.scene !== "professor") {
      await MessageBox.alert(
        `Hola, ${user.username}! Vuelve cuando quieras.`,
        "Profesor Cacho",
      );
      this.exitCutsceneMode();
      return;
    }

    // Ejecutar quest actual
    const questData = await loadQuest(currentQuestCode);
    const runner = new QuestRunner(questData, this);
    await runner.run();

    this.exitCutsceneMode();

    // Después de completar, verificar si hay otra quest de esta escena
    // Refrescar datos del usuario
    const updatedUser = await questService.getUser(user.id);
    store.user = updatedUser;

    // Si hay otra quest de esta escena, ejecutarla
    if (updatedUser.current_quest_code) {
      const nextQuest = await questService.getQuest(
        updatedUser.current_quest_code,
      );
      if (nextQuest && nextQuest.scene === "professor") {
        await this.checkAndRunQuests();
      }
    }
  }

  async initUI() {
    // Los demos se mantienen para testing, pero se pueden remover después
  }
}
