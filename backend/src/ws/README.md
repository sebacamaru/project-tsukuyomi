# WebSocket Handler Architecture

## Estructura del Módulo WebSocket

```
src/ws/
├── index.js         # Loader y registro de handlers
├── handler.js       # Coordinador principal (NUEVO)
├── login.js         # Handler de login
├── challenge.js     # Handler de desafíos
└── battle.js        # Handler de batallas
```

## Flujo de Mensajes WebSocket

```
Cliente envía mensaje
    ↓
handleWsMessage (handler.js)
    ↓
parseMessage() → Valida JSON
    ↓
Valida campo 'type'
    ↓
handleEvent() → Busca handler en eventHandlers
    ↓
wsErrorHandler() → Wrapper de errores
    ↓
Handler específico (login/challenge/battle)
    ↓
Respuesta al cliente
```

## Ventajas de la Arquitectura Desacoplada

### ✅ Antes (server.js con lógica inline)

**Problemas:**
- Server.js con 40+ líneas de lógica WS
- Difícil de testear
- Acoplamiento alto
- No reutilizable

```javascript
// server.js (❌ ANTES)
app.ws("/ws", {
  message(ws, rawMessage) {
    // 40 líneas de parsing, validación, logging...
  }
});
```

### ✅ Después (handlers desacoplados)

**Beneficios:**
- Server.js limpio (3 líneas)
- Fácil de testear unitariamente
- Reutilizable
- Separación de concerns clara

```javascript
// server.js (✅ AHORA)
app.ws("/ws", {
  open: handleWsOpen,
  message: handleWsMessage,
  close: handleWsClose,
});
```

## Componentes del handler.js

### 1. `parseMessage(rawMessage)`
**Responsabilidad:** Parsear JSON de forma segura

```javascript
const result = parseMessage(rawMessage);
// { success: true, data: {...} }
// { success: false, error: Error }
```

**Ventajas:**
- No lanza excepciones
- Retorna objeto con resultado
- Fácil de testear

---

### 2. `sendError(ws, message)`
**Responsabilidad:** Enviar errores al cliente de forma consistente

```javascript
sendError(ws, "Invalid JSON");
// Envía: { type: "ERROR", message: "Invalid JSON" }
```

