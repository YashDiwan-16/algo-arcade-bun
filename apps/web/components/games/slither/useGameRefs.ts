import { useCallback, useRef } from "react";
import type { Point, Bot, Orb, DeathOrb, Particle } from "./types";
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  BOT_COUNT,
  SEGMENT_DISTANCE,
} from "./constants";
import {
  initializeSnake,
  initializeBots,
  generateOrbs,
  createBot,
  checkSnakeCollision,
  createDeathOrbs,
  createBotTrail,
} from "./game-logic";
import { updateBotDirection, moveBotHead, updateBotSegments } from "./bot-ai";

export function useGameRefs() {
  const snake = useRef<Point[]>(
    initializeSnake(WORLD_WIDTH / 2, WORLD_HEIGHT / 2)
  );
  const bots = useRef<Bot[]>([]);
  const orbs = useRef<Orb[]>([]);
  const deathOrbs = useRef<DeathOrb[]>([]);
  const particles = useRef<Particle[]>([]);
  const camera = useRef<Point>({ x: 0, y: 0 });
  const mouseRef = useRef<Point>({ x: 0, y: 0 });

  const resetGame = useCallback(() => {
    snake.current = initializeSnake(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    bots.current = initializeBots(BOT_COUNT);
    orbs.current = generateOrbs();
    deathOrbs.current = [];
    particles.current = [];
    camera.current = { x: 0, y: 0 };
  }, []);

  const addParticle = useCallback(
    (x: number, y: number, color: string, count = 3) => {
      for (let i = 0; i < count; i++) {
        particles.current.push({
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
    },
    []
  );

  const updateBotsAI = useCallback((isPlayerAlive: boolean) => {
    const botsToRemove: string[] = [];

    // Check for bot deaths
    bots.current.forEach((bot) => {
      const head = bot.segments[0];

      // Boundary collision
      if (
        head.x < 30 ||
        head.x > WORLD_WIDTH - 30 ||
        head.y < 30 ||
        head.y > WORLD_HEIGHT - 30
      ) {
        botsToRemove.push(bot.id);
        deathOrbs.current.push(...createDeathOrbs(bot.segments, bot.color));
        particles.current.push(...createBotTrail(bot.segments, bot.color));
        return;
      }

      // Collision with player
      if (isPlayerAlive && checkSnakeCollision(bot.segments, snake.current)) {
        botsToRemove.push(bot.id);
        deathOrbs.current.push(...createDeathOrbs(bot.segments, bot.color));
        particles.current.push(...createBotTrail(bot.segments, bot.color));
        return;
      }

      // Collision with other bots
      for (const otherBot of bots.current) {
        if (
          otherBot.id !== bot.id &&
          !botsToRemove.includes(bot.id) &&
          checkSnakeCollision(bot.segments, otherBot.segments)
        ) {
          botsToRemove.push(bot.id);
          deathOrbs.current.push(...createDeathOrbs(bot.segments, bot.color));
          particles.current.push(...createBotTrail(bot.segments, bot.color));
          return;
        }
      }
    });

    // Remove dead bots
    const killedBotCount = botsToRemove.length;
    bots.current = bots.current.filter((bot) => !botsToRemove.includes(bot.id));

    // Update surviving bots
    bots.current.forEach((bot) => {
      updateBotDirection(
        bot,
        orbs.current,
        deathOrbs.current,
        snake.current,
        bots.current,
        isPlayerAlive
      );
      moveBotHead(bot);
      updateBotSegments(bot);
    });

    // Respawn bots
    while (bots.current.length < BOT_COUNT) {
      const x = Math.random() * (WORLD_WIDTH - 200) + 100;
      const y = Math.random() * (WORLD_HEIGHT - 200) + 100;
      bots.current.push(createBot(`bot-${Date.now()}-${Math.random()}`, x, y));
    }

    return killedBotCount;
  }, []);

  const collectOrbs = useCallback(
    (scoreCallback: (points: number) => void) => {
      if (snake.current.length === 0) return;

      const head = snake.current[0];

      // Player collects regular orbs
      orbs.current = orbs.current.filter((orb) => {
        const dx = orb.x - head.x;
        const dy = orb.y - head.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 15) {
          scoreCallback(1);
          addParticle(orb.x, orb.y, orb.color);
          growSnake(snake.current);
          return false;
        }
        return true;
      });

      // Player collects death orbs
      deathOrbs.current = deathOrbs.current.filter((orb) => {
        const dx = orb.x - head.x;
        const dy = orb.y - head.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 15) {
          scoreCallback(orb.value);
          addParticle(orb.x, orb.y, orb.color);
          for (let i = 0; i < orb.value; i++) {
            growSnake(snake.current);
          }
          return false;
        }
        return true;
      });

      // Bots collect orbs
      bots.current.forEach((bot) => {
        if (bot.segments.length === 0) return;
        const botHead = bot.segments[0];

        orbs.current = orbs.current.filter((orb) => {
          const dx = orb.x - botHead.x;
          const dy = orb.y - botHead.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 15) {
            bot.score += 1;
            addParticle(orb.x, orb.y, orb.color);
            growSnake(bot.segments);
            return false;
          }
          return true;
        });

        deathOrbs.current = deathOrbs.current.filter((orb) => {
          const dx = orb.x - botHead.x;
          const dy = orb.y - botHead.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 15) {
            bot.score += orb.value;
            addParticle(orb.x, orb.y, orb.color);
            for (let i = 0; i < orb.value; i++) {
              growSnake(bot.segments);
            }
            return false;
          }
          return true;
        });
      });
    },
    [addParticle]
  );

  const updateParticlesAndOrbs = useCallback(() => {
    // Update particles
    particles.current = particles.current.filter((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      particle.life--;
      return particle.life > 0;
    });

    // Update orb pulses
    orbs.current.forEach((orb) => {
      orb.pulse += 0.1;
    });

    deathOrbs.current.forEach((orb) => {
      orb.pulse += 0.08;
    });

    // Replenish orbs
    if (orbs.current.length < 300) {
      orbs.current.push(...generateOrbs().slice(0, 300 - orbs.current.length));
    }
  }, []);

  const updateSnakeHead = useCallback((newHead: Point) => {
    snake.current[0] = newHead;
  }, []);

  const updateCamera = useCallback((x: number, y: number) => {
    camera.current.x = x;
    camera.current.y = y;
  }, []);

  return {
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
  };
}

function growSnake(segments: Point[]): void {
  if (segments.length === 0) return;

  const tail = segments[segments.length - 1];
  const prevTail = segments[segments.length - 2] || tail;
  const dx = tail.x - prevTail.x;
  const dy = tail.y - prevTail.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > 0) {
    segments.push({
      x: tail.x + (dx / distance) * SEGMENT_DISTANCE,
      y: tail.y + (dy / distance) * SEGMENT_DISTANCE,
    });
  } else {
    segments.push({ x: tail.x, y: tail.y + SEGMENT_DISTANCE });
  }
}
