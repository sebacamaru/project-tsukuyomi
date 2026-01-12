/**
 * MessageQueue - Sistema de cola para mensajes en secuencia
 * Útil para diálogos largos o conversaciones RPG
 */
import { MessageBox } from './MessageBox.js';

class MessageQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.currentMessage = null;
    this.onComplete = null;
  }

  /**
   * Agrega un mensaje a la cola
   */
  add(config) {
    this.queue.push(config);
    return this;
  }

  /**
   * Agrega múltiples mensajes a la cola
   */
  addMultiple(configs) {
    this.queue.push(...configs);
    return this;
  }

  /**
   * Inicia el procesamiento de la cola
   */
  async start(onComplete = null) {
    if (this.isProcessing) {
      console.warn('MessageQueue: Ya hay una cola en proceso');
      return;
    }

    this.onComplete = onComplete;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const config = this.queue.shift();
      await this._showMessage(config);
    }

    this.isProcessing = false;

    if (this.onComplete) {
      this.onComplete();
    }
  }

  /**
   * Muestra un mensaje individual
   */
  async _showMessage(config) {
    this.currentMessage = new MessageBox(config);
    const result = await this.currentMessage.show();
    this.currentMessage = null;
    return result;
  }

  /**
   * Detiene la cola actual
   */
  stop() {
    this.queue = [];
    if (this.currentMessage) {
      this.currentMessage.hide();
    }
    this.isProcessing = false;
  }

  /**
   * Limpia la cola sin detener el mensaje actual
   */
  clear() {
    this.queue = [];
  }

  /**
   * Obtiene el tamaño de la cola
   */
  size() {
    return this.queue.length;
  }

  /**
   * Verifica si la cola está vacía
   */
  isEmpty() {
    return this.queue.length === 0;
  }

  /**
   * Verifica si hay un mensaje en proceso
   */
  isRunning() {
    return this.isProcessing;
  }
}

/**
 * Instancia singleton para uso global
 */
export const messageQueue = new MessageQueue();

/**
 * Helper para crear una nueva cola independiente
 */
export function createMessageQueue() {
  return new MessageQueue();
}

/**
 * Helper para mostrar una conversación completa
 */
export async function showConversation(messages, onComplete = null) {
  const queue = new MessageQueue();
  queue.addMultiple(messages);
  await queue.start(onComplete);
}

/**
 * Helper para crear diálogos de decisión (bifurcación)
 */
export async function showDecisionTree(tree) {
  /**
   * Estructura esperada del árbol:
   * {
   *   message: { text, speaker, avatar },
   *   options: [
   *     { text, value, next: { message, options } },
   *     { text, value, next: { message, options } }
   *   ]
   * }
   */

  const processNode = async (node) => {
    if (!node) return null;

    const config = {
      ...node.message,
      options: node.options || []
    };

    const result = await MessageBox.show(config);

    if (result && node.options) {
      const selectedOption = node.options.find(opt => opt.value === result.value);
      if (selectedOption && selectedOption.next) {
        return await processNode(selectedOption.next);
      }
    }

    return result;
  };

  return await processNode(tree);
}
