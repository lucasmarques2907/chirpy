import { describe, it, expect, beforeAll } from "vitest";
import {
  checkPasswordHash,
  hashPassword,
  makeJWT,
  validateJWT,
} from "./auth.js";
import { UserNotAuthenticatedError } from "./app/api/errors.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for the incorrect password", async () => {
    const result = await checkPasswordHash(password2, hash1);
    expect(result).toBe(false);
  });
});

describe("JWT Functions", () => {
  const secret = "secret";
  const wrongSecret = "wrong_secret";
  const userId = "some-unique-user-id";
  let validToken: string;

  beforeAll(() => {
    validToken = makeJWT(userId, 3600, secret);
  });

  it("should be a valid token", () => {
    const result = validateJWT(validToken, secret);
    expect(result).toBe(userId);
  });

  it("should throw an error for an invalid token string", () => {
    expect(() => validateJWT("invalid.token.string", secret)).toThrow(
      UserNotAuthenticatedError,
    );
  });

  it("should throw an error when the token is signed with a wrong secret", () => {
    expect(() => validateJWT(validToken, wrongSecret)).toThrow(
      UserNotAuthenticatedError,
    );
  });
});
