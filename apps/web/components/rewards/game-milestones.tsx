"use client";

import { useGameMilestones } from "@/hooks/use-rewards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Lock, Sparkles, Coins } from "lucide-react";

interface GameMilestonesProps {
  gameId: string;
}

/**
 * Component to display milestones for a specific game
 * Shows progress, completion status, and rewards
 */
export function GameMilestones({ gameId }: GameMilestonesProps) {
  const { milestones, isLoading } = useGameMilestones(gameId);

  if (isLoading) {
    return null;
  }

  if (milestones.length === 0) {
    return null;
  }

  const completedCount = milestones.filter((m) => m.completed).length;
  const claimedCount = milestones.filter((m) => m.claimed).length;

  return (
    <Card className="border-purple-200 dark:border-purple-900">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-600" />
            Game Milestones
          </span>
          <Badge variant="secondary">
            {completedCount}/{milestones.length} Complete
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {milestones.map((milestone) => {
            const progressPercent = Math.min(
              (milestone.progress / milestone.requirement) * 100,
              100
            );

            return (
              <div
                key={milestone.milestoneId}
                className={`p-3 rounded-lg border ${
                  milestone.completed && !milestone.claimed
                    ? "border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-950/20"
                    : milestone.claimed
                    ? "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20"
                    : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    {milestone.claimed && (
                      <Trophy className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    )}
                    {!milestone.completed && (
                      <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    )}
                    {milestone.completed && !milestone.claimed && (
                      <Sparkles className="h-4 w-4 text-yellow-600 animate-pulse flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {milestone.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {milestone.type === "totalScore"
                          ? `${milestone.requirement.toLocaleString()} total score`
                          : `${milestone.requirement} wins`}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={milestone.claimed ? "secondary" : "default"}
                    className={`flex-shrink-0 ${
                      milestone.completed && !milestone.claimed
                        ? "bg-green-600 hover:bg-green-700"
                        : ""
                    }`}
                  >
                    <Coins className="h-3 w-3 mr-1" />
                    {milestone.reward}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Progress value={progressPercent} className="h-1.5" />
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>
                      {milestone.progress.toLocaleString()} /{" "}
                      {milestone.requirement.toLocaleString()}
                    </span>
                    <span>{progressPercent.toFixed(0)}%</span>
                  </div>
                </div>
                {milestone.completed && !milestone.claimed && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                    🎉 Ready to claim! Visit the Rewards page
                  </p>
                )}
                {milestone.claimed && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    ✓ Claimed
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {claimedCount < completedCount && (
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
            <p className="text-sm text-purple-800 dark:text-purple-200 text-center">
              <span className="font-semibold">
                {completedCount - claimedCount} reward
                {completedCount - claimedCount !== 1 ? "s" : ""} ready!
              </span>{" "}
              Visit the{" "}
              <a
                href="/rewards"
                className="underline hover:text-purple-600 dark:hover:text-purple-300"
              >
                Rewards page
              </a>{" "}
              to claim.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
