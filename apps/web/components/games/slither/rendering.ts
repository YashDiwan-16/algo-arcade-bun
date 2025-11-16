import type {
  Point,
  Bot,
  Orb,
  DeathOrb,
  Particle,
  PowerUpState,
} from "./types";
import { WORLD_WIDTH, WORLD_HEIGHT } from "./constants";

export const drawBackground = (
  ctx: CanvasRenderingContext2D,
  canvasSize: { width: number; height: number },
  camera: Point
): void => {
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

  // Draw grid pattern
  ctx.save();
  ctx.translate(-camera.x % 50, -camera.y % 50);
  ctx.strokeStyle = "#1a1a1a";
  ctx.lineWidth = 1;

  for (let x = 0; x < canvasSize.width + 100; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasSize.height + 100);
    ctx.stroke();
  }

  for (let y = 0; y < canvasSize.height + 100; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasSize.width + 100, y);
    ctx.stroke();
  }
  ctx.restore();
};

export const drawBoundaries = (
  ctx: CanvasRenderingContext2D,
  camera: Point
): void => {
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  ctx.strokeStyle = "#ff0000";
  ctx.lineWidth = 4;
  ctx.shadowColor = "#ff0000";
  ctx.shadowBlur = 20;

  // Top
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(WORLD_WIDTH, 0);
  ctx.stroke();

  // Bottom
  ctx.beginPath();
  ctx.moveTo(0, WORLD_HEIGHT);
  ctx.lineTo(WORLD_WIDTH, WORLD_HEIGHT);
  ctx.stroke();

  // Left
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, WORLD_HEIGHT);
  ctx.stroke();

  // Right
  ctx.beginPath();
  ctx.moveTo(WORLD_WIDTH, 0);
  ctx.lineTo(WORLD_WIDTH, WORLD_HEIGHT);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.restore();
};

export const drawOrbs = (
  ctx: CanvasRenderingContext2D,
  orbs: Orb[],
  camera: Point,
  canvasSize: { width: number; height: number }
): void => {
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  orbs.forEach((orb) => {
    const screenX = orb.x - camera.x;
    const screenY = orb.y - camera.y;

    if (
      screenX > -50 &&
      screenX < canvasSize.width + 50 &&
      screenY > -50 &&
      screenY < canvasSize.height + 50
    ) {
      const pulseSize = Math.max(1, orb.size + Math.sin(orb.pulse) * 1);

      // Glow
      const gradient = ctx.createRadialGradient(
        orb.x,
        orb.y,
        0,
        orb.x,
        orb.y,
        Math.max(1, pulseSize * 3)
      );
      gradient.addColorStop(0, orb.color + "80");
      gradient.addColorStop(0.5, orb.color + "40");
      gradient.addColorStop(1, orb.color + "00");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, Math.max(1, pulseSize * 3), 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = orb.color;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, Math.max(1, pulseSize), 0, Math.PI * 2);
      ctx.fill();
    }
  });

  ctx.restore();
};

export const drawDeathOrbs = (
  ctx: CanvasRenderingContext2D,
  deathOrbs: DeathOrb[],
  camera: Point,
  canvasSize: { width: number; height: number }
): void => {
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  deathOrbs.forEach((orb) => {
    const screenX = orb.x - camera.x;
    const screenY = orb.y - camera.y;

    if (
      screenX > -50 &&
      screenX < canvasSize.width + 50 &&
      screenY > -50 &&
      screenY < canvasSize.height + 50
    ) {
      const pulseSize = Math.max(1, orb.size + Math.sin(orb.pulse) * 1.5);

      // Outer glow
      const gradient = ctx.createRadialGradient(
        orb.x,
        orb.y,
        0,
        orb.x,
        orb.y,
        Math.max(1, pulseSize * 4)
      );
      gradient.addColorStop(0, orb.color + "FF");
      gradient.addColorStop(0.3, orb.color + "80");
      gradient.addColorStop(0.7, orb.color + "40");
      gradient.addColorStop(1, orb.color + "00");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, Math.max(1, pulseSize * 4), 0, Math.PI * 2);
      ctx.fill();

      // Core
      const coreGradient = ctx.createRadialGradient(
        orb.x,
        orb.y,
        0,
        orb.x,
        orb.y,
        Math.max(1, pulseSize)
      );
      coreGradient.addColorStop(0, "#ffffff");
      coreGradient.addColorStop(0.5, orb.color);
      coreGradient.addColorStop(1, orb.color + "80");

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, Math.max(1, pulseSize), 0, Math.PI * 2);
      ctx.fill();
    }
  });

  ctx.restore();
};

