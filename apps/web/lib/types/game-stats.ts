import { z } from "zod";

export type GameType = "head-soccer" | "rock-paper-scissor" | "showdown";

export const gameStatsSchema = z.object({
  userId: z.string(),
  gameType: z.enum(["head-soccer", "rock-paper-scissor", "showdown"]),
  playerWins: z.number().int().nonnegative(),
  aiWins: z.number().int().nonnegative(),
  ties: z.number().int().nonnegative().optional(),
  totalPlays: z.number().int().nonnegative(),
  lastPlayedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GameStats = z.infer<typeof gameStatsSchema>;

export const leaderboardEntrySchema = z.object({
  userId: z.string(),
  userName: z.string().nullable(),
  playerWins: z.number(),
  aiWins: z.number(),
  ties: z.number(),
  totalPlays: z.number(),
  winRate: z.number(),
  rank: z.number(),
});

export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

export const scoreLeaderboardEntrySchema = z.object({
  userId: z.string(),
  userName: z.string().nullable(),
  highScore: z.number(),
  totalPlays: z.number(),
  totalScore: z.number(),
  averageScore: z.number(),
  rank: z.number(),
});

export type ScoreLeaderboardEntry = z.infer<
  typeof scoreLeaderboardEntrySchema
>;
