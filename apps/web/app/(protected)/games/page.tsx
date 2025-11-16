import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Star, Users, Zap, TrendingUp } from "lucide-react";

interface Game {
  id: string;
  title: string;
  description: string;
  image: string;
  href: string;
  category: string;
  players: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const games: Game[] = [
  {
    id: "head-soccer",
    title: "Head Soccer",
    description:
      "A fast-paced physics-based soccer game where you control characters with oversized heads. Jump, kick, and score goals in this exciting 1v1 match!",
    image: "/games/head-soccer.png",
    href: "/games/head-soccer",
    category: "Sports",
    players: "1-2 Players",
    difficulty: "Medium",
  },
  {
    id: "showdown",
    title: "Quick Draw Showdown",
    description:
      "Test your reflexes in this Wild West quick-draw duel. Wait for the signal and be the fastest to draw your weapon. One shot, one chance!",
    image: "/games/showdown.png",
    href: "/games/showdown",
    category: "Action",
    players: "Single Player",
    difficulty: "Hard",
  },
  {
    id: "rock-paper-scissor",
    title: "Rock Paper Scissors",
    description:
      "The classic hand game with a modern twist. Challenge the AI and see if you can outsmart it in this timeless battle of wits.",
    image: "/games/rock-paper-scissor.png",
    href: "/games/rock-paper-scissor",
    category: "Casual",
    players: "Single Player",
    difficulty: "Easy",
  },
  {
    id: "paaji",
    title: "Paaji",
    description:
      "An exciting adventure game featuring unique mechanics and challenging gameplay. Explore, compete, and conquer in this thrilling experience!",
    image: "/games/paaji.png",
    href: "/games/paaji",
    category: "Adventure",
    players: "Single Player",
    difficulty: "Medium",
  },
  {
    id: "endless-runner",
    title: "Endless Runner",
    description:
      "Run, jump, and dodge obstacles in this fast-paced endless runner game. How far can you go while collecting coins and power-ups?",
    image: "/games/endless-runner.jpg",
    href: "/games/endless-runner",
    category: "Action",
    players: "Single Player",
    difficulty: "Easy",
  },
  {
    id: "slither",
    title: "Slither",
    description:
      "A multiplayer snake game where you grow by consuming orbs and outmaneuver other players. Can you become the longest snake on the server?",
    image: "/games/slither.png",
    href: "/games/slither",
    category: "Casual",
    players: "Multiplayer",
    difficulty: "Medium",
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

export default function GamesPage() {
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
            <Gamepad2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
              {games.length} Games Available
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight">
            <span className="block bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent bg-size-[200%_auto] animate-[gradient_8s_ease_infinite]">
              Games Arena
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose your adventure from our collection of exciting games
          </p>
        </div>

        {/* Stats Bar */}
        <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-0 animate-[fadeIn_1s_ease-out_0.2s_forwards]">
          {[
            {
              icon: Star,
              label: "Featured",
              value: "4",
              color: "text-yellow-600 dark:text-yellow-400",
            },
            {
              icon: Users,
              label: "Multiplayer",
              value: "1",
              color: "text-blue-600 dark:text-blue-400",
            },
            {
              icon: Zap,
              label: "Action",
              value: "1",
              color: "text-purple-600 dark:text-purple-400",
            },
            {
              icon: TrendingUp,
              label: "Popular",
              value: "4",
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

        {/* Games Grid */}
        <section className="opacity-0 animate-[fadeIn_1s_ease-out_0.4s_forwards]">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game, index) => (
              <Link
                key={game.id}
                href={game.href}
                className="group relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-800 shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-300 dark:hover:border-purple-700 hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

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
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-purple-600 group-hover:to-pink-600 dark:group-hover:from-purple-400 dark:group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
                      {game.title}
                    </h3>
                    <div className="p-2 rounded-xl bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                      <Gamepad2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {game.description}
                  </p>

                  {/* Meta Information */}
                  <div className="flex items-center gap-2 pt-2">
                    <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        👥 {game.players}
                      </span>
                    </div>
                  </div>

                  {/* Play Button */}
                  <Button className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/40 transition-all duration-300 text-base font-bold">
                    <span className="flex items-center justify-center gap-2">
                      Play Now
                      <Gamepad2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                    </span>
                  </Button>
                </div>

                {/* Decorative Corner Accent */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-linear-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
            ))}
          </div>
        </section>

        {/* Empty State */}
        {games.length === 0 && (
          <div className="flex min-h-[500px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-12 text-center">
            <div className="mb-6 rounded-full bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-8 animate-pulse">
              <Gamepad2 className="h-16 w-16 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="mb-3 text-3xl font-black text-gray-900 dark:text-white">
              No Games Available Yet
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
              Our game collection is being prepared. Check back soon for
              exciting new games!
            </p>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center space-y-6 p-8 rounded-3xl bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 shadow-2xl shadow-purple-500/30 opacity-0 animate-[fadeIn_1s_ease-out_0.6s_forwards]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-lg text-purple-100 max-w-2xl mx-auto">
            Create your own custom game with our AI-powered game studio
          </p>
          <a href="/studio">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 text-base font-bold"
            >
              <Zap className="w-5 h-5 mr-2" />
              Create with AI Studio
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
