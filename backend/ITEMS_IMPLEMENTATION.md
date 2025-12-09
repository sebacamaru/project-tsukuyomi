# Implementación de Items API

## Objetivo
Migrar el fetch directo a `/src/data/items.json` del frontend a un endpoint REST del backend siguiendo las guidelines del proyecto.

## Estructura a seguir

### 1. Schema de DB (`src/db/schema/items.js`)
- Crear tabla `items` con campos: id, name, price, icon
- Exportar funciones helper: `insertItem`, `getItems`

### 2. Validación (`src/validators/schemas.js`)
- Agregar `createItemSchema` para validar creación de items

### 3. Rutas API (`src/api/items.js`)
- `GET /api/items` - Obtener todos los items con cache
- `POST /api/items` - Crear un item (validado)
- Seguir patrón:
  - Uso de `asyncHandler` para manejo de errores
  - Cache con Redis (5 min TTL)
  - Invalidación de cache al crear
  - Validación con Zod schemas

### 4. Registro de rutas (`src/api/index.js`)
- Importar y registrar `registerItems`

### 5. Frontend (`frontend/src/services/marketplaceService.js`)
- Cambiar `fetch("/src/data/items.json")` a `fetch("/api/items")`

## Datos iniciales (seed)
```json
[
  { "name": "Potion", "price": 50, "icon": "https://via.placeholder.com/64/3498db/ffffff?text=P" },
  { "name": "Elixir", "price": 120, "icon": "https://via.placeholder.com/64/e74c3c/ffffff?text=E" },
  { "name": "Phoenix Down", "price": 500, "icon": "https://via.placeholder.com/64/f39c12/ffffff?text=PD" },
  { "name": "Ether", "price": 150, "icon": "https://via.placeholder.com/64/9b59b6/ffffff?text=ET" }
]
```
