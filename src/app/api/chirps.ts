import type { Request, Response } from "express";
import { respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";
import { createChirp } from "../../db/queries/chirps.js";

export async function handlerCreateChirp(req: Request, res: Response) {
  type parameters = {
    body: string;
    userId: string;
  };

  const params: parameters = req.body;

  if (!params.body || !params.userId) {
    throw new BadRequestError("Missing required fields");
  }

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const words = params.body.split(" ");

  const badWords = ["kerfuffle", "sharbert", "fornax"];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (badWords.includes(word.toLowerCase())) {
      words[i] = "****";
    }
  }

  const cleanedBody = words.join(" ");

  const chirp = await createChirp({ body: cleanedBody, userId: params.userId });

  if (!chirp) {
    throw new Error("Could not create chirp");
  }

  respondWithJSON(res, 201, {
    body: chirp.body,
    userId: chirp.userId,
  });
}
