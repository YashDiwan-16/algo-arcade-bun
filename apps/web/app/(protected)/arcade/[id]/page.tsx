"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Sparkles, Zap, Trophy } from "lucide-react";
import { client } from "@/lib/orpc";
import Link from "next/link";

export default function ArenaGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;

  const { data: game, isLoading } = useQuery({
    queryKey: ["arena-game", gameId],
    queryFn: async () => {
      return await client.arena.game({ id: gameId });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg text-muted-foreground">Game not found</p>
        <Button onClick={() => router.push("/arcade")}>Back to Arena</Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Game Content */}
      <div className="flex-1 container mx-auto p-4 flex gap-4">
        {/* Game Preview - Takes most space */}
        <div className="flex-1 relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative h-full rounded-2xl overflow-hidden border-2 border-slate-200/50 dark:border-slate-800/50 bg-slate-900 shadow-2xl">
            <iframe
              srcDoc={game.code}
              className="w-full h-full border-0"
              title={game.title}
              sandbox="allow-scripts"
            />
          </div>
        </div>

        {/* Game Info Sidebar */}
        <div className="w-80">
          <Card className="border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
                Why Create with AI?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center shrink-0">
                  <Zap className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Lightning Fast
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Create games in minutes, not hours
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center shrink-0">
                  <Sparkles className="h-3 w-3 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    AI Powered
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Smart assistance every step of the way
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center shrink-0">
                  <Trophy className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    No Code Required
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Build without writing a single line
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="mt-4 overflow-hidden border-purple-300 dark:border-purple-700 bg-linear-to-br from-purple-500/10 via-pink-500/10 to-purple-500/10 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-purple-500/20 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/30 transition-all group">
            <div className="absolute inset-0 bg-linear-to-br from-purple-600/20 to-pink-600/20 dark:from-purple-600/30 dark:to-pink-600/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">
                Create Your Own!
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Like this game? Build your own masterpiece with AI assistance in
                minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <Button
                asChild
                className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/50 dark:shadow-purple-500/30 font-semibold group"
              >
                <Link
                  href="/ai"
                  className="flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
                  Start Creating
                  <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
