import { os } from "@orpc/server";
import { z } from "zod";
import clientPromise from "@/lib/mongodb";
import { env } from "@/env";

// Platform Stats: Get global platform statistics
const getPlatformStats = os
  .input(z.object({}))
  .output(
    z.object({
      totalUsers: z.number(),
      totalGamesGenerated: z.number(),
      totalPlays: z.number(),
      totalPublishedGames: z.number(),
    })
  )
  .route({
    method: "GET",
    path: "/stats/platform",
  })
  .handler(async () => {
    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);

    // Get total users
    const totalUsers = await db.collection("user").countDocuments();

    // Get total AI games generated
    const totalGamesGenerated = await db.collection("aiGames").countDocuments();

    // Get total published games in arena
    const totalPublishedGames = await db
      .collection("aiGames")
      .countDocuments({ published: true });

    // Get total plays across all games (competitive games)
    const competitivePlaysResult = await db
      .collection("gameStats")
      .aggregate([
        {
          $group: {
            _id: null,
            totalPlays: { $sum: "$totalPlays" },
          },
        },
      ])
      .toArray();

    const competitivePlays =
      (competitivePlaysResult[0]?.totalPlays as number | undefined) ?? 0;

    // Get total plays from score-based games
    const scorePlaysResult = await db
      .collection("scoreGameStats")
      .aggregate([
        {
          $group: {
            _id: null,
            totalPlays: { $sum: "$totalPlays" },
          },
        },
      ])
      .toArray();

    const scorePlays =
      (scorePlaysResult[0]?.totalPlays as number | undefined) ?? 0;

    // Combine both types of plays
    const totalPlays = competitivePlays + scorePlays;

    return {
      totalUsers,
      totalGamesGenerated,
      totalPlays,
      totalPublishedGames,
    };
  });

export const statsRouter = os.router({
  platform: getPlatformStats,
});
