# MessageBox - Sistema de Mensajes RPG

Sistema de diálogos interactivos estilo RPG para mostrar mensajes con opciones múltiples, conversaciones en secuencia y árboles de decisión.

## 📁 Estructura

```
MessageBox/
├── MessageBox.js      # Componente principal
├── MessageBox.css     # Estilos del componente
├── messageQueue.js    # Sistema de cola para conversaciones
└── README.md          # Esta documentación
```

## 🚀 Uso Básico

### Importar el componente

```javascript
import { MessageBox } from '../ui/components/MessageBox/MessageBox.js';
import '../ui/components/MessageBox/MessageBox.css';
```

### Mensaje simple

```javascript
await MessageBox.alert("¡Bienvenido al juego!", "Narrador");
```

### Mensaje con opciones

```javascript
const result = await MessageBox.show({
  speaker: "Profesor Oak",
  text: "¿Qué Pokémon eliges?",
  options: [
    { text: "Charmander", value: "fire" },
    { text: "Squirtle", value: "water" },
    { text: "Bulbasaur", value: "grass" }
  ]
});

console.log(result.value); // "fire", "water" o "grass"
```

### Confirmación Sí/No

```javascript
const confirmed = await MessageBox.confirm(
  "¿Estás seguro?",
  "Sistema"
);

if (confirmed) {
  // Usuario confirmó
}
```

## 📖 API Completa

### Constructor

```javascript
new MessageBox(config)
```

**Parámetros de config:**

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `speaker` | string | `''` | Nombre del personaje que habla |
| `avatar` | string | `null` | URL de la imagen del avatar |
| `text` | string | `''` | Texto del mensaje |
| `options` | Array | `[]` | Array de opciones de respuesta |
| `onSelect` | Function | `() => {}` | Callback al seleccionar opción |
| `onClose` | Function | `() => {}` | Callback al cerrar el mensaje |
| `typewriterSpeed` | number | `30` | Velocidad del efecto typewriter (ms/caracter) |
| `enableTypewriter` | boolean | `true` | Habilitar efecto typewriter |
| `closable` | boolean | `true` | Permitir cerrar con click/Enter |

**Estructura de opciones:**

```javascript
{
  text: "Texto de la opción",    // Texto mostrado
  value: "valor",                 // Valor devuelto al seleccionar
  icon: "🔥"                      // Emoji o icono opcional
}
```

### Métodos Estáticos

#### MessageBox.show(config)

Crea y muestra un mensaje. Retorna una promesa que se resuelve cuando se selecciona una opción o se cierra.

```javascript
const result = await MessageBox.show({
  speaker: "NPC",
  text: "¿Necesitas ayuda?",
  options: [
    { text: "Sí", value: true },
    { text: "No", value: false }
  ]
});
```

**Retorna:**
- Si se selecciona opción: `{ value, option, index }`
- Si se cierra sin seleccionar: `null`

#### MessageBox.alert(text, speaker)

Muestra un mensaje simple que se cierra con click o Enter.

```javascript
await MessageBox.alert("¡Misión completada!", "Sistema");
```

#### MessageBox.confirm(text, speaker)

Muestra un diálogo de confirmación Sí/No.

```javascript
const confirmed = await MessageBox.confirm(
  "¿Guardar partida?",
  "Sistema"
);
// Retorna: true o false
```

### Métodos de Instancia

#### show()

Muestra el mensaje y retorna una promesa.

```javascript
const msg = new MessageBox({ text: "Hola" });
await msg.show();
```

#### hide()

Oculta y destruye el mensaje.

```javascript
msg.hide();
```

## 🔄 Sistema de Cola (MessageQueue)

Para conversaciones largas o secuencias de mensajes.

### Importar

```javascript
import { messageQueue, showConversation, showDecisionTree } from '../ui/components/MessageBox/messageQueue.js';
```

### Conversación en secuencia

```javascript
await showConversation([
  {
    speaker: "Profesor Oak",
    text: "Hola, bienvenido.",
    closable: true
  },
  {
    speaker: "Profesor Oak",
    text: "¿Listo para tu aventura?",
    options: [
      { text: "¡Sí!", value: "yes" },
      { text: "No aún", value: "no" }
    ]
  }
]);
```

### Árbol de decisiones

Crea diálogos ramificados donde cada opción lleva a diferentes mensajes.

```javascript
await showDecisionTree({
  message: {
    speaker: "NPC",
    text: "¿Qué camino tomas?"
  },
  options: [
    {
      text: "Izquierda",
      value: "left",
      next: {
        message: {
          speaker: "NPC",
          text: "Encuentras un cofre.",
          closable: true
        }
      }
    },
    {
      text: "Derecha",
      value: "right",
      next: {
        message: {
          speaker: "NPC",
          text: "Encuentras un enemigo.",
          options: [
            { text: "Luchar", value: "fight" },
            { text: "Huir", value: "flee" }
          ]
        }
      }
    }
  ]
});
```

### Cola manual

```javascript
import { messageQueue } from '../ui/components/MessageBox/messageQueue.js';

// Agregar mensajes
messageQueue
  .add({ text: "Mensaje 1", closable: true })
  .add({ text: "Mensaje 2", closable: true })
  .add({ text: "Mensaje 3", closable: true });

// Iniciar la cola
await messageQueue.start(() => {
  console.log("Conversación completada");
});

// Detener la cola
messageQueue.stop();
```

## 🎨 Personalización CSS

El componente usa las variables CSS del proyecto. Puedes personalizarlo modificando:

