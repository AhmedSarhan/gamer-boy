import { chromium } from "playwright";
import { db } from "../src/db/index";
import { categories, games, gameCategories } from "../src/db/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

// Genres from GameDistribution.com API response
const GAME_GENRES = [
  "Casual",
  "Puzzle",
  "Adventure",
  "Dress-up",
  "Racing & Driving",
  "Shooter",
  "Agility",
  "Simulation",
  "Battle",
  "Art",
  "Match-3",
  ".IO",
  "Mahjong & Connect",
  "Strategy",
  "Care",
  "Sports",
  "Cards",
  "Football",
  "Cooking",
  "Bubble Shooter",
  "Educational",
  "Jigsaw",
  "Merge",
  "Boardgames",
  "Basketball",
  "Quiz",
];

interface ScrapedGame {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  gameId: string;
  genres: string[]; // Multiple genres per game
}

const JSON_FILE_PATH = path.join(__dirname, "../src/data/games.json");

/**
 * Load games from JSON file
 */
function loadGamesFromJson(): ScrapedGame[] {
  try {
    if (fs.existsSync(JSON_FILE_PATH)) {
      const data = fs.readFileSync(JSON_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.log("⚠ Could not load games from JSON:", error);
  }
  return [];
}

/**
 * Save games to JSON file
 */
function saveGamesToJson(games: ScrapedGame[]): void {
  try {
    const dir = path.dirname(JSON_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(games, null, 2), "utf-8");
    console.log(`\n💾 Saved ${games.length} games to ${JSON_FILE_PATH}`);
  } catch (error) {
    console.error("⚠ Error saving games to JSON:", error);
  }
}

/**
 * Generate slug from text
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Generate category slug from genre name
 */
function genreToSlug(genre: string): string {
  return generateSlug(genre);
}

/**
 * Guess genres/categories based on game title and description
 * Uses keyword matching to assign likely categories
 */
function guessGenresFromContent(
  title: string,
  description: string,
  href?: string
): string[] {
  const text = `${title} ${description} ${href || ""}`.toLowerCase();
  const foundGenres: string[] = [];

  // Comprehensive keyword matching for genres
  const genreKeywords: Record<string, string[]> = {
    Puzzle: [
      "puzzle",
      "match",
      "connect",
      "mahjong",
      "sudoku",
      "brain",
      "logic",
      "jigsaw",
      "crossword",
      "word",
      "trivia",
      "quiz",
    ],
    Adventure: [
      "adventure",
      "quest",
      "explore",
      "journey",
      "story",
      "narrative",
      "rpg",
      "role",
      "fantasy",
      "magic",
    ],
    Racing: [
      "racing",
      "race",
      "drive",
      "car",
      "speed",
      "drift",
      "vehicle",
      "motor",
      "bike",
      "bicycle",
    ],
    Shooter: [
      "shoot",
      "gun",
      "bullet",
      "war",
      "combat",
      "battle",
      "fps",
      "weapon",
      "zombie",
      "sniper",
    ],
    Strategy: [
      "strategy",
      "tower",
      "defense",
      "tactical",
      "tactics",
      "plan",
      "empire",
      "kingdom",
      "civilization",
      "chess",
    ],
    Sports: [
      "sport",
      "ball",
      "soccer",
      "football",
      "basketball",
      "tennis",
      "golf",
      "baseball",
      "hockey",
      "volleyball",
    ],
    Casual: ["casual", "fun", "easy", "simple", "relax", "chill", "idle"],
    Battle: ["battle", "fight", "arena", "versus", "vs", "pvp", "combat"],
    Simulation: [
      "simulation",
      "sim",
      "life",
      "manage",
      "tycoon",
      "city",
      "farm",
      "business",
    ],
    Arcade: [
      "arcade",
      "classic",
      "retro",
      "vintage",
      "old",
      "nostalgia",
      "8-bit",
    ],
    Action: [
      "action",
      "adrenaline",
      "fast",
      "quick",
      "intense",
      "thriller",
      "exciting",
    ],
    Cooking: [
      "cooking",
      "cook",
      "chef",
      "kitchen",
      "recipe",
      "food",
      "restaurant",
      "bakery",
    ],
    DressUp: [
      "dress",
      "fashion",
      "style",
      "makeup",
      "beauty",
      "outfit",
      "clothes",
      "wardrobe",
    ],
    Educational: [
      "educational",
      "learn",
      "teach",
      "school",
      "study",
      "education",
      "kids",
      "children",
    ],
    Card: ["card", "cards", "poker", "blackjack", "solitaire", "deck"],
    Board: ["board", "boardgame", "monopoly", "checkers", "backgammon"],
    Bubble: ["bubble", "pop", "shooter", "match-3"],
    IO: [".io", "io game", "multiplayer", "online"],
  };

  // Check each genre
  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      if (!foundGenres.includes(genre)) {
        foundGenres.push(genre);
      }
    }
  }

  // Also check URL for category hints
  if (href) {
    const urlLower = href.toLowerCase();
    if (urlLower.includes("/puzzle")) foundGenres.push("Puzzle");
    if (urlLower.includes("/action")) foundGenres.push("Action");
    if (urlLower.includes("/adventure")) foundGenres.push("Adventure");
    if (urlLower.includes("/racing")) foundGenres.push("Racing");
    if (urlLower.includes("/sports")) foundGenres.push("Sports");
    if (urlLower.includes("/strategy")) foundGenres.push("Strategy");
    if (urlLower.includes("/arcade")) foundGenres.push("Arcade");
    if (urlLower.includes("/casual")) foundGenres.push("Casual");
  }

  // Remove duplicates
  return [...new Set(foundGenres)];
}

