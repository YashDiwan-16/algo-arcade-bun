import { os } from "@orpc/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { env } from "@/env";
import { generateObject } from "ai";
import { aiModel } from "@/ai/config";

// AI Game Generation: Create a new AI-generated game
const createAIGame = os
  .input(
    z.object({
      description: z
        .string()
        .min(10, "Description must be at least 10 characters"),
    })
  )
  .output(
    z.object({
      id: z.string(),
      title: z.string(),
      code: z.string(),
      description: z.string(),
      createdAt: z.coerce.date(),
    })
  )
  .route({
    method: "POST",
    path: "/ai/create",
  })
  .handler(async ({ input }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized: Must be logged in to create AI games");
    }

    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const gamesCollection = db.collection("aiGames");

    // Generate game code using Google Gemini AI with structured output
    const gameId = `game_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const systemPrompt = `You are an expert HTML5 Canvas game developer specializing in creating beautiful, polished, and engaging browser games. Your games are known for:

VISUAL EXCELLENCE:
- Modern, clean UI design with smooth animations
- Beautiful color schemes and gradients
- Professional typography and layouts
- Particle effects and visual feedback
- Smooth transitions and polished interactions

TECHNICAL QUALITY:
- Optimized game loops with requestAnimationFrame
- Responsive controls (keyboard, mouse, touch)
- Clean, maintainable code structure
- Proper collision detection and physics
- Memory-efficient resource management

GAME DESIGN:
- Clear visual feedback for all interactions
- Intuitive UI with instructions
- Progressive difficulty curves
- Score systems and achievements
- Game over screens with replay functionality

USER EXPERIENCE:
- Mobile-responsive design
- Loading states and error handling
- Accessibility considerations
- Clear win/lose conditions
- Engaging gameplay mechanics`;

    const { object: gameData } = await generateObject({
      model: aiModel,
      schema: z.object({
        title: z
          .string()
          .describe(
            "A catchy, descriptive title for the game (max 50 characters)"
          ),
        html: z
          .string()
          .describe(
            "Complete HTML5 game code including all HTML, CSS, and JavaScript in a single file"
          ),
      }),
      prompt: `${systemPrompt}

Generate a COMPLETE, FULLY FUNCTIONAL, and BEAUTIFUL HTML5 canvas game based on this description:

"${input.description}"

CRITICAL REQUIREMENTS:
1. Create a complete HTML document with <!DOCTYPE html>
2. Include all necessary HTML, CSS, and JavaScript in a single file
3. Use HTML5 Canvas for graphics - draw shapes using canvas drawing methods (fillRect, arc, beginPath, etc.)
4. DO NOT use Image() objects or base64 data URIs - draw all graphics using canvas drawing commands
5. DO NOT include any external resources or data URIs
6. Implement smooth game loop with requestAnimationFrame
7. Add responsive keyboard/mouse controls
8. Include HUD elements (score, health, instructions)
9. Use beautiful colors, gradients, and animations
10. Add particle effects where appropriate
11. Implement game over/win screens with restart functionality
12. Center canvas with elegant dark background
13. Add smooth transitions and visual feedback
14. Include a professional UI with clear instructions
15. Make the game feel polished and complete
16. Use single quotes in JavaScript strings
17. DO NOT write comments or commentaded code

IMPORTANT: Draw all game entities (player, enemies, platforms, coins, etc.) using canvas drawing methods like fillRect(), arc(), fill(), stroke(), etc. NO IMAGES OR DATA URIS.

Generate a catchy, descriptive title and the complete game code.`,
      temperature: 0.7,
      maxRetries: 3,
    });

    const newGame = {
      id: gameId,
      userId: session.user.id,
      title: gameData.title,
      description: input.description,
      code: gameData.html,
      versions: [],
      currentVersion: 0,
      published: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await gamesCollection.insertOne(newGame);

    return {
      id: newGame.id,
      title: newGame.title,
      code: newGame.code,
      description: newGame.description,
      createdAt: newGame.createdAt,
    };
  });

// AI Game: Get a specific game by ID
const getAIGame = os
  .input(
    z.object({
      id: z.string(),
    })
  )
  .output(
    z.object({
      id: z.string(),
      title: z.string(),
      code: z.string(),
      description: z.string(),
      versions: z.array(
        z.object({
          version: z.number(),
          code: z.string(),
          prompt: z.string(),
          createdAt: z.coerce.date(),
        })
      ),
      currentVersion: z.number(),
      published: z.boolean(),
      userId: z.string(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
    })
  )
  .route({
    method: "GET",
    path: "/ai/game",
  })
  .handler(async ({ input }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const gamesCollection = db.collection("aiGames");

    const game = await gamesCollection.findOne({ id: input.id });

    if (!game) {
      throw new Error("Game not found");
    }

    // Check if user owns this game
    if (game.userId !== session.user.id) {
      throw new Error("Forbidden: You don't own this game");
    }

    return {
      id: game.id,
      title: game.title,
      code: game.code,
      description: game.description,
      versions: game.versions || [],
      currentVersion: game.currentVersion || 0,
      published: game.published || false,
      userId: game.userId,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    };
  });

// AI Game: Update game with AI improvements
const improveAIGame = os
  .input(
    z.object({
      id: z.string(),
      prompt: z.string().min(1, "Prompt is required"),
    })
  )
  .output(
    z.object({
      id: z.string(),
      code: z.string(),
      version: z.number(),
    })
  )
  .route({
    method: "POST",
    path: "/ai/improve",
  })
  .handler(async ({ input }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const gamesCollection = db.collection("aiGames");

    const game = await gamesCollection.findOne({ id: input.id });

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.userId !== session.user.id) {
      throw new Error("Forbidden");
    }

    // Use AI SDK to improve the code based on prompt with structured output
    const systemPrompt = `You are an expert HTML5 Canvas game developer specializing in creating beautiful, polished, and engaging browser games. When improving games, you focus on:

VISUAL IMPROVEMENTS:
- Enhanced animations and smooth transitions
- Better color schemes and gradients
- Improved UI/UX design
- Added particle effects and visual feedback
- Professional polish and attention to detail

TECHNICAL IMPROVEMENTS:
- Performance optimizations
- Better code structure and maintainability
- Enhanced game mechanics
- Improved collision detection
- Memory efficiency

GAMEPLAY IMPROVEMENTS:
- Balanced difficulty
- Better feedback systems
- Enhanced controls and responsiveness
- More engaging mechanics
- Quality of life improvements`;

    const { object: gameImprovement } = await generateObject({
      model: aiModel,
      schema: z.object({
        html: z
          .string()
          .describe(
            "Complete improved HTML5 game code with all requested changes implemented"
          ),
      }),
      prompt: `${systemPrompt}

USER REQUEST: "${input.prompt}"

CURRENT GAME CODE:
${game.code}

CRITICAL INSTRUCTIONS:
1. Carefully implement the user's requested improvements
2. Maintain all existing functionality unless explicitly asked to change it
3. Keep the game fully functional and playable
4. Enhance visual polish and user experience
5. Ensure code remains clean and well-structured
6. Add smooth transitions for any new features
7. Test logic carefully to avoid breaking the game
8. Maintain the canvas size and overall structure
9. Use single quotes in JavaScript strings
10. DO NOT add Image() objects or base64 data URIs - use canvas drawing commands only (fillRect, arc, etc.)
11. DO NOT include any external resources or data URIs
12. Draw all graphics using canvas drawing methods
13. DO NOT write comments or commented code

Generate the complete improved HTML code.`,
      temperature: 0.7,
      maxRetries: 3,
    });

    const improvedCode = gameImprovement.html;

    const newVersion = (game.currentVersion || 0) + 1;
    const versionEntry = {
      version: newVersion,
      code: improvedCode,
      prompt: input.prompt,
      createdAt: new Date(),
    };

    await gamesCollection.updateOne(
      { id: input.id },
      {
        $set: {
          code: improvedCode,
          currentVersion: newVersion,
          updatedAt: new Date(),
        },
        $push: {
          versions: versionEntry,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      }
    );

    return {
      id: input.id,
      code: improvedCode,
      version: newVersion,
    };
  });

// AI Game: Restore a previous version
const restoreAIGameVersion = os
  .input(
    z.object({
      id: z.string(),
      version: z.number(),
    })
  )
  .output(
    z.object({
      id: z.string(),
      code: z.string(),
      version: z.number(),
    })
  )
  .route({
    method: "POST",
    path: "/ai/restore-version",
  })
  .handler(async ({ input }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const gamesCollection = db.collection("aiGames");

    const game = await gamesCollection.findOne({ id: input.id });

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.userId !== session.user.id) {
      throw new Error("Forbidden");
    }

    const versions = game.versions || [];
    const targetVersion = versions.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (v: any) => v.version === input.version
    );

    if (!targetVersion) {
      throw new Error("Version not found");
    }

    await gamesCollection.updateOne(
      { id: input.id },
      {
        $set: {
          code: targetVersion.code,
          currentVersion: input.version,
          updatedAt: new Date(),
        },
      }
    );

    return {
      id: input.id,
      code: targetVersion.code,
      version: input.version,
    };
  });

// AI Game: Publish game to arena
const publishAIGame = os
  .input(
    z.object({
      id: z.string(),
      title: z.string().min(1, "Title is required"),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      id: z.string(),
    })
  )
  .route({
    method: "POST",
    path: "/ai/publish",
  })
  .handler(async ({ input }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const gamesCollection = db.collection("aiGames");

    const game = await gamesCollection.findOne({ id: input.id });

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.userId !== session.user.id) {
      throw new Error("Forbidden");
    }

    await gamesCollection.updateOne(
      { id: input.id },
      {
        $set: {
          published: true,
          title: input.title,
          publishedAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    return {
      success: true,
      id: input.id,
    };
  });

// AI Game: Get user's recent game generations
const getUserRecentGames = os
  .input(
    z.object({
      limit: z.number().int().positive().optional().default(5),
    })
  )
  .output(
    z.object({
      games: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          createdAt: z.coerce.date(),
        })
      ),
    })
  )
  .route({
    method: "GET",
    path: "/ai/recent",
  })
  .handler(async ({ input }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { games: [] };
    }

    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const gamesCollection = db.collection("aiGames");

    const games = await gamesCollection
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(input.limit)
      .project({ id: 1, title: 1, createdAt: 1 })
      .toArray();

    return {
      games: games.map((game) => ({
        id: game.id,
        title: game.title,
        createdAt: game.createdAt,
      })),
    };
  });

// AI Game: Get all user's games with full details
const getAllUserGames = os
  .input(
    z.object({
      limit: z.number().int().positive().optional().default(1000),
    })
  )
  .output(
    z.object({
      games: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          published: z.boolean(),
          currentVersion: z.number(),
          createdAt: z.coerce.date(),
          updatedAt: z.coerce.date(),
        })
      ),
    })
  )
  .route({
    method: "GET",
    path: "/ai/all",
  })
  .handler(async ({ input }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return { games: [] };
    }

    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const gamesCollection = db.collection("aiGames");

    const games = await gamesCollection
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(input.limit)
      .project({
        id: 1,
        title: 1,
        description: 1,
        published: 1,
        currentVersion: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .toArray();

    return {
      games: games.map((game) => ({
        id: game.id,
        title: game.title,
        description: game.description || "",
        published: game.published || false,
        currentVersion: game.currentVersion || 0,
        createdAt: game.createdAt,
        updatedAt: game.updatedAt,
      })),
    };
  });

// AI Game: Delete a game
const deleteAIGame = os
  .input(
    z.object({
      id: z.string(),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      id: z.string(),
    })
  )
  .route({
    method: "DELETE",
    path: "/ai/delete",
  })
  .handler(async ({ input }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized: Must be logged in to delete games");
    }

    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const gamesCollection = db.collection("aiGames");

    // Find the game first to verify ownership
    const game = await gamesCollection.findOne({ id: input.id });

    if (!game) {
      throw new Error("Game not found");
    }

    // Check if user owns this game
    if (game.userId !== session.user.id) {
      throw new Error("Forbidden: You don't own this game");
    }

    // Delete the game
    await gamesCollection.deleteOne({ id: input.id });

    return {
      success: true,
      id: input.id,
    };
  });

export const aiRouter = os.router({
  create: createAIGame,
  get: getAIGame,
  improve: improveAIGame,
  restoreVersion: restoreAIGameVersion,
  publish: publishAIGame,
  recentGames: getUserRecentGames,
  allGames: getAllUserGames,
  delete: deleteAIGame,
});
