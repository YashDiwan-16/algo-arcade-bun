"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/orpc";
import { toast } from "sonner";

type GameType = "head-soccer" | "rock-paper-scissor" | "showdown";

export function useGameStats(gameType: GameType) {
  const queryClient = useQueryClient();

  const updateStats = useMutation({
    mutationFn: async ({
      playerWon,
      tie = false,
    }: {
      playerWon: boolean;
      tie?: boolean;
    }) => {
      return client.gameStats.update({
        gameType,
        playerWon,
        tie,
      });
    },
    onSuccess: () => {
      // Invalidate leaderboard queries
      queryClient.invalidateQueries({ queryKey: ["leaderboard", gameType] });
      queryClient.invalidateQueries({ queryKey: ["gameStats", gameType] });
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
    updateStats: updateStats.mutate,
    isUpdating: updateStats.isPending,
  };
}
