import type { DisplayState, PowerUpState } from "./types";

interface GameStatsProps {
  playerName: string;
  score: number;
  displayState: DisplayState;
  powerUpState: PowerUpState;
}

export function GameStats({
  playerName,
  score,
  displayState,
  powerUpState,
}: GameStatsProps) {
  return (
    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 bg-black bg-opacity-70 backdrop-blur-sm p-2 sm:p-4 rounded-lg border border-cyan-400 border-opacity-30 max-w-[180px] sm:max-w-none">
      <h1 className="text-base sm:text-2xl font-bold mb-1 sm:mb-2 text-cyan-400">
        {playerName}&apos;s Game
      </h1>
      <div className="flex flex-col gap-1 sm:gap-2 text-sm sm:text-lg">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Score:</span>
          <span className="text-cyan-400 font-bold">{score}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Length:</span>
          <span className="text-cyan-400 font-bold">
            {displayState.snakeLength}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Bots:</span>
          <span className="text-red-400 font-bold">
            {displayState.botCount}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Rank:</span>
          <span className="text-yellow-400 font-bold">
            #{displayState.playerRank}
          </span>
        </div>
      </div>

      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-700">
        {powerUpState.isActive && (
          <div className="text-yellow-400 font-bold animate-pulse text-xs sm:text-base">
            ⚡ BOOST: {Math.ceil(powerUpState.duration / 1000)}s
          </div>
        )}
        {powerUpState.cooldown && (
          <div className="text-gray-400 text-xs sm:text-base">
            ⏳ Cooldown: {Math.ceil(powerUpState.cooldownTime / 1000)}s
          </div>
        )}
        {!powerUpState.isActive && !powerUpState.cooldown && (
          <div className="text-green-400 text-xs sm:text-base">
            ✨ Press SPACE for boost!
          </div>
        )}
      </div>
    </div>
  );
}