**Ventajas:**
- Formato de error consistente
- DRY (Don't Repeat Yourself)
- Un solo lugar para modificar formato

---

### 3. `handleEvent(ws, type, data)`
**Responsabilidad:** Coordinar la ejecución del handler apropiado

**Flujo:**
1. Busca handler en `eventHandlers` Map
2. Si no existe → log warning + error al cliente
3. Si existe → log evento + ejecuta handler
4. Si falla → log error + error al cliente

**Ventajas:**
- Logging automático de todos los eventos
- Error handling centralizado
- Lógica de dispatch clara

---

### 4. `handleWsMessage(ws, rawMessage)`
**Responsabilidad:** Coordinador principal del flujo de mensajes

**Pasos:**
1. Parse del mensaje JSON
2. Validación del campo `type`
3. Delegación al `handleEvent()`

**Ventajas:**
- Punto de entrada claro
- Validaciones en orden lógico
- Fácil de extender

---

### 5. `handleWsOpen(ws)` y `handleWsClose(ws)`
**Responsabilidad:** Lifecycle hooks de conexión

**Ventajas:**
- Logging consistente
- Lugar para agregar lógica de cleanup
- Separado de la lógica de mensajes

---

## Testing

### Ejemplo de Test Unitario

```javascript
import { describe, test, expect } from "bun:test";
import { parseMessage, sendError } from "./handler.js";

describe("parseMessage", () => {
  test("parsea JSON válido", () => {
    const result = parseMessage('{"type":"LOGIN","userId":1}');
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ type: "LOGIN", userId: 1 });
  });

  test("maneja JSON inválido", () => {
    const result = parseMessage("invalid json");
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });

  test("maneja null/undefined", () => {
    const result = parseMessage(null);
    expect(result.success).toBe(false);
  });
});

describe("sendError", () => {
  test("envía mensaje de error correcto", () => {
    const mockWs = {
      send: jest.fn(),
    };
    sendError(mockWs, "Test error");
    expect(mockWs.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "ERROR", message: "Test error" })
    );
  });
});
```

---

## Extensibilidad

### Agregar un Nuevo Evento

**1. Crear handler en archivo específico:**

```javascript
// src/ws/trade.js
export function handleTradeOffer(ws, data) {
  // lógica del trade
}

export function registerTradeHandlers(eventHandlers) {
  eventHandlers.set("TRADE_OFFER", handleTradeOffer);
}
```

**2. Registrar en index.js:**

```javascript
// src/ws/index.js
import { registerTradeHandlers } from "./trade.js";

export function loadWsHandlers() {
  registerLoginHandlers(eventHandlers);
  registerChallengeHandlers(eventHandlers);
  registerBattleHandlers(eventHandlers);
  registerTradeHandlers(eventHandlers);  // ← NUEVO
}
```

**3. ¡Listo!** El handler.js automáticamente:
- Loguea el evento
- Ejecuta el handler
- Maneja errores
- Valida el mensaje

---

## Mejoras Futuras Sugeridas

### 1. Autenticación en WebSocket
```javascript
// handler.js
async function authenticateWs(ws, token) {
  // Verificar JWT antes de permitir eventos
  const user = await verifyJwt(token);
  ws.userId = user.id;
  return user;
}
```

### 2. Rate Limiting por Usuario
```javascript
// handler.js
const rateLimiter = new Map();

function checkRateLimit(userId) {
  // Limitar eventos por usuario
  const count = rateLimiter.get(userId) || 0;
  if (count > 100) throw new Error("Rate limit exceeded");
  rateLimiter.set(userId, count + 1);
}
```

### 3. Middleware System
```javascript
// handler.js
const middlewares = [
  authenticateMiddleware,
  rateLimitMiddleware,
  loggingMiddleware,
];

function applyMiddlewares(ws, data) {
  for (const middleware of middlewares) {
    middleware(ws, data);
  }
}
```

### 4. Event Schema Validation
```javascript
// Mover validación a handler.js
const eventSchemas = {
  LOGIN: wsLoginSchema,
  SEND_CHALLENGE: wsChallengeSchema,
  // ...
};

function validateEvent(type, data) {
  const schema = eventSchemas[type];
  if (schema) return validate(schema, data);
  return { success: true, data };
}
```

---

## Comparación de Líneas de Código

| Archivo | Antes | Después | Reducción |
|---------|-------|---------|-----------|
| server.js | 67 | 28 | **58%** |
| handler.js | - | 103 | (nuevo) |
| **Total** | 67 | 131 | +64 |

**Nota:** Aunque hay más líneas totales, la mayoría son comentarios y código reutilizable/testeable.

---

## Principios de Diseño Aplicados

### 🎯 Single Responsibility Principle (SRP)
Cada función tiene una sola razón para cambiar:
- `parseMessage` → solo parseo
- `sendError` → solo envío de errores
- `handleEvent` → solo coordinación

### 🔌 Dependency Inversion Principle (DIP)
`handler.js` depende de abstracciones (eventHandlers Map), no de implementaciones concretas.

### 🧩 Open/Closed Principle (OCP)
Abierto para extensión (agregar eventos), cerrado para modificación (no hay que tocar handler.js).

### 🧪 Testability
Cada función pura es testeable independientemente:
```javascript
// ✅ Fácil de testear
const result = parseMessage('{"test": 1}');

// ❌ Difícil de testear (antes)
app.ws("/ws", { message(ws, raw) { /* ... */ } });
```

---

## Resumen

**Antes:** Server.js monolítico con 40+ líneas de lógica inline

**Después:**
- ✅ Server.js limpio (3 líneas)
- ✅ handler.js modular y reutilizable
- ✅ Separación clara de concerns
- ✅ Fácil de testear
- ✅ Fácil de extender
- ✅ Logging automático
- ✅ Error handling consistente

**Próximo paso:** Escribir tests unitarios para handler.js
