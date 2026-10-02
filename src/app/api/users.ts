import type { Request, Response } from "express";
import { createUser, updateUser } from "../../db/queries/users.js";
import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError } from "./errors.js";
import { getBearerToken, hashPassword, validateJWT } from "../../auth.js";
import { NewUser } from "../../db/schema.js";
import { config } from "../../config.js";

export type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerCreateUser(req: Request, res: Response) {
  type parameters = {
    email: string;
    password: string;
  };
  const params: parameters = req.body;

  if (!params.password || !params.email) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassword = await hashPassword(params.password);

  const user = await createUser({
    email: params.email,
    hashedPassword: hashedPassword,
  } satisfies NewUser);

  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isChirpyRed: user.isChirpyRed,
  } satisfies UserResponse);
}

export async function handlerUpdateUser(req: Request, res: Response) {
  const accessToken = getBearerToken(req);

  type parameters = {
    email: string;
    password: string;
  };

  const params: parameters = req.body;

  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassword = await hashPassword(params.password);

  const userId = validateJWT(accessToken, config.jwt.secret);
  const user = await updateUser(userId, params.email, hashedPassword);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  respondWithJSON(res, 200, {
    id: userId,
    email: params.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isChirpyRed: user.isChirpyRed,
  } satisfies UserResponse);
}
