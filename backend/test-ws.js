#!/usr/bin/env node

/**
 * Script de prueba para WebSockets de Tsukuyomi
 * Ejecutar: node test-ws.js
 */

const WebSocket = require('ws');

const WS_URL = 'ws://localhost:3000/ws';
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${COLORS.gray}[${timestamp}]${COLORS.reset} ${COLORS[color]}${message}${COLORS.reset}`);
}

function createClient(name) {
  return new Promise((resolve, reject) => {
    log(`Conectando ${name}...`, 'cyan');
    const ws = new WebSocket(WS_URL);

    ws.on('open', () => {
      log(`✅ ${name} conectado`, 'green');
      resolve(ws);
    });

    ws.on('error', (error) => {
      log(`❌ ${name} error: ${error.message}`, 'red');
      reject(error);
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);
        log(`📥 ${name} recibió: ${JSON.stringify(msg)}`, 'yellow');
      } catch {
        log(`📥 ${name} recibió (raw): ${data}`, 'yellow');
      }
    });

    ws.on('close', () => {
      log(`🔌 ${name} desconectado`, 'gray');
    });
  });
}

function send(ws, name, data) {
  const message = JSON.stringify(data);
  ws.send(message);
  log(`📤 ${name} envió: ${message}`, 'cyan');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testBasicFlow() {
  log('\n=== TEST 1: Flujo Básico ===', 'bright');

  try {
    const client1 = await createClient('Cliente1');
    await sleep(500);

    // Test LOGIN
    send(client1, 'Cliente1', { type: 'LOGIN', userId: 1 });
    await sleep(500);

    // Test JSON inválido
    log('\n--- Probando JSON inválido ---', 'bright');
    client1.send('{ invalid json }');
    await sleep(500);

    // Test evento desconocido
    log('\n--- Probando evento desconocido ---', 'bright');
    send(client1, 'Cliente1', { type: 'EVENTO_INEXISTENTE', data: 'test' });
    await sleep(500);

    client1.close();
    await sleep(1000);

    log('\n✅ Test 1 completado\n', 'green');
  } catch (error) {
    log(`❌ Test 1 falló: ${error.message}`, 'red');
  }
}

async function testChallengeFlow() {
  log('\n=== TEST 2: Flujo de Desafío ===', 'bright');

  try {
    // Conectar dos clientes
    const client1 = await createClient('Cliente1');
    await sleep(500);
    const client2 = await createClient('Cliente2');
    await sleep(500);

    // Ambos hacen login
    log('\n--- Login de ambos clientes ---', 'bright');
    send(client1, 'Cliente1', { type: 'LOGIN', userId: 1 });
    send(client2, 'Cliente2', { type: 'LOGIN', userId: 2 });
    await sleep(1000);

    // Cliente1 desafía a Cliente2
    log('\n--- Cliente1 desafía a Cliente2 ---', 'bright');
    send(client1, 'Cliente1', { type: 'SEND_CHALLENGE', from: 1, to: 2 });
    await sleep(1000);

    // Cliente2 acepta el desafío
    log('\n--- Cliente2 acepta el desafío ---', 'bright');
    send(client2, 'Cliente2', { type: 'ACCEPT_CHALLENGE', from: 1, to: 2 });
    await sleep(1000);

    // Ambos marcan ready
    log('\n--- Ambos clientes marcan ready ---', 'bright');
    const battleId = 'battle_' + Date.now();
    send(client1, 'Cliente1', { type: 'PLAYER_READY', battleId, userId: 1, monsterId: 1 });
    await sleep(500);
    send(client2, 'Cliente2', { type: 'PLAYER_READY', battleId, userId: 2, monsterId: 2 });
    await sleep(1000);

    client1.close();
    client2.close();
    await sleep(1000);

    log('\n✅ Test 2 completado\n', 'green');
  } catch (error) {
    log(`❌ Test 2 falló: ${error.message}`, 'red');
  }
}

async function testValidation() {
  log('\n=== TEST 3: Validación de Datos ===', 'bright');

  try {
    const client = await createClient('TestClient');
    await sleep(500);

    // Test LOGIN con userId inválido
    log('\n--- LOGIN con userId inválido (string) ---', 'bright');
    send(client, 'TestClient', { type: 'LOGIN', userId: 'not_a_number' });
    await sleep(500);

    // Test LOGIN sin userId
    log('\n--- LOGIN sin userId ---', 'bright');
    send(client, 'TestClient', { type: 'LOGIN' });
    await sleep(500);

    // Test SEND_CHALLENGE con datos inválidos
    log('\n--- SEND_CHALLENGE con from negativo ---', 'bright');
    send(client, 'TestClient', { type: 'SEND_CHALLENGE', from: -1, to: 2 });
    await sleep(500);

    // Test PLAYER_READY con monsterId faltante
    log('\n--- PLAYER_READY sin monsterId ---', 'bright');
    send(client, 'TestClient', { type: 'PLAYER_READY', battleId: 'test', userId: 1 });
    await sleep(500);

    client.close();
    await sleep(1000);

    log('\n✅ Test 3 completado\n', 'green');
  } catch (error) {
    log(`❌ Test 3 falló: ${error.message}`, 'red');
  }
}

async function runAllTests() {
  log('\n🌙 ============================================', 'bright');
  log('     TSUKUYOMI - WebSocket Test Suite', 'bright');
  log('============================================\n', 'bright');

  await testBasicFlow();
  await testChallengeFlow();
  await testValidation();

  log('\n🎉 Todos los tests completados!', 'green');
  log('============================================\n', 'bright');

  process.exit(0);
}

// Manejar errores no capturados
process.on('unhandledRejection', (error) => {
  log(`❌ Error no manejado: ${error.message}`, 'red');
  process.exit(1);
});

// Ejecutar tests
runAllTests();
