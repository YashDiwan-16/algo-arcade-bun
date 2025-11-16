import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Star,
  TrendingUp,
  Award,
  Target,
  Zap,
} from "lucide-react";

interface Game {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  gameType: "score" | "win-loss";
}

const games: Game[] = [
  {
    id: "head-soccer",
    title: "Head Soccer",
    description:
      "Compete for the most wins in this fast-paced physics soccer game. Track your victories and climb the ranks!",
    image: "/games/head-soccer.png",
    category: "Sports",
    difficulty: "Medium",
    gameType: "win-loss",
  },
  {
    id: "showdown",
    title: "Quick Draw Showdown",
    description:
      "Test your reflexes and rack up wins in this Wild West quick-draw duel. Be the fastest gunslinger!",
    image: "/games/showdown.png",
    category: "Action",
    difficulty: "Hard",
    gameType: "win-loss",
  },
  {
    id: "rock-paper-scissor",
    title: "Rock Paper Scissors",
    description:
      "Outsmart the AI and build your win streak in this classic hand game with modern tracking.",
    image: "/games/rock-paper-scissor.png",
    category: "Casual",
    difficulty: "Easy",
    gameType: "win-loss",
  },
  {
    id: "slither",
    title: "Slither",
    description:
      "Grow the longest snake and achieve the highest score. Can you dominate the arena and top the leaderboard?",
    image: "/games/slither.png",
    category: "Casual",
    difficulty: "Medium",
    gameType: "score",
  },
  {
    id: "endless-runner",
    title: "Endless Runner",
    description:
      "Run as far as you can and set the highest score. Dodge obstacles and collect coins to beat other players!",
    image: "/games/endless-runner.jpg",
    category: "Action",
    difficulty: "Easy",
    gameType: "score",
  },
  {
    id: "paaji",
    title: "Paaji",
    description:
      "Compete for the highest winnings! Cash out at the right time and see who can earn the most coins.",
    image: "/games/paaji.png",
    category: "Adventure",
    difficulty: "Medium",
    gameType: "score",
  },
];

const difficultyColors = {
  Easy: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
  Medium:
    "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  Hard: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

const categoryIcons = {
  Sports: "⚽",
  Action: "⚡",
  Casual: "🎮",
  Adventure: "🗺️",
};

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-yellow-50/30 to-white dark:from-gray-950 dark:via-yellow-950/20 dark:to-gray-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-yellow-300/20 dark:bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-orange-300/20 dark:bg-orange-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12 text-center space-y-6 opacity-0 animate-[fadeIn_1s_ease-out_forwards]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border border-yellow-200 dark:border-yellow-800">
            <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
              {games.length} Game Leaderboards
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight">
            <span className="flex items-center justify-center gap-3">
              <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400" />
              <span className="block bg-linear-to-r from-yellow-600 via-orange-600 to-red-600 dark:from-yellow-400 dark:via-orange-400 dark:to-red-400 bg-clip-text text-transparent bg-size-[200%_auto] animate-[gradient_8s_ease_infinite]">
                Leaderboards
              </span>
              <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400" />
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Compete with players worldwide and climb to the top of each game
          </p>
        </div>

        {/* Stats Bar */}
        <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-0 animate-[fadeIn_1s_ease-out_0.2s_forwards]">
          {[
            {
              icon: Trophy,
              label: "Win/Loss",
              value: "3",
              color: "text-yellow-600 dark:text-yellow-400",
            },
            {
              icon: Target,
              label: "Score-Based",
              value: "3",
              color: "text-blue-600 dark:text-blue-400",
            },
            {
              icon: Award,
              label: "Total Games",
              value: "6",
              color: "text-purple-600 dark:text-purple-400",
            },
            {
              icon: TrendingUp,
              label: "Active",
              value: "6",
              color: "text-green-600 dark:text-green-400",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-200 dark:border-gray-800 hover:border-yellow-300 dark:hover:border-yellow-700 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-linear-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30">
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

        {/* Games Grid */}
        <section className="opacity-0 animate-[fadeIn_1s_ease-out_0.4s_forwards]">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game, index) => (
              <Link
                key={game.id}
                href={`/leaderboard/${game.id}`}
                className="group relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/20 hover:border-yellow-300 dark:hover:border-yellow-700 hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-br from-yellow-500/10 via-orange-500/10 to-red-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Image Container */}
                <div className="relative aspect-video overflow-hidden">
                  {/* Image Overlay Gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-gray-900/90 via-gray-900/40 to-transparent z-10" />

                  {/* Category Badge on Image */}
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <div className="px-3 py-1.5 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 flex items-center gap-1.5">
                      <span className="text-lg">
                        {
                          categoryIcons[
                            game.category as keyof typeof categoryIcons
                          ]
                        }
                      </span>
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">
                        {game.category}
                      </span>
                    </div>
                  </div>

                  {/* Difficulty Badge on Image */}
                  <div className="absolute top-4 right-4 z-20">
                    <Badge
                      variant="outline"
                      className={`text-xs font-bold backdrop-blur-md ${
                        difficultyColors[game.difficulty]
                      }`}
                    >
                      {game.difficulty}
                    </Badge>
                  </div>

                  {/* Game Type Badge */}
                  <div className="absolute bottom-4 right-4 z-20">
                    <div
                      className={`px-3 py-1.5 rounded-full backdrop-blur-md border ${
                        game.gameType === "score"
                          ? "bg-blue-500/90 border-blue-400/50 text-white"
                          : "bg-green-500/90 border-green-400/50 text-white"
                      }`}
                    >
                      <span className="text-xs font-bold">
                        {game.gameType === "score"
                          ? "🎯 High Score"
                          : "🏆 Win/Loss"}
                      </span>
                    </div>
                  </div>

                  <Image
                    src={game.image}
                    alt={game.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>

                {/* Content Container */}
                <div className="relative p-6 space-y-4">
                  {/* Title with Icon */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-yellow-600 group-hover:to-orange-600 dark:group-hover:from-yellow-400 dark:group-hover:to-orange-400 group-hover:bg-clip-text transition-all duration-300">
                      {game.title}
                    </h3>
                    <div className="p-2 rounded-xl bg-linear-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                      <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {game.description}
                  </p>

                  {/* View Leaderboard Button */}
                  <Button className="w-full bg-linear-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white shadow-lg shadow-yellow-500/30 group-hover:shadow-xl group-hover:shadow-yellow-500/40 transition-all duration-300 text-base font-bold">
                    <span className="flex items-center justify-center gap-2">
                      View Leaderboard
                      <Trophy className="w-5 h-5 transition-transform group-hover:scale-110" />
                    </span>
                  </Button>
                </div>

                {/* Decorative Corner Accent */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-linear-to-br from-yellow-500/20 to-orange-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-16 text-center space-y-6 p-8 rounded-3xl bg-linear-to-r from-yellow-600 via-orange-600 to-red-600 shadow-2xl shadow-yellow-500/30 opacity-0 animate-[fadeIn_1s_ease-out_0.6s_forwards]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white">
            Ready to compete?
          </h2>
          <p className="text-lg text-yellow-100 max-w-2xl mx-auto">
            Play our games and see if you can top the leaderboards!
          </p>
          <a href="/games">
            <Button
              size="lg"
              className="bg-white text-yellow-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 text-base font-bold"
            >
              <Zap className="w-5 h-5 mr-2" />
              Play Games
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
