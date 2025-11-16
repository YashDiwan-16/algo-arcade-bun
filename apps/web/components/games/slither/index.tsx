"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import type {
  GameState,
  DisplayState,
  PowerUpState,
  DeathInfo,
  Point,
} from "./types";
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  BASE_SNAKE_SPEED,
  POWER_UP_SPEED_MULTIPLIER,
  POWER_UP_DURATION,
  POWER_UP_COOLDOWN,
} from "./constants";
import { useGameRefs } from "./useGameRefs";
import {
  checkSnakeCollision,
  generateLeaderboard,
  updateSnakeSegments,
} from "./game-logic";
import {
  drawBackground,
  drawBoundaries,
  drawOrbs,
  drawDeathOrbs,
  drawParticles,
  drawSnake,
  drawBots,
  drawMiniMap,
} from "./rendering";
import { GameStats } from "./GameStats";
import { ControlsInfo } from "./ControlsInfo";
import { GameOverDialog } from "./GameOverDialog";
import { StartScreen } from "./StartScreen";
import { useSidebar } from "@/components/ui/sidebar";
import { useScoreGameStats } from "@/hooks/use-score-game-stats";

export default function SlitherGame() {
  const { data: session } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game statistics tracking
  const {
    updateScore,
    isUpdating: isSavingStats,
    highScore,
    totalPlays,
    isNewHighScore,
  } = useScoreGameStats("slither");
  const animationRef = useRef<number | undefined>(undefined);
  const scoreSubmittedRef = useRef(false);
  const [canvasSize, setCanvasSize] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 800,
    height: typeof window !== "undefined" ? window.innerHeight : 600,
  }));

  const { setOpen, setOpenMobile, isMobile } = useSidebar();

  // Close sidebar initially when component mounts (but allow user to reopen it)
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
  }, []);

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    isPlaying: false,
    isAlive: true,
    gameStarted: false,
    playerName: "Player",
  });

  // Display state (for UI rendering)
  const [displayState, setDisplayState] = useState<DisplayState>({
    snakeLength: 8,
    botCount: 8,
    playerRank: 1,
  });

  // Power-up state
  const [powerUpState, setPowerUpState] = useState<PowerUpState>({
    isActive: false,
    cooldown: false,
    duration: 0,
    cooldownTime: 0,
  });

  // UI state
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [deathInfo, setDeathInfo] = useState<DeathInfo | null>(null);
  const [finalRank, setFinalRank] = useState(0);

  // Game refs and logic
  const {
    snake,
    bots,
    orbs,
    deathOrbs,
    particles,
    camera,
    mouseRef,
    resetGame,
    addParticle,
    updateBotsAI,
    collectOrbs,
    updateParticlesAndOrbs,
    updateSnakeHead,
    updateCamera,
  } = useGameRefs();

  // Update canvas size
  const updateCanvasSize = useCallback(() => {
    setCanvasSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [updateCanvasSize]); // Get current snake speed
  const getCurrentSpeed = useCallback(() => {
    return powerUpState.isActive
      ? BASE_SNAKE_SPEED * POWER_UP_SPEED_MULTIPLIER
      : BASE_SNAKE_SPEED;
  }, [powerUpState.isActive]);

  // Mouse movement handler
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    },
    [mouseRef]
  );

  // Keyboard handler for power-up
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space" && gameState.isAlive && gameState.gameStarted) {
        e.preventDefault();

        if (!powerUpState.isActive && !powerUpState.cooldown) {
          setPowerUpState({
            isActive: true,
            cooldown: false,
            duration: POWER_UP_DURATION,
            cooldownTime: 0,
          });

          const head = snake.current[0];
          addParticle(head.x, head.y, "#ffff00", 15);
        }
      }
    },
    [
      gameState.isAlive,
      gameState.gameStarted,
      powerUpState.isActive,
      powerUpState.cooldown,
      snake,
      addParticle,
    ]
  );

  // Kill player
  const killPlayer = useCallback(
    (
      cause: "boundary" | "bot",
      killerBot?: { name: string; color: string }
    ) => {
      if (!gameState.isAlive) return;

      const head = snake.current[0];
      addParticle(head.x, head.y, "#ff6b6b", 20);

      // Calculate final rank
      const leaderboard = generateLeaderboard(
        gameState.playerName,
        gameState.score,
        snake.current.length,
        bots.current,
        gameState.gameStarted
      );
      const playerRank = leaderboard.findIndex((entry) => entry.isPlayer) + 1;

      // Save score to database (only once per game session)
      if (gameState.score > 0 && !scoreSubmittedRef.current) {
        scoreSubmittedRef.current = true;
        updateScore(gameState.score);
      }

      setDeathInfo({
        cause,
        botName: killerBot?.name,
        botColor: killerBot?.color,
      });
      setFinalRank(playerRank);
      setGameState((prev) => ({ ...prev, isAlive: false, isPlaying: false }));
      setShowGameOverDialog(true);
    },
    [
      gameState.isAlive,
      gameState.playerName,
      gameState.score,
      gameState.gameStarted,
      snake,
      bots,
      addParticle,
      updateScore,
    ]
  );

  // Start game
  const startGame = useCallback(() => {
    resetGame();
    scoreSubmittedRef.current = false; // Reset score submission flag

    setGameState({
      score: 0,
      isPlaying: true,
      isAlive: true,
      gameStarted: true,
      playerName: session?.user?.name || "Player",
    });

    setPowerUpState({
      isActive: false,
      cooldown: false,
      duration: 0,
      cooldownTime: 0,
    });

    setShowGameOverDialog(false);
    setDeathInfo(null);
    setFinalRank(0);
  }, [resetGame, session]);

  // Restart game
  const restartGame = useCallback(() => {
    scoreSubmittedRef.current = false; // Reset score submission flag

    setGameState((prev) => ({
      ...prev,
      score: 0,
      isPlaying: true,
      isAlive: true,
      gameStarted: false,
    }));

    setPowerUpState({
      isActive: false,
      cooldown: false,
      duration: 0,
      cooldownTime: 0,
    });

    setShowGameOverDialog(false);
  }, []);

  // Update power-up state
  useEffect(() => {
    if (!gameState.gameStarted) return;

    const interval = setInterval(() => {
      setPowerUpState((prev) => {
        if (prev.isActive && prev.duration > 0) {
          const newDuration = prev.duration - 100;
          if (newDuration <= 0) {
            return {
              isActive: false,
              cooldown: true,
              duration: 0,
              cooldownTime: POWER_UP_COOLDOWN,
            };
          }
          return { ...prev, duration: newDuration };
        } else if (prev.cooldown && prev.cooldownTime > 0) {
          const newCooldownTime = prev.cooldownTime - 100;
          if (newCooldownTime <= 0) {
            return {
              isActive: false,
              cooldown: false,
              duration: 0,
              cooldownTime: 0,
            };
          }
          return { ...prev, cooldownTime: newCooldownTime };
        }
        return prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.gameStarted]);

  // Game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !gameState.gameStarted) return;

    // Draw background and boundaries
    drawBackground(ctx, canvasSize, camera.current);
    drawBoundaries(ctx, camera.current);

    // Update snake movement (only if alive)
    if (gameState.isAlive) {
      const head = snake.current[0];
      const centerX = canvasSize.width / 2;
      const centerY = canvasSize.height / 2;

      const dx = mouseRef.current.x - centerX;
      const dy = mouseRef.current.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        const currentSpeed = getCurrentSpeed();
        const newHead: Point = {
          x: head.x + (dx / distance) * currentSpeed,
          y: head.y + (dy / distance) * currentSpeed,
        };

        // Check boundary collision
        if (
          newHead.x < 20 ||
          newHead.x > WORLD_WIDTH - 20 ||
          newHead.y < 20 ||
          newHead.y > WORLD_HEIGHT - 20
        ) {
          killPlayer("boundary");
        } else {
          updateSnakeHead(newHead);

          // Check collision with bots
          for (const bot of bots.current) {
            if (checkSnakeCollision(snake.current, bot.segments)) {
              killPlayer("bot", { name: bot.name, color: bot.color });
              break;
            }
          }

          // Update segments
          updateSnakeSegments(snake.current);

          // Add trail particles
          if (Math.random() < 0.3) {
            const trailColor = powerUpState.isActive ? "#ffff00" : "#4ecdc4";
            addParticle(head.x, head.y, trailColor, 1);
          }
        }
      }

      updateCamera(head.x - centerX, head.y - centerY);
    }

    // Update bots
    const killedBots = updateBotsAI(gameState.isAlive);
    if (killedBots > 0) {
      setGameState((prev) => ({
        ...prev,
        score: prev.score + Math.floor(killedBots * 5),
      }));
    }

    // Collect orbs
    collectOrbs((points) => {
      setGameState((prev) => ({ ...prev, score: prev.score + points }));
    });

    // Update particles and orbs
    updateParticlesAndOrbs();

    // Draw everything
    drawOrbs(ctx, orbs.current, camera.current, canvasSize);
    drawDeathOrbs(ctx, deathOrbs.current, camera.current, canvasSize);
    drawParticles(ctx, particles.current, camera.current);
    drawSnake(ctx, snake.current, camera.current, powerUpState);
    drawBots(ctx, bots.current, camera.current);
    drawMiniMap(
      ctx,
      canvasSize,
      camera.current,
      snake.current,
      bots.current,
      gameState.isAlive,
      powerUpState
    );

    // Update display state
    const leaderboard = generateLeaderboard(
      gameState.playerName,
      gameState.score,
      snake.current.length,
      bots.current,
      gameState.gameStarted
    );
    setDisplayState({
      snakeLength: snake.current.length,
      botCount: bots.current.length,
      playerRank: leaderboard.findIndex((entry) => entry.isPlayer) + 1,
    });
  }, [
    gameState.gameStarted,
    gameState.isAlive,
    gameState.playerName,
    gameState.score,
    canvasSize,
    camera,
    snake,
    bots,
    orbs,
    deathOrbs,
    particles,
    mouseRef,
    powerUpState,
    getCurrentSpeed,
    killPlayer,
    updateBotsAI,
    collectOrbs,
    updateParticlesAndOrbs,
    addParticle,
    updateSnakeHead,
    updateCamera,
  ]);

  // Animation loop
  useEffect(() => {
    if (!gameState.gameStarted) return;

    const animate = () => {
      gameLoop();
      animationRef.current = requestAnimationFrame(animate);
    };

    if (animationRef.current === undefined) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current !== undefined) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };
  }, [gameLoop, gameState.gameStarted]);

  // Event listeners
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleMouseMove, handleKeyPress]);

  // Start screen
  if (!gameState.gameStarted) {
    return <StartScreen onStart={startGame} />;
  }

  // Game screen
  const leaderboard = generateLeaderboard(
    gameState.playerName,
    gameState.score,
    snake.current.length,
    bots.current,
    gameState.gameStarted
  );

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black text-white overflow-hidden">
      <GameStats
        playerName={gameState.playerName}
        score={gameState.score}
        displayState={displayState}
        powerUpState={powerUpState}
      />

      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="cursor-none"
        style={{
          background:
            "radial-gradient(circle at center, #1a1a2e 0%, #0a0a0a 100%)",
        }}
      />

      {showGameOverDialog && deathInfo && (
        <GameOverDialog
          deathInfo={deathInfo}
          finalRank={finalRank}
          playerName={gameState.playerName}
          score={gameState.score}
          displayState={displayState}
          leaderboard={leaderboard}
          onRestart={restartGame}
          highScore={highScore}
          isNewHighScore={isNewHighScore}
        />
      )}

      <ControlsInfo />
    </div>
  );
}