export const drawParticles = (
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  camera: Point
): void => {
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  particles.forEach((particle) => {
    const alpha = particle.life / particle.maxLife;
    const particleSize = Math.max(0.5, particle.size * alpha);
    ctx.fillStyle =
      particle.color +
      Math.floor(alpha * 255)
        .toString(16)
        .padStart(2, "0");
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
};

export const drawSnake = (
  ctx: CanvasRenderingContext2D,
  snake: Point[],
  camera: Point,
  powerUpState: PowerUpState
): void => {
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  snake.forEach((segment, index) => {
    const size = index === 0 ? 12 : 8;
    const alpha = Math.max(0.3, 1 - index * 0.01);

    // Power-up glow
    if (powerUpState.isActive) {
      const powerGradient = ctx.createRadialGradient(
        segment.x,
        segment.y,
        0,
        segment.x,
        segment.y,
        Math.max(1, size * 3)
      );
      powerGradient.addColorStop(0, `rgba(255, 255, 0, ${alpha * 0.8})`);
      powerGradient.addColorStop(0.5, `rgba(255, 255, 0, ${alpha * 0.4})`);
      powerGradient.addColorStop(1, `rgba(255, 255, 0, 0)`);

      ctx.fillStyle = powerGradient;
      ctx.beginPath();
      ctx.arc(segment.x, segment.y, Math.max(1, size * 3), 0, Math.PI * 2);
      ctx.fill();
    }

    // Regular glow
    const gradient = ctx.createRadialGradient(
      segment.x,
      segment.y,
      0,
      segment.x,
      segment.y,
      Math.max(1, size * 2)
    );
    gradient.addColorStop(0, `rgba(78, 205, 196, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(78, 205, 196, ${alpha * 0.5})`);
    gradient.addColorStop(1, `rgba(78, 205, 196, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(segment.x, segment.y, Math.max(1, size * 2), 0, Math.PI * 2);
    ctx.fill();

    // Core segment
    const coreGradient = ctx.createRadialGradient(
      segment.x,
      segment.y,
      0,
      segment.x,
      segment.y,
      Math.max(1, size)
    );
    if (index === 0) {
      coreGradient.addColorStop(0, "#ffffff");
      coreGradient.addColorStop(
        0.3,
        powerUpState.isActive ? "#ffff00" : "#4ecdc4"
      );
      coreGradient.addColorStop(
        1,
        powerUpState.isActive ? "#ffaa00" : "#2d8a80"
      );
    } else {
      coreGradient.addColorStop(
        0,
        powerUpState.isActive ? "#ffff00" : "#4ecdc4"
      );
      coreGradient.addColorStop(
        1,
        powerUpState.isActive ? "#ffaa00" : "#2d8a80"
      );
    }

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(segment.x, segment.y, Math.max(2, size), 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
};

export const drawBots = (
  ctx: CanvasRenderingContext2D,
  bots: Bot[],
  camera: Point
): void => {
  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  bots.forEach((bot) => {
    bot.segments.forEach((segment, index) => {
      const size = index === 0 ? 12 : 8;
      const alpha = Math.max(0.3, 1 - index * 0.01);
      const glowIntensity = Math.max(1, 1 + bot.aggressiveness * 0.5);

      // Glow
      const gradient = ctx.createRadialGradient(
        segment.x,
        segment.y,
        0,
        segment.x,
        segment.y,
        Math.max(1, size * 2 * glowIntensity)
      );
      gradient.addColorStop(
        0,
        bot.color +
          Math.floor(alpha * 255)
            .toString(16)
            .padStart(2, "0")
      );
      gradient.addColorStop(
        0.5,
        bot.color +
          Math.floor(alpha * 127)
            .toString(16)
            .padStart(2, "0")
      );
      gradient.addColorStop(1, bot.color + "00");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(
        segment.x,
        segment.y,
        Math.max(1, size * 2 * glowIntensity),
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Core
      const coreGradient = ctx.createRadialGradient(
        segment.x,
        segment.y,
        0,
        segment.x,
        segment.y,
        Math.max(1, size)
      );
      if (index === 0) {
        coreGradient.addColorStop(0, "#ffffff");
        coreGradient.addColorStop(0.3, bot.color);
        coreGradient.addColorStop(1, bot.color + "CC");
      } else {
        coreGradient.addColorStop(0, bot.color);
        coreGradient.addColorStop(1, bot.color + "80");
      }

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(segment.x, segment.y, Math.max(2, size), 0, Math.PI * 2);
      ctx.fill();
    });
  });

  ctx.restore();
};

export const drawMiniMap = (
  ctx: CanvasRenderingContext2D,
  canvasSize: { width: number; height: number },
  camera: Point,
  snake: Point[],
  bots: Bot[],
  isAlive: boolean,
  powerUpState: PowerUpState
): void => {
  const mapSize = 150;
  const mapX = canvasSize.width - mapSize - 20;
  const mapY = 20;

  // Map background
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(mapX, mapY, mapSize, mapSize);
  ctx.strokeStyle = "#4ecdc4";
  ctx.lineWidth = 2;
  ctx.strokeRect(mapX, mapY, mapSize, mapSize);

  // Viewport indicator
  const viewportX = mapX + (camera.x / WORLD_WIDTH) * mapSize;
  const viewportY = mapY + (camera.y / WORLD_HEIGHT) * mapSize;
  const viewportWidth = (canvasSize.width / WORLD_WIDTH) * mapSize;
  const viewportHeight = (canvasSize.height / WORLD_HEIGHT) * mapSize;

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);

  // Draw player on mini-map
  if (isAlive && snake.length > 0) {
    const head = snake[0];
    const playerMapX = mapX + (head.x / WORLD_WIDTH) * mapSize;
    const playerMapY = mapY + (head.y / WORLD_HEIGHT) * mapSize;

    ctx.fillStyle = powerUpState.isActive ? "#ffff00" : "#4ecdc4";
    ctx.beginPath();
    ctx.arc(playerMapX, playerMapY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = (powerUpState.isActive ? "#ffff00" : "#4ecdc4") + "60";
    ctx.beginPath();
    ctx.arc(
      playerMapX,
      playerMapY,
      Math.min(12, snake.length / 4),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Draw bots on mini-map
  bots.forEach((bot) => {
    if (bot.segments.length === 0) return;

    const head = bot.segments[0];
    const botMapX = mapX + (head.x / WORLD_WIDTH) * mapSize;
    const botMapY = mapY + (head.y / WORLD_HEIGHT) * mapSize;

    const botSize = bot.aggressiveness > 0.7 ? 4 : 3;
    ctx.fillStyle = bot.color;
    ctx.beginPath();
    ctx.arc(botMapX, botMapY, botSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = bot.color + "60";
    ctx.beginPath();
    ctx.arc(
      botMapX,
      botMapY,
      Math.min(10, bot.segments.length / 4),
      0,
      Math.PI * 2
    );
    ctx.fill();

    if (bot.aggressiveness > 0.7) {
      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(botMapX, botMapY, botSize + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  });
};
