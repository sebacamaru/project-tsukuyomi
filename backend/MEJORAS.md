# Mejoras Implementadas en el Backend

Este documento detalla todas las mejoras de arquitectura implementadas en el backend de Tsukuyomi.

## 📋 Resumen de Mejoras

1. ✅ **Eliminación de contraseñas de respuestas API**
2. ✅ **Unificación de dependencias de bcrypt**
3. ✅ **Validación con Zod**
4. ✅ **Implementación de Redis para cache**
5. ✅ **Error handling consistente**
6. ✅ **Logging estructurado con Pino**
7. ✅ **Desacoplamiento de handlers WebSocket**

---

## 1. 🔒 Seguridad: Eliminación de Contraseñas

### Problema
El endpoint `GET /api/users` devolvía contraseñas hasheadas en la respuesta.

### Solución
- Modificado el query SQL para excluir el campo `password`
- Solo se devuelven: `id`, `email`, `nickname`

### Archivos modificados
- `src/api/users.js:8-14`

---

## 2. 🔧 Unificación de Dependencias

### Problema
Existían dos librerías de bcrypt instaladas:
- `bcrypt` (usado en `users.js`)
- `bcryptjs` (usado en `auth.js`)

### Solución
- Eliminada `bcryptjs` del `package.json`
- Todos los archivos ahora usan `bcrypt`

### Archivos modificados
- `package.json:12` - Eliminada `bcryptjs`
- `src/api/auth.js:2` - Cambiado import a `bcrypt`

---

## 3. ✔️ Validación con Zod

### Implementación
Se creó un sistema completo de validación usando Zod para:
- Rutas REST API
- Eventos WebSocket
- Parámetros de URL

### Archivos creados
- `src/validators/schemas.js` - Todos los schemas de validación
- `src/validators/validate.js` - Helper de validación

### Schemas definidos
```javascript
// AUTH
registerSchema     // email, password (min 6), nickname (3-20 chars)
loginSchema        // email, password

// USERS
createUserSchema   // email, password (min 6), nickname (3-20 chars)

// MONSTERS
createMonsterSchema    // name, attack (1-999), defense (1-999), ownerId
userIdParamSchema      // userId (numeric)

// WEBSOCKET
wsLoginSchema          // userId (positive int)
wsChallengeSchema      // from, to (positive ints)
wsPlayerReadySchema    // battleId, userId, monsterId
```

### Uso
```javascript
const validation = validate(registerSchema, body);
if (!validation.success) {
  return Response.json({ error: validation.error }, { status: 400 });
}
const { email, password, nickname } = validation.data;
```

### Archivos modificados
- `src/api/auth.js` - Validación en register/login
- `src/api/users.js` - Validación en POST /api/users
- `src/api/monsters.js` - Validación en todos los endpoints
- `src/ws/login.js` - Validación evento LOGIN
- `src/ws/challenge.js` - Validación eventos SEND_CHALLENGE y ACCEPT_CHALLENGE
- `src/ws/battle.js` - Validación evento PLAYER_READY

---

## 4. 🚀 Redis Cache

### Implementación
Sistema de cache con Redis para optimizar consultas frecuentes.

### Archivo creado
- `src/services/cache.js` - Servicio completo de cache

### Métodos disponibles
```javascript
cache.get(key)                    // Obtener valor
cache.set(key, value, ttl=300)   // Guardar con TTL (5 min default)
cache.delete(key)                 // Eliminar clave
cache.deletePattern(pattern)      // Eliminar por patrón (ej: "user:*")
cache.exists(key)                 // Verificar existencia
```

### Endpoints con cache
| Endpoint | Cache Key | TTL |
|----------|-----------|-----|
| GET /api/users | `users:all` | 5 min |
| GET /api/monsters | `monsters:all` | 5 min |
| GET /api/monsters/by-user/:id | `monsters:user:{id}` | 5 min |

### Invalidación automática
- POST /api/users → invalida `users:all`
- POST /api/monsters → invalida `monsters:all` y `monsters:user:{ownerId}`

### Archivos modificados
- `src/api/users.js:10-27` - Cache en GET /api/users
- `src/api/users.js:57` - Invalidación en POST
- `src/api/monsters.js:8-30` - Cache en GET /api/monsters
- `src/api/monsters.js:33-64` - Cache en GET by user
- `src/api/monsters.js:91-92` - Invalidación en POST

---

## 5. ⚠️ Error Handling Consistente

### Implementación
Wrappers para manejo centralizado de errores en REST y WebSocket.

### Archivo creado
- `src/utils/errorHandler.js`

