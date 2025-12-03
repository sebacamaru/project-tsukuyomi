import { z } from "zod";

// ===== AUTH SCHEMAS =====
export const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña debe tener mínimo 6 caracteres"),
  nickname: z.string().min(3, "Nickname debe tener mínimo 3 caracteres").max(20, "Nickname muy largo"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

// ===== USER SCHEMAS =====
export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña debe tener mínimo 6 caracteres"),
  nickname: z.string().min(3, "Nickname debe tener mínimo 3 caracteres").max(20, "Nickname muy largo"),
});

// ===== MONSTER SCHEMAS =====
export const createMonsterSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(50, "Nombre muy largo"),
  attack: z.number().int().min(1, "Ataque debe ser mayor a 0").max(999, "Ataque máximo: 999"),
  defense: z.number().int().min(1, "Defensa debe ser mayor a 0").max(999, "Defensa máxima: 999"),
  ownerId: z.number().int().positive("ID de dueño inválido"),
});

export const userIdParamSchema = z.object({
  userId: z.string().regex(/^\d+$/, "ID debe ser numérico").transform(Number),
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
