# 🌙 Tsukuyomi Backend

Backend para juego de batallas de monstruos en tiempo real construido con **Bun + Elysia**.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
bun install

# Iniciar en desarrollo
bun run dev

# Servidor corriendo en http://localhost:3000
```

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [ARQUITECTURA.md](./ARQUITECTURA.md) | Visión general de la arquitectura, stack tecnológico, patrones de diseño |
| [API.md](./API.md) | Referencia completa de endpoints REST y WebSocket |
| [FLUJOS.md](./FLUJOS.md) | Diagramas de flujo detallados de todos los procesos |
| [TESTING_WEBSOCKETS.md](./TESTING_WEBSOCKETS.md) | Guía para probar WebSockets |
| [src/ws/README.md](./src/ws/README.md) | Arquitectura del módulo WebSocket |

## 🏗️ Stack Tecnológico

- **Runtime:** Bun 1.x
- **Framework:** Elysia 1.x
- **Database:** SQLite
- **Cache:** Redis
- **Validation:** Zod
- **Logging:** Pino
- **Auth:** JWT + bcrypt

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── api/              # REST endpoints
│   ├── ws/               # WebSocket handlers
│   ├── core/             # Core functionality (JWT, static files)
│   ├── db/               # Database
│   ├── services/         # Business logic (cache, etc)
│   ├── stores/           # In-memory stores (userStore, roomStore)
│   ├── validators/       # Zod schemas
│   ├── utils/            # Utilities (logger, errorHandler)
│   └── server.js         # Entry point
├── test-ws-client.html   # HTML test client
├── test-ws.js            # Automated test suite
└── TESTING_WEBSOCKETS.md # Testing guide
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo (hot reload)
bun run dev

# Testing
bun run test              # Tests unitarios
node test-ws.js           # Tests WebSocket automatizados
open test-ws-client.html  # Cliente de prueba visual
```

## 🌐 Endpoints Principales

### REST API

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/register` | Registrar usuario |
| POST | `/api/login` | Login de usuario |
| GET | `/api/users` | Listar usuarios |
| GET | `/api/users/:id` | Obtener usuario |
| PUT | `/api/users/:id` | Actualizar usuario |
| DELETE | `/api/users/:id` | Eliminar usuario |
| GET | `/api/monsters` | Listar monstruos |
| GET | `/api/monsters/:id` | Obtener monstruo |

### WebSocket

**URL:** `ws://localhost:3000/ws`

**Eventos:**
- `LOGIN` - Autenticar en WebSocket
- `SEND_CHALLENGE` - Enviar desafío a otro usuario
- `ACCEPT_CHALLENGE` - Aceptar desafío y crear batalla
- `PLAYER_READY` - Marcar jugador listo en batalla

Ver [API.md](./API.md) para detalles completos.

## 🎮 Flujo de Batalla

```
1. Ambos usuarios conectan por WebSocket
2. Ambos hacen LOGIN (userId)
3. Usuario A envía SEND_CHALLENGE (from, to)
4. Usuario B recibe CHALLENGE_RECEIVED
5. Usuario B envía ACCEPT_CHALLENGE
6. Se crea batalla (battleId)
7. Ambos envían PLAYER_READY (battleId, userId, monsterId)
8. Cuando ambos ready → BATTLE_START
```

Ver [FLUJOS.md](./FLUJOS.md) para diagramas detallados.

## 🧪 Testing

### Opción 1: Cliente HTML Visual

```bash
# Abrir en navegador
open frontend/dist/test-ws-client.html
```

Interfaz gráfica con botones de acción rápida y logs en tiempo real.

### Opción 2: Script Automatizado

```bash
node test-ws.js
```

Suite de tests que prueba todos los flujos automáticamente.

### Opción 3: CLI con wscat

```bash
npm install -g wscat
wscat -c ws://localhost:3000/ws
> {"type":"LOGIN","userId":1}
```

Ver [TESTING_WEBSOCKETS.md](./TESTING_WEBSOCKETS.md) para guía completa.

## 🔒 Autenticación

