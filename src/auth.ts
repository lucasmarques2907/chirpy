import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { UserNotAuthenticatedError } from "./app/api/errors.js";

const TOKEN_ISSUER = "chirpy";

export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export function checkPasswordHash(
  password: string,
  hash: string,
): Promise<boolean> {
  return argon2.verify(hash, password);
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(
  userId: string,
  expiresIn: number,
  secret: string,
): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + expiresIn;
  const token = jwt.sign(
    {
      iss: TOKEN_ISSUER,
      sub: userId,
      iat: issuedAt,
      exp: expiresAt,
    } satisfies payload,
    secret,
    { algorithm: "HS256" },
  );

  return token;
}

export function validateJWT(tokenString: string, secret: string): string {
  let decoded: payload;

  try {
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (e) {
    throw new UserNotAuthenticatedError("Invalid token");
  }

  if (decoded.iss !== TOKEN_ISSUER) {
    throw new UserNotAuthenticatedError("Invalid issuer");
  }

  if (!decoded.sub) {
    throw new UserNotAuthenticatedError("No user ID in token");
  }

  return decoded.sub;
}