async function scrapeGameDistributionGames(
  useJsonFallback: boolean = true
): Promise<void> {
  console.log("🚀 Starting game scraping from GameDistribution.com...\n");

  // Try to load from JSON first if fallback is enabled
  if (useJsonFallback) {
    const existingGames = loadGamesFromJson();
    if (existingGames.length > 0) {
      console.log(
        `📂 Found ${existingGames.length} games in JSON file. Use --fresh flag to scrape new data.\n`
      );
      console.log("💾 Loading games from JSON into database...");
      await insertGamesIntoDatabase(existingGames);
      return;
    }
  }

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });

  const scrapedGames: ScrapedGame[] = [];
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  try {
    console.log("\n🎮 Scraping games from GameDistribution.com...");

    await page.goto("https://gamedistribution.com/games", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    console.log("  ✓ Page loaded, waiting for content...");
    await page.waitForTimeout(3000);

    // Scroll down to load more games
    console.log("  📜 Scrolling to load more games...");
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(1000);
    }

    console.log("  🔍 Extracting game data...");

    // Extract games from the page
    const gameData = await page.evaluate(() => {
      const games: Array<{
        title: string;
        description: string;
        thumbnail: string;
        gameId: string;
        href: string;
        categories: string[];
      }> = [];

      // Try to find all image elements with gamedistribution.com thumbnails
      const images = document.querySelectorAll(
        'img[src*="gamedistribution.com"]'
      );

      images.forEach((img) => {
        const src = img.getAttribute("src");
        if (!src) return;

        // Extract game ID from thumbnail
        const idMatch = src.match(/\/([a-f0-9]{32})-(\d+x\d+)/);
        if (!idMatch) return;

        const gameId = idMatch[1];

        // Try to find parent link
        const link = img.closest("a");
        const href = link?.getAttribute("href") || "";

        // Skip if not a game link
        if (!href.includes("/games/")) return;

        // Try to find title
        let title = "";
        const titleEl =
          link?.querySelector(
            "h1, h2, h3, h4, [class*='title'], [class*='name']"
          ) || link;
        if (titleEl) {
          title = titleEl.textContent?.trim() || "";
        }

        // Use alt text as fallback
        if (!title) {
          title = img.getAttribute("alt") || "";
        }

        // Skip if no valid title
        if (!title || title.length < 3 || title.length > 100) return;

        // Skip if title contains unwanted patterns
        if (
          title.includes("GamesShow More") ||
          title.includes("Show More") ||
          title.match(/^\d+\s*Games/) ||
          (title.includes("games") && title.includes("show"))
        ) {
          return;
        }

        // Try to find description
        let description = "";
        const descEl = link?.querySelector("p, [class*='desc']");
        if (descEl) {
          description = descEl.textContent?.trim() || "";
        }

        if (!description) {
          description = "A fun HTML5 game";
        }

        // Extract categories/genres from the game element
        const categories: string[] = [];

        // Try to find category badges, tags, or genre elements
        const categoryElements = link?.querySelectorAll(
          ".category, .genre, .tag, [data-category], [data-genre], .badge, [class*='category'], [class*='genre']"
        );

        categoryElements?.forEach((catEl: Element) => {
          const catText = catEl.textContent?.trim();
          if (catText && catText.length > 0 && catText.length < 50) {
            categories.push(catText.toLowerCase());
          }
        });

        // Also check data attributes
        const dataCategory = link?.getAttribute("data-category");
        if (dataCategory) {
          categories.push(dataCategory.toLowerCase());
        }

        const dataGenre = link?.getAttribute("data-genre");
        if (dataGenre) {
          categories.push(dataGenre.toLowerCase());
        }

        games.push({
          title: title.trim(),
          description: description.substring(0, 300),
          thumbnail: src,
          gameId,
          href,
          categories,
        });
      });

      return games;
    });

    console.log(`  ✓ Found ${gameData.length} potential games`);

    // Process games
    for (const game of gameData) {
      if (scrapedGames.length >= 100) {
        break;
      }

      // Skip duplicates
      if (seenIds.has(game.gameId)) {
        continue;
      }

      const slug = generateSlug(game.title);

      // Skip if slug already seen
      if (seenSlugs.has(slug)) {
        continue;
      }

      // Extract categories from scraped game data (already extracted from page)
      let categorySlugs = (game.categories || []).map((cat) =>
        generateSlug(cat)
      );

      // If no categories found, use genre guessing as fallback
      if (categorySlugs.length === 0) {
        const guessedGenres = guessGenresFromContent(
          game.title,
          game.description,
          game.href
        );
        categorySlugs = guessedGenres.map((genre) => generateSlug(genre));
      }

      // Ensure at least one category (default to Casual)
      if (categorySlugs.length === 0) {
        categorySlugs = ["casual"];
      }

      const genres = categorySlugs;

      seenIds.add(game.gameId);
      seenSlugs.add(slug);

      scrapedGames.push({
        title: game.title,
        slug,
        description: game.description,
        thumbnail: game.thumbnail,
        gameId: game.gameId,
        genres,
      });

      if (scrapedGames.length % 10 === 0) {
        console.log(`  ✓ Collected ${scrapedGames.length}/100 games`);
      }
    }

    // If we don't have enough games, try loading more
    if (scrapedGames.length < 100) {
      console.log(
        `\n  ⚠ Only found ${scrapedGames.length} games. Scrolling more...`
      );

      for (let i = 0; i < 20; i++) {
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await page.waitForTimeout(500);

        // Re-extract games periodically
        if (i % 5 === 0) {
          const newGameData = await page.evaluate(() => {
            const games: Array<{
              title: string;
              description: string;
              thumbnail: string;
              gameId: string;
              href: string;
              categories: string[];
            }> = [];

            const images = document.querySelectorAll(
              'img[src*="gamedistribution.com"]'
            );

            images.forEach((img) => {
              const src = img.getAttribute("src");
              if (!src) return;

              const idMatch = src.match(/\/([a-f0-9]{32})-(\d+x\d+)/);
              if (!idMatch) return;

              const gameId = idMatch[1];
              const link = img.closest("a");
              const href = link?.getAttribute("href") || "";

              if (!href.includes("/games/")) return;

              let title = "";
              const titleEl =
                link?.querySelector(
                  "h1, h2, h3, h4, [class*='title'], [class*='name']"
                ) || link;
              if (titleEl) {
                title = titleEl.textContent?.trim() || "";
              }

              if (!title) {
                title = img.getAttribute("alt") || "";
              }

              if (
                !title ||
                title.length < 3 ||
                title.length > 100 ||
                title.includes("GamesShow More") ||
                title.includes("Show More") ||
                title.match(/^\d+\s*Games/)
              ) {
                return;
              }

              let description = "";
              const descEl = link?.querySelector("p, [class*='desc']");
              if (descEl) {
                description = descEl.textContent?.trim() || "";
              }

              if (!description) {
                description = "A fun HTML5 game";
              }

              // Extract categories/genres from the game element
              const categories: string[] = [];

              // Try to find category badges, tags, or genre elements
              const categoryElements = link?.querySelectorAll(
                ".category, .genre, .tag, [data-category], [data-genre], .badge, [class*='category'], [class*='genre']"
              );
              categoryElements?.forEach((catEl) => {
                const catText = catEl.textContent?.trim();
                if (catText && catText.length > 0 && catText.length < 50) {
                  categories.push(catText.toLowerCase());
                }
              });

              // Also check data attributes
              const dataCategory = link?.getAttribute("data-category");
              if (dataCategory) {
                categories.push(dataCategory.toLowerCase());
              }

              const dataGenre = link?.getAttribute("data-genre");
              if (dataGenre) {
                categories.push(dataGenre.toLowerCase());
              }

              games.push({
                title: title.trim(),
                description: description.substring(0, 300),
                thumbnail: src,
                gameId,
                href,
                categories: categories.length > 0 ? categories : [],
              });
            });

            return games;
          });

          // Add new games
          for (const game of newGameData) {
            if (scrapedGames.length >= 100) {
              break;
            }

            if (seenIds.has(game.gameId)) {
              continue;
            }

            const slug = generateSlug(game.title);
            if (seenSlugs.has(slug)) {
              continue;
            }

            // Use categories already extracted from game data
            let categorySlugs = (game.categories || []).map((cat: string) =>
              generateSlug(cat)
            );

            // If no categories found, use genre guessing as fallback
            if (categorySlugs.length === 0) {
              const guessedGenres = guessGenresFromContent(
                game.title,
                game.description,
                game.href
              );
              categorySlugs = guessedGenres.map((genre) => generateSlug(genre));
            }

            // Ensure at least one category (default to Casual)
            if (categorySlugs.length === 0) {
              categorySlugs = ["casual"];
            }

            const genres = categorySlugs;

            seenIds.add(game.gameId);
            seenSlugs.add(slug);

            scrapedGames.push({
              title: game.title,
              slug,
              description: game.description,
              thumbnail: game.thumbnail,
              gameId: game.gameId,
              genres,
            });

            if (scrapedGames.length % 10 === 0) {
              console.log(`  ✓ Collected ${scrapedGames.length}/100 games`);
            }
          }

          if (scrapedGames.length >= 100) {
            break;
          }
        }
      }
    }

    if (scrapedGames.length === 0) {
      throw new Error(
        "No games found. Please check the GameDistribution.com structure."
      );
    }

    console.log(`\n📊 Scraped ${scrapedGames.length} unique games`);

    // Save to JSON file
    saveGamesToJson(scrapedGames);

    // Insert into database
    await insertGamesIntoDatabase(scrapedGames);
  } catch (error) {
    console.error("\n❌ Error during scraping:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Insert games into database
 */
async function insertGamesIntoDatabase(
  scrapedGames: ScrapedGame[]
): Promise<void> {
  const categoryMap = new Map<string, number>();

  // Collect all unique category slugs from scraped games
  const allCategorySlugs = new Set<string>();
  scrapedGames.forEach((game) => {
    game.genres.forEach((genreSlug) => {
      if (genreSlug) {
        allCategorySlugs.add(genreSlug);
      }
    });
  });

  // Also add predefined genres as fallback
  GAME_GENRES.forEach((genre) => {
    allCategorySlugs.add(genreToSlug(genre));
  });

  // Create all categories dynamically
  console.log("\n📁 Processing categories...");
  for (const categorySlug of allCategorySlugs) {
    try {
      const existing = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .limit(1);

      if (existing.length > 0) {
        categoryMap.set(categorySlug, existing[0].id);
      } else {
        // Generate category name from slug (capitalize first letter of each word)
        const categoryName = categorySlug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        const result = await db
          .insert(categories)
          .values({
            name: categoryName,
            slug: categorySlug,
          })
          .returning();

        categoryMap.set(categorySlug, result[0].id);
        console.log(`  ✓ Category: ${categoryName} (${categorySlug})`);
      }
    } catch (error) {
      console.log(`  ⚠ Error creating category ${categorySlug}:`, error);
    }
  }

  // Insert games and their category relationships
  console.log(`\n💾 Inserting ${scrapedGames.length} games into database...`);

  for (let i = 0; i < scrapedGames.length; i++) {
    const game = scrapedGames[i];
    try {
      const existingGame = await db
        .select()
        .from(games)
        .where(eq(games.slug, game.slug))
        .limit(1);

      let gameDbId: number;

      if (existingGame.length > 0) {
        gameDbId = existingGame[0].id;
        await db
          .update(games)
          .set({
            title: game.title,
            description: game.description,
            thumbnail: game.thumbnail,
            gameId: game.gameId,
            updatedAt: new Date(),
          })
          .where(eq(games.id, gameDbId));
      } else {
        const result = await db
          .insert(games)
          .values({
            title: game.title,
            slug: game.slug,
            description: game.description,
            thumbnail: game.thumbnail,
            gameId: game.gameId,
          })
          .returning();
        gameDbId = result[0].id;
      }

      // Delete existing category relationships
      await db
        .delete(gameCategories)
        .where(eq(gameCategories.gameId, gameDbId));

      // Insert new category relationships
      // game.genres already contains slugs, not genre names
      for (const genreSlug of game.genres) {
        const catId = categoryMap.get(genreSlug);
        if (catId) {
          try {
            await db.insert(gameCategories).values({
              gameId: gameDbId,
              categoryId: catId,
            });
          } catch {
            // Relationship might already exist, skip silently
          }
        } else {
          console.log(
            `    ⚠ Category "${genreSlug}" not found in categoryMap for game "${game.title}"`
          );
        }
      }
    } catch (error) {
      console.error(`  ✗ Error inserting game "${game.title}":`, error);
    }

    if ((i + 1) % 10 === 0) {
      console.log(`  ✓ Processed ${i + 1}/${scrapedGames.length} games`);
    }
  }

  // Display summary
  const totalGames = await db.select().from(games);
  const totalCategories = await db.select().from(categories);
  const totalRelations = await db.select().from(gameCategories);
  console.log("\n📊 Database Summary:");
  console.log(`  Categories: ${totalCategories.length}`);
  console.log(`  Games: ${totalGames.length}`);
  console.log(`  Game-Category relationships: ${totalRelations.length}`);
}

// Parse command line arguments
const args = process.argv.slice(2);
const useFresh = args.includes("--fresh");

// Run the scraper
scrapeGameDistributionGames(!useFresh)
  .then(() => {
    console.log("\n🎉 All done! Run 'npm run db:studio' to view the database.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
