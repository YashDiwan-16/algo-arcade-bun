import { os } from "@orpc/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { env } from "@/env";

// Leaderboard: Get global leaderboard for win/loss games
const getLeaderboard = os
  .input(
    z.object({
      gameType: z.enum(["head-soccer", "rock-paper-scissor", "showdown"]),
      limit: z.number().int().positive().optional().default(100),
    })
  )
  .output(
    z.object({
      leaderboard: z.array(
        z.object({
          userId: z.string(),
          userName: z.string().nullable(),
          playerWins: z.number(),
          aiWins: z.number(),
          ties: z.number(),
          totalPlays: z.number(),
          winRate: z.number(),
          rank: z.number(),
        })
      ),
      userRank: z.number().nullable(),
    })
  )
  .route({
    method: "GET",
    path: "/leaderboard",
  })
  .handler(async ({ input }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const statsCollection = db.collection("gameStats");

    // Aggregate leaderboard with user names
    const leaderboardData = await statsCollection
      .aggregate([
        {
          $match: {
            gameType: input.gameType,
            totalPlays: { $gt: 0 },
          },
        },
        {
          $lookup: {
            from: "user",
            let: { uid: "$userId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$id", "$$uid"] },
                      { $eq: [{ $toString: "$_id" }, "$$uid"] },
                    ],
                  },
                },
              },
              { $limit: 1 },
            ],
            as: "userInfo",
          },
        },
        {
          $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            winRate: {
              $multiply: [
                {
                  $cond: [
                    { $gt: ["$totalPlays", 0] },
                    { $divide: ["$playerWins", "$totalPlays"] },
                    0,
                  ],
                },
                100,
              ],
            },
          },
        },
        {
          $sort: {
            playerWins: -1,
            winRate: -1,
            totalPlays: -1,
          },
        },
        {
          $limit: input.limit,
        },
        {
          $project: {
            userId: 1,
            userName: "$userInfo.name",
            playerWins: 1,
            aiWins: 1,
            ties: { $ifNull: ["$ties", 0] },
            totalPlays: 1,
            winRate: { $round: ["$winRate", 2] },
          },
        },
      ])
      .toArray();

    // Add rank to each entry
    const leaderboard = leaderboardData.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      userId: entry.userId || "",
      userName: entry.userName || null,
      playerWins: entry.playerWins || 0,
      aiWins: entry.aiWins || 0,
      ties: entry.ties || 0,
      totalPlays: entry.totalPlays || 0,
      winRate: entry.winRate || 0,
    }));

    // Find user's rank if logged in
    let userRank: number | null = null;
    if (session) {
      const userEntry = leaderboard.find(
        (entry) => entry.userId === session.user.id
      );
      userRank = userEntry ? userEntry.rank : null;
    }

    return {
      leaderboard,
      userRank,
    };
  });

// Leaderboard: Get global leaderboard for score-based games
const getScoreLeaderboard = os
  .input(
    z.object({
      gameType: z.enum(["slither", "endless-runner", "paaji"]),
      limit: z.number().int().positive().optional().default(100),
    })
  )
  .output(
    z.object({
      leaderboard: z.array(
        z.object({
          userId: z.string(),
          userName: z.string().nullable(),
          highScore: z.number(),
          totalPlays: z.number(),
          totalScore: z.number(),
          averageScore: z.number(),
          rank: z.number(),
        })
      ),
      userRank: z.number().nullable(),
    })
  )
  .route({
    method: "GET",
    path: "/leaderboard/score",
  })
  .handler(async ({ input }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const statsCollection = db.collection("scoreGameStats");

    // Aggregate leaderboard with user names
    const leaderboardData = await statsCollection
      .aggregate([
        {
          $match: {
            gameType: input.gameType,
            totalPlays: { $gt: 0 },
          },
        },
        {
          $lookup: {
            from: "user",
            let: { uid: "$userId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      { $eq: ["$id", "$$uid"] },
                      { $eq: [{ $toString: "$_id" }, "$$uid"] },
                    ],
                  },
                },
              },
              { $limit: 1 },
            ],
            as: "userInfo",
          },
        },
        {
          $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            averageScore: {
              $cond: [
                { $gt: ["$totalPlays", 0] },
                { $round: [{ $divide: ["$totalScore", "$totalPlays"] }, 0] },
                0,
              ],
            },
          },
        },
        {
          $sort: {
            highScore: -1,
            totalScore: -1,
            totalPlays: -1,
          },
        },
        {
          $limit: input.limit,
        },
        {
          $project: {
            userId: 1,
            userName: "$userInfo.name",
            highScore: 1,
            totalPlays: 1,
            totalScore: 1,
            averageScore: 1,
          },
        },
      ])
      .toArray();

    // Add rank to each entry
    const leaderboard = leaderboardData.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      userId: entry.userId || "",
      userName: entry.userName || null,
      highScore: entry.highScore || 0,
      totalPlays: entry.totalPlays || 0,
      totalScore: entry.totalScore || 0,
      averageScore: entry.averageScore || 0,
    }));

    // Find user's rank if logged in
    let userRank: number | null = null;
    if (session) {
      const userEntry = leaderboard.find(
        (entry) => entry.userId === session.user.id
      );
      userRank = userEntry ? userEntry.rank : null;
    }

    return {
      leaderboard,
      userRank,
    };
  });

export const leaderboardRouter = os.router({
  get: getLeaderboard,
  getScore: getScoreLeaderboard,
});
