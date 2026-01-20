/**
 * Reemplaza variables en un template HTML
 * Sintaxis: ${{ variable.path }}
 *
 * @param {string} template - HTML string con placeholders
 * @param {object} data - Objeto con los datos a interpolar
 * @returns {string} - HTML con variables reemplazadas
 *
 * @example
 * const html = render(template, {
 *   user: { username: 'Juan', email: 'juan@mail.com' },
 *   stats: { level: 5 }
 * });
 * // ${{ user.username }} → "Juan"
 * // ${{ stats.level }} → "5"
 */
export function render(template, data) {
  return template.replace(/\$\{\{\s*([\w.]+)\s*\}\}/g, (match, path) => {
    const value = path.split(".").reduce((obj, key) => obj?.[key], data);
    return value ?? "";
  });
}
