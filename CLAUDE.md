# Project Tsukuyomi (Chigotama)

Juego educativo web con arquitectura cliente-servidor.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Runtime | Bun |
| Backend | Elysia 1.4.17 |
| Frontend | Vite (rolldown) + Pixi.js 8.14.3 |
| Base de Datos | SQLite (dev), PostgreSQL (prod) |
| Cache | Redis |
| Auth | JWT + Bcrypt |
| Validación | Zod |

## Comandos

```bash
# Desarrollo
npm run frontend      # Vite dev server (localhost:5173)
npm run backend       # Elysia API (localhost:3000)
npm run dev           # Docker + Backend
npm run build         # Build frontend + ejecuta dev
```

## Estructura del Proyecto

```
project-tsukuyomi/
├── backend/src/
│   ├── server.js           # Punto de entrada Elysia
│   ├── api/                # Rutas REST (auth, users, items, quests, monsters, admin)
│   ├── db/                 # SQLite + esquemas
│   ├── ws/                 # WebSocket handlers (battle, challenge)
│   ├── validators/         # Esquemas Zod
│   ├── services/cache.js   # Abstracción Redis
│   └── utils/              # Logger (Pino), errorHandler
│
├── frontend/src/
│   ├── main.js             # Punto de entrada
│   ├── core/               # App, Scene, SceneManager, Router, Store, Renderer
│   ├── scenes/             # Vistas (Login, Register, Dashboard, Professor, Battle, Marketplace, Inventory, Admin)
│   ├── services/           # Comunicación API (auth, user, quest, marketplace, admin)
│   ├── ui/
│   │   ├── components/     # Navbar, MessageBox, ItemCard, LoadingIndicator
│   │   ├── layout/         # Template principal
│   │   └── scenes/         # HTML+CSS por escena
│   ├── styles/             # CSS global (variables, base, components, utilities)
│   └── data/               # items.json, quests/*.json
│
└── public/                 # Build output (assets compilados)
```

## Arquitectura Frontend

**Patrón Scene-based** (similar a game engines):
- Cada vista es una `Scene` que extiende la clase base
- Lifecycle: `onEnter()`, `onExit()`, `onEnterComplete()`
- Lazy loading con dynamic imports
- Router custom con History API

**Estado global:**
```javascript
store = { gold, inventory, items, user, token }
```

**Persistencia:** LocalStorage key `tsukuyomi_auth`

## Arquitectura Backend

**API REST:**
- `POST /auth/register` - Registro (email + password)
- `POST /auth/login` - Login, retorna JWT
- `GET/PUT /api/users/:id` - CRUD usuarios
- `GET /api/items` - Listado items
- `GET /api/quests/:code` - Obtener quest
- `POST /api/users/:id/complete-quest` - Completar quest

**WebSocket `/ws`:** Eventos LOGIN, CHALLENGE, PLAYER_READY, batalla en tiempo real

**Cache Redis:** TTL 5 min para users, items, monsters

## Convenciones de Código

- **JavaScript ES6+** (no TypeScript)
- **CSS puro** con variables CSS, metodología BEM
- **Mobile-first** responsive design
- **Validación Zod** en backend
- **Estructura modular** por feature

## Variables de Entorno

**Frontend (.env):**
- `VITE_API_URL` - URL del backend
- `VITE_APP_NAME` - Nombre de la app

**Backend (.env):**
- `PORT` - Puerto del servidor (3000)
- `JWT_SECRET` - Secreto para tokens
- `JWT_EXP` - Expiración JWT (2h)
- `REDIS_URL` - URL de Redis

## Flujo de Autenticación

1. Usuario registra con email + password
2. Password hasheado con bcrypt
3. JWT generado y retornado
4. Token guardado en localStorage
5. Incluido en headers: `Authorization: Bearer {token}`

## Sistema de Quests

**Archivos:** `frontend/src/data/quests/*.json` ejecutados por `QuestRunner`

**Estructura JSON:**
```json
{
  "code": "quest_id",
  "autoNextQuest": false,
  "nextQuestDelay": 2,
  "debug": true,
  "dialogues": [
    { "id": "d1", "speaker": "NPC", "text": "Hola {username}", "next": "d2" },
    { "id": "d2", "options": [{ "text": "Opción", "next": "d3" }] },
    { "id": "d3", "action": "complete_quest" }
  ]
}
```

**Acciones en diálogos:**
- Diálogo simple: `speaker`, `text`, `next`
- Opciones múltiples: `options[]` con `text`, `value`, `icon`, `next`
- `input_username`: Input validado (3-20 chars, alfanumérico)
- `create_monster`: Selección de starter (TODO)
- `complete_quest`: Finaliza quest y programa siguiente

**Sistema de delays:**
- `nextQuestDelay`: número fijo o rango `"1-3"`
- `debug: true` → minutos, `debug: false` → horas
- Guarda timestamp en `user.next_quest_available_at`

**Variables en texto:** `{variable}` busca en contexto local → `store.user`

**Progreso:** `current_quest_code` en usuario, encadenadas por `prerequisite_quest_code`

**Badge Profesor:** `App.js` muestra notificación si hay quest disponible y no hay delay activo

## Sistema de Items

**Tabla `items`:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | TEXT | Identificador interno (ej: `basic_potion`, `chigo_egg`) |
| `label` | TEXT | Nombre visible al usuario (ej: "Poción Básica") |
| `description` | TEXT | Descripción del item (opcional) |
| `price` | INTEGER | Precio en oro (0 = no comprable, es recompensa) |
| `icon` | TEXT | Nombre del archivo en /assets (ej: `sprite-egg.png`) |
| `type` | TEXT | Categoría: `potion`, `egg`, `misc` |

**API REST:**
- `GET /api/items` - Listado de items (cache 5 min)
- `POST /api/marketplace/buy` - Comprar item
- `GET /api/users/:id/inventory` - Inventario del usuario

**Admin (solo dev):**
- `GET /api/admin/items` - Listar items
- `POST /api/admin/items` - Crear item
- `PUT /api/admin/items/:id` - Actualizar item
- `DELETE /api/admin/items/:id` - Eliminar item
- `DELETE /api/admin/items` - Eliminar todos

**Frontend:**
- `InventoryScene` - Vista del inventario (`/inventory`)
- `MarketplaceScene` - Tienda (`/marketplace`)
- `inventoryService` - Operaciones de inventario
- `ItemCard` - Componente reutilizable para mostrar items

**Recompensas en Quests:**

Los items se otorgan via `rewards_json` en quests:
```json
{
  "gold": 500,
  "items": [{ "itemName": "chigo_egg", "quantity": 1 }]
}
```
Nota: `itemName` usa el campo `name` (identificador interno).

## Notas Importantes

- El frontend compila a `/public` (no a `/dist`)
- Pixi.js renderiza background con partículas animadas
- Modo "cutscene" oculta navbar para diálogos inmersivos
- Admin routes solo disponibles en desarrollo