### Variables principales

```css
/* En variables.css */
--vibrant-coral: #fe5150ff;  /* Color del speaker */
--neutral-800: #27272a;       /* Color de bordes */
--surface: #f4f4f5;           /* Fondo de opciones */
```

### Clases CSS

- `.message-box-overlay` - Overlay de fondo
- `.message-box` - Contenedor principal
- `.message-box__avatar` - Avatar del personaje
- `.message-box__speaker` - Nombre del personaje
- `.message-box__text` - Texto del mensaje
- `.message-box__options` - Contenedor de opciones
- `.message-box__option` - Botón de opción individual

### Variantes de estilo

Puedes agregar clases modificadoras al elemento:

```javascript
const msg = new MessageBox({ text: "Error!" });
const element = msg.render();
element.querySelector('.message-box').classList.add('message-box--error');
```

Variantes disponibles:
- `message-box--info`
- `message-box--success`
- `message-box--warning`
- `message-box--error`

## ⌨️ Controles

| Acción | Resultado |
|--------|-----------|
| Click en texto | Salta el efecto typewriter |
| Click en opción | Selecciona la opción |
| Click en overlay/texto (sin opciones) | Cierra el mensaje |
| Enter o Espacio | Cierra el mensaje (si es closable) |

## 📱 Responsive

El componente es completamente responsive:

- **Mobile**: Diseño vertical, avatar pequeño
- **Tablet**: Centrado en pantalla
- **Desktop**: Avatar más grande, ancho máximo 700px

## 🎯 Ejemplos Prácticos

### En una Scene

```javascript
import { Scene } from '../core/Scene.js';
import { MessageBox } from '../ui/components/MessageBox/MessageBox.js';
import '../ui/components/MessageBox/MessageBox.css';

export class GameScene extends Scene {
  async initUI() {
    // Mostrar mensaje al entrar a la escena
    await MessageBox.alert("¡Has entrado a la cueva!", "Narrador");

    // Interacción con NPC
    this.onClick("#npc-button", async () => {
      const result = await MessageBox.show({
        speaker: "Vendedor",
        text: "¿Qué quieres comprar?",
        options: [
          { text: "Poción (50g)", value: "potion", icon: "🧪" },
          { text: "Antídoto (30g)", value: "antidote", icon: "💊" },
          { text: "Nada", value: null }
        ]
      });

      if (result && result.value) {
        await this.buyItem(result.value);
      }
    });
  }
}
```

### Tutorial interactivo

```javascript
await showConversation([
  {
    speaker: "Guía",
    text: "¡Bienvenido al tutorial!",
    closable: true
  },
  {
    speaker: "Guía",
    text: "Usa las flechas para moverte.",
    closable: true
  },
  {
    speaker: "Guía",
    text: "¿Quieres más ayuda?",
    options: [
      { text: "Sí", value: "yes" },
      { text: "No, estoy listo", value: "no" }
    ]
  }
]);
```

### Boss battle con diálogo

```javascript
const result = await showDecisionTree({
  message: {
    speaker: "Dragón",
    text: "¡No pasarás! ¿Cómo me derrotarás?"
  },
  options: [
    {
      text: "Con magia",
      value: "magic",
      next: {
        message: {
          speaker: "Dragón",
          text: "¡Mi escudo mágico te protege! ¿Qué hechizo usas?",
          options: [
            { text: "Fuego", value: "fire" },
            { text: "Hielo", value: "ice" }
          ]
        }
      }
    },
    {
      text: "Con espada",
      value: "sword",
      next: {
        message: {
          speaker: "Dragón",
          text: "¡Un guerrero valiente! Te respeto.",
          closable: true
        }
      }
    }
  ]
});
```

## 🎭 Características Avanzadas

### Efecto Typewriter

El texto aparece letra por letra. Puedes:
- Ajustar la velocidad con `typewriterSpeed`
- Desactivarlo con `enableTypewriter: false`
- Saltar la animación haciendo click en el texto

### Animaciones

- Fade in del overlay
- Slide up del mensaje
- Stagger animation de las opciones
- Efecto hover en opciones con indicador animado

### Tema oscuro

El componente detecta automáticamente `prefers-color-scheme: dark` y ajusta los colores.

## ✅ Buenas Prácticas

1. **Usa `await`**: Siempre espera la respuesta del mensaje antes de continuar
2. **Maneja nulos**: `MessageBox.show()` puede retornar `null` si se cierra sin seleccionar
3. **Cleanup automático**: No necesitas limpiar manualmente, el componente se auto-destruye
4. **Reutilización**: Crea mensajes nuevos para cada interacción, no reutilices instancias
5. **Accesibilidad**: Provee textos claros y opciones descriptivas

## 🐛 Troubleshooting

**El mensaje no se muestra:**
- Verifica que importaste el CSS
- Comprueba que no hay errores en la consola

**El typewriter no funciona:**
- Asegúrate de que `enableTypewriter` está en `true`
- Verifica que `typewriterSpeed` es un número positivo

**Las opciones no son clickeables:**
- El mensaje todavía está en modo typewriter, espera a que termine o haz click para saltar

**El mensaje no se cierra:**
- Verifica que `closable` está en `true`
- Si tiene opciones, debes seleccionar una para cerrarlo

## 📝 Notas

- Los mensajes tienen z-index de modal (`--z-modal`), aparecen sobre todo el contenido
- Los event listeners se limpian automáticamente al cerrar
- Compatible con mobile touch events
- No requiere frameworks externos (vanilla JS)
