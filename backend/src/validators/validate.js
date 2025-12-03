/**
 * Valida datos con un schema de Zod
 * @param {import('zod').ZodSchema} schema - Schema de Zod
 * @param {any} data - Datos a validar
 * @returns {{ success: boolean, data?: any, error?: string }}
 */
export function validate(schema, data) {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    // Extraer primer mensaje de error
    const firstError = error.errors?.[0];
    const message = firstError?.message || "Validación falló";
    return { success: false, error: message };
  }
}
