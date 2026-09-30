import { describe, it, expect, beforeAll } from "vitest";
import {
  checkPasswordHash,
  extractBearerToken,
  hashPassword,
  makeJWT,
  validateJWT,
} from "./auth.js";
import {
  BadRequestError,
  UserNotAuthenticatedError,
} from "./app/api/errors.js";

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

describe("extractBearerToken", () => {
  it("should extract the token from a valid header", () => {
    const token = "mySecretToken";
    const header = `Bearer ${token}`;
    expect(extractBearerToken(header)).toBe(token);
  });

  it("should extract the token even if there are extra parts", () => {
    const token = "mySecretToken";
    const header = `Bearer ${token} extra-data`;
    expect(extractBearerToken(header)).toBe(token);
  });

  it("should throw a BadRequestError if the header does not contain at least two parts", () => {
    const header = "Bearer";
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });

  it('should throw a BadRequestError if the header does not start with "Bearer"', () => {
    const header = "Basic mySecretToken";
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });

  it("should throw a BadRequestError if the header is an empty string", () => {
    const header = "";
    expect(() => extractBearerToken(header)).toThrow(BadRequestError);
  });
});
