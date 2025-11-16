# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Algo Arcade Mono is a full-stack blockchain gaming platform built on Algorand, featuring AI-powered game generation using Google Gemini. The monorepo contains:

- **apps/web**: Next.js 16 full-stack application (frontend + API)
- **apps/algorand**: Algorand smart contract development and deployment
- **packages**: Shared packages (currently empty)

## Key Technologies

- **Frontend**: Next.js 16 with App Router, React 19, Tailwind CSS 4
- **API**: oRPC for type-safe RPC endpoints with automatic OpenAPI generation
- **Auth**: better-auth with Google OAuth and Email OTP
- **Database**: MongoDB (native driver, no ORM)
- **AI**: Google Gemini 2.5 Flash Lite via Vercel AI SDK
- **Blockchain**: Algorand TypeScript SDK and AlgoKit
- **Monorepo**: Turborepo with bun

## Development Commands

### Web Application (apps/web)

```bash
# Development
bun dev                    # Start Next.js dev server (http://localhost:3000)

# Building
bun build                  # Production build
bun start                  # Serve production build

# Code Quality
bun lint                   # Run ESLint

# Algorand Integration
bun generate               # Link AlgoKit projects (algokit project link --all)
```

### Smart Contracts (apps/algorand)

```bash
# Build & Deploy
bun build                  # Compile contracts + generate TypeScript clients
bun deploy                 # Deploy with hot-reload (watches .env changes)
bun deploy:ci              # CI-safe deployment without hot-reload

# Type Checking
bun check-types            # Run TypeScript type checker
```

## Architecture Overview

### API Architecture (oRPC)

The API uses oRPC, a type-safe RPC framework with automatic OpenAPI generation. All endpoints are defined in `apps/web/lib/router/`:

- **admin.ts**: User management, role-based access control (admin/super-admin)
- **ai.ts**: AI game generation from natural language descriptions
- **game-stats.ts**: Win/loss tracking and game statistics
- **leaderboard.ts**: Global and per-game rankings
- **arena.ts**: Game arena management
- **stats.ts**: User-specific statistics

Each endpoint is strongly typed with Zod schemas. Changes to routers automatically propagate types to the frontend via oRPC client.

### Authentication Flow

Uses better-auth with:

- Google OAuth 2.0 for social login
- Email OTP for passwordless authentication
- Admin plugin with three roles: user, admin, super-admin
- NextJS cookie-based session management
- MongoDB adapter for persistence

Auth configuration in `apps/web/lib/auth.ts`. All API routes should call `auth.api.getSession()` to verify authentication.

### Database Design

MongoDB collections:

- `user`: User accounts and profiles
- `gameStats`: Win/loss statistics for competitive games (head-soccer, rock-paper-scissor, showdown)
- `scoreGameStats`: Score-based statistics for arcade games (slither, endless-runner, paaji)
- `session`: Auth sessions
- `verification`: Email OTP codes
- `aiGames`: AI-generated game code and metadata

Access via singleton client in `apps/web/lib/mongodb.ts`. No ORM - use native MongoDB driver directly.

### Game Implementation Pattern

Each game lives in `apps/web/components/games/{game-name}/` with standard structure:

```
game-name/
├── index.tsx                 # Main React component wrapper
├── game-logic.ts             # Core game mechanics and state
├── rendering.ts              # Canvas rendering functions
├── bot-ai.ts                 # Bot AI logic
├── useGameRefs.ts            # Custom hooks for refs
├── GameOverDialog.tsx        # End game modal
├── StartScreen.tsx           # Game intro screen
├── constants.ts              # Game constants
└── types.ts                  # TypeScript types
```

Games use HTML5 Canvas for rendering and handle their own state management.

### Smart Contract Development

Smart contracts are written in Algorand TypeScript. Key files:

