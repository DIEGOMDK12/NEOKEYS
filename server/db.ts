import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL or NEON_DATABASE_URL must be set.",
  );
}

const client = new pg.Client({ connectionString: databaseUrl });
client.connect().catch(err => {
  console.error("Failed to connect to database:", err);
});

export const db = drizzle(client, { schema });
