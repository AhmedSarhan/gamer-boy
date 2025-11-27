import { config } from "dotenv";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import * as schema from "../src/db/schema";

// Load environment variables from .env file
config();

async function migrate() {
  console.log("Starting data migration from local SQLite to Turso...\n");

  // Check for Turso credentials
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
    console.error("Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set");
    process.exit(1);
  }

  // Connect to local SQLite database
  const localDb = drizzleSqlite(new Database("games.db"), { schema });
  console.log("✓ Connected to local SQLite database");

  // Connect to Turso database
  const tursoDb = drizzleLibsql(
    createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    }),
    { schema }
  );
  console.log("✓ Connected to Turso database\n");

  try {
    // Migrate categories first (no dependencies)
    console.log("Migrating categories...");
    const localCategories = await localDb.select().from(schema.categories);
    if (localCategories.length > 0) {
      await tursoDb.insert(schema.categories).values(localCategories);
      console.log(`✓ Migrated ${localCategories.length} categories`);
    } else {
      console.log("  No categories to migrate");
    }

    // Migrate games (no dependencies)
    console.log("Migrating games...");
    const localGames = await localDb.select().from(schema.games);
    if (localGames.length > 0) {
      await tursoDb.insert(schema.games).values(localGames);
      console.log(`✓ Migrated ${localGames.length} games`);
    } else {
      console.log("  No games to migrate");
    }

    // Migrate game_categories junction table (depends on games and categories)
    console.log("Migrating game-category relationships...");
    const localGameCategories = await localDb
      .select()
      .from(schema.gameCategories);
    if (localGameCategories.length > 0) {
      await tursoDb.insert(schema.gameCategories).values(localGameCategories);
      console.log(
        `✓ Migrated ${localGameCategories.length} game-category relationships`
      );
    } else {
      console.log("  No game-category relationships to migrate");
    }

    // Migrate ratings (depends on games)
    console.log("Migrating ratings...");
    const localRatings = await localDb.select().from(schema.ratings);
    if (localRatings.length > 0) {
      await tursoDb.insert(schema.ratings).values(localRatings);
      console.log(`✓ Migrated ${localRatings.length} ratings`);
    } else {
      console.log("  No ratings to migrate");
    }

    console.log("\n✓ Migration completed successfully!");
  } catch (error) {
    console.error("\n✗ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
