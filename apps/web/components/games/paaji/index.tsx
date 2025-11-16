"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";
import { X, Sparkles, Trophy, Zap } from "lucide-react";
import { useSound } from "@/hooks/use-sound";
import Image from "next/image";
import { useScoreGameStats } from "@/hooks/use-score-game-stats";

type GameStatus = "idle" | "in-progress" | "won" | "lost" | "cashed-out";
type Difficulty = "Easy" | "Hard";

interface PaajiProps {
  rows?: number;
  cols?: number;
}

type RowConfig = {
  safeIndices: number[];
  revealedIndex?: number;
};

type PopupType = "win" | "lose" | null;
type PopupState = {
  isOpen: boolean;
  type: PopupType;
};

export function Paaji({ rows = 8, cols = 4 }: PaajiProps) {
  // Game statistics tracking
  const {
    updateScore,
    highScore,
    totalPlays,
    isNewHighScore,
  } = useScoreGameStats("paaji");
  const scoreSubmittedRef = React.useRef(false);

  const [status, setStatus] = React.useState<GameStatus>("idle");
  const [currentRow, setCurrentRow] = React.useState(0);
  const [config, setConfig] = React.useState<RowConfig[]>([]);
  const [steps, setSteps] = React.useState(0);
  const [difficulty, setDifficulty] = React.useState<Difficulty>("Easy");
  const [numCols, setNumCols] = React.useState(cols);
  const [betAmount, setBetAmount] = React.useState<string>("10");
  const [balance, setBalance] = React.useState<number>(1000);
  const [popup, setPopup] = React.useState<PopupState>({
    isOpen: false,
    type: null,
  });
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [successMessage, setSuccessMessage] = React.useState<string>("");

  const [PaajiWinSound] = useSound("/sounds/PaajiWin.mp3");
  const [BetSound] = useSound("/sounds/Bet.mp3");
  const [PaajiLoseSound] = useSound("/sounds/PaajiLose.mp3");
  const [PaajiCashoutSound] = useSound("/sounds/PaajiCashOut.mp3");

  const multiplier = React.useMemo(() => {
    const easy = [1.12, 1.36, 1.65, 1.95, 2.0, 2.4, 2.6, 3.0];
    const hard = [1.25, 1.56, 1.95, 2.2, 2.8, 3.5, 4.3, 5.0];
    const list = difficulty === "Easy" ? easy : hard;
    const idx = Math.min(steps, Math.max(0, list.length - 1));
    const value = list[idx] ?? list[list.length - 1] ?? 1;
    return value.toFixed(2);
  }, [steps, difficulty]);

  const potentialWin = React.useMemo(() => {
    const bet = parseFloat(betAmount) || 0;
    return (bet * parseFloat(multiplier)).toFixed(2);
  }, [betAmount, multiplier]);

  const canPlay = status === "in-progress";

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  React.useEffect(() => {
    if (errorMessage || successMessage) {
      const t = setTimeout(clearMessages, 4000);
      return () => clearTimeout(t);
    }
  }, [errorMessage, successMessage]);

  React.useEffect(() => {
    setNumCols(difficulty === "Easy" ? 4 : 5);
  }, [difficulty]);

  function generateBoard(): RowConfig[] {
    const safePerRow = difficulty === "Easy" ? 2 : 1;
    return Array.from({ length: rows }, () => {
      const safeIndices: number[] = [];
      while (safeIndices.length < safePerRow) {
        const idx = Math.floor(Math.random() * numCols);
        if (!safeIndices.includes(idx)) safeIndices.push(idx);
      }
      return { safeIndices };
    });
  }

  async function startGame() {
    clearMessages();
    scoreSubmittedRef.current = false; // Reset score submission flag

    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) {
      setErrorMessage("Please enter a valid bet amount.");
      return;
    }

    if (bet > balance) {
      setErrorMessage("Insufficient balance!");
      return;
    }

    if (bet < 1) {
      setErrorMessage("Minimum bet amount is 1.");
      return;
    }

    BetSound();
    setBalance((prev) => prev - bet);
    setConfig(generateBoard());
    setStatus("in-progress");
    setCurrentRow(0);
    setSteps(0);
    setPopup({ isOpen: false, type: null });
    setSuccessMessage("🎮 Game started! Good luck!");
  }

  function resetGame() {
    setStatus("idle");
    setCurrentRow(0);
    setConfig([]);
    setSteps(0);
    setPopup({ isOpen: false, type: null });
  }

  const cashOut = async () => {
    if (status === "in-progress") {
      PaajiCashoutSound();
      setStatus("cashed-out");
      const winnings = parseFloat(potentialWin);
      setBalance((prev) => prev + winnings);
      setSuccessMessage(`💰 Cashed out ${winnings.toFixed(2)} coins!`);
      // Save winnings amount - only once per game session
      if (!scoreSubmittedRef.current) {
        scoreSubmittedRef.current = true;
        updateScore(Math.round(winnings)); // Store winnings as score
      }
    }
  };

  const pickTile = (row: number, col: number) => {
    if (!canPlay || row !== currentRow) return;

    setConfig((prev) => {
      const next = [...prev];
      next[row] = { ...(next[row] ?? { safeIndices: [] }), revealedIndex: col };
      return next;
    });

    const isSafe = config[row]?.safeIndices?.includes(col);
    if (isSafe) {
      PaajiWinSound();
      const nextRow = currentRow + 1;
      setSteps((s) => s + 1);

      if (nextRow >= rows) {
        setStatus("won");
        PaajiCashoutSound();
        const winnings = parseFloat(potentialWin);
        setBalance((prev) => prev + winnings);
        setSuccessMessage(`🎉 You won ${winnings.toFixed(2)} coins!`);
        // Save winnings amount - only once per game session
        if (!scoreSubmittedRef.current) {
          scoreSubmittedRef.current = true;
          updateScore(Math.round(winnings)); // Store winnings as score
        }
      } else {
        setCurrentRow(nextRow);
      }
    } else {
      PaajiLoseSound();
      setStatus("lost");
      setErrorMessage("💥 Better luck next time!");
      // Save 0 for loss (still increments totalPlays) - only once per game session
      if (!scoreSubmittedRef.current) {
        scoreSubmittedRef.current = true;
        updateScore(0); // Loss = 0 winnings, but still counts as a play
      }
    }
  };

  React.useEffect(() => {
    if (status === "lost") setPopup({ isOpen: true, type: "lose" });
    if (status === "won" || status === "cashed-out")
      setPopup({ isOpen: true, type: "win" });
  }, [status]);

  React.useEffect(() => {
    if (popup.isOpen && popup.type === "win") {
      const end = Date.now() + 2500;
      const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

      const frame = () => {
        if (Date.now() > end) return;
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          startVelocity: 60,
          origin: { x: 0, y: 0.5 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          startVelocity: 60,
          origin: { x: 1, y: 0.5 },
          colors,
        });
        requestAnimationFrame(frame);
      };
      frame();
    }
  }, [popup]);

  const closePopup = () => {
    setPopup({ isOpen: false, type: null });
    resetGame();
  };

  const adjustBetAmount = (factor: number) => {
    const val = parseFloat(betAmount) || 0;
    const newVal = Math.max(1, val * factor);
    setBetAmount(newVal.toFixed(0));
  };

  return (
    <div className="mx-auto max-w-6xl w-full pt-4 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
        {/* Left Panel */}
        <div className="rounded-3xl border-2 border-primary/20 bg-linear-to-br from-background via-background to-primary/5 p-6 space-y-4 shadow-xl">
          {/* Balance Card */}
          <div className="bg-linear-to-r from-primary/20 to-purple-500/20 border-2 border-primary/30 rounded-2xl p-4 text-center backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Balance
              </span>
            </div>
            <p className="text-3xl font-bold text-primary">
              {balance.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">coins</p>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="bg-red-500/10 border-2 border-red-500/30 rounded-2xl p-3 text-center text-red-400 animate-in fade-in slide-in-from-top-2">
              <p className="font-medium">{errorMessage}</p>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-500/10 border-2 border-green-500/30 rounded-2xl p-3 text-center text-green-400 animate-in fade-in slide-in-from-top-2">
              <p className="font-medium">{successMessage}</p>
            </div>
          )}

          {/* Bet Amount */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
              <Zap className="w-3 h-3" />
              Bet Amount
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  disabled={status === "in-progress"}
                  className="pr-16 h-12 text-lg font-semibold bg-background/50 border-2"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  coins
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustBetAmount(0.5)}
                disabled={status === "in-progress"}
                className="h-9"
              >
                ½×
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => adjustBetAmount(2)}
                disabled={status === "in-progress"}
                className="h-9"
              >
                2×
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBetAmount(Math.min(balance, 100).toFixed(0))}
                disabled={status === "in-progress"}
                className="h-9"
              >
                Max
              </Button>
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Difficulty
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["Easy", "Hard"].map((d) => (
                <Button
                  key={d}
                  onClick={() => {
                    setDifficulty(d as Difficulty);
                    resetGame();
                  }}
                  variant={difficulty === d ? "default" : "outline"}
                  className="h-11 font-semibold"
                  disabled={status === "in-progress"}
                >
                  {d === "Easy" ? "😊 Easy" : "🔥 Hard"}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {difficulty === "Easy"
                ? "2 safe tiles per row"
                : "1 safe tile per row"}
            </p>
          </div>

          {/* Game Controls */}
          {status !== "in-progress" ? (
            <Button
              className="w-full h-14 text-lg font-bold rounded-2xl bg-linear-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg"
              onClick={startGame}
            >
              <Trophy className="w-5 h-5 mr-2" />
              Start Game
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={cashOut}
                className="h-12 font-semibold bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                💰 Cash Out
              </Button>
              <Button
                variant="outline"
                onClick={resetGame}
                className="h-12 font-semibold"
              >
                Reset
              </Button>
            </div>
          )}

          {/* Stats */}
          <div className="bg-background/50 border-2 border-border rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Multiplier</span>
              <span className="text-xl font-bold text-primary">
                {multiplier}×
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Steps</span>
              <span className="text-xl font-bold">
                {steps} / {rows}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-sm font-semibold">Potential Win</span>
              <span className="text-xl font-bold text-green-400">
                {potentialWin}
              </span>
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="relative rounded-3xl border-2 border-primary/20 bg-linear-to-br from-background via-background to-primary/5 p-6 shadow-2xl">
          <div className="absolute top-4 left-4 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 backdrop-blur-sm">
            <p className="text-sm font-semibold">
              {status === "idle" && "🎯 Ready to play!"}
              {status === "in-progress" &&
                `🎮 Row ${currentRow + 1} of ${rows}`}
              {status === "won" && "🏆 Victory!"}
              {status === "lost" && "💥 Game Over"}
              {status === "cashed-out" && "💰 Cashed Out!"}
            </p>
          </div>

          <div className="grid gap-3 mt-12">
            {Array.from({ length: rows }).map((_, rowIdx) => {
              const logicalRow = rows - 1 - rowIdx;
              const rowCfg = config[logicalRow];
              const isActive = canPlay && logicalRow === currentRow;
              const isPast =
                logicalRow < currentRow ||
                ["won", "lost", "cashed-out"].includes(status);

              return (
                <div
                  key={rowIdx}
                  className={cn(
                    "grid gap-3 transition-all duration-300",
                    numCols === 4 ? "grid-cols-4" : "grid-cols-5",
                    isActive && "scale-[1.02]",
                  )}
                >
                  {Array.from({ length: numCols }).map((__, col) => {
                    const picked = rowCfg?.revealedIndex === col;
                    const isSafe = rowCfg?.safeIndices?.includes(col);
                    const reveal =
                      isPast ||
                      picked ||
                      ["won", "lost", "cashed-out"].includes(status);

                    return (
                      <button
                        key={col}
                        disabled={!isActive}
                        onClick={() => pickTile(logicalRow, col)}
                        className={cn(
                          "aspect-[2.1/1] rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group",
                          isActive
                            ? "border-primary/50 bg-linear-to-br from-primary/20 to-purple-500/20 hover:border-primary hover:scale-105 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
                            : "border-border bg-background/40",
                          picked &&
                            isSafe &&
                            "bg-linear-to-br from-green-500/20 to-emerald-500/20 border-green-500/50",
                          picked &&
                            !isSafe &&
                            "bg-linear-to-br from-red-500/20 to-orange-500/20 border-red-500/50",
                        )}
                      >
                        {isActive && (
                          <div className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/10 to-primary/0 animate-pulse" />
                        )}
                        {reveal && (
                          <div className="flex items-center justify-center h-full animate-in zoom-in-50 duration-300">
                            {isSafe ? (
                              <Image
                                src="/happypaaji.png"
                                width={100}
                                height={100}
                                alt="Safe"
                                className="h-full object-contain p-2"
                              />
                            ) : (
                              <div className="size-12 bg-linear-to-br from-red-500 to-orange-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse" />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popup */}
      {popup.isOpen && (
        <div
          onClick={closePopup}
          className="fixed inset-0 bg-background/90 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300"
        >
          <div className="bg-linear-to-br from-background via-background to-primary/10 border-2 border-primary/30 rounded-3xl p-10 max-w-md w-full text-center relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button
              onClick={closePopup}
              className="absolute top-6 right-6 text-foreground/60 hover:text-foreground hover:bg-foreground/10 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>

            {popup.type === "lose" ? (
              <>
                <div className="mb-6 animate-in zoom-in-50 duration-500">
                  <Image
                    height={100}
                    width={100}
                    src="/Bomb.svg"
                    alt="Lose"
                    className="w-28 mx-auto"
                  />
                </div>
                <h2 className="text-4xl font-bold text-red-400 mb-3">
                  BOOM! 💥
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Better luck next time, champ!
                </p>
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6">
                  <p className="text-sm text-red-300">
                    You made it {steps} step{steps !== 1 ? "s" : ""} this time
                  </p>
                  <p className="text-lg text-red-400 font-bold mt-2">
                    Winnings: 0 coins
                  </p>
                  {highScore > 0 && (
                    <p className="text-sm text-purple-300 mt-2">
                      Your Best Winnings: {highScore} coins
                      {totalPlays > 0 && ` (${totalPlays} plays)`}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="mb-6 animate-in zoom-in-50 duration-500">
                  <Image
                    height={100}
                    width={100}
                    src="/Gems.svg"
                    alt="Win"
                    className="w-28 mx-auto"
                  />
                </div>
                <h2 className="text-4xl font-bold bg-linear-to-r from-primary to-purple-400 bg-clip-text text-transparent mb-3">
                  Amazing! 🎉
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {status === "won"
                    ? "You conquered all rows!"
                    : "Smart cash out!"}
                </p>
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-6">
                  {isNewHighScore && (
                    <p className="text-yellow-400 text-xl font-bold mb-2 animate-pulse">
                      🎉 NEW HIGH WINNINGS! 🎉
                    </p>
                  )}
                  <p className="text-sm text-green-300 mb-2">
                    Multiplier: {multiplier}× | Steps: {steps}
                  </p>
                  <p className="text-2xl font-bold text-green-400">
                    Won {potentialWin} coins!
                  </p>
                  {highScore > 0 && (
                    <p className="text-sm text-purple-300 mt-2">
                      Your Best Winnings: {highScore} coins
                      {totalPlays > 0 && ` (${totalPlays} plays)`}
                    </p>
                  )}
                </div>
              </>
            )}

            <Button
              className="w-full h-14 rounded-2xl text-lg font-bold bg-linear-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg"
              onClick={closePopup}
            >
              Play Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Paaji;
