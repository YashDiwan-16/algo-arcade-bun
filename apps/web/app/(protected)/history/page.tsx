"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/orpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  Sparkles,
  Trash2,
  ExternalLink,
  Calendar,
  Code,
  Gamepad2,
  History as HistoryIcon,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPublished, setFilterPublished] = useState<
    "all" | "published" | "unpublished"
  >("all");
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch all user games with full details
  const { data, isLoading, error } = useQuery({
    queryKey: ["userAIGames"],
    queryFn: async () => {
      const response = await client.ai.allGames({ limit: 1000 });
      return response.games;
    },
  });

  // Delete game mutation
  const deleteGame = useMutation({
    mutationFn: async (gameId: string) => {
      return await client.ai.delete({ id: gameId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAIGames"] });
      toast.success("Game deleted successfully");
      setGameToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete game", {
        description: error.message,
      });
    },
  });

  // Filter games based on search and published status
  const filteredGames = data?.filter((game) => {
    const matchesSearch =
      searchQuery === "" ||
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPublished =
      filterPublished === "all" ||
      (filterPublished === "published" && game.published) ||
      (filterPublished === "unpublished" && !game.published);

    return matchesSearch && matchesPublished;
  });

  const getGameIcon = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (
      lowerTitle.includes("space") ||
      lowerTitle.includes("rocket") ||
      lowerTitle.includes("astro")
    )
      return "🚀";
    if (
      lowerTitle.includes("puzzle") ||
      lowerTitle.includes("brain") ||
      lowerTitle.includes("logic")
    )
      return "🧩";
    if (
      lowerTitle.includes("race") ||
      lowerTitle.includes("racing") ||
      lowerTitle.includes("car")
    )
      return "🏎️";
    if (
      lowerTitle.includes("shoot") ||
      lowerTitle.includes("gun") ||
      lowerTitle.includes("blast")
    )
      return "🔫";
    if (lowerTitle.includes("jump") || lowerTitle.includes("platform"))
      return "🦘";
    if (lowerTitle.includes("adventure") || lowerTitle.includes("quest"))
      return "⚔️";
    if (lowerTitle.includes("snake")) return "🐍";
    if (lowerTitle.includes("ball") || lowerTitle.includes("bounce"))
      return "⚽";
    if (lowerTitle.includes("bird") || lowerTitle.includes("fly")) return "🐦";
    if (lowerTitle.includes("alien") || lowerTitle.includes("invader"))
      return "👾";
    if (lowerTitle.includes("maze") || lowerTitle.includes("labyrinth"))
      return "🌀";
    if (lowerTitle.includes("tower") || lowerTitle.includes("defense"))
      return "🏰";
    if (lowerTitle.includes("card") || lowerTitle.includes("memory"))
      return "🃏";
    if (lowerTitle.includes("candy") || lowerTitle.includes("match"))
      return "🍬";
    if (lowerTitle.includes("zombie") || lowerTitle.includes("monster"))
      return "🧟";
    if (lowerTitle.includes("ninja") || lowerTitle.includes("warrior"))
      return "🥷";
    if (
      lowerTitle.includes("fish") ||
      lowerTitle.includes("ocean") ||
      lowerTitle.includes("sea")
    )
      return "🐟";
    if (lowerTitle.includes("dragon")) return "🐉";
    if (lowerTitle.includes("pixel") || lowerTitle.includes("retro"))
      return "👾";
    if (lowerTitle.includes("avoid") || lowerTitle.includes("dodge"))
      return "💨";
    return "🎮";
  };

  const publishedCount = data?.filter((g) => g.published).length || 0;
  const unpublishedCount = data?.filter((g) => !g.published).length || 0;

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-purple-50/30 to-white dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12 text-center space-y-6 opacity-0 animate-[fadeIn_1s_ease-out_forwards]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800">
            <HistoryIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Your AI Creations
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight">
            <span className="block bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent bg-size-[200%_auto] animate-[gradient_8s_ease_infinite]">
              Game History
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            View and manage all your AI-generated games
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 opacity-0 animate-[fadeIn_1s_ease-out_0.2s_forwards]">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterPublished === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPublished("all")}
            >
              All ({data?.length || 0})
            </Button>
            <Button
              variant={filterPublished === "published" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPublished("published")}
              className="gap-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              Published ({publishedCount})
            </Button>
            <Button
              variant={
                filterPublished === "unpublished" ? "default" : "outline"
              }
              size="sm"
              onClick={() => setFilterPublished("unpublished")}
              className="gap-1"
            >
              <XCircle className="w-4 h-4" />
              Unpublished ({unpublishedCount})
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        {!isLoading && (
          <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-0 animate-[fadeIn_1s_ease-out_0.2s_forwards]">
            {[
              {
                icon: Gamepad2,
                label: "Total Games",
                value: data?.length || 0,
                color: "text-purple-600 dark:text-purple-400",
              },
              {
                icon: Clock,
                label: "Recent",
                value:
                  data?.filter(
                    (g) =>
                      new Date().getTime() - new Date(g.createdAt).getTime() <
                      7 * 24 * 60 * 60 * 1000
                  ).length || 0,
                color: "text-blue-600 dark:text-blue-400",
              },
              {
                icon: CheckCircle2,
                label: "Published",
                value: publishedCount,
                color: "text-green-600 dark:text-green-400",
              },
              {
                icon: Code,
                label: "Versions",
                value: data?.reduce((sum, g) => sum + g.currentVersion, 0) || 0,
                color: "text-pink-600 dark:text-pink-400",
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <>
            {/* Skeleton Stats Bar */}
            <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skeleton Game Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card
                  key={i}
                  className="relative overflow-hidden bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-800"
                >
                  <div className="p-6 space-y-4">
                    {/* Header Skeleton */}
                    <div className="flex items-start gap-4">
                      <Skeleton className="shrink-0 w-16 h-16 rounded-2xl" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-20 rounded-full" />
                          <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                      </div>
                    </div>

                    {/* Description Skeleton */}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>

                    {/* Meta Skeleton */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                      <Skeleton className="h-3 w-3 rounded" />
                      <Skeleton className="h-3 w-24" />
                    </div>

                    {/* Action Buttons Skeleton */}
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="flex-1 h-10" />
                      <Skeleton className="w-10 h-10" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-12 border-destructive/50 bg-destructive/10">
            <div className="text-center space-y-4">
              <div className="text-6xl">❌</div>
              <p className="text-xl text-destructive font-semibold">
                Failed to load games
              </p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          </Card>
        )}

        {/* Games Grid */}
        {!isLoading && !error && (
          <>
            {filteredGames && filteredGames.length === 0 ? (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎮</div>
                  <p className="text-2xl font-bold">
                    {searchQuery || filterPublished !== "all"
                      ? "No games found"
                      : "No games created yet!"}
                  </p>
                  <p className="text-muted-foreground">
                    {searchQuery || filterPublished !== "all"
                      ? "Try adjusting your search or filters"
                      : "Create your first AI-powered game to get started"}
                  </p>
                  {!searchQuery && filterPublished === "all" && (
                    <Link href="/ai" className="inline-block mt-6">
                      <Button size="lg" className="font-bold">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Create Your First Game
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ) : (
              <section className="opacity-0 animate-[fadeIn_1s_ease-out_0.4s_forwards]">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredGames?.map((game, index) => (
                    <Card
                      key={game.id}
                      className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-300 dark:hover:border-purple-700 hover:-translate-y-2"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Hover Gradient Overlay */}
                      <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                      <div className="relative p-6 space-y-4">
                        {/* Header with Icon and Title */}
                        <div className="flex items-start gap-4">
                          <div className="shrink-0 w-16 h-16 rounded-2xl bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                            {getGameIcon(game.title)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white line-clamp-2 mb-2">
                              {game.title}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              {game.published ? (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Published
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Draft
                                </Badge>
                              )}
                              {game.currentVersion > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  v{game.currentVersion}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        {game.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {game.description}
                          </p>
                        )}

                        {/* Meta Info */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-gray-200 dark:border-gray-800">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(game.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Link href={`/ai/${game.id}`} className="flex-1">
                            <Button className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/40 transition-all duration-300">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Open
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 dark:hover:border-red-700"
                            onClick={() => setGameToDelete(game.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </Button>
                        </div>
                      </div>

                      {/* Decorative Corner Accent */}
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center space-y-6 p-8 rounded-3xl bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 shadow-2xl shadow-purple-500/30 opacity-0 animate-[fadeIn_1s_ease-out_0.6s_forwards]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white">
            Ready to create more?
          </h2>
          <p className="text-lg text-purple-100 max-w-2xl mx-auto">
            Use our AI-powered game studio to bring your ideas to life
          </p>
          <Link href="/ai">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 text-base font-bold"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create New Game
            </Button>
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={gameToDelete !== null}
        onOpenChange={(open) => !open && setGameToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Delete Game
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this game? This action cannot be
              undone and all versions will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (gameToDelete) {
                  deleteGame.mutate(gameToDelete);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteGame.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
