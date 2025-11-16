"use client";

import { useState } from "react";
import { useRewards } from "@/hooks/use-rewards";
import { useWallet } from "@txnlab/use-wallet-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Coins,
  Wallet,
  Check,
  Lock,
  Target,
  Award,
  Sparkles,
  Gift,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import ConnectWallet from "@/components/algorand/ConnectWallet";

export default function RewardsPage() {
  const {
    milestones,
    totalEarned,
    totalClaimable,
    summary,
    isLoading,
    isClaiming,
    claimReward,
  } = useRewards();

  const { activeAddress } = useWallet();
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(
    null
  );

  const handleClaim = (milestoneId: string) => {
    if (!activeAddress) {
      toast.error("Please connect your wallet first");
      setIsConnectOpen(true);
      return;
    }

    setSelectedMilestone(milestoneId);
    claimReward({
      milestoneId,
      walletAddress: activeAddress,
    });
  };

  // Group milestones by game
  const milestonesByGame = milestones.reduce((acc, milestone) => {
    if (!acc[milestone.gameId]) {
      acc[milestone.gameId] = {
        gameName: milestone.gameName,
        milestones: [],
      };
    }
    acc[milestone.gameId].milestones.push(milestone);
    return acc;
  }, {} as Record<string, { gameName: string; milestones: typeof milestones }>);

  const gameIcons: Record<string, string> = {
    "endless-runner": "🏃",
    "rock-paper-scissor": "✊",
    slither: "🐍",
    "head-soccer": "⚽",
    showdown: "🤠",
    paaji: "🎰",
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Gift className="h-10 w-10 text-purple-600 dark:text-purple-400" />
          <h1 className="text-4xl font-bold bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
            Game Rewards
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Complete milestones in your favorite games and earn ALGO tokens! Track
          your progress and claim rewards.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-purple-200 dark:border-purple-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {totalEarned.toFixed(2)} ALGO
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 dark:border-green-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Claimable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {totalClaimable.toFixed(2)} ALGO
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {summary?.milestonesCompleted || 0}
              <span className="text-lg text-gray-500 dark:text-gray-400">
                /{summary?.totalMilestones || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 dark:border-yellow-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Claimed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {summary?.milestonesClaimed || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Connection Alert */}
      {!activeAddress && (
        <Card className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="text-orange-800 dark:text-orange-200 flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Connect Your Wallet
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              Connect your Algorand wallet to claim rewards when you complete
              milestones.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setIsConnectOpen(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      )}

      {/* Milestones by Game */}
      {!isLoading && (
        <div className="space-y-6">
          {Object.entries(milestonesByGame).map(
            ([gameId, { gameName, milestones: gameMilestones }]) => (
              <Card key={gameId} className="overflow-hidden">
                <CardHeader className="bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <CardTitle className="flex items-center gap-3">
                    <span className="text-3xl">
                      {gameIcons[gameId] || "🎮"}
                    </span>
                    <span>{gameName}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {gameMilestones.filter((m) => m.completed).length}/
                      {gameMilestones.length} Completed
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {gameMilestones.map((milestone) => {
                      const progressPercent = Math.min(
                        (milestone.progress / milestone.requirement) * 100,
                        100
                      );

                      return (
                        <Card
                          key={milestone.milestoneId}
                          className={`${
                            milestone.completed && !milestone.claimed
                              ? "border-green-400 dark:border-green-600 shadow-lg shadow-green-100 dark:shadow-green-900/20"
                              : milestone.claimed
                              ? "border-gray-300 dark:border-gray-700 opacity-75"
                              : "border-gray-200 dark:border-gray-800"
                          }`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {milestone.claimed && (
                                    <Check className="h-5 w-5 text-green-600" />
                                  )}
                                  {!milestone.completed && (
                                    <Lock className="h-5 w-5 text-gray-400" />
                                  )}
                                  {milestone.completed &&
                                    !milestone.claimed && (
                                      <Sparkles className="h-5 w-5 text-yellow-600 animate-pulse" />
                                    )}
                                  {milestone.name}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  {milestone.type === "totalScore"
                                    ? `Reach ${milestone.requirement.toLocaleString()} total score`
                                    : `Win ${milestone.requirement} games`}
                                </CardDescription>
                              </div>
                              <Badge
                                variant={
                                  milestone.claimed ? "secondary" : "default"
                                }
                                className={
                                  milestone.completed && !milestone.claimed
                                    ? "bg-green-600 hover:bg-green-700"
                                    : ""
                                }
                              >
                                {milestone.reward} ALGO
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Progress
                                </span>
                                <span className="font-medium">
                                  {milestone.progress.toLocaleString()} /{" "}
                                  {milestone.requirement.toLocaleString()}
                                </span>
                              </div>
                              <Progress
                                value={progressPercent}
                                className="h-2"
                              />
                            </div>

                            {milestone.claimed && (
                              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                <Check className="h-4 w-4" />
                                Claimed on{" "}
                                {milestone.claimedAt
                                  ? new Date(
                                      milestone.claimedAt
                                    ).toLocaleDateString()
                                  : "Unknown"}
                              </div>
                            )}

                            {milestone.completed && !milestone.claimed && (
                              <Button
                                onClick={() =>
                                  handleClaim(milestone.milestoneId)
                                }
                                disabled={
                                  isClaiming &&
                                  selectedMilestone === milestone.milestoneId
                                }
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                {isClaiming &&
                                selectedMilestone === milestone.milestoneId ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Claiming...
                                  </>
                                ) : (
                                  <>
                                    <Coins className="mr-2 h-4 w-4" />
                                    Claim {milestone.reward} ALGO
                                  </>
                                )}
                              </Button>
                            )}

                            {!milestone.completed && (
                              <Button
                                variant="outline"
                                disabled
                                className="w-full"
                              >
                                <Target className="mr-2 h-4 w-4" />
                                {progressPercent.toFixed(0)}% Complete
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && milestones.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Milestones Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start playing games to unlock milestones and earn rewards!
            </p>
            <Button asChild>
              <a href="/games">Browse Games</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Connect Wallet Dialog */}
      <ConnectWallet
        openModal={isConnectOpen}
        closeModal={() => setIsConnectOpen(false)}
      />
    </div>
  );
}
