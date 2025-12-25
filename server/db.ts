import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const databaseUrl = "postgresql://neondb_owner:npg_fEj5aSPtOu6c@ep-soft-tree-a4ryrpv3-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set.",
  );
}

const client = new pg.Pool({ 
  connectionString: databaseUrl,
});

export const db = drizzle(client, { schema });
