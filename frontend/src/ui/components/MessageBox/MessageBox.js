/**
 * MessageBox - Componente de mensajes estilo RPG
 * Sistema de diálogos con opciones múltiples
 */
export class MessageBox {
  // Flag estático para evitar múltiples mensajes simultáneos
  static isActive = false;

  constructor(config) {
    this.speaker = config.speaker || "";
    this.avatar = config.avatar || null;
    this.text = config.text || "";
    this.options = config.options || [];
    this.onSelect = config.onSelect || (() => {});
    this.onClose = config.onClose || (() => {});
    this.typewriterSpeed = config.typewriterSpeed || 30; // ms por caracter
    this.enableTypewriter = config.enableTypewriter !== false;
    this.closable = config.closable !== false;

    this.element = null;
    this.textElement = null;
    this.typewriterTimeout = null;
    this.isTyping = false;
    this.fullText = this.text;
    this.currentCharIndex = 0;

    this.resolvePromise = null;
  }

  /**
   * Renderiza el componente
   */
  render() {
    const container = document.createElement("div");
    container.className = "message-box-overlay";
    container.innerHTML = `
      <div class="message-box">
        ${
          this.avatar
            ? `
          <div class="message-box__avatar">
            <img src="${this.avatar}" alt="${this.speaker}" />
          </div>
        `
            : ""
        }
        <div class="message-box__content">
          ${
            this.speaker
              ? `
            <div class="message-box__speaker">${this.speaker}</div>
          `
              : ""
          }
          <div class="message-box__text"></div>
          ${
            this.options.length > 0
              ? `
            <div class="message-box__options">
              ${this.options
                .map(
                  (opt, index) => `
                <button class="message-box__option" data-index="${index}" data-value="${opt.value || opt.text}">
                  ${opt.icon ? `<span class="option-icon">${opt.icon}</span>` : ""}
                  <span class="option-text">${opt.text}</span>
                </button>
              `,
                )
                .join("")}
            </div>
          `
              : ""
          }
          ${
            this.closable && this.options.length === 0
              ? `
            <div class="message-box__close-hint">
              <span>Presiona [Enter] o haz click para continuar</span>
            </div>
          `
              : ""
          }
        </div>
      </div>
    `;

    this.element = container;
    this.textElement = container.querySelector(".message-box__text");

    this._attachEvents();
    return container;
  }

  /**
   * Adjunta eventos al componente
   */
  _attachEvents() {
    // Click en opciones
    const optionButtons = this.element.querySelectorAll(".message-box__option");
    optionButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (this.isTyping) {
          this._skipTypewriter();
          return;
        }

        const value = btn.dataset.value;
        const index = parseInt(btn.dataset.index);
        this._handleSelect(value, index);
      });
    });

    // Click en overlay o contenido para cerrar (solo si no hay opciones)
    if (this.closable && this.options.length === 0) {
      this.element.addEventListener("click", (e) => {
        if (this.isTyping) {
          this._skipTypewriter();
        } else if (
          e.target.classList.contains("message-box-overlay") ||
          e.target.closest(".message-box__text")
        ) {
          this._handleClose();
        }
      });

      // Tecla Enter para cerrar
      this._keyHandler = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (this.isTyping) {
            this._skipTypewriter();
          } else {
            this._handleClose();
          }
        }
      };
      document.addEventListener("keydown", this._keyHandler);
    }

    // Click en el texto salta el typewriter
    if (this.textElement) {
      this.textElement.addEventListener("click", () => {
        if (this.isTyping) {
          this._skipTypewriter();
        }
      });
    }
  }

  /**
   * Muestra el mensaje con animación
   */
  async show() {
    // Si ya hay un mensaje activo, ignorar
    if (MessageBox.isActive) {
      return new Promise((resolve) => resolve(null));
    }

    return new Promise((resolve) => {
      this.resolvePromise = resolve;

      // Marcar como activo
      MessageBox.isActive = true;

      // Renderizar primero si no está renderizado
      if (!this.element) {
        this.render();
      }

      // Agregar al DOM
      document.body.appendChild(this.element);

      // Trigger animación
      requestAnimationFrame(() => {
        this.element.classList.add("active");
      });

      // Iniciar typewriter
      if (this.enableTypewriter) {
        this._startTypewriter();
      } else {
        this.textElement.textContent = this.fullText;
        this._showOptions();
      }
    });
  }

  /**
   * Inicia el efecto typewriter
   */
  _startTypewriter() {
    this.isTyping = true;
    this.currentCharIndex = 0;
    this.textElement.textContent = "";

    const type = () => {
      if (this.currentCharIndex < this.fullText.length) {
        this.textElement.textContent += this.fullText[this.currentCharIndex];
        this.currentCharIndex++;
        this.typewriterTimeout = setTimeout(type, this.typewriterSpeed);
      } else {
        this.isTyping = false;
        this._showOptions();
      }
    };

    type();
  }

  /**
   * Salta el efecto typewriter
   */
  _skipTypewriter() {
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
    }
    this.isTyping = false;
    this.textElement.textContent = this.fullText;
    this._showOptions();
  }

  /**
   * Muestra las opciones con animación
   */
  _showOptions() {
    const optionsContainer = this.element.querySelector(
      ".message-box__options",
    );
    if (optionsContainer) {
      optionsContainer.classList.add("visible");
    }
  }

  /**
   * Maneja la selección de una opción
   */
  _handleSelect(value, index) {
    const selectedOption = this.options[index];

    // Callback
    if (this.onSelect) {
      this.onSelect(value, selectedOption, index);
    }

    // Cerrar y resolver
    this.hide();
    if (this.resolvePromise) {
      this.resolvePromise({ value, option: selectedOption, index });
    }
  }

  /**
   * Maneja el cierre del mensaje
   */
  _handleClose() {
    if (this.onClose) {
      this.onClose();
    }

    this.hide();
    if (this.resolvePromise) {
      this.resolvePromise(null);
    }
  }

  /**
   * Oculta y destruye el mensaje
   */
  hide() {
    // Liberar el flag inmediatamente para permitir el siguiente mensaje
    MessageBox.isActive = false;

    // Limpiar timeouts
    if (this.typewriterTimeout) {
      clearTimeout(this.typewriterTimeout);
    }

    // Limpiar event listeners
    if (this._keyHandler) {
      document.removeEventListener("keydown", this._keyHandler);
    }

    // Animación de salida
    this.element.classList.remove("active");

    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }, 300); // Duración de la animación
  }

  /**
   * Método estático para crear y mostrar un mensaje rápido
   */
  static async show(config) {
    const messageBox = new MessageBox(config);
    return await messageBox.show();
  }

  /**
   * Método helper para mensajes simples
   */
  static async alert(text, speaker = "") {
    return await MessageBox.show({
      text,
      speaker,
      options: [],
      closable: true,
    });
  }

  /**
   * Método helper para confirmaciones
   */
  static async confirm(text, speaker = "") {
    const result = await MessageBox.show({
      text,
      speaker,
      options: [
        { text: "Sí", value: true },
        { text: "No", value: false },
      ],
    });
    return result ? result.value : false;
  }
}
