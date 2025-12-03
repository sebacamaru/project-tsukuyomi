# 🧪 Testing de WebSockets

Guía completa para probar los WebSockets de Tsukuyomi.

## 🚀 Iniciar el Servidor

Primero, asegúrate de que el servidor backend esté corriendo:

```bash
cd backend
bun run dev
```

El servidor debería iniciar en: `http://localhost:3000`

---

## Opción 1: Cliente HTML Visual 🎨

### ¿Qué es?
Un cliente WebSocket interactivo en el navegador con interfaz gráfica.

### Cómo usar:

1. **Abrir el archivo:**
   - Abre `backend/test-ws-client.html` en tu navegador
   - O arrastra el archivo al navegador

2. **Conectar:**
   - El campo URL ya tiene `ws://localhost:3000/ws` por defecto
   - Click en "Conectar"
   - Deberías ver "✅ Conexión establecida" en los logs

3. **Probar eventos:**
   - **LOGIN (userId: 1)** - Simula login del usuario 1
   - **LOGIN (userId: 2)** - Simula login del usuario 2
   - **DESAFÍO 1 → 2** - Usuario 1 desafía a usuario 2
   - **ACEPTAR DESAFÍO** - Acepta un desafío
   - **PLAYER READY** - Marca jugador listo
   - **❌ JSON Inválido** - Prueba error de parsing
   - **❌ Evento Desconocido** - Prueba evento no registrado
   - **❌ Datos Inválidos** - Prueba validación Zod

4. **Mensaje personalizado:**
   - Escribe tu propio JSON en el campo de texto
   - Ejemplo: `{"type":"LOGIN","userId":5}`
   - Click "Enviar" o presiona Enter

### Características:
- ✅ Logs en tiempo real con colores
- ✅ Ver mensajes enviados y recibidos
- ✅ Timestamp en cada log
- ✅ Botones de acción rápida
- ✅ Estado de conexión visible
- ✅ Limpiar logs

---

## Opción 2: Script de Node.js Automatizado 🤖

### ¿Qué es?
Suite de tests automatizada que prueba todos los flujos de WebSocket.

### Cómo usar:

1. **Instalar WebSocket (si no tienes):**
   ```bash
   npm install ws
   ```

2. **Ejecutar tests:**
   ```bash
   cd backend
   node test-ws.js
   ```

### Tests incluidos:

#### Test 1: Flujo Básico
- ✅ Conexión exitosa
- ✅ LOGIN con userId válido
- ❌ JSON inválido (debe dar error)
- ❌ Evento desconocido (debe dar error)

#### Test 2: Flujo de Desafío
- ✅ Dos clientes conectados
- ✅ Ambos hacen LOGIN
- ✅ Cliente1 desafía a Cliente2
- ✅ Cliente2 acepta el desafío
- ✅ Ambos marcan PLAYER_READY
- ✅ Batalla comienza

#### Test 3: Validación de Datos
- ❌ LOGIN con userId string (debe fallar)
- ❌ LOGIN sin userId (debe fallar)
- ❌ SEND_CHALLENGE con from negativo (debe fallar)
- ❌ PLAYER_READY sin monsterId (debe fallar)

### Salida esperada:
```
🌙 ============================================
     TSUKUYOMI - WebSocket Test Suite
============================================

=== TEST 1: Flujo Básico ===
[HH:MM:SS] Conectando Cliente1...
[HH:MM:SS] ✅ Cliente1 conectado
[HH:MM:SS] 📤 Cliente1 envió: {"type":"LOGIN","userId":1}
[HH:MM:SS] 📥 Cliente1 recibió: {"type":"WS_CONNECTED"}
[HH:MM:SS] 📥 Cliente1 recibió: {"type":"LOGIN_OK","userId":1}
...
```

---

## Opción 3: Usando `wscat` (CLI) 💻

### Instalar wscat:
```bash
npm install -g wscat
```

### Conectar:
```bash
wscat -c ws://localhost:3000/ws
```

### Enviar mensajes:
```
> {"type":"LOGIN","userId":1}
< {"type":"WS_CONNECTED"}
< {"type":"LOGIN_OK","userId":1}

> {"type":"SEND_CHALLENGE","from":1,"to":2}
< {"type":"USER_OFFLINE","to":2}
```

---

## Opción 4: Postman 📮

1. **Abrir Postman**
2. **New → WebSocket Request**
3. **URL:** `ws://localhost:3000/ws`
4. **Connect**
5. **Enviar mensajes:**
   ```json
   {"type":"LOGIN","userId":1}
   ```

---

## 📋 Eventos Disponibles

### LOGIN
Registra un usuario en el userStore.

**Enviar:**
```json
{
  "type": "LOGIN",
  "userId": 1
}
```

**Recibir:**
```json
{
  "type": "LOGIN_OK",
  "userId": 1
}
```

---

### SEND_CHALLENGE
Un usuario desafía a otro.

**Enviar:**
```json
{
  "type": "SEND_CHALLENGE",
  "from": 1,
  "to": 2
}
```

