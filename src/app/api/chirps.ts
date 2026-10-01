import type { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import {
  BadRequestError,
  NotFoundError,
  UserForbiddenError,
} from "./errors.js";
import {
  createChirp,
  deleteChirp,
  getChirp,
  getChirps,
} from "../../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../../auth.js";
import { config } from "../../config.js";

export async function handlerCreateChirp(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  const params: parameters = req.body;

  const token = getBearerToken(req);
  const userId = validateJWT(token, config.jwt.secret);

  const cleaned = validateChirp(params.body);
  const chirp = await createChirp({ body: cleaned, userId: userId });

  respondWithJSON(res, 201, chirp);
}

function validateChirp(body: string) {
  const maxChirpLength = 140;
  if (body.length > maxChirpLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxChirpLength}`,
    );
  }

  const badWords = ["kerfuffle", "sharbert", "fornax"];
  return getCleanedBody(body, badWords);
}

function getCleanedBody(body: string, badWords: string[]) {
  const words = body.split(" ");

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const loweredWord = word.toLowerCase();
    if (badWords.includes(loweredWord)) {
      words[i] = "****";
    }
  }

  const cleaned = words.join(" ");
  return cleaned;
}

export async function handlerGetAllChirps(req: Request, res: Response) {
  let authorId = "";
  let authorIdQuery = req.query.authorId;
  if (typeof authorIdQuery === "string") {
    authorId = authorIdQuery;
  }

  const chirps = await getChirps(authorId);

  respondWithJSON(res, 200, chirps);
}

export async function handlerGetChirp(req: Request, res: Response) {
  const { chirpId } = req.params;

  if (typeof chirpId !== "string") {
    throw new BadRequestError("Invalid chirp ID");
  }

  const chirp = await getChirp(chirpId);
  if (!chirp) {
    throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
  }

  respondWithJSON(res, 200, chirp);
}

export async function handlerDeleteChirp(req: Request, res: Response) {
  const { chirpId } = req.params;

  if (typeof chirpId !== "string") {
    throw new BadRequestError("Invalid chirp ID");
  }

  const accessToken = getBearerToken(req);
  const userId = validateJWT(accessToken, config.jwt.secret);

  const chirp = await getChirp(chirpId);
  if (!chirp) {
    throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);
  }

  if (chirp.userId !== userId) {
    throw new UserForbiddenError("You can't delete this chirp");
  }

  const deleted = await deleteChirp(chirpId);
  if (!deleted) {
    throw new Error(`Failed to delete chirp with chirpIp: ${chirpId}`);
  }

  res.status(204).send();
}
