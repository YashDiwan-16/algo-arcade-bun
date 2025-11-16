import type {
  Point,
  Bot,
  Orb,
  DeathOrb,
  Particle,
  LeaderboardEntry,
} from "./types";
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  BOT_NAMES,
  BOT_COLORS,
  INITIAL_LENGTH,
  SEGMENT_DISTANCE,
  ORB_COLORS,
  ORB_COUNT,
  ORB_MIN_SIZE,
  ORB_MAX_SIZE,
} from "./constants";

export const generateOrbs = (): Orb[] => {
  const orbs: Orb[] = [];
  for (let i = 0; i < ORB_COUNT; i++) {
    orbs.push({
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * WORLD_HEIGHT,
      color: ORB_COLORS[Math.floor(Math.random() * ORB_COLORS.length)],
      size: ORB_MIN_SIZE + Math.random() * (ORB_MAX_SIZE - ORB_MIN_SIZE),
      pulse: Math.random() * Math.PI * 2,
    });
  }
  return orbs;
};

export const initializeSnake = (centerX: number, centerY: number): Point[] => {
  const snake: Point[] = [];
  for (let i = 0; i < INITIAL_LENGTH; i++) {
    snake.push({
      x: centerX - i * SEGMENT_DISTANCE,
      y: centerY,
    });
  }
  return snake;
};

export const createBot = (
  id: string,
  x: number,
  y: number,
  nameIndex?: number
): Bot => {
  const color = BOT_COLORS[Math.floor(Math.random() * BOT_COLORS.length)];
  const name =
    nameIndex !== undefined
      ? BOT_NAMES[nameIndex % BOT_NAMES.length] +
        (nameIndex >= BOT_NAMES.length
          ? ` ${Math.floor(nameIndex / BOT_NAMES.length) + 1}`
          : "")
      : BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] +
        ` ${Math.floor(Math.random() * 100)}`;

  const segments: Point[] = [];
  for (let j = 0; j < INITIAL_LENGTH; j++) {
    segments.push({
      x: x - j * SEGMENT_DISTANCE,
      y: y,
    });
  }

  return {
    id,
    name,
    segments,
    direction: Math.random() * Math.PI * 2,
    targetX: x,
    targetY: y,
    color,
    speed: 2.5 + Math.random() * 1.5,
    lastDirectionChange: 0,
    aggressiveness: 0.3 + Math.random() * 0.7,
    score: 0,
  };
};

export const initializeBots = (count: number): Bot[] => {
  const bots: Bot[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * (WORLD_WIDTH - 200) + 100;
    const y = Math.random() * (WORLD_HEIGHT - 200) + 100;
    bots.push(createBot(`bot-${i}`, x, y, i));
  }
  return bots;
};

export const checkSnakeCollision = (
  snake1: Point[],
  snake2: Point[]
): boolean => {
  const head1 = snake1[0];
  for (let i = 0; i < snake2.length; i++) {
    const segment = snake2[i];
    const dx = head1.x - segment.x;
    const dy = head1.y - segment.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < 15) {
      return true;
    }
  }
  return false;
};

export const createDeathOrbs = (
  segments: Point[],
  color: string
): DeathOrb[] => {
  const deathOrbs: DeathOrb[] = [];
  segments.forEach((segment, index) => {
    if (index % 2 === 0) {
      deathOrbs.push({
        x: segment.x + (Math.random() - 0.5) * 20,
        y: segment.y + (Math.random() - 0.5) * 20,
        color: color,
        size: 4 + Math.random() * 3,
        pulse: Math.random() * Math.PI * 2,
        value: 2,
      });
    }
  });
  return deathOrbs;
};

export const createParticles = (
  x: number,
  y: number,
  color: string,
  count: number = 3
): Particle[] => {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 30,
      maxLife: 30,
      color,
      size: 2 + Math.random() * 3,
    });
  }
  return particles;
};

export const createBotTrail = (
  segments: Point[],
  color: string
): Particle[] => {
  const particles: Particle[] = [];
  segments.forEach((segment, index) => {
    if (index % 3 === 0) {
      for (let i = 0; i < 5; i++) {
        particles.push({
          x: segment.x + (Math.random() - 0.5) * 15,
          y: segment.y + (Math.random() - 0.5) * 15,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 60 + Math.random() * 40,
          maxLife: 100,
          color: color,
          size: 3 + Math.random() * 2,
        });
      }
    }
  });
  return particles;
};

export const updateSnakeSegments = (
  snake: Point[],
  segmentDistance: number = SEGMENT_DISTANCE
): void => {
  for (let i = 1; i < snake.length; i++) {
    const current = snake[i];
    const target = snake[i - 1];
    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > segmentDistance) {
      const ratio = (distance - segmentDistance) / distance;
      current.x += dx * ratio;
      current.y += dy * ratio;
    }
  }
};

export const generateLeaderboard = (
  playerName: string,
  playerScore: number,
  playerLength: number,
  bots: Bot[],
  isGameStarted: boolean
): LeaderboardEntry[] => {
  const entries: LeaderboardEntry[] = [];

  if (isGameStarted) {
    entries.push({
      name: playerName,
      score: playerScore,
      length: playerLength,
      isPlayer: true,
      color: "#4ecdc4",
    });
  }

  bots.forEach((bot) => {
    entries.push({
      name: bot.name,
      score: bot.score,
      length: bot.segments.length,
      isPlayer: false,
      color: bot.color,
    });
  });

  return entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.length - a.length;
  });
};

export const updateParticles = (particles: Particle[]): Particle[] => {
  return particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      life: p.life - 1,
    }))
    .filter((p) => p.life > 0);
};

export const checkBoundaryCollision = (
  point: Point,
  margin: number = 20
): boolean => {
  return (
    point.x < margin ||
    point.x > WORLD_WIDTH - margin ||
    point.y < margin ||
    point.y > WORLD_HEIGHT - margin
  );
};
