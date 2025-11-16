import { os } from "@orpc/server";
import { z } from "zod";
import clientPromise from "@/lib/mongodb";
import { env } from "@/env";

// Arena: Get all published games
const getArenaGames = os
  .input(
    z.object({
      page: z.number().int().positive().optional().default(1),
      perPage: z.number().int().positive().optional().default(12),
    })
  )
  .output(
    z.object({
      games: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          html: z.string(),
          userName: z.string().nullable(),
          createdAt: z.coerce.date(),
        })
      ),
      total: z.number(),
      pageCount: z.number(),
    })
  )
  .route({
    method: "GET",
    path: "/arena/games",
  })
  .handler(async ({ input }) => {
    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const gamesCollection = db.collection("aiGames");

    const filter = { published: true };

    const total = await gamesCollection.countDocuments(filter);
    const skip = (input.page - 1) * input.perPage;
    const pageCount = Math.ceil(total / input.perPage);

    const games = await gamesCollection
      .aggregate([
        { $match: filter },
        {
          $lookup: {
            from: "user",
            localField: "userId",
            foreignField: "id",
            as: "userInfo",
          },
        },
        {
          $unwind: {
            path: "$userInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        { $sort: { publishedAt: -1 } },
        { $skip: skip },
        { $limit: input.perPage },
        {
          $project: {
            id: 1,
            title: 1,
            description: 1,
            code: 1,
            userName: "$userInfo.name",
            createdAt: 1,
          },
        },
      ])
      .toArray();

    return {
      games: games.map((game) => ({
        id: game.id,
        title: game.title,
        description: game.description,
        html: game.code || "",
        userName: game.userName || null,
        createdAt: game.createdAt,
      })),
      total,
      pageCount,
    };
  });

// Arena: Get a specific published game
const getArenaGame = os
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
      userName: z.string().nullable(),
      createdAt: z.coerce.date(),
    })
  )
  .route({
    method: "GET",
    path: "/arena/game",
  })
  .handler(async ({ input }) => {
    const client = await clientPromise;
    const db = client.db(env.MONGODB_DB_NAME);
    const gamesCollection = db.collection("aiGames");
    const usersCollection = db.collection("user");

    const game = await gamesCollection.findOne({
      id: input.id,
      published: true,
    });

    if (!game) {
      throw new Error("Game not found or not published");
    }

    const user = await usersCollection.findOne({ id: game.userId });

    return {
      id: game.id,
      title: game.title,
      code: game.code,
      description: game.description,
      userName: user?.name || null,
      createdAt: game.createdAt,
    };
  });

export const arenaRouter = os.router({
  games: getArenaGames,
  game: getArenaGame,
});