El backend usa **JWT** para autenticación:

```javascript
// Register/Login devuelve token
{
  "id": 1,
  "email": "player@example.com",
  "nickname": "Player1",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Usar en requests protegidos (futuro)
Authorization: Bearer <token>
```

## 💾 Cache

Redis se usa para cachear consultas frecuentes:

- `users:all` - Lista de usuarios (TTL: 5 min)
- `user:{id}` - Usuario específico (TTL: 5 min)
- `monsters:all` - Lista de monstruos (TTL: 5 min)

Cache se invalida automáticamente en updates.

## 📊 Logging

Usa **Pino** para logs estructurados:

```javascript
// En desarrollo: pretty-print colorizado
[18:24:06] INFO: 🚀 Chigotama backend inició
[18:24:06] INFO: ✔ Server running on http://localhost:3000

// En producción: JSON parseable
{"level":30,"time":1733163845,"msg":"Server started"}
```

Niveles: `debug`, `info`, `warn`, `error`

## 🛠️ Desarrollo

### Agregar Nuevo Endpoint REST

1. Crear handler en `src/api/`
2. Agregar validación Zod en `src/validators/schemas.js`
3. Registrar ruta en `src/api/index.js`

```javascript
// src/api/items.js
export function loadItemRoutes(app) {
  app.get("/api/items", asyncHandler(async () => {
    const items = db.query("SELECT * FROM items");
    return Response.json(items);
  }));
}

// src/api/index.js
import { loadItemRoutes } from "./items.js";

export function loadApiRoutes(app) {
  loadUserRoutes(app);
  loadMonsterRoutes(app);
  loadItemRoutes(app); // ← Agregar
}
```

### Agregar Nuevo Evento WebSocket

1. Crear handler en `src/ws/`
2. Agregar validación Zod en `src/validators/schemas.js`
3. Registrar en `src/ws/index.js`

```javascript
// src/ws/trade.js
function handleTrade(ws, data) {
  // ... lógica
}

export function registerTradeHandlers(eventHandlers) {
  eventHandlers.set("TRADE_REQUEST", wsErrorHandler(handleTrade));
}

// src/ws/index.js
import { registerTradeHandlers } from "./trade.js";

export function loadWsHandlers() {
  registerLoginHandlers(eventHandlers);
  registerChallengeHandlers(eventHandlers);
  registerBattleHandlers(eventHandlers);
  registerTradeHandlers(eventHandlers); // ← Agregar
}
```

## 🐛 Troubleshooting

### "Error: connect ECONNREFUSED"
- Servidor no está corriendo
- Solución: `bun run dev`

### "WebSocket connection failed"
- URL incorrecta
- Solución: Verificar `ws://localhost:3000/ws`

### "USER_OFFLINE" al enviar desafío
- Usuario destino no ha hecho LOGIN en WebSocket
- Solución: Ambos usuarios deben hacer LOGIN primero

### Cache no se invalida
- Redis no está corriendo
- Solución: `docker-compose up -d redis`

## 📈 Performance

| Operación | Tiempo |
|-----------|--------|
| GET /users (cached) | ~1ms |
| GET /users (uncached) | ~5ms |
| WebSocket login | ~2ms |
| WebSocket challenge | ~3ms |

## 🔮 Roadmap

### v1.1 (Próximo)
- [ ] Tests unitarios con Bun test
- [ ] Tests de integración
- [ ] Rate limiting
- [ ] WebSocket authentication con JWT
- [ ] Health check endpoint

### v2.0 (Futuro)
- [ ] Sistema de combate completo
- [ ] Migrar a PostgreSQL
- [ ] Redis Pub/Sub para multi-instancia
- [ ] Métricas y monitoreo
- [ ] Admin panel

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 License

MIT

## 🙏 Agradecimientos

- **Bun** - Runtime JavaScript ultrarrápido
- **Elysia** - Framework web minimalista
- **Zod** - Validación con TypeScript
- **Pino** - Logger de alto rendimiento

---

**Documentación completa:** Ver archivos .md en el directorio raíz del backend.
