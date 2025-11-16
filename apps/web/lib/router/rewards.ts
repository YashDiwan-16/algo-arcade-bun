import { os } from "@orpc/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import clientPromise from "@/lib/mongodb";
import { env } from "@/env";
import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { GameRewardsClient } from "@/contracts/GameRewards";
import { getAlgodConfigFromEnvironment } from "@/utils/network/getAlgoClientConfigs";

// Milestone definitions for each game
export const GAME_MILESTONES = {
  "endless-runner": [
    {
      id: "er_score_10k",
      name: "Runner's Start",
      requirement: 10000,
      reward: 0.5,
      type: "totalScore" as const,
    },
    {
      id: "er_score_50k",
      name: "Marathon Runner",
      requirement: 50000,
      reward: 1,
      type: "totalScore" as const,
    },
    {
      id: "er_score_100k",
      name: "Elite Sprinter",
      requirement: 100000,
      reward: 2,
      type: "totalScore" as const,
    },
    {
      id: "er_score_250k",
      name: "Speed Legend",
      requirement: 250000,
      reward: 5,
      type: "totalScore" as const,
    },
  ],
  "rock-paper-scissor": [
    {
      id: "rps_wins_5",
      name: "Beginner's Luck",
      requirement: 5,
      reward: 0.3,
      type: "wins" as const,
    },
    {
      id: "rps_wins_20",
      name: "Strategic Mind",
      requirement: 20,
      reward: 1,
      type: "wins" as const,
    },
    {
      id: "rps_wins_50",
      name: "Master Tactician",
      requirement: 50,
      reward: 3,
      type: "wins" as const,
    },
    {
      id: "rps_wins_100",
      name: "Undefeated Champion",
      requirement: 100,
      reward: 7,
      type: "wins" as const,
    },
  ],
  slither: [
    {
      id: "sl_score_5k",
      name: "Snake Charmer",
      requirement: 5000,
      reward: 0.5,
      type: "totalScore" as const,
    },
    {
      id: "sl_score_20k",
      name: "Serpent Master",
      requirement: 20000,
      reward: 1.5,
      type: "totalScore" as const,
    },
    {
      id: "sl_score_50k",
      name: "Python Lord",
      requirement: 50000,
      reward: 3,
      type: "totalScore" as const,
    },
    {
      id: "sl_score_100k",
      name: "Legendary Viper",
      requirement: 100000,
      reward: 6,
      type: "totalScore" as const,
    },
  ],
  "head-soccer": [
    {
      id: "hs_wins_10",
      name: "Soccer Rookie",
      requirement: 10,
      reward: 0.5,
      type: "wins" as const,
    },
    {
      id: "hs_wins_30",
      name: "Field Captain",
      requirement: 30,
      reward: 1.5,
      type: "wins" as const,
    },
    {
      id: "hs_wins_75",
      name: "Soccer Pro",
      requirement: 75,
      reward: 4,
      type: "wins" as const,
    },
    {
      id: "hs_wins_150",
      name: "World Champion",
      requirement: 150,
      reward: 8,
      type: "wins" as const,
    },
  ],
  showdown: [
    {
      id: "sd_wins_10",
      name: "Quick Draw",
      requirement: 10,
      reward: 0.5,
      type: "wins" as const,
    },
    {
      id: "sd_wins_30",
      name: "Gunslinger",
      requirement: 30,
      reward: 1.5,
      type: "wins" as const,
    },
    {
      id: "sd_wins_75",
      name: "Sharp Shooter",
      requirement: 75,
      reward: 4,
      type: "wins" as const,
    },
    {
      id: "sd_wins_150",
      name: "Western Legend",
      requirement: 150,
      reward: 8,
      type: "wins" as const,
    },
  ],
  paaji: [
    {
      id: "pj_score_10k",
      name: "Lucky Start",
      requirement: 10000,
      reward: 0.5,
      type: "totalScore" as const,
    },
    {
      id: "pj_score_50k",
      name: "Risk Taker",
      requirement: 50000,
      reward: 1.5,
      type: "totalScore" as const,
    },
    {
      id: "pj_score_100k",
      name: "High Roller",
      requirement: 100000,
      reward: 3,
      type: "totalScore" as const,
    },
    {
      id: "pj_score_300k",
      name: "Jackpot Master",
      requirement: 300000,
      reward: 7,
      type: "totalScore" as const,
    },
  ],
} as const;

