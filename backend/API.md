# 📡 API Reference - Tsukuyomi Backend

## Base URL

```
http://localhost:3000
```

---

## 🔐 Autenticación

### POST /api/register

Registra un nuevo usuario en el sistema.

**Request:**
```json
POST /api/register
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "securepass123",
  "nickname": "DragonSlayer"
}
```

**Response: 201 Created**
```json
{
  "id": 1,
  "email": "player@example.com",
  "nickname": "DragonSlayer",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 400 | Email ya registrado |
| 400 | Validación fallida (Zod) |

**Validación:**
- `email`: Debe ser email válido
- `password`: Mínimo 6 caracteres
- `nickname`: Entre 3 y 20 caracteres

---

### POST /api/login

Autentica un usuario existente.

**Request:**
```json
POST /api/login
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "securepass123"
}
```

**Response: 200 OK**
```json
{
  "id": 1,
  "email": "player@example.com",
  "nickname": "DragonSlayer",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 401 | Credenciales inválidas |
| 400 | Validación fallida |

---

## 👥 Usuarios

### GET /api/users

Obtiene lista de todos los usuarios (sin passwords).

**Request:**
```bash
GET /api/users
```

**Response: 200 OK**
```json
[
  {
    "id": 1,
    "email": "player1@example.com",
    "nickname": "DragonSlayer"
  },
  {
    "id": 2,
    "email": "player2@example.com",
    "nickname": "ShadowMage"
  }
]
```

**Cache:**
- ✅ Cacheado en Redis por 5 minutos
- Key: `users:all`
- Invalidado al crear/actualizar/borrar usuarios

---

### GET /api/users/:id

Obtiene un usuario específico por ID.

**Request:**
```bash
GET /api/users/1
```

**Response: 200 OK**
```json
{
  "id": 1,
  "email": "player1@example.com",
  "nickname": "DragonSlayer"
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 404 | Usuario no encontrado |

**Cache:**
- ✅ Cacheado en Redis por 5 minutos
- Key: `user:{id}`

---

### PUT /api/users/:id

Actualiza un usuario existente.

**Request:**
```json
PUT /api/users/1
Content-Type: application/json

{
  "email": "newemail@example.com",
  "nickname": "NewNickname"
}
```

**Response: 200 OK**
```json
{
  "id": 1,
  "email": "newemail@example.com",
  "nickname": "NewNickname"
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 404 | Usuario no encontrado |
| 400 | Email ya en uso |
| 400 | Validación fallida |

**Cache Invalidation:**
- Invalida `users:all`
- Invalida `user:{id}`

---

### DELETE /api/users/:id

Elimina un usuario del sistema.

**Request:**
```bash
DELETE /api/users/1
```

**Response: 200 OK**
```json
{
  "message": "User deleted successfully"
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 404 | Usuario no encontrado |

**Cache Invalidation:**
- Invalida `users:all`
- Invalida `user:{id}`

---

## 🐉 Monstruos

### GET /api/monsters

Obtiene lista de todos los monstruos disponibles.

**Request:**
```bash
GET /api/monsters
```

**Response: 200 OK**
```json
[
  {
    "id": 1,
    "name": "Dragón de Fuego",
    "type": "fire",
    "hp": 120,
    "attack": 85,
    "defense": 70,
    "speed": 60
  },
  {
    "id": 2,
    "name": "Serpiente de Agua",
    "type": "water",
    "hp": 100,
    "attack": 65,
    "defense": 90,
    "speed": 75
  }
]
```

**Cache:**
- ✅ Cacheado en Redis por 5 minutos
- Key: `monsters:all`

---

### GET /api/monsters/:id

Obtiene un monstruo específico por ID.

**Request:**
```bash
GET /api/monsters/1
```

**Response: 200 OK**
```json
{
  "id": 1,
  "name": "Dragón de Fuego",
  "type": "fire",
  "hp": 120,
  "attack": 85,
  "defense": 70,
  "speed": 60
}
```

**Errores:**

| Código | Descripción |
|--------|-------------|
| 404 | Monstruo no encontrado |

**Cache:**
- ✅ Cacheado en Redis por 5 minutos
- Key: `monster:{id}`

---

## 🌐 WebSocket API

### Conexión WebSocket

**URL:**
```
ws://localhost:3000/ws
```

**Ejemplo:**
```javascript
const ws = new WebSocket("ws://localhost:3000/ws");

ws.onopen = () => {
  console.log("Conectado");
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Recibido:", data);
};
```

---

### Eventos WebSocket

Todos los mensajes deben tener un campo `type`:

```json
{
  "type": "EVENT_NAME",
  ...otherFields
}
```

---

### 1. LOGIN

Autentica al usuario en WebSocket y lo añade al userStore.

**Enviar:**
```json
{
  "type": "LOGIN",
  "userId": 1
}
```

**Recibir (éxito):**
```json
{
  "type": "LOGIN_OK",
  "userId": 1,
  "message": "Bienvenido, usuario 1"
}
```

**Recibir (error - ya conectado):**
```json
{
  "type": "ERROR",
  "message": "Este usuario ya está conectado en otra sesión"
}
```

**Validación:**
- `userId` debe ser un número entero positivo

---

### 2. SEND_CHALLENGE

Envía un desafío a otro usuario.

**Enviar:**
```json
{
  "type": "SEND_CHALLENGE",
  "from": 1,
  "to": 2
}
```

**Recibir (remitente):**
```json
{
  "type": "CHALLENGE_SENT",
  "to": 2,
  "message": "Desafío enviado exitosamente"
}
```

**Recibir (destinatario):**
```json
{
  "type": "CHALLENGE_RECEIVED",
  "from": 1
}
```

**Recibir (error - usuario offline):**
```json
{
  "type": "ERROR",
  "message": "El usuario 2 no está conectado"
}
```

**Validación:**
- `from`: número entero positivo
- `to`: número entero positivo

---

### 3. ACCEPT_CHALLENGE

Acepta un desafío y crea una batalla.

**Enviar:**
```json
{
  "type": "ACCEPT_CHALLENGE",
  "from": 1,
  "to": 2
}
```

**Recibir (ambos jugadores):**
```json
{
  "type": "CHALLENGE_ACCEPTED",
  "battleId": "battle_1733163845123",
  "message": "¡Batalla creada! Selecciona tu monstruo"
}
```

**Recibir (error - usuario offline):**
```json
{
  "type": "ERROR",
  "message": "El usuario 1 ya no está conectado"
}
```

**Validación:**
- `from`: número entero positivo
- `to`: número entero positivo

---

### 4. PLAYER_READY

Marca al jugador como listo en una batalla.

**Enviar:**
```json
{
  "type": "PLAYER_READY",
  "battleId": "battle_1733163845123",
  "userId": 1,
  "monsterId": 5
}
```

**Recibir (ambos jugadores - progreso):**
```json
{
  "type": "BATTLE_READY_UPDATE",
  "player": 1,
  "readyState": [1],
  "message": "Jugador 1 está listo"
}
```

**Recibir (ambos jugadores - cuando todos listos):**
```json
{
  "type": "BATTLE_START",
  "battleId": "battle_1733163845123",
  "message": "¡Que comience la batalla!"
}
```

**Recibir (error - batalla no existe):**
```json
{
  "type": "ERROR",
  "message": "La batalla battle_xxx no existe o ya finalizó"
}
```

**Recibir (error - no pertenece a la batalla):**
```json
{
  "type": "ERROR",
  "message": "No perteneces a esta batalla"
}
```

**Validación:**
- `battleId`: string no vacío
- `userId`: número entero positivo
- `monsterId`: número entero positivo

---

## 📊 Códigos de Estado HTTP

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Validación fallida o datos inválidos |
| 401 | Unauthorized | Credenciales inválidas |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error inesperado del servidor |

---

## 🔒 Autenticación JWT

### Obtener Token

Los tokens se obtienen mediante:
- `POST /api/register`
- `POST /api/login`

### Usar Token

Para endpoints protegidos (futuro):

```bash
GET /api/protected
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Estructura del Token

```json
{
  "id": 1,
  "iat": 1733163845,
  "exp": 1733250245
}
```

---

## 💾 Cache Strategy

### Endpoints Cacheados

| Endpoint | Key Redis | TTL |
|----------|-----------|-----|
| GET /api/users | `users:all` | 5 min |
| GET /api/users/:id | `user:{id}` | 5 min |
| GET /api/monsters | `monsters:all` | 5 min |
| GET /api/monsters/:id | `monster:{id}` | 5 min |

### Invalidación

Cache se invalida automáticamente en:
- POST (creación)
- PUT (actualización)
- DELETE (eliminación)

**Ejemplo:**
```javascript
// POST /api/users
await cache.del("users:all"); // Invalidar lista

// PUT /api/users/1
await cache.del("users:all");
await cache.del("user:1"); // Invalidar específico
```

---

## 🧪 Testing

### Probar API REST con curl

**Register:**
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","nickname":"Tester"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

**Get Users:**
```bash
curl http://localhost:3000/api/users
```

### Probar WebSocket

Ver [TESTING_WEBSOCKETS.md](./TESTING_WEBSOCKETS.md) para guía completa.

**Opción 1: Cliente HTML**
```bash
open frontend/dist/test-ws-client.html
```

**Opción 2: Script Node.js**
```bash
node test-ws.js
```

**Opción 3: wscat**
```bash
wscat -c ws://localhost:3000/ws
> {"type":"LOGIN","userId":1}
```

---

## 📝 Ejemplos de Uso

### Flujo Completo: Registro → Login → Batalla

**1. Registrar dos usuarios**
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"player1@test.com","password":"123456","nickname":"Player1"}'

curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"player2@test.com","password":"123456","nickname":"Player2"}'
```

**2. Conectar ambos usuarios por WebSocket**
```javascript
// Cliente 1
const ws1 = new WebSocket("ws://localhost:3000/ws");
ws1.send(JSON.stringify({ type: "LOGIN", userId: 1 }));

