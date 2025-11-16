"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useScoreGameStats } from "@/hooks/use-score-game-stats";

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "obstacle" | "collectible";
  variant?: number;
  collectibleType?: string;
}

interface HighScore {
  score: number;
  date: string;
}

interface FloatingScore {
  id: number;
  x: number;
  y: number;
  opacity: number;
  offsetY: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

const getGameConfig = () => ({
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 600,
  GROUND_HEIGHT: 100,
  PLAYER_WIDTH: 80,
  PLAYER_HEIGHT: 80,
  GRAVITY: 0.8,
  JUMP_FORCE: -16,
  GAME_SPEED: 6,
  MIN_OBSTACLE_DISTANCE: 350, // Minimum distance between obstacles
  MAX_OBSTACLE_DISTANCE: 600, // Maximum distance between obstacles
  COLLECTIBLE_SPAWN_RATE: 0.006,
});

const MusicIcon = ({ isPlaying }: { isPlaying: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000">
    {isPlaying ? (
      <>
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      </>
    ) : (
      <>
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
      </>
    )}
  </svg>
);

export default function GalopeLibertador() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement>(null);
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const playerImagesRef = useRef<HTMLImageElement[]>([]);
  const obstacleImagesRef = useRef<HTMLImageElement[]>([]);
  const gameConfigRef = useRef(getGameConfig());
  const lastObstacleXRef = useRef<number>(-1000);
  const gameSpeedRef = useRef(6);
  const scoreSubmittedRef = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isClient, setIsClient] = useState(() => typeof window !== "undefined");

  // Game statistics tracking
  const {
    updateScore,
    highScore: dbHighScore,
    totalPlays,
    isNewHighScore,
  } = useScoreGameStats("endless-runner");

