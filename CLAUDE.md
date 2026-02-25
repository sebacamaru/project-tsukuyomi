# Project Tsukuyomi (Chigotama)

Juego educativo web con arquitectura cliente-servidor.

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| Runtime | Bun |
| Backend | Elysia 1.4.17 |
| Frontend | Vite (rolldown) + Pixi.js 8.14.3 |
| Base de Datos | SQLite (dev), PostgreSQL (prod) |
| Cache | Redis |
| Auth | JWT + Bcrypt |
| Validacion | Zod |

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
│   ├── api/                # Rutas REST (auth, users, eggs, candies, stones, chigos, quests, admin, inventory)
│   ├── db/                 # SQLite + esquemas
│   │   ├── schema/         # eggs, candies, stones, chigos, users
│   │   └── seeds/          # egg_types, candy_types, stone_types, chigo_species
│   ├── ws/                 # WebSocket handlers (battle, challenge)
│   ├── validators/         # Esquemas Zod
│   ├── services/cache.js   # Abstraccion Redis
│   └── utils/              # Logger (Pino), errorHandler
│
├── frontend/src/
│   ├── main.js             # Punto de entrada
│   ├── core/               # App, Scene, SceneManager, Router, Store, Renderer, QuestRunner
│   ├── scenes/             # Vistas (Login, Register, Dashboard, Professor, Battle, Marketplace, Inventory, Admin)
│   ├── services/           # Comunicacion API (auth, user, quest, egg, candy, stone, chigo, marketplace, admin)
│   ├── ui/
│   │   ├── components/     # Navbar, MessageBox, ItemGrid, LoadingIndicator
│   │   ├── layout/         # Template principal
│   │   └── scenes/         # HTML+CSS por escena
│   ├── styles/             # CSS global (variables, base, components, utilities)
│   └── data/               # quests/*.json
│
└── public/                 # Build output (assets compilados)
```

## Arquitectura Frontend

**Patron Scene-based** (similar a game engines):
- Cada vista es una `Scene` que extiende la clase base
- Lifecycle: `onEnter()`, `onExit()`, `onEnterComplete()`
- Lazy loading con dynamic imports
- Router custom con History API

**Sistema de Entities (Scene.js):**

Elementos interactuables se declaran en HTML con data attributes y se auto-registran:

```html
<img data-entity="egg" />          <!-- this.entity.egg -->
<button data-entity="button" />    <!-- this.entity.button -->
<div data-group="lights" />        <!-- this.entities.lights (EntityGroup) -->
```

- `this.entity.name` — elemento individual (`Entity` wrapper)
- `this.entities.name` — grupo de elementos (`EntityGroup` wrapper)

**API de Entity:**
```javascript
this.entity.egg.play("anim-shake")       // one-shot, await
this.entity.egg.start("anim-wobble")     // loop
this.entity.egg.stop()                   // para loop
this.entity.egg.show() / .hide()
this.entity.egg.addClass("cls") / .removeClass("cls")
this.entity.egg.onClick(() => ...)       // con cleanup automático
this.entity.egg.on("mouseenter", () => ...) // cualquier evento
this.entity.egg.el                       // DOM nativo
```

**API de EntityGroup:**
```javascript
this.entities.lights.playAll("anim-shake")           // paralelo
this.entities.lights.playSequential("anim-shake", 200) // secuencial
this.entities.lights.eachSequential((e) => e.addClass("on"), 200)
this.entities.lights.startAll("anim-wobble")
this.entities.lights.stopAll()
```

**Helpers de Scene:**
```javascript
await this.delay(500)
await this.showMessage("Hatching...", "Professor")
await this.playSceneAnim("anim-flash")   // aplica al root de la escena
await this.runSequence([fn1, fn2, fn3])  // cancelable en onExit()
```

El cleanup de animaciones es automático en `onExit()`. Las escenas no necesitan `onExit()` custom si solo usan el sistema de entities.

**Sistema Dual de Renderers (Sprite + UI):**

Escenas pueden optar por un sistema de renderizado dual con `this.useSpriteRenderer = true`:

- `#sprite-renderer` — Canvas de 90x135px escalado con CSS transform al `#app-wrapper`. Para pixel art y sprites posicionados.
- `#ui-renderer` — Overlay sin escalar, z-index superior, pointer-events pass-through. Para tooltips, menús, HUD.

