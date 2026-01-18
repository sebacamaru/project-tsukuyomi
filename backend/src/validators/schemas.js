import { z } from "zod";

// ===== AUTH SCHEMAS =====
export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña debe tener mínimo 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

// ===== USER SCHEMAS =====
export const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "Username debe tener mínimo 3 caracteres")
    .max(20, "Username muy largo")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username solo puede contener letras, números y guiones bajos",
    ),
});

// ===== MONSTER SCHEMAS =====
export const createMonsterSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(50, "Nombre muy largo"),
  attack: z
    .number()
    .int()
    .min(1, "Ataque debe ser mayor a 0")
    .max(999, "Ataque máximo: 999"),
  defense: z
    .number()
    .int()
    .min(1, "Defensa debe ser mayor a 0")
    .max(999, "Defensa máxima: 999"),
  ownerId: z.number().int().positive("ID de dueño inválido"),
});

export const userIdParamSchema = z.object({
  userId: z.string().regex(/^\d+$/, "ID debe ser numérico").transform(Number),
});

// ===== ITEM SCHEMAS =====
export const createItemSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(50, "Nombre muy largo"),
  price: z
    .number()
    .int()
    .min(0, "Precio debe ser mayor o igual a 0")
    .max(999999, "Precio máximo: 999999"),
  icon: z.string().url("URL de ícono inválida"),
});

// ===== WEBSOCKET SCHEMAS =====
export const wsLoginSchema = z.object({
  userId: z.number().int().positive("ID de usuario inválido"),
});

export const wsChallengeSchema = z.object({
  from: z.number().int().positive("ID from inválido"),
  to: z.number().int().positive("ID to inválido"),
});

export const wsPlayerReadySchema = z.object({
  battleId: z.string().min(1, "BattleId requerido"),
  userId: z.number().int().positive("ID de usuario inválido"),
  monsterId: z.number().int().positive("ID de monstruo inválido"),
});