  const [gameState, setGameState] = useState<"menu" | "playing" | "gameOver">(
    "menu",
  );
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState<HighScore[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("galope-libertador-scores");
        if (saved) {
          return JSON.parse(saved);
        }
      } catch {
        console.log("Error loading high scores");
      }
    }
    return [];
  });
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [floatingScores, setFloatingScores] = useState<FloatingScore[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 600 });
  const [isPortrait, setIsPortrait] = useState(false);

  // Player state
  const [player, setPlayer] = useState({
    x: 100,
    y: 0,
    velocityY: 0,
    isJumping: false,
    canDoubleJump: true,
    spriteIndex: 0,
    animationCounter: 0,
  });

  // Game objects
  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [backgroundX, setBackgroundX] = useState(0);

  useEffect(() => {
    if (!isClient) return;

    const checkOrientation = () => {
      const isMobile = window.innerWidth <= 768;
      const isPortraitMode = window.innerHeight > window.innerWidth;
      setIsPortrait(isMobile && isPortraitMode);
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;

    const updateCanvasSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setCanvasSize({ width, height });
      gameConfigRef.current.CANVAS_WIDTH = width;
      gameConfigRef.current.CANVAS_HEIGHT = height;

      setPlayer((prev) => ({
        ...prev,
        y:
          height -
          gameConfigRef.current.GROUND_HEIGHT -
          gameConfigRef.current.PLAYER_HEIGHT,
      }));
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    if (typeof window !== "undefined") {
      backgroundImageRef.current = document.createElement("img");
      backgroundImageRef.current.src = "/endless-runner/background.png";

      for (let i = 1; i <= 5; i++) {
        const img = document.createElement("img");
        img.src = `/endless-runner/guemes${i}.png`;
        playerImagesRef.current[i - 1] = img;
      }

      for (let i = 1; i <= 3; i++) {
        const img = document.createElement("img");
        img.src = `/endless-runner/cactus${i}.png`;
        obstacleImagesRef.current[i - 1] = img;
      }
    }

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !audioRef.current) return;

    audioRef.current.volume = 0.3;
    audioRef.current.loop = true;
  }, [isClient]);

  const toggleMusic = useCallback(async () => {
    if (!isClient || !audioRef.current) return;

    try {
      if (isMusicPlaying) {
        audioRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        await audioRef.current.play();
        setIsMusicPlaying(true);
      }
    } catch {
      console.log("Audio play failed");
    }
  }, [isMusicPlaying, isClient]);

  useEffect(() => {
    if (!isClient) return;

    const startMusic = async () => {
      try {
        if (audioRef.current && !isMusicPlaying) {
          await audioRef.current.play();
          setIsMusicPlaying(true);
        }
      } catch {
        console.log("Auto-play blocked");
      }
    };

    const timer = setTimeout(startMusic, 1000);
    return () => clearTimeout(timer);
  }, [isClient, isMusicPlaying]);

  const saveHighScore = useCallback(
    (newScore: number) => {
      if (!isClient) return;

      const newHighScore: HighScore = {
        score: newScore,
        date: new Date().toLocaleDateString(),
      };

      const updatedScores = [...highScores, newHighScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      setHighScores(updatedScores);
      try {
        localStorage.setItem(
          "galope-libertador-scores",
          JSON.stringify(updatedScores),
        );
      } catch {
        console.log("Error saving high scores");
      }
    },
    [highScores, isClient],
  );

  const addFloatingScore = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.random();
    setFloatingScores((prev) => [
      ...prev,
      { id, x, y, opacity: 1, offsetY: 0 },
    ]);

    setTimeout(() => {
      setFloatingScores((prev) => prev.filter((score) => score.id !== id));
    }, 2000);
  }, []);

  const createParticles = useCallback((x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 2 + Math.random() * 2;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
        color,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  useEffect(() => {
    if (!isClient || floatingScores.length === 0) return;

    const interval = setInterval(() => {
      setFloatingScores((prev) =>
        prev
          .map((score) => ({
            ...score,
            opacity: score.opacity - 0.02,
            offsetY: score.offsetY - 2,
          }))
          .filter((score) => score.opacity > 0),
      );
    }, 16);

    return () => clearInterval(interval);
  }, [floatingScores.length, isClient]);

  useEffect(() => {
    if (!isClient || particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.3,
            life: particle.life - 0.02,
          }))
          .filter((particle) => particle.life > 0),
      );
    }, 16);

    return () => clearInterval(interval);
  }, [particles.length, isClient]);

  useEffect(() => {
    if (!isClient || gameState !== "playing") return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setPlayer((prev) => {
          if (!prev.isJumping) {
            createParticles(prev.x + 40, prev.y + 80, "#FFD700");
            return {
              ...prev,
              velocityY: gameConfigRef.current.JUMP_FORCE,
              isJumping: true,
              canDoubleJump: true,
            };
          } else if (prev.canDoubleJump) {
            createParticles(prev.x + 40, prev.y + 40, "#00FFFF");
            return {
              ...prev,
              velocityY: gameConfigRef.current.JUMP_FORCE,
              canDoubleJump: false,
            };
          }
          return prev;
        });
      }

      if (e.code === "ArrowDown") {
        e.preventDefault();
        setPlayer((prev) => ({
          ...prev,
          velocityY: prev.isJumping ? 25 : prev.velocityY,
        }));
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState, isClient, createParticles]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (gameState !== "playing") return;

      setPlayer((prev) => {
        if (!prev.isJumping) {
          createParticles(prev.x + 40, prev.y + 80, "#FFD700");
          return {
            ...prev,
            velocityY: gameConfigRef.current.JUMP_FORCE,
            isJumping: true,
            canDoubleJump: true,
          };
        } else if (prev.canDoubleJump) {
          createParticles(prev.x + 40, prev.y + 40, "#00FFFF");
          return {
            ...prev,
            velocityY: gameConfigRef.current.JUMP_FORCE,
            canDoubleJump: false,
          };
        }
        return prev;
      });
    },
    [gameState, createParticles],
  );

  const checkCollision = useCallback(
    (
      obj1: { x: number; y: number; width: number; height: number },
      obj2: { x: number; y: number; width: number; height: number },
    ) => {
      const hitboxPadding = 8;
      return (
        obj1.x + hitboxPadding < obj2.x + obj2.width - hitboxPadding &&
        obj1.x + obj1.width - hitboxPadding > obj2.x + hitboxPadding &&
        obj1.y + hitboxPadding < obj2.y + obj2.height - hitboxPadding &&
        obj1.y + obj1.height - hitboxPadding > obj2.y + hitboxPadding
      );
    },
    [],
  );
  useEffect(() => {
    if (!isClient || gameState !== "playing") return;

    const gameLoop = () => {
      setPlayer((prev) => {
        const groundY =
          canvasSize.height -
          gameConfigRef.current.GROUND_HEIGHT -
          gameConfigRef.current.PLAYER_HEIGHT;
        let newY = prev.y + prev.velocityY;
        let newVelocityY = prev.velocityY + gameConfigRef.current.GRAVITY;
        let newIsJumping = prev.isJumping;
        let newCanDoubleJump = prev.canDoubleJump;

        if (newY >= groundY) {
          newY = groundY;
          newVelocityY = 0;
          newIsJumping = false;
          newCanDoubleJump = true;
        }

        const newAnimationCounter = prev.animationCounter + 1;
        const newSpriteIndex = Math.floor(newAnimationCounter / 6) % 5;

        return {
          ...prev,
          y: newY,
          velocityY: newVelocityY,
          isJumping: newIsJumping,
          canDoubleJump: newCanDoubleJump,
          spriteIndex: newSpriteIndex,
          animationCounter: newAnimationCounter,
        };
      });

      setBackgroundX((prev) => {
        const newX = prev - gameSpeedRef.current * 0.4;
        return newX <= -canvasSize.width ? 0 : newX;
      });

      setGameObjects((prev) => {
        const newObjects = [...prev];

        const rightmostObstacle = newObjects
          .filter((obj) => obj.type === "obstacle")
          .reduce((max, obj) => Math.max(max, obj.x), -1000);

        const distanceFromLast = canvasSize.width - rightmostObstacle;

        if (distanceFromLast > gameConfigRef.current.MIN_OBSTACLE_DISTANCE) {
          const shouldSpawn =
            distanceFromLast > gameConfigRef.current.MAX_OBSTACLE_DISTANCE ||
            Math.random() < 0.015;

          if (shouldSpawn) {
            const variant = Math.floor(Math.random() * 3) + 1;
            const obstacleHeight = 50 + Math.random() * 30;
            newObjects.push({
              x: canvasSize.width + 20,
              y:
                canvasSize.height -
                gameConfigRef.current.GROUND_HEIGHT -
                obstacleHeight,
              width: 35 + Math.random() * 15,
              height: obstacleHeight,
              type: "obstacle",
              variant,
            });
            lastObstacleXRef.current = canvasSize.width;
          }
        }

        if (Math.random() < gameConfigRef.current.COLLECTIBLE_SPAWN_RATE) {
          const minHeight =
            canvasSize.height - gameConfigRef.current.GROUND_HEIGHT - 80;
          const maxHeight =
            canvasSize.height - gameConfigRef.current.GROUND_HEIGHT - 250;
          const randomY = Math.random() * (minHeight - maxHeight) + maxHeight;
          const collectibleType = Math.random() > 0.5 ? "🧉" : "🥟";

          let tooClose = false;
          for (const obj of newObjects) {
            if (obj.type === "obstacle") {
              const distance = Math.abs(canvasSize.width - obj.x);
              if (distance < 150) {
                tooClose = true;
                break;
              }
            }
          }

          if (!tooClose) {
            newObjects.push({
              x: canvasSize.width,
              y: randomY,
              width: 35,
              height: 35,
              type: "collectible",
              collectibleType,
            });
          }
        }

        return newObjects
          .map((obj) => ({
            ...obj,
            x: obj.x - gameSpeedRef.current,
          }))
          .filter((obj) => obj.x > -150);
      });

      setGameObjects((prev) => {
        const playerRect = {
          x: player.x,
          y: player.y,
          width: gameConfigRef.current.PLAYER_WIDTH,
          height: gameConfigRef.current.PLAYER_HEIGHT,
        };

        const remainingObjects: GameObject[] = [];
        let scoreIncrease = 0;

        for (const obj of prev) {
          if (checkCollision(playerRect, obj)) {
            if (obj.type === "obstacle") {
              createParticles(
                obj.x + obj.width / 2,
                obj.y + obj.height / 2,
                "#FF0000",
              );
              setGameState("gameOver");
              saveHighScore(score);
              // Save score to database (only once per game session)
              if (score > 0 && !scoreSubmittedRef.current) {
                scoreSubmittedRef.current = true;
                updateScore(score);
              }
              return prev;
            } else if (obj.type === "collectible") {
              scoreIncrease += 100;
              addFloatingScore(obj.x, obj.y);
              createParticles(
                obj.x + obj.width / 2,
                obj.y + obj.height / 2,
                "#FFD700",
              );
            }
          } else {
            remainingObjects.push(obj);
          }
        }

        if (scoreIncrease > 0) {
          setScore((prevScore) => prevScore + scoreIncrease);
        }

        return remainingObjects;
      });

      setScore((prev) => {
        const newScore = prev + 1;
        gameSpeedRef.current = 6 + Math.floor(newScore / 2000) * 0.5;
        return newScore;
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    gameState,
    player.x,
    player.y,
    score,
    checkCollision,
    saveHighScore,
    canvasSize,
    addFloatingScore,
    createParticles,
    isClient,
  ]);

  useEffect(() => {
    if (!isClient) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    if (backgroundImageRef.current && backgroundImageRef.current.complete) {
      const bgWidth = canvasSize.width;
      const bgHeight = canvasSize.height;

      ctx.drawImage(
        backgroundImageRef.current,
        backgroundX,
        0,
        bgWidth,
        bgHeight,
      );
      ctx.drawImage(
        backgroundImageRef.current,
        backgroundX + bgWidth,
        0,
        bgWidth,
        bgHeight,
      );
    }

    if (gameState === "playing") {
      particles.forEach((particle) => {
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      const playerImg = playerImagesRef.current[player.spriteIndex];
      if (playerImg && playerImg.complete) {
        ctx.save();

        if (player.velocityY < -5) {
          ctx.translate(
            player.x + gameConfigRef.current.PLAYER_WIDTH / 2,
            player.y + gameConfigRef.current.PLAYER_HEIGHT / 2,
          );
          ctx.rotate(-0.1);
          ctx.translate(
            -(player.x + gameConfigRef.current.PLAYER_WIDTH / 2),
            -(player.y + gameConfigRef.current.PLAYER_HEIGHT / 2),
          );
        } else if (player.velocityY > 5) {
          ctx.translate(
            player.x + gameConfigRef.current.PLAYER_WIDTH / 2,
            player.y + gameConfigRef.current.PLAYER_HEIGHT / 2,
          );
          ctx.rotate(0.1);
          ctx.translate(
            -(player.x + gameConfigRef.current.PLAYER_WIDTH / 2),
            -(player.y + gameConfigRef.current.PLAYER_HEIGHT / 2),
          );
        }

        ctx.drawImage(
          playerImg,
          player.x,
          player.y,
          gameConfigRef.current.PLAYER_WIDTH,
          gameConfigRef.current.PLAYER_HEIGHT,
        );
        ctx.restore();
      }

      gameObjects.forEach((obj) => {
        if (obj.type === "obstacle" && obj.variant) {
          const obstacleImg = obstacleImagesRef.current[obj.variant - 1];
          if (obstacleImg && obstacleImg.complete) {
            ctx.drawImage(obstacleImg, obj.x, obj.y, obj.width, obj.height);
          }
        } else if (obj.type === "collectible") {
          const time = Date.now() / 200;
          const bounce = Math.sin(time + obj.x / 50) * 5;
          const scale = 1 + Math.sin(time * 2 + obj.x / 30) * 0.1;

          ctx.save();
          ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2 + bounce);
          ctx.scale(scale, scale);

          ctx.shadowColor = "rgba(255, 215, 0, 0.5)";
          ctx.shadowBlur = 15;
          ctx.font = "38px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const item = obj.collectibleType || "🧉";
          ctx.fillText(item, 0, 0);

          ctx.restore();
        }
      });

      floatingScores.forEach((floatingScore) => {
        ctx.save();
        ctx.globalAlpha = floatingScore.opacity;
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "#FFD700";
        ctx.strokeStyle = "#8B4513";
        ctx.lineWidth = 3;
        ctx.strokeText(
          "+100",
          floatingScore.x,
          floatingScore.y + floatingScore.offsetY,
        );
        ctx.fillText(
          "+100",
          floatingScore.x,
          floatingScore.y + floatingScore.offsetY,
        );
        ctx.restore();
      });
    }
  }, [
    gameState,
    player,
    gameObjects,
    backgroundX,
    canvasSize,
    floatingScores,
    particles,
    isClient,
  ]);

  const startGame = () => {
    scoreSubmittedRef.current = false; // Reset score submission flag
    setGameState("playing");
    setScore(0);
    gameSpeedRef.current = 6;
    lastObstacleXRef.current = -1000;
    setPlayer({
      x: 100,
      y:
        canvasSize.height -
        gameConfigRef.current.GROUND_HEIGHT -
        gameConfigRef.current.PLAYER_HEIGHT,
      velocityY: 0,
      isJumping: false,
      canDoubleJump: true,
      spriteIndex: 0,
      animationCounter: 0,
    });
    setGameObjects([]);
    setBackgroundX(0);
    setFloatingScores([]);
    setParticles([]);
  };

  const backToMenu = () => {
    setGameState("menu");
    setParticles([]);
  };

  if (!isClient) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-linear-to-b from-amber-300 via-yellow-400 to-orange-500">
        <div className="text-center space-y-6">
          <div className="text-8xl animate-bounce">🐎</div>
          <div className="space-y-2">
            <p className="text-white text-2xl font-bold drop-shadow-lg">
              Endless Runner
            </p>
            <p className="text-white text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isPortrait) {
    return (
      <div
        className="h-full w-full flex items-center justify-center"
        style={{
          backgroundImage: "url(/endless-runner/background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="bg-linear-to-br from-black/90 to-black/70 backdrop-blur-md rounded-2xl p-8 text-center space-y-6 max-w-sm mx-4 border-2 border-yellow-400/30 shadow-2xl">
          <div className="text-7xl animate-pulse">📱</div>
          <h2 className="text-3xl font-bold text-yellow-400 drop-shadow-lg">
            Rotate Your Device
          </h2>
          <p className="text-white text-lg leading-relaxed">
            Please rotate your device to landscape mode for the best gaming
            experience
          </p>
          <div className="text-5xl animate-bounce">🔄</div>
        </div>

        <Button
          onClick={toggleMusic}
          className="fixed top-4 right-4 z-50 bg-white/95 hover:bg-white text-black p-3 rounded-full shadow-xl border-2 border-gray-300 transition-all hover:scale-110"
          size="sm"
        >
          <MusicIcon isPlaying={isMusicPlaying} />
        </Button>

        <audio ref={audioRef} src="/sounds/soundtrack.mp3" />
      </div>
    );
  }

  return (
    <div
      className="h-full w-full relative overflow-hidden"
      style={{
        backgroundImage: "url(/endless-runner/background.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Button
        onClick={toggleMusic}
        className="absolute top-4 right-4 bg-white/95 hover:bg-white text-black p-3 rounded-full shadow-xl border-2 border-gray-300 transition-all hover:scale-110"
        size="sm"
      >
        <MusicIcon isPlaying={isMusicPlaying} />
      </Button>

      <audio ref={audioRef} src="/sounds/soundtrack.mp3" />

      {gameState === "menu" && (
        <div className="h-full flex items-center justify-center p-4">
          <div className="w-full max-w-6xl">
            <div className="text-center mb-4 animate-bounce">
              <Image
                width={320}
                height={320}
                src="/endless-runner/logo.png"
                alt="Gallop of Freedom"
                className="mx-auto w-80 h-auto drop-shadow-2xl"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-white space-y-6 bg-linear-to-br from-black/80 to-black/60 backdrop-blur-md rounded-2xl p-8 border-2 border-yellow-400/30 shadow-2xl">
                <h2 className="text-3xl font-bold text-center md:text-left text-yellow-400 drop-shadow-lg">
                  🎮 How to Play
                </h2>
                <div className="space-y-3 text-lg">
                  <p className="flex items-start gap-3">
                    <span className="text-2xl">🖱️</span>
                    <span>
                      <strong className="text-yellow-300">Desktop:</strong>{" "}
                      Press SPACE to jump, ↓ for quick descent
                    </span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-2xl">📱</span>
                    <span>
                      <strong className="text-yellow-300">Mobile:</strong> Tap
                      anywhere to jump
                    </span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-2xl">⭐</span>
                    <span>Double jump available while in the air!</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-2xl">🧉</span>
                    <span>
                      Collect mate & empanadas for{" "}
                      <strong className="text-green-300">+100 points</strong>
                    </span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-2xl">🌵</span>
                    <span>Avoid the cacti or game over!</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <span className="text-2xl">⚡</span>
                    <span>Speed increases as you progress!</span>
                  </p>
                </div>

                <div className="text-center md:text-left pt-6">
                  <Button
                    onClick={startGame}
                    size="lg"
                    className="bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-12 py-6 text-2xl font-bold rounded-xl shadow-2xl transition-all hover:scale-105 border-2 border-red-400"
                  >
                    🐎 START GAME
                  </Button>
                </div>
              </div>

              <div>
                <Card className="bg-linear-to-br from-amber-100/95 to-yellow-100/95 backdrop-blur-md p-6 h-full shadow-2xl border-2 border-yellow-600/40">
                  <h3 className="text-2xl font-bold mb-4 text-amber-900 text-center flex items-center justify-center gap-2">
                    <span className="text-3xl">🏆</span>
                    Hall of Fame
                  </h3>
                  {highScores.length > 0 ? (
                    <div className="space-y-3">
                      {highScores.map((score, index) => (
                        <div
                          key={index}
                          className={`flex justify-between items-center p-3 rounded-lg transition-all ${
                            index === 0
                              ? "bg-linear-to-r from-yellow-400 to-amber-400 text-amber-900 font-bold shadow-lg scale-105"
                              : index === 1
                                ? "bg-linear-to-r from-gray-300 to-gray-400 text-gray-800"
                                : index === 2
                                  ? "bg-linear-to-r from-orange-300 to-orange-400 text-orange-900"
                                  : "bg-amber-200/50 text-amber-800"
                          }`}
                        >
                          <span className="font-bold text-lg">
                            {index === 0
                              ? "🥇"
                              : index === 1
                                ? "🥈"
                                : index === 2
                                  ? "🥉"
                                  : `#${index + 1}`}
                          </span>
                          <span className="font-mono text-lg">
                            {score.score.toLocaleString()}
                          </span>
                          <span className="text-sm">{score.date}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-amber-700 text-lg mb-4">
                        No records yet!
                      </p>
                      <p className="text-amber-600">
                        Be the first champion! 🎯
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState === "playing" && (
        <div className="w-full h-full relative">
          <div className="absolute top-4 left-4 right-20 z-10 flex justify-between items-center">
            <div className="bg-linear-to-r from-black/80 to-black/60 backdrop-blur-md px-6 py-3 rounded-xl border-2 border-yellow-400/40 shadow-xl">
              <p className="text-yellow-400 text-sm font-semibold mb-1">
                SCORE
              </p>
              <p className="text-white text-2xl font-bold">
                {score.toLocaleString()}
              </p>
            </div>
            <span className="hidden md:block bg-linear-to-r from-black/80 to-black/60 backdrop-blur-md px-5 py-3 rounded-xl text-white font-semibold border-2 border-blue-400/40 shadow-xl">
              🎮 SPACE: Jump | ↓: Fast Fall
            </span>
          </div>

          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="w-full h-full"
            onTouchStart={handleTouchStart}
            style={{ touchAction: "none" }}
          />

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 md:hidden">
            <div className="bg-linear-to-r from-black/80 to-black/60 backdrop-blur-md px-6 py-3 rounded-xl border-2 border-green-400/40 shadow-xl">
              <p className="text-white font-semibold text-center">
                👆 Tap to Jump
              </p>
            </div>
          </div>
        </div>
      )}

      {gameState === "gameOver" && (
        <div className="h-full flex items-center justify-center p-4">
          <div className="bg-linear-to-br from-black/90 to-black/70 backdrop-blur-md rounded-2xl p-10 text-center space-y-8 max-w-lg w-full border-4 border-red-500/50 shadow-2xl">
            <div className="text-white space-y-6">
              <div className="animate-pulse">
                <h2 className="text-5xl font-bold text-red-400 drop-shadow-2xl mb-2">
                  💥 GAME OVER
                </h2>
              </div>

              <div className="bg-linear-to-r from-yellow-400/20 to-amber-400/20 rounded-xl p-6 border-2 border-yellow-400/40">
                <p className="text-yellow-300 text-lg mb-2">Final Score</p>
                <p className="text-6xl font-bold text-yellow-400 drop-shadow-lg">
                  {score.toLocaleString()}
                </p>
              </div>

              {dbHighScore > 0 && (
                <div className="bg-linear-to-r from-purple-400/20 to-blue-400/20 rounded-xl p-4 border-2 border-purple-400/40">
                  <p className="text-purple-300 text-sm mb-1">Your High Score</p>
                  <p className="text-purple-400 text-3xl font-bold">
                    {dbHighScore.toLocaleString()}
                  </p>
                  {totalPlays > 0 && (
                    <p className="text-purple-300 text-sm mt-1">
                      Total Plays: {totalPlays}
                    </p>
                  )}
                </div>
              )}

              {isNewHighScore && (
                <div className="bg-linear-to-r from-yellow-500/30 to-amber-500/30 rounded-xl p-4 border-2 border-yellow-400 animate-pulse">
                  <p className="text-yellow-300 text-3xl font-bold">
                    👑 NEW HIGH SCORE! 👑
                  </p>
                </div>
              )}

              {highScores.length > 0 &&
                score >= highScores[highScores.length - 1]?.score &&
                !isNewHighScore && (
                  <div className="animate-bounce">
                    <p className="text-green-400 text-2xl font-bold drop-shadow-lg">
                      🎉 New Personal Record! 🎉
                    </p>
                  </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                onClick={startGame}
                size="lg"
                className="bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-6 text-xl font-bold rounded-xl shadow-xl transition-all hover:scale-105 border-2 border-green-400"
              >
                🔄 Play Again
              </Button>
              <Button
                onClick={backToMenu}
                size="lg"
                className="bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-xl font-bold rounded-xl shadow-xl transition-all hover:scale-105 border-2 border-blue-400"
              >
                🏠 Main Menu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
