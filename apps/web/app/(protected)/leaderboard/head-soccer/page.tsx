"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/orpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  User,
  Gamepad2,
  Sword,
  Zap,
  ArrowLeft,
  Star,
} from "lucide-react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { useDataTable } from "@/hooks/use-data-table";
import type { LeaderboardEntry } from "@/lib/types/game-stats";

const GAME_CONFIG = {
  name: "Head Soccer",
  icon: "⚽",
  category: "Sports",
  difficulty: "Medium" as const,
  gameId: "head-soccer",
};

const difficultyColors = {
  Easy: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  Medium:
    "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  Hard: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

export default function HeadSoccerLeaderboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard", "head-soccer"],
    queryFn: () =>
      client.leaderboard.get({
        gameType: "head-soccer",
        limit: 100,
      }),
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1)
      return <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getRankBadgeVariant = (rank: number) => {
    if (rank === 1) return "default";
    if (rank === 2) return "secondary";
    if (rank === 3) return "outline";
    return "outline";
  };

  const columns = useMemo<ColumnDef<LeaderboardEntry>[]>(
    () => [
      {
        id: "rank",
        accessorKey: "rank",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Rank" />
        ),
        cell: ({ row }) => {
          const rank = row.getValue("rank") as number;
          return (
            <div className="flex items-center gap-2">
              {getRankIcon(rank)}
              <Badge
                variant={getRankBadgeVariant(rank)}
                className="font-mono font-bold min-w-12 justify-center"
              >
                #{rank}
              </Badge>
            </div>
          );
        },
        enableSorting: true,
        enableHiding: false,
      },
      {
        id: "player",
        accessorFn: (row) => row.userName ?? "Unknown Player",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Player" />
        ),
        cell: ({ row }) => {
          const userName = row.original.userName;
          const rank = row.original.rank;
          const gradients = [
            "from-yellow-500 to-orange-500",
            "from-gray-400 to-gray-500",
            "from-amber-600 to-orange-700",
          ];
          const gradient =
            rank <= 3 ? gradients[rank - 1] : "from-purple-500 to-pink-500";
          return (
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full bg-linear-to-br ${gradient} flex items-center justify-center ${
                  rank === 1 ? "ring-2 ring-yellow-400 ring-offset-2" : ""
                }`}
              >
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span
                  className={`font-semibold ${
                    rank === 1 ? "text-yellow-400 text-lg" : ""
                  }`}
                >
                  {userName ?? "Unknown Player"}
                </span>
              </div>
            </div>
          );
        },
        enableSorting: true,
      },
      {
        id: "playerWins",
        accessorKey: "playerWins",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Wins" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Sword className="w-4 h-4 text-green-500" />
            <span className="font-bold text-green-400">
              {row.getValue("playerWins")}
            </span>
          </div>
        ),
        enableSorting: true,
      },
      {
        id: "aiWins",
        accessorKey: "aiWins",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Losses" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-500" />
            <span className="font-bold text-red-400">
              {row.getValue("aiWins")}
            </span>
          </div>
        ),
        enableSorting: true,
      },
      {
        id: "ties",
        accessorKey: "ties",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Ties" />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-muted-foreground">
            {row.getValue("ties") || 0}
          </span>
        ),
        enableSorting: true,
      },
      {
        id: "totalPlays",
        accessorKey: "totalPlays",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Total Plays" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-blue-500" />
            <span className="font-medium">{row.getValue("totalPlays")}</span>
          </div>
        ),
        enableSorting: true,
      },
      {
        id: "winRate",
        accessorKey: "winRate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Win Rate" />
        ),
        cell: ({ row }) => {
          const winRate = row.getValue("winRate") as number;
          const getWinRateColor = (rate: number) => {
            if (rate >= 70) return "text-green-400";
            if (rate >= 50) return "text-yellow-400";
            return "text-red-400";
          };
          return (
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className={`font-bold ${getWinRateColor(winRate)}`}>
                {winRate}%
              </span>
            </div>
          );
        },
        enableSorting: true,
      },
    ],
    []
  );

  const { table } = useDataTable<LeaderboardEntry>({
    data: data?.leaderboard ?? [],
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "rank", desc: false }],
      pagination: { pageIndex: 0, pageSize: 20 },
    },
    getRowId: (row) => row.userId,
  });

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      {/* Back Button */}
      <Link href="/leaderboard">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Leaderboards
        </Button>
      </Link>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="text-6xl animate-bounce">{GAME_CONFIG.icon}</div>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10 text-yellow-400" />
          <h1 className="text-4xl md:text-5xl font-black bg-linear-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            {GAME_CONFIG.name}
          </h1>
          <Trophy className="w-10 h-10 text-yellow-400" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <Badge
            variant="outline"
            className={difficultyColors[GAME_CONFIG.difficulty]}
          >
            {GAME_CONFIG.difficulty}
          </Badge>
          <Badge variant="outline" className="text-sm">
            {GAME_CONFIG.category}
          </Badge>
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
          >
            🏆 Win/Loss
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Compete for the most wins and climb the ranks!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.userRank && (
          <Card className="p-6 bg-linear-to-r from-blue-500/10 to-purple-500/10 border-blue-500/50">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Your Rank</span>
              </div>
              <p className="text-4xl font-black text-blue-400">
                #{data.userRank}
              </p>
            </div>
          </Card>
        )}

        <Card className="p-6 bg-linear-to-r from-purple-500/10 to-pink-500/10 border-purple-500/50">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gamepad2 className="w-4 h-4" />
              <span>Total Players</span>
            </div>
            <p className="text-4xl font-black text-purple-400">
              {data?.leaderboard.length ?? 0}
            </p>
          </div>
        </Card>

        {data?.leaderboard && data.leaderboard.length > 0 && (
          <Card className="p-6 bg-linear-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/50">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="w-4 h-4" />
                <span>Most Wins</span>
              </div>
              <p className="text-4xl font-black text-yellow-400">
                {data.leaderboard[0].playerWins}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <Card className="p-12">
          <div className="text-center space-y-4 animate-pulse">
            <Gamepad2 className="w-16 h-16 mx-auto text-muted-foreground" />
            <p className="text-xl text-muted-foreground">
              Loading leaderboard...
            </p>
          </div>
        </Card>
      )}

      {/* Leaderboard Table */}
      {data && !isLoading && (
        <>
          {data.leaderboard.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="text-6xl">{GAME_CONFIG.icon}</div>
                <p className="text-2xl font-bold">No players yet!</p>
                <p className="text-muted-foreground">
                  Be the first to play {GAME_CONFIG.name} and claim the top
                  spot!
                </p>
                <Link
                  href={`/games/${GAME_CONFIG.gameId}`}
                  className="inline-block mt-6"
                >
                  <Button size="lg" className="font-bold">
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Play Now
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="p-6">
                <DataTable table={table} />
              </Card>
            </div>
          )}
        </>
      )}

      {/* Bottom CTA */}
      <Card className="p-8 bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 border-none text-white">
        <div className="text-center space-y-4">
          <div className="text-5xl mb-4">{GAME_CONFIG.icon}</div>
          <h2 className="text-3xl font-black">Ready to compete?</h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            Play {GAME_CONFIG.name} now and see if you can make it to the top
            of the leaderboard!
          </p>
          <Link
            href={`/games/${GAME_CONFIG.gameId}`}
            className="inline-block mt-4"
          >
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 text-base font-bold"
            >
              <Zap className="w-5 h-5 mr-2" />
              Play {GAME_CONFIG.name}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
