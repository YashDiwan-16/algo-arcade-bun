"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGameStats } from "@/hooks/use-game-stats";

type GameState =
  | "waiting"
  | "ready"
  | "countdown"
  | "fire"
  | "result"
  | "staking"
  | "contract_ready";
type Winner = "player" | "ai" | "none";
type GameStats = { playerWins: number; aiWins: number };

export default function QuickDrawGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>("waiting");
  const [winner, setWinner] = useState<Winner>("none");
  const [message, setMessage] = useState("Connect wallet to start staking!");
  const [stats, setStats] = useState<GameStats>({ playerWins: 0, aiWins: 0 });
  const [playerShot, setPlayerShot] = useState(false);
  const [aiShot, setAiShot] = useState(false);
  const [playerFell, setPlayerFell] = useState(false);
  const [aiFell, setAiFell] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [showReadyIndicator, setShowReadyIndicator] = useState(false);
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPostClaimDialog, setShowPostClaimDialog] = useState(false);
  const { updateStats } = useGameStats("showdown");
  const statsTrackedRef = useRef(false);

  const gameTimerRef = useRef<number | undefined>(undefined);
  const aiReactionRef = useRef<number | undefined>(undefined);
  const animationRef = useRef<number | undefined>(undefined);

  const STAKE_AMOUNT = 2;
  const BOT_COUNT = 1;
  const REWARD = BOT_COUNT * STAKE_AMOUNT + STAKE_AMOUNT;

  // Drawing functions
  const drawCactus = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => {
    ctx.fillStyle = "#16a34a";
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fillRect(x, y, width, height);
    ctx.fillRect(x - 15, y + 20, 15, 30);
    ctx.fillRect(x + width, y + 30, 15, 25);
    ctx.shadowBlur = 0;
  };

  const drawCowboy = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    facing: "left" | "right",
    shot: boolean,
    fell: boolean,
    isPlayer: boolean,
  ) => {
    ctx.save();
    ctx.translate(x, y);
    if (facing === "right") ctx.scale(-1, 1);

    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 4;

    // Hat
    ctx.fillStyle = "#8b4513";
    ctx.fillRect(-15, -40, 30, 8);
    ctx.fillRect(-20, -48, 40, 8);

    // Head
    ctx.fillStyle = isPlayer ? "#fbbf24" : "#dc2626";
    ctx.fillRect(-10, -32, 20, 20);

    // Body
    ctx.fillStyle = "#1f2937";
    if (fell) {
      ctx.fillRect(-30, -5, 40, 15);
      ctx.fillStyle = "#92400e";
      ctx.fillRect(-35, -10, 15, 8);
      ctx.fillRect(20, -10, 15, 8);
    } else {
      ctx.fillRect(-12, -12, 24, 30);
      ctx.fillStyle = "#92400e";
      if (shot) {
        ctx.fillRect(12, -8, 20, 6);
        ctx.fillStyle = "#374151";
        ctx.fillRect(32, -6, 8, 3);
      } else {
        ctx.fillRect(-18, -8, 8, 20);
        ctx.fillRect(10, -8, 8, 20);
      }
      ctx.fillStyle = "#1e40af";
      ctx.fillRect(-10, 18, 8, 20);
      ctx.fillRect(2, 18, 8, 20);
    }

    ctx.restore();
  };

  const drawMuzzleFlash = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
  ) => {
    // const time = Date.now() * 0.01;
    ctx.save();
    ctx.globalAlpha = 0.8;

    // Outer glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
    gradient.addColorStop(0, "#fef3c7");
    gradient.addColorStop(0.3, "#fbbf24");
    gradient.addColorStop(0.7, "#f59e0b");
    gradient.addColorStop(1, "rgba(245, 158, 11, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Core flash
    ctx.fillStyle = "#fef3c7";
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const drawReadyIndicator = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
  ) => {
    const time = Date.now() * 0.005;
    const alpha = (Math.sin(time) + 1) * 0.5;
    ctx.save();
    ctx.globalAlpha = alpha;

    // Glow effect
    ctx.shadowColor = "#fbbf24";
    ctx.shadowBlur = 30;

    ctx.fillStyle = "#fbbf24";
    ctx.font = "bold 64px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("READY", x, y);
    ctx.restore();
  };

  const drawFireText = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
  ) => {
    ctx.save();

    // Red glow
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 40;

    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 96px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("FIRE!", x, y);

    // White outline
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.strokeText("FIRE!", x, y);

    ctx.restore();
  };

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Animated sky gradient
    const time = Date.now() * 0.0001;
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGradient.addColorStop(0, `hsl(${40 + Math.sin(time) * 5}, 95%, 70%)`);
    skyGradient.addColorStop(0.4, "#fbbf24");
    skyGradient.addColorStop(0.7, "#f59e0b");
    skyGradient.addColorStop(1, "#d97706");
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Animated sun
    ctx.save();
    ctx.fillStyle = "#fef3c7";
    ctx.shadowColor = "#fef3c7";
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(
      canvas.width - 100,
      80 + Math.sin(time * 2) * 5,
      45,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();

    // Ground with texture
    const groundGradient = ctx.createLinearGradient(
      0,
      canvas.height - 100,
      0,
      canvas.height,
    );
    groundGradient.addColorStop(0, "#92400e");
    groundGradient.addColorStop(1, "#78350f");
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

    // Cacti
    drawCactus(ctx, 100, canvas.height - 150, 30, 80);
    drawCactus(ctx, canvas.width - 150, canvas.height - 130, 25, 70);

    // Cowboys
    const playerY = playerFell ? canvas.height - 50 : canvas.height - 120;
    drawCowboy(ctx, 150, playerY, "left", playerShot, playerFell, true);

    const aiY = aiFell ? canvas.height - 50 : canvas.height - 120;
    drawCowboy(ctx, canvas.width - 150, aiY, "right", aiShot, aiFell, false);

    // Muzzle flashes
    if (playerShot && !playerFell)
      drawMuzzleFlash(ctx, 180, canvas.height - 100);
    if (aiShot && !aiFell)
      drawMuzzleFlash(ctx, canvas.width - 180, canvas.height - 100);

    // UI overlays
    if (showReadyIndicator && gameState === "ready") {
      drawReadyIndicator(ctx, canvas.width / 2, canvas.height / 2 - 50);
    }
    if (gameState === "fire") {
      drawFireText(ctx, canvas.width / 2, canvas.height / 2 - 50);
    }
  }, [playerShot, aiShot, playerFell, aiFell, showReadyIndicator, gameState]);

  const endGame = useCallback((gameWinner: Winner, customMessage?: string) => {
    setGameState("result");
    setWinner(gameWinner);
    if (customMessage) {
      setMessage(customMessage);
    } else if (gameWinner === "player") {
      setMessage("You won the duel!");
      setAiFell(true);
      setStats((prev) => ({ ...prev, playerWins: prev.playerWins + 1 }));
    } else if (gameWinner === "ai") {
      setMessage("The AI outgunned you!");
      setPlayerFell(true);
      setStats((prev) => ({ ...prev, aiWins: prev.aiWins + 1 }));
    }
    setTimeout(() => setShowResultDialog(true), 1000);
    if (gameTimerRef.current) clearTimeout(gameTimerRef.current);
    if (aiReactionRef.current) clearTimeout(aiReactionRef.current);
  }, []);

  const playerShoot = useCallback(() => {
    if (gameState === "fire" && !playerShot) {
      setPlayerShot(true);
      if (!aiShot) endGame("player");
    } else if (gameState === "ready" || gameState === "countdown") {
      setPlayerShot(true);
      endGame("ai", "You shot too early!");
    }
  }, [gameState, playerShot, aiShot, endGame]);

  const resetGame = useCallback(() => {
    setGameState("staking");
    setMessage("Stake 2 GEM to play against 1 AI bot!");
    setWinner("none");
    setPlayerShot(false);
    setAiShot(false);
    setPlayerFell(false);
    setAiFell(false);
    setShowReadyIndicator(false);
    setShowResultDialog(false);
    setShowInstructions(false);
    statsTrackedRef.current = false;
    if (gameTimerRef.current) clearTimeout(gameTimerRef.current);
    if (aiReactionRef.current) clearTimeout(aiReactionRef.current);
  }, []);

  // Track stats when game ends
  useEffect(() => {
    if (
      gameState === "result" &&
      winner !== "none" &&
      !statsTrackedRef.current
    ) {
      statsTrackedRef.current = true;

      const playerWon = winner === "player";
      updateStats({ playerWon, tie: false });
    }
  }, [gameState, winner, updateStats]);

  const stakeForGame = () => {
    setIsLoading(true);
    setTimeout(() => {
      setGameState("ready");
      setMessage("Get ready...");
      setShowReadyIndicator(true);
      gameTimerRef.current = window.setTimeout(() => {
        setShowReadyIndicator(false);
        setGameState("countdown");
        setMessage("Wait for it...");
        const delay = Math.random() * 2000 + 1000;
        gameTimerRef.current = window.setTimeout(() => {
          setGameState("fire");
          setMessage("FIRE!");
          const aiReactionTime = Math.random() * 800 + 200;
          aiReactionRef.current = window.setTimeout(() => {
            if (!playerShot) {
              setAiShot(true);
              endGame("ai");
            }
          }, aiReactionTime);
        }, delay);
      }, 2000);
      setShowStakeDialog(false);
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "KeyA") {
        e.preventDefault();
        playerShoot();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [playerShoot]);

  useEffect(() => {
    const animate = () => {
      drawScene();
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [drawScene]);

  useEffect(() => {
    return () => {
      if (gameTimerRef.current) clearTimeout(gameTimerRef.current);
      if (aiReactionRef.current) clearTimeout(aiReactionRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-linear-to-b from-amber-900 via-orange-800 to-amber-950 overflow-hidden">
      {/* Instruction Dialog */}
      {showInstructions && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl mx-4 p-8 bg-linear-to-br from-amber-900 via-orange-900 to-red-950 rounded-2xl border-4 border-amber-600 shadow-2xl">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-amber-600 px-8 py-2 rounded-full border-4 border-amber-400 shadow-lg">
              <h2 className="text-3xl font-bold text-white tracking-wider">
                🤠 QUICK DRAW 🤠
              </h2>
            </div>

            <div className="mt-8 space-y-6 text-amber-100">
              <div className="bg-black/30 rounded-lg p-6 border-2 border-amber-700">
                <h3 className="text-xl font-bold text-amber-300 mb-4">
                  HOW TO PLAY:
                </h3>
                <ul className="space-y-3 text-lg">
                  <li className="flex items-center gap-3">
                    <span className="text-2xl">💰</span>
                    <span>Stake 2 GEM to challenge 1 AI bot</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-2xl">🎯</span>
                    <span>Click START to begin the duel</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-2xl">⏰</span>
                    <span>Wait for the &quot;FIRE!&quot; command</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-2xl">🔫</span>
                    <span>
                      Press{" "}
                      <kbd className="px-3 py-1 bg-amber-700 rounded font-mono font-bold">
                        A
                      </kbd>{" "}
                      to shoot
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex justify-around text-center bg-linear-to-r from-amber-700 via-yellow-600 to-amber-700 p-4 rounded-lg border-2 border-amber-400">
                <div>
                  <div className="text-sm text-amber-200">Your Stake</div>
                  <div className="text-2xl font-bold text-white">2 GEM</div>
                </div>
                <div className="border-l-2 border-amber-400"></div>
                <div>
                  <div className="text-sm text-amber-200">Prize Pool</div>
                  <div className="text-2xl font-bold text-white">
                    {REWARD} GEM
                  </div>
                </div>
                <div className="border-l-2 border-amber-400"></div>
                <div>
                  <div className="text-sm text-amber-200">AI Bots</div>
                  <div className="text-2xl font-bold text-white">1</div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => {
                  setShowInstructions(false);
                  setShowStakeDialog(true);
                }}
                className="flex-1 bg-linear-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg border-2 border-green-400"
              >
                🎮 START DUEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staking Dialog */}
      {showStakeDialog && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl mx-4 p-8 bg-linear-to-br from-amber-900 via-orange-900 to-red-950 rounded-2xl border-4 border-amber-600 shadow-2xl">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-amber-600 px-8 py-2 rounded-full border-4 border-amber-400 shadow-lg">
              <h2 className="text-2xl font-bold text-white">
                💰 STAKE TO PLAY 💰
              </h2>
            </div>

            <div className="mt-8 space-y-6">
              <div className="bg-black/40 rounded-lg p-6 border-2 border-amber-700 space-y-3 text-amber-100 text-lg">
                <div className="flex justify-between">
                  <span>Your Stake:</span>
                  <span className="font-bold text-yellow-400">2 GEM</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Bot Stake:</span>
                  <span className="font-bold text-red-400">2 GEM (1 bot)</span>
                </div>
                <div className="border-t-2 border-amber-700 pt-3 flex justify-between">
                  <span className="font-bold">Total Prize:</span>
                  <span className="font-bold text-2xl text-green-400">
                    {REWARD} GEM
                  </span>
                </div>
                <div className="text-center text-amber-300 text-sm pt-2">
                  ⚡ Winner Takes All! ⚡
                </div>
              </div>

              <button
                onClick={stakeForGame}
                disabled={isLoading}
                className="w-full bg-linear-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg border-2 border-green-400 disabled:border-gray-500"
              >
                {isLoading ? "⏳ STAKING..." : "🎯 STAKE 2 GEM & PLAY"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Dialog */}
      {showResultDialog && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl mx-4 p-8 bg-linear-to-br from-amber-900 via-orange-900 to-red-950 rounded-2xl border-4 border-amber-600 shadow-2xl">
            <div
              className={`absolute -top-6 left-1/2 transform -translate-x-1/2 px-8 py-2 rounded-full border-4 shadow-lg ${
                winner === "player"
                  ? "bg-green-600 border-green-400"
                  : "bg-red-600 border-red-400"
              }`}
            >
              <h2 className="text-2xl font-bold text-white">
                {winner === "player" ? "🎉 VICTORY! 🎉" : "💀 DEFEAT 💀"}
              </h2>
            </div>

            <div className="mt-8 space-y-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-100">{message}</p>
              </div>

              {winner === "player" && (
                <div className="bg-green-900/40 border-2 border-green-600 rounded-lg p-6 text-center space-y-4">
                  <p className="text-xl text-green-300">You won the duel! 🏆</p>
                  <p className="text-lg text-amber-100">
                    Claim your reward of{" "}
                    <span className="text-2xl font-bold text-yellow-400">
                      {REWARD} GEM
                    </span>
                  </p>
                  <p className="text-sm text-green-400">
                    (2 GEM stake + 2 GEM from AI bot)
                  </p>
                </div>
              )}

              {winner === "ai" && (
                <div className="bg-red-900/40 border-2 border-red-600 rounded-lg p-6 text-center space-y-4">
                  <p className="text-xl text-red-300">
                    The AI outgunned you! 💀
                  </p>
                  <p className="text-lg text-amber-100">
                    Better luck next time, partner!
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setShowResultDialog(false);
                  setShowPostClaimDialog(true);
                }}
                disabled={isLoading}
                className={`w-full font-bold py-4 px-8 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg border-2 ${
                  winner === "player"
                    ? "bg-linear-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 border-green-400"
                    : "bg-linear-to-r from-orange-600 to-red-700 hover:from-orange-500 hover:to-red-600 border-orange-400"
                } text-white disabled:from-gray-600 disabled:to-gray-700 disabled:border-gray-500`}
              >
                {isLoading
                  ? "⏳ PROCESSING..."
                  : winner === "player"
                    ? `💰 CLAIM ${REWARD} GEM`
                    : "🔄 END GAME & PLAY AGAIN"}
              </button>

              <div className="flex justify-center gap-8 text-lg text-amber-200">
                <div>
                  Your Wins:{" "}
                  <span className="font-bold text-green-400">
                    {stats.playerWins}
                  </span>
                </div>
                <div>
                  AI Wins:{" "}
                  <span className="font-bold text-red-400">{stats.aiWins}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post-Claim Dialog */}
      {showPostClaimDialog && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-xl mx-4 p-8 bg-linear-to-br from-amber-900 via-orange-900 to-red-950 rounded-2xl border-4 border-amber-600 shadow-2xl">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-purple-600 px-8 py-2 rounded-full border-4 border-purple-400 shadow-lg">
              <h2 className="text-2xl font-bold text-white">
                🎉 GAME COMPLETE! 🎉
              </h2>
            </div>

            <div className="mt-8 space-y-6">
              <p className="text-xl text-center text-amber-100">
                What would you like to do next?
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setShowPostClaimDialog(false);
                    resetGame();
                    setShowStakeDialog(true);
                  }}
                  className="w-full bg-linear-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg border-2 border-green-400"
                >
                  🎮 STAKE AGAIN & PLAY
                </button>

                <button
                  onClick={() => (window.location.href = "/")}
                  className="w-full bg-linear-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg border-2 border-blue-400"
                >
                  🏠 GO TO HOME
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Canvas */}
      <div className="relative w-full h-full flex flex-col">
        {/* Scoreboard */}
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center px-8 py-6 bg-linear-to-b from-black/60 to-transparent">
          <div className="bg-linear-to-r from-blue-600 to-blue-800 px-6 py-3 rounded-xl border-2 border-blue-400 shadow-lg">
            <div className="text-xs text-blue-200 uppercase tracking-wider">
              You
            </div>
            <div className="text-3xl font-bold text-white">
              {stats.playerWins}
            </div>
          </div>

          <div className="bg-black/60 backdrop-blur-sm px-8 py-3 rounded-xl border-2 border-amber-600 shadow-lg">
            <div className="text-center text-amber-400 text-sm font-semibold">
              POOL
            </div>
            <div className="text-2xl font-bold text-white text-center">
              80 $
            </div>
          </div>

          <div className="bg-linear-to-r from-red-600 to-red-800 px-6 py-3 rounded-xl border-2 border-red-400 shadow-lg">
            <div className="text-xs text-red-200 uppercase tracking-wider text-right">
              AI
            </div>
            <div className="text-3xl font-bold text-white text-right">
              {stats.aiWins}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={1200}
          height={600}
          className="w-full h-full"
          onClick={playerShoot}
        />

        {/* Message Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-linear-to-t from-black/80 to-transparent py-8">
          <div className="text-center">
            <div className="inline-block bg-black/60 backdrop-blur-sm px-12 py-4 rounded-xl border-2 border-amber-600 shadow-2xl">
              <p className="text-2xl font-bold text-amber-300 tracking-wider">
                {message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
