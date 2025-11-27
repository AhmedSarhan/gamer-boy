import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Use Turso in production (when environment variables are set)
// Otherwise fall back to local SQLite for development
const useTurso =
  process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN;

export const db = useTurso
  ? drizzleLibsql(
      createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
      }),
      { schema }
    )
  : drizzleSqlite(new Database("games.db"), { schema });
