"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gamepad2,
  Store,
  Clock,
  Sparkles,
  Home,
  TrendingUp,
  Zap,
  MessageCirclePlus,
  ChessKing,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/orpc";
import { formatDistanceToNow } from "date-fns";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarHeader,
} from "@/components/ui/sidebar";

// Navigation blocks
const navigationItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Games",
    url: "/games",
    icon: Gamepad2,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "AI",
    url: "/ai",
    icon: MessageCirclePlus,
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "History",
    url: "/history",
    icon: Clock,
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    title: "Arcade",
    url: "/arcade",
    icon: Store,
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    title: "Rewards",
    url: "/rewards",
    icon: Sparkles,
    gradient: "from-green-500 to-teal-500",
  },
  {
    title: "Leaderboard",
    url: "/leaderboard",
    icon: ChessKing,
    gradient: "from-pink-500 to-red-500",
  },
];

// Available games from components
const gameComponents = [
  {
    name: "Head Soccer",
    path: "/games/head-soccer",
    emoji: "⚽",
    color: "text-green-500",
  },
  {
    name: "Quick Draw",
    path: "/games/showdown",
    emoji: "🔫",
    color: "text-orange-500",
  },
  {
    name: "Rock Paper Scissor",
    path: "/games/rock-paper-scissor",
    emoji: "✊",
    color: "text-blue-500",
  },
  {
    name: "Paaji",
    path: "/games/paaji",
    emoji: "🎮",
    color: "text-purple-500",
  },
  {
    name: "Endless Runner",
    path: "/games/endless-runner",
    emoji: "🏃‍♂️",
    color: "text-red-500",
  },
  {
    name: "Slither",
    path: "/games/slither",
    emoji: "🐍",
    color: "text-green-500",
  },
];

// Game icon emojis based on common game types/keywords
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
  if (lowerTitle.includes("ball") || lowerTitle.includes("bounce")) return "⚽";
  if (lowerTitle.includes("bird") || lowerTitle.includes("fly")) return "🐦";
  if (lowerTitle.includes("alien") || lowerTitle.includes("invader"))
    return "👾";
  if (lowerTitle.includes("maze") || lowerTitle.includes("labyrinth"))
    return "🌀";
  if (lowerTitle.includes("tower") || lowerTitle.includes("defense"))
    return "🏰";
  if (lowerTitle.includes("card") || lowerTitle.includes("memory")) return "🃏";
  if (lowerTitle.includes("candy") || lowerTitle.includes("match")) return "🍬";
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
  if (lowerTitle.includes("pixel") || lowerTitle.includes("retro")) return "👾";
  if (lowerTitle.includes("avoid") || lowerTitle.includes("dodge")) return "💨";
  return "🎮"; // default game icon
};

export function AppSidebar() {
  const pathname = usePathname();

  // Fetch user's recent AI game generations
  const { data: recentGamesData } = useQuery({
    queryKey: ["recentAIGames"],
    queryFn: async () => {
      try {
        return await client.ai.recentGames({ limit: 4 });
      } catch (error) {
        // Return empty array if not authenticated or error occurs
        console.error("Error fetching recent AI games:", error);
        return { games: [] };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });

  const recentGenerations = (recentGamesData?.games || []).map((game) => ({
    id: game.id,
    name: game.title,
    createdAt: formatDistanceToNow(new Date(game.createdAt), {
      addSuffix: true,
    }),
    icon: getGameIcon(game.title),
  }));

  return (
    <Sidebar>
      <SidebarHeader className="bg-background border-b border-sidebar-border">
        <Link href={"/"} className="flex items-center gap-2 px-2 py-2">
          <Gamepad2 className="h-8 w-8 text-gradient-to-br from-amber-500 to-orange-600" />
          <span className="text-lg font-bold">Algo Games</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-linear-to-b from-background to-background/95 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Section 1: Navigation Blocks */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            <TrendingUp className="h-3 w-3" />
            <span>Explore</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`group relative overflow-hidden transition-all ${
                          isActive
                            ? "bg-accent/70 shadow-lg shadow-primary/20 py-3"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-linear-to-r from-primary/20 via-primary/10 to-transparent animate-pulse" />
                        )}
                        <div className="absolute inset-0 -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
                        <div
                          className={`relative rounded-md bg-linear-to-br ${
                            item.gradient
                          } p-1.5 ${
                            isActive
                              ? "shadow-md shadow-primary/30 scale-110"
                              : ""
                          } transition-transform`}
                        >
                          <item.icon className="h-4 w-4 text-white" />
                        </div>
                        <span
                          className={`relative font-medium ${
                            isActive ? "text-primary font-semibold" : ""
                          }`}
                        >
                          {item.title}
                        </span>
                        {isActive && (
                          <div className="absolute right-2 h-2 w-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-linear-to-r from-transparent via-border to-transparent" />

        {/* Section 2: Popular Games */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            <Zap className="h-3 w-3 text-yellow-500" />
            <span>Popular Games</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {gameComponents.map((game) => {
                const isActive = pathname === game.path;
                return (
                  <SidebarMenuItem key={game.path}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={game.path}
                        className={`group relative overflow-hidden transition-all py-3 ${
                          isActive
                            ? "bg-accent/70 shadow-lg shadow-primary/20"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-linear-to-r from-primary/20 via-primary/10 to-transparent animate-pulse" />
                        )}
                        <div className="absolute inset-0 -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
                        <div
                          className={`relative flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-lg transition-transform ${
                            isActive
                              ? "scale-110 shadow-md shadow-primary/30 ring-2 ring-primary/50"
                              : "group-hover:scale-110"
                          }`}
                        >
                          {game.emoji}
                        </div>
                        <div className="relative flex flex-col">
                          <span
                            className={`text-sm font-medium ${
                              isActive ? "text-primary font-semibold" : ""
                            }`}
                          >
                            {/* show maximum 20 characters */}
                            {game.name.length > 20
                              ? `${game.name.slice(0, 20)}...`
                              : game.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {isActive ? "Now playing" : "Play now"}
                          </span>
                        </div>
                        {isActive && (
                          <div className="absolute right-2 h-2 w-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="bg-linear-to-r from-transparent via-border to-transparent" />

        {/* Section 3: Recent Generations */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="h-3 w-3 text-purple-500" />
            <span>Your Arcades</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentGenerations.map((gen) => (
                <SidebarMenuItem key={gen.id}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={`/ai/${gen.id}`}
                      className="group relative overflow-hidden transition-all hover:bg-accent/50"
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-purple-500/5 to-transparent -translate-x-full transition-transform duration-500 group-hover:translate-x-full" />
                      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-lg transition-transform group-hover:scale-110 group-hover:bg-purple-500/20">
                        {gen.icon}
                      </div>
                      <div className="relative flex flex-col gap-0.5">
                        <span className="text-sm font-medium">
                          {gen.name.length > 20
                            ? `${gen.name.slice(0, 20)}...`
                            : gen.name}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {gen.createdAt}
                        </span>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Pro Tip Section */}
        <div className="mx-4 mb-4 mt-auto rounded-lg border border-primary/20 bg-linear-to-br from-primary/5 via-purple-500/5 to-pink-500/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-semibold">Pro Tip</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Create your own games using our AI-powered editor!
          </p>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
