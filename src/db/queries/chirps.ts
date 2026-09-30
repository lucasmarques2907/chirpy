import { asc } from "drizzle-orm";
import { db } from "../index.js";
import { newChirp, chirps } from "../schema.js";

export async function createChirp(chirp: newChirp) {
  const [rows] = await db.insert(chirps).values(chirp).returning();
  return rows;
}

export async function getChirps() {
  const rows = await db.select().from(chirps).orderBy(asc(chirps.createdAt));
  return rows;
}