### Funciones

#### `asyncHandler(handler)`
Wrapper para handlers REST API. Captura errores y devuelve respuestas apropiadas.

**Errores SQL detectados:**
- `UNIQUE constraint failed` → 409 Conflict
- `NOT NULL constraint failed` → 400 Bad Request
- `FOREIGN KEY constraint failed` → 400 Bad Request
- Otros → 500 Internal Server Error

**Uso:**
```javascript
router.post("/api/users", asyncHandler(async (req) => {
  // tu código aquí
}));
```

#### `wsErrorHandler(handler)`
Wrapper para handlers WebSocket. Captura errores y envía mensaje de error al cliente.

**Uso:**
```javascript
eventHandlers.set("LOGIN", wsErrorHandler(handleLogin));
```

### Archivos modificados
- `src/api/auth.js:9, 42` - Wrapped con asyncHandler
- `src/api/users.js:11, 32` - Wrapped con asyncHandler
- `src/api/monsters.js:9, 34, 68` - Wrapped con asyncHandler
- `src/ws/login.js:27` - Wrapped con wsErrorHandler
- `src/ws/challenge.js:60-61` - Wrapped con wsErrorHandler
- `src/ws/battle.js:46` - Wrapped con wsErrorHandler

---

## 6. 📝 Logging Estructurado

### Implementación
Sistema de logging con Pino (JSON estructurado en producción, pretty en desarrollo).

### Archivo creado
- `src/utils/logger.js`

### Funciones de logging

#### `logger.info/warn/error/debug(message, context?)`
Logger base de Pino.

#### `logRequest(method, path, status, duration)`
Logger para requests HTTP.
```javascript
logRequest("GET", "/api/users", 200, 45);
// Output: GET /api/users 200 [45ms]
```

#### `logWsEvent(event, userId, success=true)`
Logger para eventos WebSocket.
```javascript
logWsEvent("LOGIN", 123, true);
// Output: WS: LOGIN (user: 123)
```

#### `logError(context, error, metadata?)`
Logger para errores con stack trace.
```javascript
logError("Cache GET", error, { key: "users:all" });
```

#### `logCache(operation, key, hit?)`
Logger para operaciones de cache.
```javascript
logCache("get", "users:all", true);  // HIT
logCache("get", "users:all", false); // MISS
logCache("set", "users:all");        // SET
```

### Configuración
```javascript
// Nivel de log (env: LOG_LEVEL)
logger.level = process.env.LOG_LEVEL || "info";

// Pretty print en desarrollo
process.env.NODE_ENV !== "production"
```

### Integración

**server.js:**
- Startup message
- WebSocket conexión/desconexión
- Eventos WebSocket
- Errores de parsing JSON

**cache.js:**
- Todas las operaciones (get, set, delete, exists)
- Errores de Redis

**errorHandler.js:**
- Errores en API handlers
- Errores en WS handlers

---

## 7. 🧩 Desacoplamiento de Handlers WebSocket

### Problema
El archivo `server.js` contenía 40+ líneas de lógica inline para manejar mensajes WebSocket, incluyendo:
- Parsing de JSON
- Validación de mensajes
- Logging de eventos
- Manejo de errores
- Dispatch de handlers

Esto resultaba en:
- Código difícil de testear
- Alto acoplamiento
- Baja reutilizabilidad
- Server.js monolítico

### Solución
Refactorización completa del sistema WebSocket en módulos especializados:

#### Archivo creado
- `src/ws/handler.js` - Coordinador de mensajes WebSocket

#### Funciones implementadas

**1. `parseMessage(rawMessage)`**
- Parsea JSON de forma segura
- Retorna objeto con `{ success, data?, error? }`
- No lanza excepciones