// Get all milestones with user progress
const getUserMilestones = os
  .input(z.object({}))
  .output(
    z.object({
      milestones: z.array(
        z.object({
          gameId: z.string(),
          gameName: z.string(),
          milestoneId: z.string(),
          name: z.string(),
          requirement: z.number(),
          reward: z.number(),
          type: z.enum(["totalScore", "wins"]),
          progress: z.number(),
          completed: z.boolean(),
          claimed: z.boolean(),
          completedAt: z.coerce.date().nullable(),
          claimedAt: z.coerce.date().nullable(),
        })
      ),
      totalEarned: z.number(),
      totalClaimable: z.number(),
    })
  )
  .route({
    method: "GET",
    path: "/rewards/milestones",
  })
  .handler(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized: Must be logged in to view milestones");
    }

    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const scoreStatsCollection = db.collection("scoreGameStats");
    const gameStatsCollection = db.collection("gameStats");
    const milestonesCollection = db.collection("userMilestones");

    const userId = session.user.id;

    // Fetch user's claimed milestones
    const claimedMilestones = await milestonesCollection
      .find({ userId })
      .toArray();

    const claimedMap = new Map(
      claimedMilestones.map((m) => [
        m.milestoneId,
        {
          claimed: m.claimed || false,
          completedAt: m.completedAt,
          claimedAt: m.claimedAt || null,
        },
      ])
    );

    // Fetch user's game stats
    const scoreStats = await scoreStatsCollection.find({ userId }).toArray();

    const winLossStats = await gameStatsCollection.find({ userId }).toArray();

    const scoreStatsMap = new Map(scoreStats.map((s) => [s.gameType, s]));

    const winLossStatsMap = new Map(winLossStats.map((s) => [s.gameType, s]));

    const gameNames: Record<string, string> = {
      "endless-runner": "Endless Runner",
      "rock-paper-scissor": "Rock Paper Scissors",
      slither: "Slither",
      "head-soccer": "Head Soccer",
      showdown: "Quick Draw Showdown",
      paaji: "Paaji",
    };

    // Build milestone list with progress
    const allMilestones = [];
    let totalEarned = 0;
    let totalClaimable = 0;

    for (const [gameId, milestones] of Object.entries(GAME_MILESTONES)) {
      for (const milestone of milestones) {
        let progress = 0;

        if (milestone.type === "totalScore") {
          const stats = scoreStatsMap.get(gameId);
          progress = stats?.totalScore || 0;
        } else if (milestone.type === "wins") {
          const stats = winLossStatsMap.get(gameId);
          progress = stats?.playerWins || 0;
        }

        const completed = progress >= milestone.requirement;
        const claimData = claimedMap.get(milestone.id);
        const claimed = claimData?.claimed || false;

        if (completed && claimed) {
          totalEarned += milestone.reward;
        } else if (completed && !claimed) {
          totalClaimable += milestone.reward;
        }

        allMilestones.push({
          gameId,
          gameName: gameNames[gameId] || gameId,
          milestoneId: milestone.id,
          name: milestone.name,
          requirement: milestone.requirement,
          reward: milestone.reward,
          type: milestone.type,
          progress,
          completed,
          claimed,
          completedAt: claimData?.completedAt || null,
          claimedAt: claimData?.claimedAt || null,
        });
      }
    }

    // Sort: claimable first, then by game and requirement
    allMilestones.sort((a, b) => {
      if (a.completed && !a.claimed && !(b.completed && !b.claimed)) return -1;
      if (!(a.completed && !a.claimed) && b.completed && !b.claimed) return 1;
      if (a.gameId !== b.gameId) return a.gameId.localeCompare(b.gameId);
      return a.requirement - b.requirement;
    });

    return {
      milestones: allMilestones,
      totalEarned,
      totalClaimable,
    };
  });

