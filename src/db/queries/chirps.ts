import { db } from "../index.js";
import { newChirp, chirps } from "../schema.js";

export async function createChirp(chirp: newChirp) {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}