- `apps/algorand/smart_contracts/{contract}/contract.algo.ts`: Contract code
- `apps/algorand/smart_contracts/{contract}/deploy-config.ts`: Deployment config
- `apps/algorand/smart_contracts/index.ts`: Dynamic deployment orchestrator

The orchestrator automatically:

1. Discovers contracts by scanning directories
2. Loads deploy configurations
3. Executes deployments programmatically
4. Generates TypeScript client SDKs in `artifacts/` directory

After building contracts, generated clients are available in `apps/algorand/smart_contracts/artifacts/{ContractName}Client.ts`.

### AI Game Generation

Located in `apps/web/lib/router/ai.ts`. Workflow:

1. User provides natural language game description
2. Backend calls Google Gemini 2.5 Flash Lite via Vercel AI SDK
3. AI generates complete HTML5 Canvas game (HTML + CSS + JS)
4. Generated code stored in MongoDB `aiGames` collection
5. Frontend renders game in Monaco editor with live preview

System prompts are defined in `apps/web/ai/templates.ts` and model configuration in `apps/web/ai/config.ts`.

## Environment Configuration

Environment variables are validated in `apps/web/env.ts` using @t3-oss/env-nextjs. Required variables:

**Database**:

- `MONGODB_URI`: MongoDB connection string
- `MONGODB_DB_NAME`: Database name

**Authentication**:

- `BETTER_AUTH_SECRET`: Secret key for better-auth
- `BETTER_AUTH_URL`: Base URL (e.g., http://localhost:3000)
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth secret

**Email (Nodemailer)**:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `SMTP_FROM_EMAIL`

**Storage**:

- `PINATA_JWT`: Pinata API token (for IPFS uploads)

**AI**:

- `GOOGLE_GENERATIVE_AI_API_KEY`: Google AI API key for Gemini

## Important Patterns and Conventions

### Adding New API Endpoints

1. Create or modify router file in `apps/web/lib/router/`
2. Use `os.input()` and `os.output()` with Zod schemas for type safety
3. Define route metadata with `.route({ method, path })`
4. Implement handler with `.handler(async ({ input }) => { ... })`
5. Export from `apps/web/lib/router/index.ts`
6. Types automatically available on frontend via oRPC client

Example:

```typescript
import { os } from "@orpc/server";
import { z } from "zod";

const myEndpoint = os
  .input(z.object({ name: z.string() }))
  .output(z.object({ greeting: z.string() }))
  .route({ method: "POST", path: "/my-endpoint" })
  .handler(async ({ input }) => {
    return { greeting: `Hello, ${input.name}!` };
  });

export const myRouter = os.router({ myEndpoint });
```

### Adding New Games

1. Copy existing game structure from `apps/web/components/games/slither/`
2. Implement game logic in `game-logic.ts`
3. Implement rendering in `rendering.ts`
4. Create React wrapper in `index.tsx`
5. Add game to routing/navigation
6. Update `gameStats` schema if needed for new stat types

### Working with Smart Contracts

1. Create new contract directory: `apps/algorand/smart_contracts/{name}/`
2. Write contract in `contract.algo.ts` using Algorand TypeScript
3. Create `deploy-config.ts` with deployment parameters
4. Run `bun build` to compile and generate client SDK
5. Import generated client in web app: `import { {Name}Client } from '@/contracts/{Name}Client'`
6. Use `bun deploy` for testing deployment with hot-reload

### Database Queries

Use native MongoDB driver. Example:

```typescript
import clientPromise from "@/lib/mongodb";
import { env } from "@/env";

const client = await clientPromise;
const db = client.db(env.MONGODB_DB_NAME);
const collection = db.collection("collectionName");

// Insert
await collection.insertOne({ ... });

// Find
const results = await collection.find({ ... }).toArray();

// Update
await collection.updateOne({ _id: ... }, { $set: { ... } });
```

No ORM abstractions - write queries directly.

### Using Game Statistics Hooks

The platform provides two specialized hooks for tracking game statistics:

#### 1. useGameStats (Win/Loss Games)

For competitive games with win/loss outcomes (head-soccer, rock-paper-scissor, showdown):

```typescript
import { useGameStats } from "@/hooks/use-game-stats";

function MyCompetitiveGame() {
  const { updateStats, isUpdating } = useGameStats("head-soccer");

  const handleGameEnd = (playerWon: boolean, isTie: boolean = false) => {
    updateStats({ playerWon, tie: isTie });
  };

  // Use updateStats when game ends
}
```

#### 2. useScoreGameStats (Score-Based Games)

For arcade games with score tracking (slither, endless-runner, paaji):

```typescript
import { useScoreGameStats } from "@/hooks/use-score-game-stats";

function MyScoreGame() {
  const {
    stats,
    updateScore,
    isNewHighScore,
    highScore,
    totalPlays,
    averageScore,
  } = useScoreGameStats("slither");

  const handleGameOver = (finalScore: number) => {
    updateScore(finalScore);
    // Automatically shows toast if new high score
  };

  return (
    <div>
      <p>High Score: {highScore}</p>
      <p>Total Plays: {totalPlays}</p>
      <p>Average Score: {averageScore}</p>
      {isNewHighScore && <p>New Record!</p>}
    </div>
  );
}
```

**Features:**
- Automatic high score tracking
- Total plays and average score calculation
- New high score toast notifications
- Automatic query invalidation and refetching
- Type-safe with full TypeScript support
- Handles unauthenticated users gracefully

## File Organization

### Critical Files to Understand First

1. **apps/web/env.ts**: Environment variable schema and validation
2. **apps/web/lib/auth.ts**: Authentication setup and configuration
3. **apps/web/lib/router/index.ts**: Main API router composition
4. **apps/web/lib/mongodb.ts**: Database singleton client
5. **apps/web/ai/config.ts**: AI model configuration
6. **.algokit.toml**: Monorepo and AlgoKit configuration

### Component Organization

- **apps/web/components/admin/**: Admin dashboard components
- **apps/web/components/ai-elements/**: AI game generation UI
- **apps/web/components/auth/**: Login/signup forms
- **apps/web/components/games/**: Individual game implementations
- **apps/web/components/layout/**: Shared layout components
- **apps/web/components/profile/**: User profile UI
- **apps/web/components/ui/**: Reusable UI components (shadcn/ui)

### API Routes

Next.js API routes in `apps/web/app/api/`:

- Uses oRPC endpoints from `lib/router/`
- OpenAPI documentation available via Scalar

## Testing Smart Contracts

Use AlgoKit's built-in debugging:

```bash
# Enable AVM debugging
export DEBUG=1

# Deploy with debugging
cd apps/algorand
bun deploy
```

Debug logs will show detailed transaction information and AVM execution traces.

## Common Workflows

### Adding Authentication to New Route

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({
  headers: await headers(),
});

if (!session) {
  throw new Error("Unauthorized");
}

// Access user: session.user
```

### Admin-Only Endpoints

```typescript
const session = await auth.api.getSession({
  headers: await headers(),
});

if (!session || session.user.role !== "admin") {
  throw new Error("Forbidden: Admin access required");
}
```

### Connecting to Algorand Wallet

Frontend uses `@txnlab/use-wallet-react`:

```typescript
import { useWallet } from "@txnlab/use-wallet-react";

const { activeAccount, signTransactions } = useWallet();
```

## Notes

- **No ORM**: Database queries use native MongoDB driver
- **Type Safety**: oRPC provides end-to-end type safety from API to frontend
- **Monorepo**: Use Turbo filters to run commands on specific apps
- **Hot Reload**: Smart contract deployment watches .env for changes
- **AI Model**: Currently using Gemini 2.5 Flash Lite (fast, cost-effective)
- **Package Manager**: This repo uses bun (lockfile: bun-lock.yaml)