// Cliente 2
const ws2 = new WebSocket("ws://localhost:3000/ws");
ws2.send(JSON.stringify({ type: "LOGIN", userId: 2 }));
```

**3. Usuario 1 desafía a Usuario 2**
```javascript
ws1.send(JSON.stringify({
  type: "SEND_CHALLENGE",
  from: 1,
  to: 2
}));
```

**4. Usuario 2 acepta el desafío**
```javascript
ws2.send(JSON.stringify({
  type: "ACCEPT_CHALLENGE",
  from: 1,
  to: 2
}));
```

**5. Ambos marcan ready**
```javascript
ws1.send(JSON.stringify({
  type: "PLAYER_READY",
  battleId: "battle_1733163845123",
  userId: 1,
  monsterId: 5
}));

ws2.send(JSON.stringify({
  type: "PLAYER_READY",
  battleId: "battle_1733163845123",
  userId: 2,
  monsterId: 3
}));
```

**6. ¡Batalla comienza!**
```javascript
// Ambos reciben:
{
  "type": "BATTLE_START",
  "battleId": "battle_1733163845123",
  "message": "¡Que comience la batalla!"
}
```

---

## 🚀 Rate Limits

⚠️ **Actualmente no implementado**

Futura implementación planeada:
- API REST: 100 requests/minuto por IP
- WebSocket: 50 eventos/minuto por usuario

---

## 📚 Ver También

- [ARQUITECTURA.md](./ARQUITECTURA.md) - Arquitectura general
- [FLUJOS.md](./FLUJOS.md) - Flujos detallados
- [TESTING_WEBSOCKETS.md](./TESTING_WEBSOCKETS.md) - Guía de testing
- [src/ws/README.md](./src/ws/README.md) - Arquitectura WebSocket
