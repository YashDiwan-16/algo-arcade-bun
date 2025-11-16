export interface Point {
  x: number;
  y: number;
}

export interface Orb {
  x: number;
  y: number;
  color: string;
  size: number;
  pulse: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface Bot {
  id: string;
  name: string;
  segments: Point[];
  direction: number;
  targetX: number;
  targetY: number;
  color: string;
  speed: number;
  lastDirectionChange: number;
  aggressiveness: number;
  avoidanceTarget?: Point;
  score: number;
}

export interface DeathOrb {
  x: number;
  y: number;
  color: string;
  size: number;
  pulse: number;
  value: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  length: number;
  isPlayer: boolean;
  color: string;
}

export interface DeathInfo {
  cause: "boundary" | "bot";
  botName?: string;
  botColor?: string;
}

export interface GameState {
  score: number;
  isPlaying: boolean;
  isAlive: boolean;
  gameStarted: boolean;
  playerName: string;
}

export interface DisplayState {
  snakeLength: number;
  botCount: number;
  playerRank: number;
}

export interface PowerUpState {
  isActive: boolean;
  cooldown: boolean;
  duration: number;
  cooldownTime: number;
}

export interface GameRefs {
  snake: Point[];
  bots: Bot[];
  orbs: Orb[];
  deathOrbs: DeathOrb[];
  particles: Particle[];
  camera: Point;
}
