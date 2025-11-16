"use client";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/orpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Gamepad2,
  Trophy,
  Users,
  Rocket,
  Zap,
  Star,
  ArrowRight,
  Play,
  Code,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { data: stats } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: async () => {
      const result = await client.stats.platform({});
      return result;
    },
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-white via-purple-50/30 to-white dark:from-gray-950 dark:via-purple-950/20 dark:to-gray-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-40 right-20 w-96 h-96 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-300/20 dark:bg-pink-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-32 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Text */}
            <div className="space-y-8 opacity-0 animate-[fadeIn_1s_ease-out_forwards]">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  AI-Powered Game Creation
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight">
                <span className="block text-gray-900 dark:text-white">
                  Welcome to{" "}
                </span>
                <span className="block bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent bg-size-[200%_auto] animate-[gradient_8s_ease_infinite]">
                  Algo Arcade
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                Play exciting games, create your own with AI, and share them
                with the world. The future of gaming is here, and it&apos;s
                powered by your imagination.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/arcade">
                  <Button
                    size="lg"
                    className="group bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300"
                  >
                    <Play className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
                    Play Games
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link href="/ai">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-all duration-300"
                  >
                    <Sparkles className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" />
                    Create with AI
                  </Button>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.totalUsers.toLocaleString() || "0"}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Players
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.totalGamesGenerated.toLocaleString() || "0"}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Games Created
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.totalPlays.toLocaleString() || "0"}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Plays
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - 3D Visual Element */}
            <div className="relative lg:h-[600px] flex items-center justify-center">
              <div className="relative w-full max-w-lg aspect-square">
                {/* Floating Cards */}
                <div className="absolute inset-0 animate-[float_6s_ease-in-out_infinite]">
                  <Card className="absolute top-0 right-0 w-48 bg-linear-to-br from-purple-500 to-pink-500 border-0 shadow-2xl shadow-purple-500/50 rotate-6 hover:rotate-12 transition-transform duration-500">
                    <CardContent className="p-6 text-white">
                      <Gamepad2 className="w-12 h-12 mb-3" />
                      <h3 className="font-bold text-lg">Instant Play</h3>
                      <p className="text-sm text-purple-100">
                        Jump into action
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="absolute top-1/4 left-0 w-48 bg-linear-to-br from-blue-500 to-cyan-500 border-0 shadow-2xl shadow-blue-500/50 -rotate-6 hover:-rotate-12 transition-transform duration-500"
                    style={{ animationDelay: "150ms" }}
                  >
                    <CardContent className="p-6 text-white">
                      <Code className="w-12 h-12 mb-3" />
                      <h3 className="font-bold text-lg">AI Studio</h3>
                      <p className="text-sm text-blue-100">Create with ease</p>
                    </CardContent>
                  </Card>

                  <Card
                    className="absolute bottom-1/4 right-1/4 w-48 bg-linear-to-br from-pink-500 to-orange-500 border-0 shadow-2xl shadow-pink-500/50 rotate-3 hover:rotate-6 transition-transform duration-500"
                    style={{ animationDelay: "300ms" }}
                  >
                    <CardContent className="p-6 text-white">
                      <Trophy className="w-12 h-12 mb-3" />
                      <h3 className="font-bold text-lg">Compete</h3>
                      <p className="text-sm text-pink-100">Climb the ranks</p>
                    </CardContent>
                  </Card>

                  <Card
                    className="absolute bottom-0 left-1/4 w-48 bg-linear-to-br from-green-500 to-emerald-500 border-0 shadow-2xl shadow-green-500/50 -rotate-3 hover:-rotate-6 transition-transform duration-500"
                    style={{ animationDelay: "450ms" }}
                  >
                    <CardContent className="p-6 text-white">
                      <Globe className="w-12 h-12 mb-3" />
                      <h3 className="font-bold text-lg">Share</h3>
                      <p className="text-sm text-green-100">Global community</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Center Glow */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 bg-linear-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 dark:from-purple-500/20 dark:via-pink-500/20 dark:to-blue-500/20 rounded-full blur-3xl animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <Badge
              variant="outline"
              className="px-4 py-1 text-sm font-semibold border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
            >
              Features
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From playing to creating, we&apos;ve got you covered with
              cutting-edge features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Trophy,
                title: "Leaderboards",
                description:
                  "Compete globally and track your progress across all games",
                bg: "bg-yellow-50 dark:bg-yellow-950/20",
                iconColor: "text-yellow-600 dark:text-yellow-400",
              },
              {
                icon: Rocket,
                title: "Instant Publishing",
                description:
                  "One-click publishing to share your games with the community",
                bg: "bg-blue-50 dark:bg-blue-950/20",
                iconColor: "text-blue-600 dark:text-blue-400",
              },
              {
                icon: Zap,
                title: "Real-time Stats",
                description:
                  "Track your performance and game analytics in real-time",
                bg: "bg-purple-50 dark:bg-purple-950/20",
                iconColor: "text-purple-600 dark:text-purple-400",
              },
              {
                icon: Sparkles,
                title: "AI-Powered Creation",
                description:
                  "Generate unique games with advanced AI technology",
                bg: "bg-pink-50 dark:bg-pink-950/20",
                iconColor: "text-pink-600 dark:text-pink-400",
              },
              {
                icon: Users,
                title: "Community Driven",
                description:
                  "Connect with creators and players from around the world",
                bg: "bg-green-50 dark:bg-green-950/20",
                iconColor: "text-green-600 dark:text-green-400",
              },
              {
                icon: Star,
                title: "Premium Quality",
                description:
                  "High-quality games with stunning graphics and smooth gameplay",
                bg: "bg-indigo-50 dark:bg-indigo-950/20",
                iconColor: "text-indigo-600 dark:text-indigo-400",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10" />
                <CardContent className="p-8 relative">
                  <div
                    className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110`}
                  >
                    <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
