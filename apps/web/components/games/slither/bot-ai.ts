import type { Bot, Point, Orb, DeathOrb } from "./types";
import { WORLD_WIDTH, WORLD_HEIGHT, SEGMENT_DISTANCE } from "./constants";

export const findNearestOrb = (
  botHead: Point,
  orbs: Orb[],
  deathOrbs: DeathOrb[],
  searchRadius: number = 250
): (Orb | DeathOrb) | null => {
  let nearestOrb: (Orb | DeathOrb) | null = null;
  let nearestDistance = Number.POSITIVE_INFINITY;

  const allOrbs: (Orb | DeathOrb)[] = [...orbs, ...deathOrbs];
  for (const orb of allOrbs) {
    const dx = orb.x - botHead.x;
    const dy = orb.y - botHead.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < searchRadius && distance < nearestDistance) {
      nearestDistance = distance;
      nearestOrb = orb;
    }
  }

  return nearestOrb;
};

export const calculateBoundaryAvoidance = (
  bot: Bot,
  head: Point
): { x: number; y: number } => {
  const boundaryAvoidance = (1 - bot.aggressiveness) * 0.005;
  let avoidanceX = 0;
  let avoidanceY = 0;

  if (head.x < 80) avoidanceX += (80 - head.x) * boundaryAvoidance;
  if (head.x > WORLD_WIDTH - 80)
    avoidanceX -= (head.x - (WORLD_WIDTH - 80)) * boundaryAvoidance;
  if (head.y < 80) avoidanceY += (80 - head.y) * boundaryAvoidance;
  if (head.y > WORLD_HEIGHT - 80)
    avoidanceY -= (head.y - (WORLD_HEIGHT - 80)) * boundaryAvoidance;

  return { x: avoidanceX, y: avoidanceY };
};

export const calculatePlayerAvoidance = (
  bot: Bot,
  head: Point,
  playerSnake: Point[]
): { x: number; y: number } => {
  const playerAvoidance = (1 - bot.aggressiveness) * 0.01;
  let avoidanceX = 0;
  let avoidanceY = 0;

  playerSnake.forEach((segment, segIndex) => {
    const dx = segment.x - head.x;
    const dy = segment.y - head.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 50 && distance > 0 && segIndex < playerSnake.length / 3) {
      const force = (50 - distance) * playerAvoidance;
      avoidanceX -= (dx / distance) * force;
      avoidanceY -= (dy / distance) * force;
    }
  });

  return { x: avoidanceX, y: avoidanceY };
};

export const calculateBotAvoidance = (
  bot: Bot,
  head: Point,
  allBots: Bot[]
): { x: number; y: number } => {
  const botAvoidance = (1 - bot.aggressiveness) * 0.008;
  let avoidanceX = 0;
  let avoidanceY = 0;

  allBots.forEach((otherBot) => {
    if (otherBot.id !== bot.id) {
      otherBot.segments.forEach((segment) => {
        const dx = segment.x - head.x;
        const dy = segment.y - head.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 40 && distance > 0) {
          const force = (40 - distance) * botAvoidance;
          avoidanceX -= (dx / distance) * force;
          avoidanceY -= (dy / distance) * force;
        }
      });
    }
  });

  return { x: avoidanceX, y: avoidanceY };
};

export const calculateSeekingForce = (
  bot: Bot,
  head: Point,
  targetOrb: Orb | DeathOrb | null
): { x: number; y: number } => {
  let seekX = 0;
  let seekY = 0;

  if (targetOrb !== null) {
    const dx = targetOrb.x - head.x;
    const dy = targetOrb.y - head.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const seekStrength = 0.08 + bot.aggressiveness * 0.04;
      seekX = (dx / distance) * seekStrength;
      seekY = (dy / distance) * seekStrength;
    }
  }

  return { x: seekX, y: seekY };
};

export const calculateHuntingForce = (
  bot: Bot,
  head: Point,
  playerSnake: Point[]
): { x: number; y: number } => {
  let huntX = 0;
  let huntY = 0;

  if (bot.segments.length > playerSnake.length * 0.8) {
    const playerHead = playerSnake[0];
    const dx = playerHead.x - head.x;
    const dy = playerHead.y - head.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 150 && bot.aggressiveness > 0.6) {
      const huntStrength = bot.aggressiveness * 0.03;
      huntX += (dx / distance) * huntStrength;
      huntY += (dy / distance) * huntStrength;
    }
  }

  return { x: huntX, y: huntY };
};

export const updateBotDirection = (
  bot: Bot,
  orbs: Orb[],
  deathOrbs: DeathOrb[],
  playerSnake: Point[],
  allBots: Bot[],
  isPlayerAlive: boolean
): void => {
  const head = bot.segments[0];
  const now = Date.now();

  // Find nearest orb
  const nearestOrb = findNearestOrb(head, orbs, deathOrbs);

  // Calculate forces
  const boundaryForce = calculateBoundaryAvoidance(bot, head);
  const playerForce = isPlayerAlive
    ? calculatePlayerAvoidance(bot, head, playerSnake)
    : { x: 0, y: 0 };
  const botForce = calculateBotAvoidance(bot, head, allBots);
  const seekForce = calculateSeekingForce(bot, head, nearestOrb);
  const huntForce = isPlayerAlive
    ? calculateHuntingForce(bot, head, playerSnake)
    : { x: 0, y: 0 };

  // Random direction changes
  if (now - bot.lastDirectionChange > 1000 + Math.random() * 2000) {
    bot.direction += (Math.random() - 0.5) * (0.3 + bot.aggressiveness * 0.4);
    bot.lastDirectionChange = now;
  }

  // Combine all forces
  const totalForceX =
    boundaryForce.x +
    playerForce.x +
    botForce.x +
    seekForce.x +
    huntForce.x +
    Math.cos(bot.direction) * 0.03;

  const totalForceY =
    boundaryForce.y +
    playerForce.y +
    botForce.y +
    seekForce.y +
    huntForce.y +
    Math.sin(bot.direction) * 0.03;

  // Update direction
  if (Math.abs(totalForceX) > 0.001 || Math.abs(totalForceY) > 0.001) {
    bot.direction = Math.atan2(totalForceY, totalForceX);
  }
};

export const moveBotHead = (bot: Bot): void => {
  const head = bot.segments[0];
  const speedMultiplier = 1 + bot.aggressiveness * 0.2;

  bot.segments[0] = {
    x: head.x + Math.cos(bot.direction) * bot.speed * speedMultiplier,
    y: head.y + Math.sin(bot.direction) * bot.speed * speedMultiplier,
  };
};

export const updateBotSegments = (bot: Bot): void => {
  for (let i = 1; i < bot.segments.length; i++) {
    const current = bot.segments[i];
    const target = bot.segments[i - 1];

    const dx = target.x - current.x;
    const dy = target.y - current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > SEGMENT_DISTANCE) {
      const ratio = (distance - SEGMENT_DISTANCE) / distance;
      current.x += dx * ratio;
      current.y += dy * ratio;
    }
  }
};
