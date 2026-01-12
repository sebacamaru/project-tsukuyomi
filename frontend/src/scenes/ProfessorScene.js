import professorHTML from "../ui/scenes/professor/professor.html?raw";
import "../ui/scenes/professor/professor.css";
import { Scene } from "../core/Scene.js";
import { MessageBox } from "../ui/components/MessageBox/MessageBox.js";
import "../ui/components/MessageBox/MessageBox.css";
import {
  showConversation,
  showDecisionTree,
} from "../ui/components/MessageBox/messageQueue.js";

export class ProfessorScene extends Scene {
  constructor() {
    super();
    this.backgroundClass = "professor-background";
  }

  async getHTML() {
    return professorHTML;
  }

  async onEnterComplete() {
    this.enterCutsceneMode();
    await this.delay(1000);

    await MessageBox.alert(
      "¡Bienvenido a mi laboratorio! Este es un diálogo en modo cinemático sin distracciones.",
      "Profesor Oak",
    );

    this.exitCutsceneMode();
  }

  async initUI() {
    // Ejemplo 1: Mensaje simple con botón
    this.onClick("#demo-simple", async () => {
      await MessageBox.alert(
        "¡Bienvenido al laboratorio! Aquí podrás aprender sobre el sistema de mensajes RPG.",
        "Profesor Oak",
      );
    });

    // Ejemplo 2: Mensaje con opciones
    this.onClick("#demo-options", async () => {
      const result = await MessageBox.show({
        speaker: "Profesor Oak",
        text: "¿Qué tipo de Pokémon prefieres?",
        options: [
          { text: "Tipo Fuego 🔥", value: "fire", icon: "🔥" },
          { text: "Tipo Agua 💧", value: "water", icon: "💧" },
          { text: "Tipo Planta 🌿", value: "grass", icon: "🌿" },
        ],
      });

      if (result) {
        await MessageBox.alert(
          `¡Excelente elección! El tipo ${result.value} es muy poderoso.`,
          "Profesor Oak",
        );
      }
    });

    // Ejemplo 3: Conversación en secuencia
    this.onClick("#demo-conversation", async () => {
      await showConversation([
        {
          speaker: "Profesor Oak",
          text: "Hola, soy el Profesor Oak.",
          closable: true,
        },
        {
          speaker: "Profesor Oak",
          text: "He dedicado mi vida al estudio de los Pokémon.",
          closable: true,
        },
        {
          speaker: "Profesor Oak",
          text: "¿Estás listo para comenzar tu aventura?",
          options: [
            { text: "¡Sí, estoy listo!", value: "yes" },
            { text: "Todavía no...", value: "no" },
          ],
        },
      ]);
    });

    // Ejemplo 4: Árbol de decisiones
    this.onClick("#demo-tree", async () => {
      await showDecisionTree({
        message: {
          speaker: "Profesor Oak",
          text: "¿Quieres aprender sobre Pokémon o sobre combates?",
        },
        options: [
          {
            text: "Sobre Pokémon",
            value: "pokemon",
            next: {
              message: {
                speaker: "Profesor Oak",
                text: "Los Pokémon son criaturas fascinantes. ¿Qué tipo te interesa?",
              },
              options: [
                {
                  text: "Tipo Fuego",
                  value: "fire",
                  next: {
                    message: {
                      speaker: "Profesor Oak",
                      text: "¡Los Pokémon de tipo Fuego son apasionados y fuertes!",
                      closable: true,
                    },
                  },
                },
                {
                  text: "Tipo Agua",
                  value: "water",
                  next: {
                    message: {
                      speaker: "Profesor Oak",
                      text: "¡Los Pokémon de tipo Agua son versátiles y resistentes!",
                      closable: true,
                    },
                  },
                },
              ],
            },
          },
          {
            text: "Sobre combates",
            value: "battle",
            next: {
              message: {
                speaker: "Profesor Oak",
                text: "En los combates Pokémon, la estrategia es clave. Cada tipo tiene fortalezas y debilidades.",
                closable: true,
              },
            },
          },
        ],
      });
    });

    // Ejemplo 5: Confirmación
    this.onClick("#demo-confirm", async () => {
      const confirmed = await MessageBox.confirm(
        "¿Estás seguro de que quieres salir del laboratorio?",
        "Profesor Oak",
      );

      if (confirmed) {
        await MessageBox.alert("¡Hasta pronto, entrenador!", "Profesor Oak");
      } else {
        await MessageBox.alert("¡Me alegra que te quedes!", "Profesor Oak");
      }
    });
  }
}
