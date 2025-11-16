import type { DeathInfo, LeaderboardEntry, DisplayState } from "./types";

interface GameOverDialogProps {
  deathInfo: DeathInfo | null;
  finalRank: number;
  playerName: string;
  score: number;
  displayState: DisplayState;
  leaderboard: LeaderboardEntry[];
  onRestart: () => void;
  highScore?: number;
  isNewHighScore?: boolean;
}

export function GameOverDialog({
  deathInfo,
  finalRank,
  playerName,
  score,
  displayState,
  leaderboard,
  onRestart,
  highScore = 0,
  isNewHighScore = false,
}: GameOverDialogProps) {
  if (!deathInfo) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-linear-to-br from-gray-900 to-black p-4 sm:p-6 md:p-8 rounded-2xl max-w-2xl w-full mx-2 sm:mx-4 border-2 border-red-500 shadow-2xl animate-scale-in max-h-[95vh] overflow-y-auto">
        {isNewHighScore && (
          <div className="text-center mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-lg animate-pulse">
            <p className="text-2xl sm:text-3xl font-bold text-white">
              🎉 NEW HIGH SCORE! 🎉
            </p>
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-red-400 mb-4 sm:mb-6 text-center animate-pulse">
          Game Over!
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Left Column: Player Stats */}
          <div className="space-y-4">
            <div className="text-center bg-gray-800 bg-opacity-50 p-3 sm:p-4 rounded-lg">
              <p className="text-lg sm:text-xl md:text-2xl mb-2">
                Final Rank:{" "}
                <span className="text-yellow-400 font-bold">#{finalRank}</span>
              </p>
              <p className="text-sm sm:text-base md:text-lg mb-2">
                Player:{" "}
                <span className="text-cyan-400 font-semibold">
                  {playerName}
                </span>
              </p>
              <p className="text-sm sm:text-base md:text-lg mb-2">
                Final Score:{" "}
                <span className="text-green-400 font-bold">{score}</span>
              </p>
              {highScore > 0 && (
                <p className="text-sm sm:text-base md:text-lg mb-2">
                  High Score:{" "}
                  <span className="text-yellow-400 font-bold">{highScore}</span>
                </p>
              )}
              <p className="text-lg mb-2">
                Final Length:{" "}
                <span className="text-blue-400 font-bold">
                  {displayState.snakeLength}
                </span>
              </p>
            </div>

            <div className="bg-gray-800 bg-opacity-50 p-3 sm:p-4 rounded-lg">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-red-300 mb-2">
                Cause of Death:
              </h3>
              {deathInfo.cause === "boundary" ? (
                <p className="text-xs sm:text-sm md:text-base text-red-200 text-center bg-red-900 bg-opacity-30 p-2 sm:p-3 rounded">
                  💀 Crashed into the world boundary
                </p>
              ) : (
                <div className="flex items-center justify-center space-x-1 sm:space-x-2 bg-red-900 bg-opacity-30 p-2 sm:p-3 rounded">
                  <div
                    className="w-3 sm:w-4 h-3 sm:h-4 rounded-full shrink-0"
                    style={{ backgroundColor: deathInfo.botColor }}
                  />
                  <p className="text-xs sm:text-sm md:text-base text-red-200">
                    🐍 Eliminated by{" "}
                    <span
                      className="font-bold"
                      style={{ color: deathInfo.botColor }}
                    >
                      {deathInfo.botName}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Leaderboard */}
          <div className="bg-gray-800 bg-opacity-50 p-3 sm:p-4 rounded-lg">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-cyan-400 mb-3 sm:mb-4 text-center">
              🏆 Leaderboard
            </h3>
            <div className="space-y-1 sm:space-y-2 max-h-60 sm:max-h-80 overflow-y-auto">
              {leaderboard.map((entry, index) => (
                <div
                  key={`${entry.name}-${entry.isPlayer}`}
                  className={`flex items-center justify-between p-1.5 sm:p-2 rounded transition-colors ${
                    entry.isPlayer
                      ? "bg-cyan-900 bg-opacity-50 border border-cyan-400"
                      : "bg-gray-900 bg-opacity-50"
                  }`}
                >
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span
                      className={`font-bold w-5 sm:w-6 text-xs sm:text-sm ${
                        index < 3 ? "text-yellow-400" : "text-gray-400"
                      }`}
                    >
                      {index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : `#${index + 1}`}
                    </span>
                    <div
                      className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full shadow-lg"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span
                      className={`font-medium text-xs sm:text-sm truncate ${
                        entry.isPlayer ? "text-cyan-400" : "text-white"
                      }`}
                    >
                      {entry.name}
                      {entry.isPlayer && " (You)"}
                    </span>
                  </div>
                  <div className="text-right text-xs sm:text-sm">
                    <div className="text-white font-bold">{entry.score}</div>
                    <div className="text-gray-400">{entry.length}L</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onRestart}
            className="px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base md:text-lg bg-linear-to-r from-cyan-500 to-cyan-400 text-black font-bold rounded-lg hover:from-cyan-400 hover:to-cyan-300 transition-all transform hover:scale-105 shadow-lg"
          >
            🎮 Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