```javascript
// Escena sprite-only
class ProfessorScene extends Scene {
  constructor() {
    super();
    this.useSpriteRenderer = true;
  }
  async getSpriteHTML() { return spritesHTML; }  // va al sprite-renderer
}

// Escena mixta (sprites + UI)
class BattleScene extends Scene {
  constructor() {
    super();
    this.useSpriteRenderer = true;
  }
  async getSpriteHTML() { return spritesHTML; }  // sprites escalados
  async getHTML() { return uiHTML; }             // UI overlay sin escalar
}
```

- `getSpriteHTML()` → contenido del sprite-renderer (coordenadas en 90x135px)
- `getHTML()` → contenido del ui-renderer (o escena normal si `useSpriteRenderer=false`)
- `this.spriteRoot` / `this.uiRoot` → refs a los divs
- Entities de ambos renderers se registran y usan igual
- Escenas UI-only no necesitan cambios (comportamiento por defecto)

**Archivos de escena con sprites:**
```
ui/scenes/incubator/
├── incubator-sprites.html   # Template del sprite-renderer
├── incubator.html           # Template del ui-renderer (overlay)
└── incubator.css            # Background + posicionamiento de sprites
```

**Estado global:**
```javascript
store = {
  gold: 0,
  eggs: [],           // Huevos del usuario
  candies: [],        // Caramelos del usuario
  stones: [],         // Piedras del usuario
  chigos: [],         // Chigos del usuario
  user: null,
  token: null
}
```

**Persistencia:** LocalStorage key `tsukuyomi_auth`

## Arquitectura Backend

**API REST:**
- `POST /auth/register` - Registro (email + password)
- `POST /auth/login` - Login, retorna JWT
- `GET/PUT /api/users/:id` - CRUD usuarios
- `GET /api/users/:id/inventory` - Inventario completo (eggs, candies, stones, chigos, gold)
- `GET /api/quests/:code` - Obtener quest
- `POST /api/users/:id/complete-quest` - Completar quest

**WebSocket `/ws`:** Eventos LOGIN, CHALLENGE, PLAYER_READY, batalla en tiempo real

**Cache Redis:** TTL 5 min para catalogos, 1 min para inventario usuario

## Convenciones de Codigo

- **JavaScript ES6+** (no TypeScript)
- **CSS puro** con variables CSS, metodologia BEM
- **Mobile-first** responsive design
- **Validacion Zod** en backend
- **Estructura modular** por feature

## Variables de Entorno

**Frontend (.env):**
- `VITE_API_URL` - URL del backend
- `VITE_APP_NAME` - Nombre de la app

**Backend (.env):**
- `PORT` - Puerto del servidor (3000)
- `JWT_SECRET` - Secreto para tokens
- `JWT_EXP` - Expiracion JWT (2h)
- `REDIS_URL` - URL de Redis

