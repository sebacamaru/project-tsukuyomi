import { jwt as elysiaJWT } from "@elysiajs/jwt";

export function jwtPlugin() {
  return elysiaJWT({
    name: "jwt",
    secret: process.env.JWT_SECRET,
    exp: process.env.JWT_EXP,
  });
}
