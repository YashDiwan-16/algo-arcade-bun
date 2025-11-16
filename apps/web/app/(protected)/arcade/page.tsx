"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Gamepad2,
  Users,
  Star,
  TrendingUp,
  Zap,
  Crown,
  Play,
} from "lucide-react";
import { client } from "@/lib/orpc";
import Link from "next/link";
import LoadingScreen from "@/components/layout/loading";

export default function ArenaPage() {
  const [page, setPage] = useState(1);
  const perPage = 12;

  const { data, isLoading } = useQuery({
    queryKey: ["arena-games", page],
    queryFn: async () => {
      return await client.arena.games({ page, perPage });
    },
  });

  if (isLoading) {
    return <LoadingScreen text="Loading games..." />;
  }

  return (
    <div className="h-full bg-linear-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 pt-12">
        <div className="mb-12 text-center space-y-6 opacity-0 animate-[fadeIn_1s_ease-out_forwards]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800">
            <Gamepad2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
              {data?.games.length || 0} Games Available
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight">
            <span className="block bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent bg-size-[200%_auto] animate-[gradient_8s_ease_infinite]">
              Game Arcade
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Dive into a world of fun! Explore, play, and enjoy a variety of
            games created by our amazing community.
          </p>
        </div>

        {/* Games Grid */}
        {data?.games && data.games.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
              {data.games.map((game, index) => (
                <Link
                  key={game.id}
                  href={`/arcade/${game.id}`}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 hover:border-primary/50"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-purple-500/10 to-pink-500/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  {/* Featured Badge */}
                  {index === 0 && (
                    <div className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-linear-to-r from-yellow-500 to-orange-500 text-xs font-bold text-white flex items-center gap-1 shadow-lg">
                      <Crown className="h-3 w-3" />
                      Featured
                    </div>
                  )}

                  {/* Game Preview */}
                  <div className="relative aspect-video overflow-hidden bg-linear-to-br from-muted to-muted/50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent z-10 pointer-events-none" />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-2xl">
                        <Play
                          className="h-8 w-8 text-primary-foreground ml-1"
                          fill="currentColor"
                        />
                      </div>
                    </div>

                    <iframe
                      srcDoc={game.html || ""}
                      className="w-full h-full border-none pointer-events-none transform scale-100 group-hover:scale-105 transition-transform duration-500"
                      sandbox="allow-scripts allow-popups allow-presentation"
                      loading="lazy"
                    />
                  </div>

                  {/* Game Info */}
                  <div className="relative p-5">
                    <h3 className="mb-2 text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                      {game.title}
                    </h3>
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {game.description}
                    </p>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span>
                          4.{Math.floor(game.id.charCodeAt(0) % 3) + 6}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>
                          {Math.floor((game.id.charCodeAt(1) % 9) * 100) + 100}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">Hot</span>
                      </div>
                    </div>

                    <Button className="w-full rounded-xl font-semibold shadow-lg group-hover:shadow-primary/50 transition-shadow">
                      Play Now
                      <Gamepad2 className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  {/* Shine Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.pageCount > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl min-w-[120px]"
                  size="lg"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from(
                    { length: Math.min(data.pageCount, 5) },
                    (_, i) => {
                      let pageNum;
                      if (data.pageCount <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= data.pageCount - 2) {
                        pageNum = data.pageCount - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          onClick={() => setPage(pageNum)}
                          className={`rounded-xl min-w-11 ${
                            pageNum === page
                              ? "shadow-lg shadow-primary/50"
                              : ""
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() =>
                    setPage((p) => Math.min(data.pageCount, p + 1))
                  }
                  disabled={page === data.pageCount}
                  className="rounded-xl min-w-[120px]"
                  size="lg"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative bg-linear-to-br from-primary/10 to-purple-500/10 p-8 rounded-3xl border border-primary/20">
                <Gamepad2 className="h-20 w-20 text-primary" />
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-3">No Games Available Yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Be a pioneer! Create and publish the first game to the arena and
              become a legend.
            </p>

            <Button
              asChild
              size="lg"
              className="rounded-xl bg-linear-to-r from-primary via-purple-500 to-pink-500 text-white font-semibold shadow-2xl hover:shadow-primary/50 transition-all hover:scale-105"
            >
              <Link href="/ai">
                <Zap className="mr-2 h-5 w-5" />
                Create Your First Game
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
