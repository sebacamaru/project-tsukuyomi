/**
 * Asset Registry - Resuelve URLs de assets en build time
 * Usa import.meta.glob para auto-discovery de imágenes
 */

const imageModules = import.meta.glob(
  ["../assets/images/*.{png,jpg,jpeg,svg,gif,webp}", "../assets/sprites/*.{png,jpg,jpeg,svg,gif,webp}"],
  { eager: true, import: "default" }
);

// Crear mapa: nombre de archivo -> URL resuelta por Vite
const assets = {};
for (const path in imageModules) {
  const filename = path.split("/").pop();
  assets[filename] = imageModules[path];
}

/**
 * Obtiene la URL resuelta de un asset por nombre
 * @param {string} name - Nombre del archivo (ej: 'sprite-egg.png')
 * @returns {string|null} - URL resuelta o null si no existe
 */
export function getAssetUrl(name) {
  if (!name) return null;
  return assets[name] || null;
}

/**
 * Verifica si un asset existe en el registry
 * @param {string} name - Nombre del archivo
 * @returns {boolean}
 */
export function hasAsset(name) {
  return name in assets;
}

export { assets };