## Flujo de Autenticacion

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
    { "id": "d2", "options": [{ "text": "Opcion", "next": "d3" }] },
    { "id": "d3", "action": "complete_quest" }
  ]
}
```

**Acciones en dialogos:**
- Dialogo simple: `speaker`, `text`, `next`
- Opciones multiples: `options[]` con `text`, `value`, `icon`, `next`
- `input_username`: Input validado (3-20 chars, alfanumerico)
- `create_monster`: Seleccion de starter (TODO)
- `complete_quest`: Finaliza quest y programa siguiente

**Sistema de delays:**
- `nextQuestDelay`: numero fijo o rango `"1-3"`
- `debug: true` → minutos, `debug: false` → horas
- Guarda timestamp en `user.next_quest_available_at`

**Variables en texto:** `{variable}` busca en contexto local → `store.user`

**Progreso:** `current_quest_code` en usuario, encadenadas por `prerequisite_quest_code`

**Badge Profesor:** `App.js` muestra notificacion si hay quest disponible y no hay delay activo

## Sistema de Inventario

El sistema usa tablas especializadas por tipo de item:

### Catalogos (tipos disponibles en el juego)

| Tabla | Descripcion |
|-------|-------------|
| `egg_types` | Tipos de huevos (wild, tame) con possible_species |
| `candy_types` | Caramelos que modifican stats (hp, atk, def, spd) |
| `stone_types` | Piedras elementales equipables |
| `chigo_species` | Especies de chigos con stats base |

### Inventario del Usuario

| Tabla | Descripcion |
|-------|-------------|
| `user_eggs` | Huevos con uuid, status (inventory/incubating/hatched), care_params |
| `user_candies` | Cantidad de cada tipo de caramelo |
| `user_stones` | Cantidad de cada tipo de piedra |
| `user_chigos` | Chigos con uuid, stats individuales, nickname |
| `chigo_stones` | Piedras equipadas permanentemente (max 4 por chigo) |

### API REST

**Huevos:**
- `GET /api/egg-types` - Catalogo de tipos
- `GET /api/users/:id/eggs` - Huevos del usuario
- `POST /api/users/:id/eggs/:uuid/incubate` - Iniciar incubacion
- `POST /api/users/:id/eggs/:uuid/hatch` - Eclosionar

**Caramelos:**
- `GET /api/candy-types` - Catalogo
- `GET /api/candy-types/buyable` - Comprables (price > 0)
- `GET /api/users/:id/candies` - Caramelos del usuario
- `POST /api/marketplace/buy-candy` - Comprar
- `POST /api/users/:id/candies/use` - Usar en chigo

**Piedras:**
- `GET /api/stone-types` - Catalogo
- `GET /api/stone-types/buyable` - Comprables
- `GET /api/users/:id/stones` - Piedras del usuario
- `POST /api/marketplace/buy-stone` - Comprar
- `POST /api/users/:id/stones/equip` - Equipar a chigo (permanente)

**Chigos:**
- `GET /api/chigo-species` - Catalogo de especies
- `GET /api/users/:id/chigos` - Chigos del usuario
- `GET /api/users/:id/chigos/:chigoId` - Detalle de un chigo
- `PUT /api/users/:id/chigos/:chigoId/nickname` - Cambiar nombre
- `DELETE /api/users/:id/chigos/:chigoId` - Liberar

**Inventario consolidado:**
- `GET /api/users/:id/inventory` - Retorna `{ gold, eggs, candies, stones, chigos }`

### Admin (solo dev)

- `GET/POST/PUT/DELETE /api/admin/egg-types`
- `GET/POST/PUT/DELETE /api/admin/candy-types`
- `GET/POST/PUT/DELETE /api/admin/stone-types`
- `GET/POST/PUT/DELETE /api/admin/chigo-species`
- `POST /api/admin/users/:id/give-egg`
- `POST /api/admin/users/:id/give-candy`
- `POST /api/admin/users/:id/give-stone`

### Frontend Services

- `eggService` - getUserEggs, startIncubation, hatchEgg
- `candyService` - getUserCandies, buyCandy, useCandy
- `stoneService` - getUserStones, buyStone, equipStone
- `chigoService` - getUserChigos, setNickname, releaseChigo
- `marketplaceService` - getAllBuyableItems, buyCandy, buyStone

### Recompensas en Quests

```json
{
  "gold": 500,
  "eggs": [{ "eggTypeName": "wild", "quantity": 1 }],
  "candies": [{ "candyTypeName": "hp_candy_small", "quantity": 5 }],
  "stones": [{ "stoneTypeName": "flame_burst", "quantity": 1 }]
}
```

## Notas Importantes

- El frontend compila a `/public` (no a `/dist`)
- Pixi.js renderiza background con particulas animadas
- Modo "cutscene" oculta navbar para dialogos inmersivos
- Admin routes solo disponibles en desarrollo
- Los chigos tienen stats individuales (no solo los base de la especie)
- Las piedras equipadas son permanentes (no se pueden desequipar)

## Restricciones de Claude

- **NO ejecutar builds automaticamente** - No correr `npm run build`, `npm run dev`, `npm run frontend`, `npm run backend` ni comandos similares sin autorizacion explicita del usuario.
- Solo ejecutar comandos de build/dev cuando el usuario lo solicite especificamente.
