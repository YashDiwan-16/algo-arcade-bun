import { z } from "zod";

export const milestoneSchema = z.object({
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
});

export type Milestone = z.infer<typeof milestoneSchema>;

export const rewardSummarySchema = z.object({
  totalEarned: z.number(),
  totalClaimable: z.number(),
  milestonesClaimed: z.number(),
  milestonesCompleted: z.number(),
  totalMilestones: z.number(),
});

export type RewardSummary = z.infer<typeof rewardSummarySchema>;

export const userMilestoneRecordSchema = z.object({
  userId: z.string(),
  milestoneId: z.string(),
  claimed: z.boolean(),
  completedAt: z.coerce.date(),
  claimedAt: z.coerce.date().nullable().optional(),
  walletAddress: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type UserMilestoneRecord = z.infer<typeof userMilestoneRecordSchema>;
