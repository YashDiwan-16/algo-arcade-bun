export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  prompt: string;
}

export const gameTemplates: GameTemplate[] = [
  {
    id: "space-shooter",
    name: "Space Shooter",
    description: "Classic space shooter with enemies and power-ups",
    category: "Action",
    icon: "Rocket",
    prompt:
      "Create a space shooter game where the player controls a spaceship using arrow keys. The spaceship shoots lasers with the space bar. Enemies spawn from the top and move downward with randomized movement patterns. The player scores points by destroying enemies. Add a score counter, health bar with 3 lives, and a game over screen with restart button. Include shooting sound effects (use simple beep sounds), explosion animations, and gradually increasing difficulty.",
  },
  {
    id: "platformer",
    name: "Platformer",
    description: "Side-scrolling platformer with jumping and obstacles",
    category: "Platform",
    icon: "Mountain",
    prompt:
      "Create a platformer game where the player controls a character that can move left/right with arrow keys and jump with spacebar. Add platforms at different heights, obstacles to avoid, and coins to collect. Include gravity physics, collision detection, a score counter for collected coins, and a level completion system. The character should have smooth animations for walking and jumping.",
  },
  {
    id: "puzzle-match",
    name: "Match-3 Puzzle",
    description: "Match three or more items to score points",
    category: "Puzzle",
    icon: "Grid3x3",
    prompt:
      "Create a match-3 puzzle game with a grid of colored gems. Players click to swap adjacent gems to match 3 or more of the same color in a row or column. Matched gems disappear and new ones fall from the top. Include a score system, move counter, combo multipliers for consecutive matches, and special power-ups for matching 4 or 5 gems. Add satisfying visual effects when matches occur.",
  },
  {
    id: "racing",
    name: "Racing Game",
    description: "Top-down racing game with obstacles",
    category: "Racing",
    icon: "Car",
    prompt:
      "Create a top-down racing game where the player controls a car using arrow keys. The road scrolls downward, and the player must avoid obstacles and other cars. Include lane switching, speed boosts, a speedometer, distance traveled counter, and crash detection. Add visual effects for speed, road markings, and responsive controls for a fun arcade racing experience.",
  },
  {
    id: "tower-defense",
    name: "Tower Defense",
    description: "Strategic defense game with towers and enemies",
    category: "Strategy",
    icon: "Castle",
    prompt:
      "Create a tower defense game where enemies follow a path and the player places defensive towers to stop them. Include different tower types (basic, rapid-fire, splash damage), enemy waves with increasing difficulty, health bars for enemies, a currency system to buy/upgrade towers, and a lives system. Add visual range indicators for towers and smooth enemy movement along the path.",
  },
  {
    id: "snake",
    name: "Snake Game",
    description: "Classic snake game with growing mechanics",
    category: "Arcade",
    icon: "Worm",
    prompt:
      "Create a classic snake game where the player controls a snake using arrow keys. The snake grows longer when eating food that appears randomly on the grid. The game ends if the snake hits the walls or its own body. Include a score counter, high score tracking, smooth grid-based movement, and a game over screen with restart option. Add visual feedback when the snake eats food.",
  },
  {
    id: "breakout",
    name: "Breakout",
    description: "Break bricks with a ball and paddle",
    category: "Arcade",
    icon: "Box",
    prompt:
      "Create a Breakout/Arkanoid style game where the player controls a paddle at the bottom using mouse or arrow keys. A ball bounces around breaking colored bricks at the top. Include power-ups that fall from broken bricks (multi-ball, bigger paddle, laser), a lives system, score tracking, and multiple levels with different brick patterns. Add satisfying physics for ball bouncing.",
  },
  {
    id: "flappy-bird",
    name: "Flappy Bird Clone",
    description: "Tap to fly and avoid obstacles",
    category: "Arcade",
    icon: "Bird",
    prompt:
      "Create a Flappy Bird style game where the player taps spacebar or clicks to make a bird flap and fly upward, with gravity pulling it down. Pipes move from right to left with gaps to fly through. Include score counting for each pipe passed, collision detection, a game over screen with high score, and smooth physics. Add a simple background with parallax scrolling.",
  },
  {
    id: "memory-game",
    name: "Memory Card Game",
    description: "Match pairs of hidden cards",
    category: "Puzzle",
    icon: "Brain",
    prompt:
      "Create a memory card matching game with a grid of face-down cards. Players click to reveal two cards at a time, trying to find matching pairs. Include a move counter, timer, different difficulty levels (4x4, 6x6, 8x8 grids), smooth card flip animations, and a completion screen showing time and moves. Use colorful icons or emojis on the cards.",
  },
  {
    id: "pong",
    name: "Pong",
    description: "Classic two-player paddle game",
    category: "Sports",
    icon: "RectangleHorizontal",
    prompt:
      "Create a Pong game where two paddles (left and right) hit a ball back and forth. Player controls one paddle with W/S keys, AI controls the other. Include ball physics with angle-based bouncing, score tracking (first to 10 wins), paddle movement, AI with adjustable difficulty, and a clean minimalist design. Add sound effects for paddle hits and scoring.",
  },
  {
    id: "endless-runner",
    name: "Endless Runner",
    description: "Run and jump endlessly avoiding obstacles",
    category: "Action",
    icon: "Zap",
    prompt:
      "Create an endless runner game where the player character automatically runs forward and jumps over obstacles with spacebar. The game speeds up over time. Include randomly generated obstacles, distance tracking, a score system based on distance and collected items, a high score system, and a game over screen. Add background parallax scrolling and smooth animations.",
  },
  {
    id: "asteroids",
    name: "Asteroids",
    description: "Destroy asteroids in space",
    category: "Action",
    icon: "Circle",
    prompt:
      "Create an Asteroids game where the player controls a spaceship that can rotate (left/right arrow keys), thrust forward (up arrow), and shoot (spacebar). Asteroids float around and split into smaller pieces when shot. Include wrapping screen edges, a lives system, score tracking, UFOs that occasionally appear, and smooth physics. Add particle effects for explosions.",
  },
];

export const gameCategories = [
  "All",
  "Action",
  "Arcade",
  "Puzzle",
  "Platform",
  "Racing",
  "Strategy",
  "Sports",
];