// Claim a milestone reward
const claimMilestone = os
  .input(
    z.object({
      milestoneId: z.string(),
      walletAddress: z.string().length(58),
    })
  )
  .output(
    z.object({
      success: z.boolean(),
      txId: z.string().optional(),
      reward: z.number(),
      message: z.string(),
    })
  )
  .route({
    method: "POST",
    path: "/rewards/claim",
  })
  .handler(async ({ input }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized: Must be logged in to claim rewards");
    }

    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const milestonesCollection = db.collection("userMilestones");
    const scoreStatsCollection = db.collection("scoreGameStats");
    const gameStatsCollection = db.collection("gameStats");

    const userId = session.user.id;

    // Find the milestone definition
    let milestoneDefinition:
      | (typeof GAME_MILESTONES)[keyof typeof GAME_MILESTONES][number]
      | null = null;
    let gameId: string | null = null;

    for (const [gId, milestones] of Object.entries(GAME_MILESTONES)) {
      const found = milestones.find((m) => m.id === input.milestoneId);
      if (found) {
        milestoneDefinition = found;
        gameId = gId;
        break;
      }
    }

    if (!milestoneDefinition || !gameId) {
      throw new Error("Invalid milestone ID");
    }

    // Check if already claimed
    const existingClaim = await milestonesCollection.findOne({
      userId,
      milestoneId: input.milestoneId,
    });

    if (existingClaim?.claimed) {
      throw new Error("Milestone already claimed");
    }

    // Verify user has completed the milestone
    let progress = 0;

    if (milestoneDefinition.type === "totalScore") {
      const stats = await scoreStatsCollection.findOne({
        userId,
        gameType: gameId,
      });
      progress = stats?.totalScore || 0;
    } else if (milestoneDefinition.type === "wins") {
      const stats = await gameStatsCollection.findOne({
        userId,
        gameType: gameId,
      });
      progress = stats?.playerWins || 0;
    }

    if (progress < milestoneDefinition.requirement) {
      throw new Error("Milestone requirements not met");
    }

    const now = new Date();

    // Mark as claimed in database first
    await milestonesCollection.updateOne(
      { userId, milestoneId: input.milestoneId },
      {
        $set: {
          claimed: true,
          claimedAt: now,
          walletAddress: input.walletAddress,
          updatedAt: now,
        },
        $setOnInsert: {
          userId,
          milestoneId: input.milestoneId,
          completedAt: existingClaim?.completedAt || now,
          createdAt: now,
        },
      },
      { upsert: true }
    );

    // Send actual ALGO from smart contract if app ID is configured
    let txId: string | undefined;

    if (env.NEXT_PUBLIC_REWARDS_APP_ID) {
      try {
        const algodConfig = getAlgodConfigFromEnvironment();
        const algorand = AlgorandClient.fromConfig({ algodConfig });

        // Get admin account from environment (should be securely stored)
        // In production, use a secure key management solution
        const adminMnemonic = env.REWARDS_ADMIN_MNEMONIC;
        const adminAccount = await algorand.account.fromMnemonic(adminMnemonic);

        // Initialize contract client
        const appId = BigInt(env.NEXT_PUBLIC_REWARDS_APP_ID);
        const rewardsContract = new GameRewardsClient({
          algorand,
          appId,
          defaultSender: adminAccount.addr,
        });

        // Convert ALGO to microAlgos
        const rewardMicroAlgo = BigInt(
          Math.round(milestoneDefinition.reward * 1_000_000)
        );

        // Convert milestone ID to bytes
        const milestoneIdBytes = new TextEncoder().encode(input.milestoneId);

        // Call smart contract to send reward
        // Note: The contract's inner transaction has fee=0, so we need to cover both fees
        // (1 for app call + 1 for inner payment = 2 * 1000 microAlgos)
        const result = await rewardsContract.send.claimReward({
          args: {
            recipient: input.walletAddress,
            milestoneId: milestoneIdBytes,
            rewardAmount: rewardMicroAlgo,
          },
          staticFee: (2_000).microAlgos(), // Cover both app call and inner txn fees
        });

        txId = result.txIds[0];
      } catch (error) {
        // Rollback database claim if blockchain transaction fails
        await milestonesCollection.updateOne(
          { userId, milestoneId: input.milestoneId },
          {
            $set: {
              claimed: false,
              claimedAt: null,
              walletAddress: null,
            },
          }
        );

        throw new Error(
          `Failed to send reward: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    return {
      success: true,
      reward: milestoneDefinition.reward,
      message: txId
        ? `Successfully claimed ${milestoneDefinition.reward} ALGO!`
        : `Milestone marked as claimed. ALGO payment pending (contract not configured).`,
      txId,
    };
  });

// Get user's reward summary
const getRewardSummary = os
  .input(z.object({}))
  .output(
    z.object({
      totalEarned: z.number(),
      totalClaimable: z.number(),
      milestonesClaimed: z.number(),
      milestonesCompleted: z.number(),
      totalMilestones: z.number(),
    })
  )
  .route({
    method: "GET",
    path: "/rewards/summary",
  })
  .handler(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        totalEarned: 0,
        totalClaimable: 0,
        milestonesClaimed: 0,
        milestonesCompleted: 0,
        totalMilestones: 0,
      };
    }

    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const milestonesCollection = db.collection("userMilestones");
    const scoreStatsCollection = db.collection("scoreGameStats");
    const gameStatsCollection = db.collection("gameStats");

    const userId = session.user.id;

    const claimedMilestones = await milestonesCollection
      .find({ userId })
      .toArray();

    const scoreStats = await scoreStatsCollection.find({ userId }).toArray();

    const winLossStats = await gameStatsCollection.find({ userId }).toArray();

    const scoreStatsMap = new Map(scoreStats.map((s) => [s.gameType, s]));

    const winLossStatsMap = new Map(winLossStats.map((s) => [s.gameType, s]));

    let totalMilestones = 0;
    let milestonesCompleted = 0;
    let milestonesClaimed = 0;
    let totalEarned = 0;
    let totalClaimable = 0;

    for (const [gameId, milestones] of Object.entries(GAME_MILESTONES)) {
      for (const milestone of milestones) {
        totalMilestones++;

        let progress = 0;

        if (milestone.type === "totalScore") {
          const stats = scoreStatsMap.get(gameId);
          progress = stats?.totalScore || 0;
        } else if (milestone.type === "wins") {
          const stats = winLossStatsMap.get(gameId);
          progress = stats?.playerWins || 0;
        }

        const completed = progress >= milestone.requirement;

        if (completed) {
          milestonesCompleted++;

          const claimed = claimedMilestones.find(
            (m) => m.milestoneId === milestone.id && m.claimed
          );

          if (claimed) {
            milestonesClaimed++;
            totalEarned += milestone.reward;
          } else {
            totalClaimable += milestone.reward;
          }
        }
      }
    }

    return {
      totalEarned,
      totalClaimable,
      milestonesClaimed,
      milestonesCompleted,
      totalMilestones,
    };
  });

export const rewardsRouter = os.router({
  getUserMilestones,
  claimMilestone,
  getRewardSummary,
});
