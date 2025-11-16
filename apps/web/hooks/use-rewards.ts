"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/orpc";
import { toast } from "sonner";

/**
 * Hook for managing user milestones and rewards
 * Provides functionality to view, track, and claim milestone rewards
 *
 * @returns Object containing milestones query, claim mutation, and summary data
 *
 * @example
 * ```tsx
 * const { milestones, summary, claimReward, isClaiming } = useRewards();
 *
 * // Display milestones
 * milestones.data?.milestones.map((milestone) => (
 *   <div key={milestone.milestoneId}>
 *     <h3>{milestone.name}</h3>
 *     <p>{milestone.progress} / {milestone.requirement}</p>
 *     {milestone.completed && !milestone.claimed && (
 *       <button onClick={() => claimReward({
 *         milestoneId: milestone.milestoneId,
 *         walletAddress: userWallet
 *       })}>
 *         Claim {milestone.reward} ALGO
 *       </button>
 *     )}
 *   </div>
 * ));
 * ```
 */
export function useRewards() {
  const queryClient = useQueryClient();

  // Query to fetch all user milestones with progress
  const milestones = useQuery({
    queryKey: ["rewards", "milestones"],
    queryFn: async () => {
      return client.rewards.getUserMilestones({});
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Query to fetch reward summary
  const summary = useQuery({
    queryKey: ["rewards", "summary"],
    queryFn: async () => {
      return client.rewards.getRewardSummary({});
    },
    staleTime: 1000 * 60 * 5,
  });

  // Mutation to claim a milestone reward
  const claimMutation = useMutation({
    mutationFn: async ({
      milestoneId,
      walletAddress,
    }: {
      milestoneId: string;
      walletAddress: string;
    }) => {
      return client.rewards.claimMilestone({
        milestoneId,
        walletAddress,
      });
    },
    onSuccess: (data) => {
      // Invalidate and refetch rewards data
      queryClient.invalidateQueries({ queryKey: ["rewards"] });

      // Show success notification
      toast.success("Reward Claimed!", {
        description: data.message,
      });
    },
    onError: (error) => {
      toast.error("Failed to claim reward", {
        description: error.message,
      });
    },
  });

  return {
    // Milestones data
    milestones: milestones.data?.milestones || [],
    totalEarned: milestones.data?.totalEarned || 0,
    totalClaimable: milestones.data?.totalClaimable || 0,

    // Summary data
    summary: summary.data,

    // Loading states
    isLoading: milestones.isLoading || summary.isLoading,
    isClaiming: claimMutation.isPending,

    // Mutations
    claimReward: claimMutation.mutate,

    // Refetch functions
    refetch: () => {
      milestones.refetch();
      summary.refetch();
    },
  };
}

/**
 * Hook for getting milestones for a specific game
 *
 * @param gameId - The ID of the game to filter milestones for
 * @returns Filtered milestones for the specified game
 *
 * @example
 * ```tsx
 * const { milestones, isLoading } = useGameMilestones("endless-runner");
 * ```
 */
export function useGameMilestones(gameId: string) {
  const { milestones, isLoading, claimReward, isClaiming } = useRewards();

  const gameMilestones = milestones.filter((m) => m.gameId === gameId);

  return {
    milestones: gameMilestones,
    isLoading,
    claimReward,
    isClaiming,
  };
}