**Recibir (destinatario):**
```json
{
  "type": "CHALLENGE_RECEIVED",
  "from": 1
}
```

**Error si usuario offline:**
```json
{
  "type": "USER_OFFLINE",
  "to": 2
}
```

---

### ACCEPT_CHALLENGE
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
  "battleId": "battle_1234567890"
}
```

---

### PLAYER_READY
Marca un jugador como listo en una batalla.

**Enviar:**
```json
{
  "type": "PLAYER_READY",
  "battleId": "battle_1234567890",
  "userId": 1,
  "monsterId": 5
}
```

**Recibir (ambos jugadores):**
```json
{
  "type": "BATTLE_READY_UPDATE",
  "player": 1,
  "readyState": [1]
}
```

**Cuando ambos listos:**
```json
{
  "type": "BATTLE_START",
  "battleId": "battle_1234567890"
}
```

---

## ❌ Errores Comunes

### JSON Inválido
**Enviar:** `{ esto no es json }`

**Recibir:**
```json
{
  "type": "ERROR",
  "message": "Invalid JSON"
}
```

---

### Evento Desconocido
**Enviar:**
```json
{
  "type": "EVENTO_QUE_NO_EXISTE"
}
```

**Recibir:**
```json
{
  "type": "ERROR",
  "message": "Unknown event EVENTO_QUE_NO_EXISTE"
}
```

---

### Validación Fallida (Zod)
**Enviar:**
```json
{
  "type": "LOGIN",
  "userId": "not_a_number"
}
```

**Recibir:**
```json
{
  "type": "ERROR",
  "message": "ID de usuario inválido"
}
```

---

## 🔍 Debugging

### Ver logs del servidor:
Los logs del servidor aparecen en la consola donde ejecutaste `bun run dev`:

```
[HH:MM:SS] ✔ WS conectado
[HH:MM:SS] WS: LOGIN (user: 1)
[HH:MM:SS] WS: SEND_CHALLENGE (user: 1)
```

### Verificar cache de Redis:
```bash
redis-cli
> KEYS *
> GET "users:all"
```

### Verificar base de datos:
```bash
sqlite3 backend/src/db/database.db
sqlite> SELECT * FROM users;
sqlite> SELECT * FROM monsters;
```

---

## 🎯 Flujo de Prueba Completo

### 1. Preparación
```bash
# Terminal 1: Iniciar backend
cd backend
bun run dev

# Terminal 2: Iniciar Redis (si no está corriendo)
docker-compose up -d redis
```

### 2. Abrir Cliente HTML
- Abre `backend/test-ws-client.html`
- Click "Conectar"

### 3. Probar Login
- Click "LOGIN (userId: 1)"
- Deberías ver:
  - 📤 Mensaje enviado
  - 📥 `WS_CONNECTED`
  - 📥 `LOGIN_OK`

### 4. Probar Desafío (necesitas 2 ventanas)
**Ventana 1:**
- LOGIN con userId: 1

**Ventana 2:**
- LOGIN con userId: 2

**Ventana 1:**
- DESAFÍO 1 → 2

**Ventana 2:**
- Verás `CHALLENGE_RECEIVED`
- ACEPTAR DESAFÍO

**Ambas ventanas:**
- Verán `CHALLENGE_ACCEPTED` con battleId

### 5. Probar Errores
- Click "❌ JSON Inválido"
- Click "❌ Evento Desconocido"
- Click "❌ Datos Inválidos"

Todos deberían devolver mensajes de error apropiados.

---

## 📊 Checklist de Testing

- [ ] Servidor backend corriendo
- [ ] Redis corriendo (opcional para cache)
- [ ] Cliente HTML conecta exitosamente
- [ ] LOGIN funciona correctamente
- [ ] SEND_CHALLENGE envía mensaje
- [ ] ACCEPT_CHALLENGE crea batalla
- [ ] PLAYER_READY actualiza estado
- [ ] JSON inválido devuelve error
- [ ] Evento desconocido devuelve error
- [ ] Validación Zod rechaza datos inválidos
- [ ] Logs aparecen en consola del servidor
- [ ] Múltiples clientes pueden conectarse

---

## 🐛 Troubleshooting

### "Error: connect ECONNREFUSED"
- El servidor no está corriendo
- Solución: `cd backend && bun run dev`

### "WebSocket connection failed"
- URL incorrecta
- Solución: Verifica que sea `ws://localhost:3000/ws`

### "USER_OFFLINE" al enviar desafío
- El usuario destino no ha hecho LOGIN
- Solución: Ambos usuarios deben hacer LOGIN primero

### Eventos no funcionan
- Verifica los logs del servidor
- Asegúrate de que el JSON sea válido
- Verifica que los tipos de datos sean correctos (números, no strings)

---

## 🎉 ¡Listo!

Ahora puedes probar todos los WebSockets de Tsukuyomi fácilmente.

**Recomendación:** Empieza con el cliente HTML para familiarizarte, luego usa el script automatizado para regression testing.
