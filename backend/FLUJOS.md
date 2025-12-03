# 🔄 Flujos de la Aplicación - Tsukuyomi

## 📋 Índice
- [Flujo de Autenticación](#flujo-de-autenticación)
- [Flujo de Batalla Completo](#flujo-de-batalla-completo)
- [Flujo de Cache](#flujo-de-cache)
- [Flujo de WebSocket](#flujo-de-websocket)
- [Flujo de Error Handling](#flujo-de-error-handling)

---

## Flujo de Autenticación

### 1. Registro de Usuario

```
[Cliente]
   ↓
POST /api/register
{
  "email": "user@example.com",
  "password": "123456",
  "nickname": "Player1"
}
   ↓
[API: auth.js]
   ↓
Validar con Zod
(email válido, password min 6 chars)
   ↓
Verificar email único
   ↓
Hash password con bcrypt
hash = await bcrypt.hash(password, 10)
   ↓
Insertar en DB
INSERT INTO users (email, password, nickname)
   ↓
Invalidar cache
await cache.del("users:all")
   ↓
Generar JWT
token = await app.jwt.sign({ id: user.id })
   ↓
[Respuesta]
{
  "id": 1,
  "email": "user@example.com",
  "nickname": "Player1",
  "token": "eyJhbGc..."
}
```

### 2. Login de Usuario

```
[Cliente]
   ↓
POST /api/login
{
  "email": "user@example.com",
  "password": "123456"
}
   ↓
[API: auth.js]
   ↓
Validar con Zod
   ↓
Buscar usuario por email
SELECT * FROM users WHERE email = ?
   ↓
¿Usuario existe?
   ├─ NO → Error 401 "Invalid credentials"
   └─ SÍ
      ↓
Verificar password
isValid = await bcrypt.compare(password, user.password)
   ↓
¿Password correcto?
   ├─ NO → Error 401 "Invalid credentials"
   └─ SÍ
      ↓
Generar JWT
token = await app.jwt.sign({ id: user.id })
      ↓
[Respuesta]
{
  "id": 1,
  "email": "user@example.com",
  "nickname": "Player1",
  "token": "eyJhbGc..."
}
```

---

## Flujo de Batalla Completo

### Diagrama de Estados

```
[Usuario A]                    [Usuario B]
    |                              |
    |------ WS Connect ----------->|
    |<----- WS_CONNECTED ----------|
    |                              |
    |------ LOGIN (userId: 1) ---->|
    |<----- LOGIN_OK --------------|
    |                              |
    |                          LOGIN (userId: 2)
    |                        LOGIN_OK
    |                              |
SEND_CHALLENGE ------------------>|
(from: 1, to: 2)                  |
    |                              |
    |<---- CHALLENGE_SENT ---------|
    |                              |
    |                   CHALLENGE_RECEIVED
    |                        (from: 1)
    |                              |
    |<--------- ACCEPT_CHALLENGE --|
    |        (from: 1, to: 2)      |
    |                              |
CHALLENGE_ACCEPTED ------------->|
(battleId: "battle_123")          |
    |                              |
    |<---- CHALLENGE_ACCEPTED -----|
    |                              |
PLAYER_READY ------------------->|
(battleId, userId: 1, monsterId: 5)
    |                              |
BATTLE_READY_UPDATE ------------>|
(player: 1, readyState: [1])      |
    |                              |
    |<---- BATTLE_READY_UPDATE ----|
    |                              |
    |                      PLAYER_READY
    |                   (battleId, userId: 2, monsterId: 3)
    |                              |
BATTLE_READY_UPDATE ------------>|
(player: 2, readyState: [1,2])    |
    |                              |
    |<---- BATTLE_READY_UPDATE ----|
    |                              |
BATTLE_START ------------------->|
"¡Que comience la batalla!"       |
    |                              |
    |<-------- BATTLE_START -------|
```

### Paso a Paso Detallado

#### **PASO 1: Conexión WebSocket**

```javascript
// Cliente
const ws = new WebSocket("ws://localhost:3000/ws");

// Servidor: handler.js
export function handleWsOpen(ws) {
  logger.info("✔ WS conectado");
  ws.send(JSON.stringify({ type: "WS_CONNECTED" }));
}
```

**Estado:**
- ✅ Cliente conectado
- ❌ Usuario no autenticado en WS

---

#### **PASO 2: LOGIN WebSocket**

```javascript
// Cliente A envía
{
  "type": "LOGIN",
  "userId": 1
}

// Servidor: ws/login.js
function handleLogin(ws, data) {
  // Validar con Zod
  const validation = validate(wsLoginSchema, data);

  // Verificar si ya está conectado
  const existingSocket = userStore.get(userId);
  if (existingSocket && existingSocket !== ws) {
    return ERROR("Este usuario ya está conectado en otra sesión");
  }

  // Agregar a userStore
  userStore.add(userId, ws);

  // Confirmar
  ws.send({
    type: "LOGIN_OK",
    userId: 1,
    message: "Bienvenido, usuario 1"
  });
}
```

**Estado:**
- ✅ Usuario 1 conectado: `userStore = { 1 → ws1 }`
- ✅ Usuario 2 conectado: `userStore = { 1 → ws1, 2 → ws2 }`

---

#### **PASO 3: SEND_CHALLENGE**

```javascript
// Cliente A envía
{
  "type": "SEND_CHALLENGE",
  "from": 1,
  "to": 2
}

// Servidor: ws/challenge.js
function handleSendChallenge(ws, data) {
  const { from, to } = data;

  // Buscar destinatario
  const targetWS = userStore.get(to);

  if (!targetWS) {
    return ERROR("El usuario 2 no está conectado");
  }

  // Enviar desafío al destinatario
  targetWS.send({
    type: "CHALLENGE_RECEIVED",
    from: 1
  });

  // Confirmar al remitente
  ws.send({
    type: "CHALLENGE_SENT",
    to: 2,
    message: "Desafío enviado exitosamente"
  });
}
```

**Estado:**
- Usuario 1 ve: `CHALLENGE_SENT`
- Usuario 2 ve: `CHALLENGE_RECEIVED`

---

#### **PASO 4: ACCEPT_CHALLENGE**

```javascript
// Cliente B envía
{
  "type": "ACCEPT_CHALLENGE",
  "from": 1,
  "to": 2
}

// Servidor: ws/challenge.js
function handleAcceptChallenge(ws, data) {
  const { from, to } = data;

  // Verificar que ambos estén conectados
  const wsA = userStore.get(from);
  const wsB = userStore.get(to);

  if (!wsA) return ERROR("El usuario 1 ya no está conectado");
  if (!wsB) return ERROR("El usuario 2 ya no está conectado");

  // Crear batalla
  const battleId = "battle_" + Date.now();
  roomStore.create(battleId, [from, to]);

  // Notificar a ambos
  for (const socket of [wsA, wsB]) {
    socket.send({
      type: "CHALLENGE_ACCEPTED",
      battleId,
      message: "¡Batalla creada! Selecciona tu monstruo"
    });
  }
}
```

**Estado:**
- `roomStore = { "battle_123" → { players: [1, 2], ready: [] } }`
- Ambos usuarios ven: `CHALLENGE_ACCEPTED`

---

#### **PASO 5: PLAYER_READY (Usuario 1)**

```javascript
// Cliente A envía
{
  "type": "PLAYER_READY",
  "battleId": "battle_123",
  "userId": 1,
  "monsterId": 5
}

// Servidor: ws/battle.js
function handlePlayerReady(ws, data) {
  const { userId, battleId } = data;
  const room = roomStore.get(battleId);

  // Verificar batalla existe
  if (!room) {
    return ERROR("La batalla battle_123 no existe o ya finalizó");
  }

  // Verificar pertenencia
  if (!room.players.includes(userId)) {
    return ERROR("No perteneces a esta batalla");
  }

  // Marcar ready
  const allReady = roomStore.setReady(battleId, userId);
  // room.ready = [1]

  // Notificar progreso a ambos
  for (const p of room.players) {
    const socket = userStore.get(p);
    if (socket) {
      socket.send({
        type: "BATTLE_READY_UPDATE",
        player: 1,
        readyState: [1],
        message: "Jugador 1 está listo"
      });
    }
  }

  // Si allReady = false, esperar al otro jugador
}
```

**Estado:**
- `roomStore = { "battle_123" → { players: [1, 2], ready: [1] } }`
- Ambos usuarios ven: `BATTLE_READY_UPDATE (player: 1)`

---

#### **PASO 6: PLAYER_READY (Usuario 2)**

```javascript
// Cliente B envía
{
  "type": "PLAYER_READY",
  "battleId": "battle_123",
  "userId": 2,
  "monsterId": 3
}

// Servidor: ws/battle.js (continuación)
function handlePlayerReady(ws, data) {
  // ... validaciones ...

  const allReady = roomStore.setReady(battleId, userId);
  // room.ready = [1, 2]

  // Notificar progreso
  for (const p of room.players) {
    const socket = userStore.get(p);
    socket.send({
      type: "BATTLE_READY_UPDATE",
      player: 2,
      readyState: [1, 2],
      message: "Jugador 2 está listo"
    });
  }

  // ✅ allReady = true
  if (allReady) {
    // Iniciar batalla
    for (const p of room.players) {
      const socket = userStore.get(p);
      socket.send({
        type: "BATTLE_START",
        battleId,
        message: "¡Que comience la batalla!"
      });
    }
  }
}
```

**Estado Final:**
- `roomStore = { "battle_123" → { players: [1, 2], ready: [1, 2] } }`
- Ambos usuarios ven: `BATTLE_START`
- 🎮 **¡BATALLA INICIADA!**

---

## Flujo de Cache

### GET /api/users (Con Cache)

```
[Cliente]
   ↓
GET /api/users
   ↓
[API: users.js]
   ↓
Buscar en cache
cached = await cache.get("users:all")
   ↓
¿Existe en cache?
   ├─ SÍ → Return cached (1ms)
   └─ NO
      ↓
Query database
SELECT id, email, nickname FROM users
      ↓
Guardar en cache
await cache.set("users:all", users, 300)
(TTL: 5 minutos)
      ↓
Return users
```

### POST /api/users (Invalidación)

```
[Cliente]
   ↓
POST /api/users
{ email, password, nickname }
   ↓
[API: users.js]
   ↓
Validar con Zod
   ↓
Insertar en DB
INSERT INTO users ...
   ↓
Invalidar cache
await cache.del("users:all")
   ↓
Return nuevo usuario
```

**Estrategia:** Cache-Aside + Invalidación proactiva

---

## Flujo de WebSocket

### Anatomía de un Mensaje WebSocket

```
Cliente envía: {"type":"LOGIN","userId":1}
   ↓
[WebSocket Transport Layer]
   ↓
[Elysia WS Handler]
   ↓
handleWsMessage(ws, rawMessage)
   ↓
┌─────────────────────────────┐
│ 1. parseMessage()           │
│    - Detecta si es objeto   │
│    - O parsea JSON string   │
└─────────────────────────────┘
   ↓
¿Parsing exitoso?
   ├─ NO → sendError("Invalid JSON")
   └─ SÍ
      ↓
┌─────────────────────────────┐
│ 2. Extraer type y datos     │
│    const { type, ...data }  │
└─────────────────────────────┘
      ↓
¿Tiene campo type?
   ├─ NO → sendError("Message must include 'type' field")
   └─ SÍ
      ↓
┌─────────────────────────────┐
│ 3. handleEvent(ws, type, data) │
│    - Busca en eventHandlers  │
│    - Map<string, Function>   │
└─────────────────────────────┘
      ↓
¿Handler existe?
   ├─ NO → sendError("Unknown event LOGIN")
   └─ SÍ
      ↓
┌─────────────────────────────┐
│ 4. wsErrorHandler wrapper   │
│    try {                     │
│      handler(ws, data)       │
│    } catch (e) {             │
│      logError + sendError    │
│    }                         │
└─────────────────────────────┘
      ↓
┌─────────────────────────────┐
│ 5. Handler específico       │
│    - handleLogin()           │
│    - handleSendChallenge()   │
│    - handlePlayerReady()     │
└─────────────────────────────┘
      ↓
┌─────────────────────────────┐
│ 6. Validación Zod           │
│    validate(schema, data)    │
└─────────────────────────────┘
      ↓
¿Válido?
   ├─ NO → sendError(validation.error)
   └─ SÍ
      ↓
┌─────────────────────────────┐
│ 7. Lógica de negocio        │
│    - Interactuar con stores  │
│    - Actualizar estado       │
└─────────────────────────────┘
      ↓
┌─────────────────────────────┐
│ 8. Broadcast/Response       │
│    ws.send(JSON.stringify()) │
└─────────────────────────────┘
```

---

## Flujo de Error Handling

### Error en API REST

```
[Cliente]
POST /api/register
{ email: "invalid", password: "123" }
   ↓
[asyncHandler wrapper]
try {
   ↓
[Validación Zod]
registerSchema.parse(body)
   ↓
❌ ZodError: password min 6
} catch (error) {
   ↓
[Error Handler]
logError("API Error", error)
   ↓
Return JSON error
{
  "error": "Contraseña debe tener mínimo 6 caracteres"
}
}
```

### Error en WebSocket

```
[Cliente]
{"type":"LOGIN","userId":"not_a_number"}
   ↓
[wsErrorHandler wrapper]
try {
   ↓
[handleLogin]
   ↓
[Validación Zod]
wsLoginSchema.parse(data)
   ↓
❌ ZodError: userId must be number
} catch (error) {
   ↓
[Error Handler]
logError("WS Handler: LOGIN", error)
   ↓
ws.send({
  type: "ERROR",
  message: "ID de usuario inválido"
})
}
```

### Tipos de Errores

| Tipo | Manejo | Respuesta |
|------|--------|-----------|
| **ValidationError** (Zod) | Capturado en handler | Mensaje específico Zod |
| **BusinessLogicError** | Capturado en handler | Mensaje custom |
| **UnexpectedError** | Capturado en wrapper | "Internal server error" |
| **NetworkError** | No manejado | Connection closed |

---

## Secuencias de Eventos Comunes

### Escenario: Usuario intenta desafiar a alguien offline

```
Usuario A: LOGIN (userId: 1)
   → LOGIN_OK

Usuario A: SEND_CHALLENGE (from: 1, to: 2)
   ↓
Verificar: userStore.get(2) === undefined
   → ERROR "El usuario 2 no está conectado"
```

### Escenario: Usuario intenta conectarse dos veces

```
Usuario A (Sesión 1): LOGIN (userId: 1)
   → LOGIN_OK

Usuario A (Sesión 2): LOGIN (userId: 1)
   ↓
Verificar: existingSocket = userStore.get(1) !== ws
   → ERROR "Este usuario ya está conectado en otra sesión"
```

### Escenario: Jugador marca ready en batalla inexistente

```
Usuario A: PLAYER_READY (battleId: "battle_999", userId: 1)
   ↓
Verificar: room = roomStore.get("battle_999") === undefined
   → ERROR "La batalla battle_999 no existe o ya finalizó"
```

---

## Diagramas de Estado

### Estado de Usuario

```
┌──────────────┐
│ Desconectado │
└──────────────┘
       ↓ WS Connect
┌──────────────┐
│  Conectado   │◄──────┐
│ (sin login)  │       │
└──────────────┘       │
       ↓ LOGIN         │
┌──────────────┐       │
│   Online     │       │
│  (en lobby)  │       │
└──────────────┘       │
       ↓ SEND_CHALLENGE│
┌──────────────┐       │
│  Desafiando  │       │
└──────────────┘       │
       ↓ ACCEPT_CHALLENGE
┌──────────────┐       │
│  En Batalla  │       │
│ (selección)  │       │
└──────────────┘       │
       ↓ PLAYER_READY  │
┌──────────────┐       │
│   Listo      │       │
└──────────────┘       │
       ↓ BATTLE_START  │
┌──────────────┐       │
│  Combatiendo │       │
└──────────────┘       │
       ↓ BATTLE_END    │
       └────────────────┘
```

### Estado de Batalla

```
┌──────────────┐
│   Creada     │
│ ready: []    │
└──────────────┘
       ↓ PLAYER_READY (1)
┌──────────────┐
│ Parcialmente │
│ ready: [1]   │
└──────────────┘
       ↓ PLAYER_READY (2)
┌──────────────┐
│ Todos Listos │
│ ready: [1,2] │
└──────────────┘
       ↓ BATTLE_START
┌──────────────┐
│   Iniciada   │
└──────────────┘
```

---

## Resumen

✅ **Autenticación**: JWT + bcrypt
✅ **Batallas**: Event-driven con WebSockets
✅ **Cache**: Cache-Aside + Invalidación
✅ **Errors**: Wrappers + Logging estructurado
✅ **Estado**: Stores en memoria (userStore, roomStore)
