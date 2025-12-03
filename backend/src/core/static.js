import { staticPlugin } from "@elysiajs/static";

export function staticFiles() {
  return staticPlugin({
    assets: "../frontend/dist",
    prefix: "/",
    fallback: "index.html", // importante para SPA routing
    alwaysStatic: true, // no intenta match de rutas antes
  });
}
