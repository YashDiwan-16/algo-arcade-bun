"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/orpc";
import { toast } from "sonner";

type ScoreGameType = "slither" | "endless-runner" | "paaji";

export interface ScoreGameStats {
  highScore: number;
  totalPlays: number;
  totalScore: number;
  averageScore: number;
}

export interface UpdateScoreResult {
  success: boolean;
  stats: ScoreGameStats & { isNewHighScore: boolean };
}

/**
 * Hook for managing score-based game statistics
 * Supports games like Slither, Endless Runner, and Paaji
 *
 * @param gameType - The type of score-based game
 * @returns Object containing stats query, update mutation, and helper methods
 *
 * @example
 * ```tsx
 * const { stats, updateScore, isNewHighScore } = useScoreGameStats("slither");
 *
 * // Update score when game ends
 * const handleGameOver = (finalScore: number) => {
 *   updateScore(finalScore);
 * };
 *
 * // Display stats
 * <div>
 *   <p>High Score: {stats.data?.highScore ?? 0}</p>
 *   <p>Total Plays: {stats.data?.totalPlays ?? 0}</p>
 *   <p>Average Score: {stats.data?.averageScore ?? 0}</p>
 * </div>
 * ```
 */
export function useScoreGameStats(gameType: ScoreGameType) {
  const queryClient = useQueryClient();

  // Query to fetch user's stats for this game
  const stats = useQuery({
    queryKey: ["scoreGameStats", gameType],
    queryFn: async () => {
      return client.gameStats.getUserScoreStats({
        gameType,
      });
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Mutation to update stats after a game
  const updateStats = useMutation({
    mutationFn: async (score: number) => {
      return client.gameStats.updateScore({
        gameType,
        score,
      });
    },
    onSuccess: (data) => {
      // Invalidate and refetch stats
      queryClient.invalidateQueries({ queryKey: ["scoreGameStats", gameType] });

      // Show toast notification for new high score
      if (data.stats.isNewHighScore && data.stats.highScore > 0) {
        toast.success("New High Score!", {
          description: `You scored ${data.stats.highScore} points!`,
          duration: 5000,
        });
      }
    },
    onError: (error) => {
      // Only show error if user is logged in (otherwise it's expected)
      if (!error.message.includes("Unauthorized")) {
        toast.error("Failed to update stats", {
          description: error.message,
        });
      }
    },
  });

  return {
    // Stats query
    stats,

    // Mutation methods
    updateScore: updateStats.mutate,
    updateScoreAsync: updateStats.mutateAsync,

    // Loading states
    isLoading: stats.isLoading,
    isUpdating: updateStats.isPending,

    // Last update result (useful for checking if score was a new high score)
    lastUpdate: updateStats.data,
    isNewHighScore: updateStats.data?.stats.isNewHighScore ?? false,

    // Helper to get current high score
    highScore: stats.data?.highScore ?? 0,
    totalPlays: stats.data?.totalPlays ?? 0,
    averageScore: stats.data?.averageScore ?? 0,
  };
}
