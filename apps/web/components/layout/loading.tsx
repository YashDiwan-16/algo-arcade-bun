import { Gamepad2 } from "lucide-react";

export default function LoadingScreen({ text }: { text?: string }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-linear-to-br from-background via-background to-amber-950/10`}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Animated Logo */}
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 -m-4">
            <div className="h-32 w-32 animate-spin rounded-full border-4 border-transparent border-t-amber-500 border-r-orange-500"></div>
          </div>

          {/* Middle pulsing ring */}
          <div className="absolute inset-0 -m-2">
            <div className="h-28 w-28 animate-pulse rounded-full border-2 border-orange-500/30"></div>
          </div>

          {/* Center icon with gradient */}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-amber-500 via-orange-500 to-red-500 shadow-2xl shadow-orange-500/50">
            <Gamepad2 className="h-12 w-12 text-white animate-pulse" />
          </div>

          {/* Glow effect */}
          <div className="absolute inset-0 -z-10 animate-pulse blur-2xl">
            <div className="h-24 w-24 rounded-full bg-linear-to-br from-amber-500 via-orange-500 to-red-500 opacity-60"></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-2xl font-bold bg-linear-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Algo Games
          </h2>

          {/* Loading dots animation */}
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-amber-500 [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 animate-bounce rounded-full bg-red-500"></div>
          </div>

          <p className="text-sm text-muted-foreground animate-pulse">
            {text || "Loading your gaming experience..."}
          </p>
        </div>
      </div>
    </div>
  );
}
