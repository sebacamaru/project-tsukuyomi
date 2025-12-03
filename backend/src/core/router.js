export function createRouter() {
  const routes = new Map();

  function add(method, path, handler) {
    routes.set(`${method}:${path}`, handler);
  }

  return {
    get: (p, h) => add("GET", p, h),
    post: (p, h) => add("POST", p, h),
    put: (p, h) => add("PUT", p, h),
    delete: (p, h) => add("DELETE", p, h),

    async handle(req) {
      const url = new URL(req.url);
      const key = `${req.method}:${url.pathname}`;
      const handler = routes.get(key);
      if (!handler) return null;
      return handler(req);
    },
  };
}
