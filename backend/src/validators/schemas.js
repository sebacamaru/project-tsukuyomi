import { z } from "zod";

// ===== AUTH SCHEMAS =====
export const registerSchema = z.object({
  email: z.string().email("El e-mail introducido no es inválido"),
  password: z.string().min(6, "La contraseña debe tener mínimo 6 caracteres"),
});

export const loginSchema = z.object({
  email: z.string().email("El e-mail introducido no es inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

// ===== USER SCHEMAS =====
export const usernameSchema = z.object({
  username: z
    .string()
    .min(3, "El nombre de usuario debe tener mínimo 3 caracteres")
    .max(20, "Nombre de usuario muy largo")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "El nombre de usuario solo puede contener letras, números y guiones bajos",
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
  name: z
    .string()
    .min(1, "Nombre interno requerido")
    .max(50, "Nombre interno muy largo")
    .regex(
      /^[a-z0-9_]+$/,
      "El nombre interno solo puede contener letras minúsculas, números y guiones bajos",
    ),
  label: z.string().min(1, "Label requerido").max(100, "Label muy largo"),
  description: z.string().max(500, "Descripción muy larga").optional(),
  price: z
    .number()
    .int()
    .min(0, "Precio debe ser mayor o igual a 0")
    .max(999999, "Precio máximo: 999999"),
  icon: z.string().min(1, "Ícono requerido"),
  type: z.enum(["potion", "egg", "misc"]).default("misc"),
  stackable: z.number().int().min(0).max(1).default(1),
  stock: z
    .number()
    .int()
    .min(0, "Stock debe ser mayor o igual a 0")
    .max(999999, "Stock máximo: 999999")
    .nullable()
    .optional(), // null o undefined = ilimitado
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

// ===== CHIGO SPECIES SCHEMAS =====
export const createChigoSpeciesSchema = z.object({
  name: z
    .string()
    .min(1, "Nombre interno requerido")
    .max(50, "Nombre interno muy largo")
    .regex(
      /^[a-z0-9_]+$/,
      "El nombre interno solo puede contener letras minúsculas, números y guiones bajos",
    ),
  label: z.string().min(1, "Label requerido").max(100, "Label muy largo"),
  description: z.string().max(500, "Descripción muy larga").optional(),
  icon: z.string().min(1, "Ícono requerido"),
  element_type: z.string().min(1, "Tipo elemental requerido"),
  base_hp: z
    .number()
    .int()
    .min(1, "HP base debe ser mayor a 0")
    .max(9999, "HP máximo: 9999"),
  base_atk: z
    .number()
    .int()
    .min(1, "ATK base debe ser mayor a 0")
    .max(999, "ATK máximo: 999"),
  base_def: z
    .number()
    .int()
    .min(1, "DEF base debe ser mayor a 0")
    .max(999, "DEF máximo: 999"),
  base_spd: z
    .number()
    .int()
    .min(1, "SPD base debe ser mayor a 0")
    .max(999, "SPD máximo: 999"),
  generation: z
    .number()
    .int()
    .min(1, "Generación debe ser mayor a 0")
    .default(1),
});

// ===== EGG TYPE SCHEMAS =====
export const createEggTypeSchema = z.object({
  name: z
    .string()
    .min(1, "Nombre interno requerido")
    .max(50, "Nombre interno muy largo")
    .regex(
      /^[a-z0-9_]+$/,
      "El nombre interno solo puede contener letras minúsculas, números y guiones bajos",
    ),
  label: z.string().min(1, "Label requerido").max(100, "Label muy largo"),
  description: z.string().max(500, "Descripción muy larga").optional(),
  icon: z.string().min(1, "Ícono requerido"),
  generation: z
    .number()
    .int()
    .min(1, "Generación debe ser mayor a 0")
    .default(1),
  possible_species: z.array(z.number().int().positive()).optional(),
});

// ===== CANDY TYPE SCHEMAS =====
export const createCandyTypeSchema = z.object({
  name: z
    .string()
    .min(1, "Nombre interno requerido")
    .max(50, "Nombre interno muy largo")
    .regex(
      /^[a-z0-9_]+$/,
      "El nombre interno solo puede contener letras minúsculas, números y guiones bajos",
    ),
  label: z.string().min(1, "Label requerido").max(100, "Label muy largo"),
  description: z.string().max(500, "Descripción muy larga").optional(),
  icon: z.string().min(1, "Ícono requerido"),
  stat_affected: z.enum(["hp", "atk", "def", "spd"], {
    errorMap: () => ({ message: "Stat debe ser: hp, atk, def o spd" }),
  }),
  stat_amount: z
    .number()
    .int()
    .min(1, "Cantidad debe ser mayor a 0")
    .max(999, "Cantidad máxima: 999"),
  price: z
    .number()
    .int()
    .min(0, "Precio debe ser mayor o igual a 0")
    .default(0),
});

// ===== STONE TYPE SCHEMAS =====
export const createStoneTypeSchema = z.object({
  name: z
    .string()
    .min(1, "Nombre interno requerido")
    .max(50, "Nombre interno muy largo")
    .regex(
      /^[a-z0-9_]+$/,
      "El nombre interno solo puede contener letras minúsculas, números y guiones bajos",
    ),
  label: z.string().min(1, "Label requerido").max(100, "Label muy largo"),
  description: z.string().max(500, "Descripción muy larga").optional(),
  icon: z.string().min(1, "Ícono requerido"),
  element: z.string().min(1, "Elemento requerido"),
  effect_data: z.record(z.unknown()).optional(),
  price: z
    .number()
    .int()
    .min(0, "Precio debe ser mayor o igual a 0")
    .default(0),
});

// ===== USER CHIGO SCHEMAS =====
export const createUserChigoSchema = z.object({
  species_id: z.number().int().positive("ID de especie inválido"),
  nickname: z.string().max(50, "Nickname muy largo").optional(),
  hp: z.number().int().min(1, "HP debe ser mayor a 0"),
  atk: z.number().int().min(1, "ATK debe ser mayor a 0"),
  def: z.number().int().min(1, "DEF debe ser mayor a 0"),
  spd: z.number().int().min(1, "SPD debe ser mayor a 0"),
});

// ===== USER EGG SCHEMAS =====
export const createUserEggSchema = z.object({
  egg_type_id: z.number().int().positive("ID de tipo de huevo inválido"),
});

export const updateCareParamsSchema = z.object({
  care_params: z.record(z.unknown()),
});

// ===== EQUIP STONE SCHEMA =====
export const equipStoneSchema = z.object({
  chigo_id: z.number().int().positive("ID de chigo inválido"),
  stone_type_id: z.number().int().positive("ID de piedra inválido"),
});

// ===== USE CANDY SCHEMA =====
export const useCandySchema = z.object({
  chigo_id: z.number().int().positive("ID de chigo inválido"),
  candy_type_id: z.number().int().positive("ID de caramelo inválido"),
});
