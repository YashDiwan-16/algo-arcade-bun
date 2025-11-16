import { os } from "@orpc/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { env } from "@/env";

// Game Stats: Update or create user game stats
const updateGameStats = os
  .input(
    z.object({
      gameType: z.enum(["head-soccer", "rock-paper-scissor", "showdown"]),
      playerWon: z.boolean(),
      tie: z.boolean().optional(),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      stats: z.object({
        playerWins: z.number(),
        aiWins: z.number(),
        ties: z.number(),
        totalPlays: z.number(),
      }),
    })
  )
  .route({
    method: "POST",
    path: "/game-stats/update",
  })
  .handler(async ({ input }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized: Must be logged in to track stats");
    }

    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const statsCollection = db.collection("gameStats");

    const now = new Date();
    const userId = session.user.id;

    // Find existing stats
    const existingStats = await statsCollection.findOne({
      userId,
      gameType: input.gameType,
    });

    let updatedStats;

    if (existingStats) {
      // Update existing stats
      const update = {
        $inc: {
          totalPlays: 1,
          ...(input.playerWon ? { playerWins: 1 } : {}),
          ...(!input.playerWon && !input.tie ? { aiWins: 1 } : {}),
          ...(input.tie ? { ties: 1 } : {}),
        },
        $set: {
          lastPlayedAt: now,
          updatedAt: now,
        },
      };

      await statsCollection.updateOne(
        { userId, gameType: input.gameType },
        update
      );

      updatedStats = {
        playerWins: existingStats.playerWins + (input.playerWon ? 1 : 0),
        aiWins: existingStats.aiWins + (!input.playerWon && !input.tie ? 1 : 0),
        ties: (existingStats.ties || 0) + (input.tie ? 1 : 0),
        totalPlays: existingStats.totalPlays + 1,
      };
    } else {
      // Create new stats
      const newStats = {
        userId,
        gameType: input.gameType,
        playerWins: input.playerWon ? 1 : 0,
        aiWins: !input.playerWon && !input.tie ? 1 : 0,
        ties: input.tie ? 1 : 0,
        totalPlays: 1,
        lastPlayedAt: now,
        createdAt: now,
        updatedAt: now,
      };

      await statsCollection.insertOne(newStats);
      updatedStats = {
        playerWins: newStats.playerWins,
        aiWins: newStats.aiWins,
        ties: newStats.ties,
        totalPlays: newStats.totalPlays,
      };
    }

    return {
      success: true,
      stats: updatedStats,
    };
  });

// Game Stats: Get user's stats for a specific game
const getUserGameStats = os
  .input(
    z.object({
      gameType: z.enum(["head-soccer", "rock-paper-scissor", "showdown"]),
    })
  )
  .output(
    z.object({
      playerWins: z.number(),
      aiWins: z.number(),
      ties: z.number(),
      totalPlays: z.number(),
      winRate: z.number(),
    })
  )
  .route({
    method: "GET",
    path: "/game-stats/user",
  })
  .handler(async ({ input }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        playerWins: 0,
        aiWins: 0,
        ties: 0,
        totalPlays: 0,
        winRate: 0,
      };
    }

    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const statsCollection = db.collection("gameStats");

    const stats = await statsCollection.findOne({
      userId: session.user.id,
      gameType: input.gameType,
    });

    if (!stats) {
      return {
        playerWins: 0,
        aiWins: 0,
        ties: 0,
        totalPlays: 0,
        winRate: 0,
      };
    }

    const winRate =
      stats.totalPlays > 0 ? (stats.playerWins / stats.totalPlays) * 100 : 0;

    return {
      playerWins: stats.playerWins || 0,
      aiWins: stats.aiWins || 0,
      ties: stats.ties || 0,
      totalPlays: stats.totalPlays || 0,
      winRate: Math.round(winRate * 100) / 100,
    };
  });

// Score-based Game Stats: Update or create score-based game stats (Slither, Endless Runner, Paaji)
const updateScoreGameStats = os
  .input(
    z.object({
      gameType: z.enum(["slither", "endless-runner", "paaji"]),
      score: z.number().min(0),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      stats: z.object({
        highScore: z.number(),
        totalPlays: z.number(),
        totalScore: z.number(),
        averageScore: z.number(),
        isNewHighScore: z.boolean(),
      }),
    })
  )
  .route({
    method: "POST",
    path: "/game-stats/update-score",
  })
  .handler(async ({ input }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized: Must be logged in to track stats");
    }

    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const statsCollection = db.collection("scoreGameStats");

    const now = new Date();
    const userId = session.user.id;

    // Find existing stats
    const existingStats = await statsCollection.findOne({
      userId,
      gameType: input.gameType,
    });

    let updatedStats;
    let isNewHighScore = false;

    if (existingStats) {
      // Check if this is a new high score
      isNewHighScore = input.score > (existingStats.highScore || 0);

      // Update existing stats
      const update = {
        $inc: {
          totalPlays: 1,
          totalScore: input.score,
        },
        $set: {
          lastPlayedAt: now,
          updatedAt: now,
          ...(isNewHighScore ? { highScore: input.score } : {}),
        },
      };

      await statsCollection.updateOne(
        { userId, gameType: input.gameType },
        update
      );

      const newTotalPlays = existingStats.totalPlays + 1;
      const newTotalScore = existingStats.totalScore + input.score;

      updatedStats = {
        highScore: isNewHighScore ? input.score : existingStats.highScore,
        totalPlays: newTotalPlays,
        totalScore: newTotalScore,
        averageScore: Math.round(newTotalScore / newTotalPlays),
        isNewHighScore,
      };
    } else {
      // Create new stats
      isNewHighScore = true;
      const newStats = {
        userId,
        gameType: input.gameType,
        highScore: input.score,
        totalPlays: 1,
        totalScore: input.score,
        lastPlayedAt: now,
        createdAt: now,
        updatedAt: now,
      };

      await statsCollection.insertOne(newStats);
      updatedStats = {
        highScore: input.score,
        totalPlays: 1,
        totalScore: input.score,
        averageScore: input.score,
        isNewHighScore,
      };
    }

    return {
      success: true,
      stats: updatedStats,
    };
  });

// Score-based Game Stats: Get user's stats for a specific score-based game
const getUserScoreGameStats = os
  .input(
    z.object({
      gameType: z.enum(["slither", "endless-runner", "paaji"]),
    })
  )
  .output(
    z.object({
      highScore: z.number(),
      totalPlays: z.number(),
      totalScore: z.number(),
      averageScore: z.number(),
    })
  )
  .route({
    method: "GET",
    path: "/game-stats/user-score",
  })
  .handler(async ({ input }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        highScore: 0,
        totalPlays: 0,
        totalScore: 0,
        averageScore: 0,
      };
    }

    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const statsCollection = db.collection("scoreGameStats");

    const stats = await statsCollection.findOne({
      userId: session.user.id,
      gameType: input.gameType,
    });

    if (!stats) {
      return {
        highScore: 0,
        totalPlays: 0,
        totalScore: 0,
        averageScore: 0,
      };
    }

    return {
      highScore: stats.highScore || 0,
      totalPlays: stats.totalPlays || 0,
      totalScore: stats.totalScore || 0,
      averageScore:
        stats.totalPlays > 0
          ? Math.round(stats.totalScore / stats.totalPlays)
          : 0,
    };
  });

export const gameStatsRouter = os.router({
  update: updateGameStats,
  getUserStats: getUserGameStats,
  updateScore: updateScoreGameStats,
  getUserScoreStats: getUserScoreGameStats,
});