**2. `sendError(ws, message)`**
- Formato consistente de errores
- Envía `{ type: "ERROR", message }`
- DRY (Don't Repeat Yourself)

**3. `handleEvent(ws, type, data)`**
- Coordina ejecución de handlers
- Logging automático de eventos
- Error handling centralizado
- Validación de existencia de handler

**4. `handleWsMessage(ws, rawMessage)`**
- Punto de entrada principal
- Coordina: parse → validación → dispatch
- Validación del campo `type`

**5. `handleWsOpen(ws)` y `handleWsClose(ws)`**
- Lifecycle hooks de conexión
- Logging consistente
- Lugar para cleanup futuro

### Flujo de Mensajes

```
Cliente → handleWsMessage()
           ↓
       parseMessage() - Valida JSON
           ↓
       Valida campo 'type'
           ↓
       handleEvent() - Busca handler
           ↓
       wsErrorHandler() - Wrapper
           ↓
       Handler específico (login/challenge/battle)
           ↓
       Respuesta al cliente
```

### Comparación Antes/Después

**Antes:**
```javascript
// server.js (67 líneas, monolítico)
app.ws("/ws", {
  message(ws, rawMessage) {
    let msg;
    try {
      msg = JSON.parse(rawMessage);
    } catch (error) {
      logError("WS JSON Parse", error);
      ws.send(JSON.stringify({ type: "ERROR", message: "Invalid JSON" }));
      return;
    }
    // ... 30+ líneas más
  }
});
```

**Después:**
```javascript
// server.js (28 líneas, limpio)
import { handleWsOpen, handleWsMessage, handleWsClose } from "./ws/handler.js";

app.ws("/ws", {
  open: handleWsOpen,
  message: handleWsMessage,
  close: handleWsClose,
});
```

### Ventajas

1. **Testabilidad** - Cada función es testeable independientemente
2. **Reutilizabilidad** - wsHandler.js puede usarse en otros proyectos
3. **Mantenibilidad** - Código organizado y modular
4. **Extensibilidad** - Fácil agregar nuevos eventos
5. **Single Responsibility** - Cada función hace una cosa
6. **Separación de Concerns** - Server.js solo coordina, no implementa

### Reducción de Complejidad

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Líneas en server.js | 67 | 28 | **58% menos** |
| Funciones testeable | 0 | 5 | ∞ |
| Acoplamiento | Alto | Bajo | ✅ |
| Reutilizabilidad | 0% | 100% | ✅ |

### Archivos modificados
- `src/server.js:1-7, 19-24` - Imports y uso de handlers
- `src/ws/handler.js` - Nuevo módulo (103 líneas)
- `src/ws/README.md` - Documentación completa

### Documentación
Ver [src/ws/README.md](src/ws/README.md) para:
- Arquitectura detallada
- Ejemplos de testing
- Guía de extensión
- Mejoras futuras sugeridas

---

## 📦 Nuevas Dependencias

```json
{
  "zod": "^3.23.8",           // Validación de schemas
  "pino": "^9.0.0",           // Logger estructurado
  "pino-pretty": "^13.0.0"    // Pretty print para desarrollo
}
```

**Eliminadas:**
- `bcryptjs: 3.0.3` (reemplazada por bcrypt)

---

## 🚀 Cómo usar

### 1. Instalar dependencias
```bash
cd backend
bun install
```

### 2. Configurar variables de entorno
Asegúrate de que `.env` tenga:
```env
PORT=3000
JWT_SECRET=tu_secreto_jwt
JWT_EXP=2h
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info  # debug | info | warn | error
NODE_ENV=development  # production para logs JSON
```

### 3. Iniciar Redis
```bash
docker-compose up -d redis
```

### 4. Ejecutar backend
```bash
bun run dev
```

---

## 📊 Métricas de Mejora

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Seguridad** | ⚠️ Contraseñas expuestas | ✅ Solo datos públicos |
| **Validación** | ❌ Sin validación | ✅ Zod en todo |
| **Cache** | ❌ Sin cache | ✅ Redis implementado |
| **Errores** | ⚠️ Console.log básico | ✅ Handler centralizado |
| **Logging** | ⚠️ Console.log | ✅ Pino estructurado |
| **Dependencias** | ⚠️ Duplicadas | ✅ Unificadas |
| **Arquitectura WS** | ⚠️ Monolítico (67 líneas) | ✅ Modular (28 líneas) |
| **Testabilidad** | ❌ 0 funciones testeables | ✅ 5+ funciones puras |

---

## 🔮 Próximas Mejoras Sugeridas

1. **Rate limiting** con Redis
2. **Autenticación en WebSocket** (verificar JWT antes de LOGIN)
3. **Tests unitarios** con Bun Test
4. **Health check endpoint** (`GET /health`)
5. **Metrics endpoint** con Prometheus
6. **Database migrations** con herramienta como Drizzle
7. **API documentation** con Swagger/OpenAPI
8. **CORS configuration** apropiada
9. **Helmet.js** para seguridad HTTP
10. **Request ID tracking** en logs

---

## 📚 Documentación de Referencia

- [Zod Documentation](https://zod.dev/)
- [Pino Logger](https://getpino.io/)
- [Redis Node Client](https://github.com/redis/node-redis)
- [Bun Runtime](https://bun.sh/)
- [Elysia Framework](https://elysiajs.com/)
