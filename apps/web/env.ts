import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    MONGODB_URI: z.string().min(1).max(2000),
    NODE_ENV: z.enum(["development", "production"]).default("production"),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
    MONGODB_DB_NAME: z.string().min(1).max(100).default("game-aggregator"),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    // SMTP Configuration for Nodemailer
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_SECURE: z.coerce.boolean().default(false),
    SMTP_USER: z.string().min(1),
    SMTP_PASSWORD: z.string().min(1),
    SMTP_FROM_EMAIL: z.email(),
    SMTP_FROM_NAME: z.string().default("Game Aggregator"),
    PINATA_JWT: z.string().min(1),
    // Rewards Contract Admin
    REWARDS_ADMIN_MNEMONIC: z.string().min(1),
  },
  client: {
    // NEXT_PUBLIC_ variables are exposed to the client
    NEXT_PUBLIC_ALGOD_NETWORK: z.string().default("testnet"),
    NEXT_PUBLIC_ALGOD_SERVER: z.string().min(1),
    NEXT_PUBLIC_ALGOD_PORT: z.string().default(""),
    NEXT_PUBLIC_ALGOD_TOKEN: z.string().default(""),
    NEXT_PUBLIC_INDEXER_SERVER: z.string().min(1),
    NEXT_PUBLIC_INDEXER_PORT: z.string().default(""),
    NEXT_PUBLIC_INDEXER_TOKEN: z.string().default(""),
    NEXT_PUBLIC_KMD_SERVER: z.url().optional().default("http://localhost"),
    NEXT_PUBLIC_KMD_PORT: z.string().default(""),
    NEXT_PUBLIC_KMD_TOKEN: z.string().default(""),
    NEXT_PUBLIC_KMD_WALLET: z.string().default(""),
    NEXT_PUBLIC_KMD_PASSWORD: z.string().default(""),
    NEXT_PUBLIC_REWARDS_APP_ID: z.string().optional(),
    NEXT_PUBLIC_REWARDS_APP_ADDRESS: z.string().optional(),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    MONGODB_URI: process.env.MONGODB_URI,
    NODE_ENV: process.env.NODE_ENV,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME,
    PINATA_JWT: process.env.PINATA_JWT,
    REWARDS_ADMIN_MNEMONIC: process.env.REWARDS_ADMIN_MNEMONIC,
    NEXT_PUBLIC_ALGOD_NETWORK: process.env.NEXT_PUBLIC_ALGOD_NETWORK,
    NEXT_PUBLIC_ALGOD_SERVER: process.env.NEXT_PUBLIC_ALGOD_SERVER,
    NEXT_PUBLIC_ALGOD_PORT: process.env.NEXT_PUBLIC_ALGOD_PORT,
    NEXT_PUBLIC_ALGOD_TOKEN: process.env.NEXT_PUBLIC_ALGOD_TOKEN,
    NEXT_PUBLIC_INDEXER_SERVER: process.env.NEXT_PUBLIC_INDEXER_SERVER,
    NEXT_PUBLIC_INDEXER_PORT: process.env.NEXT_PUBLIC_INDEXER_PORT,
    NEXT_PUBLIC_INDEXER_TOKEN: process.env.NEXT_PUBLIC_INDEXER_TOKEN,
    NEXT_PUBLIC_KMD_SERVER: process.env.NEXT_PUBLIC_KMD_SERVER,
    NEXT_PUBLIC_KMD_PORT: process.env.NEXT_PUBLIC_KMD_PORT,
    NEXT_PUBLIC_KMD_TOKEN: process.env.NEXT_PUBLIC_KMD_TOKEN,
    NEXT_PUBLIC_KMD_WALLET: process.env.NEXT_PUBLIC_KMD_WALLET,
    NEXT_PUBLIC_KMD_PASSWORD: process.env.NEXT_PUBLIC_KMD_PASSWORD,
    NEXT_PUBLIC_REWARDS_APP_ID: process.env.NEXT_PUBLIC_REWARDS_APP_ID,
    NEXT_PUBLIC_REWARDS_APP_ADDRESS:
      process.env.NEXT_PUBLIC_REWARDS_APP_ADDRESS,
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  // experimental__runtimeEnv: {
  //   NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  // }
});
