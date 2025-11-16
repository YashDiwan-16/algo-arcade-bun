import { env } from "@/env";
import {
  AlgoNextClientConfig,
  AlgoNextKMDConfig,
} from "../../interfaces/network";

export function getAlgodConfigFromEnvironment(): AlgoNextClientConfig {
  if (!env.NEXT_PUBLIC_ALGOD_SERVER) {
    throw new Error(
      "Attempt to get default algod configuration without specifying NEXT_PUBLIC_ALGOD_SERVER in the environment variables"
    );
  }

  return {
    server: env.NEXT_PUBLIC_ALGOD_SERVER,
    port: env.NEXT_PUBLIC_ALGOD_PORT,
    token: env.NEXT_PUBLIC_ALGOD_TOKEN,
    network: env.NEXT_PUBLIC_ALGOD_NETWORK,
  };
}

export function getIndexerConfigFromEnvironment(): AlgoNextClientConfig {
  if (!env.NEXT_PUBLIC_INDEXER_SERVER) {
    throw new Error(
      "Attempt to get default indexer configuration without specifying NEXT_PUBLIC_INDEXER_SERVER in the environment variables"
    );
  }

  return {
    server: env.NEXT_PUBLIC_INDEXER_SERVER,
    port: env.NEXT_PUBLIC_INDEXER_PORT,
    token: env.NEXT_PUBLIC_INDEXER_TOKEN,
    network: env.NEXT_PUBLIC_ALGOD_NETWORK,
  };
}

export function getKmdConfigFromEnvironment(): AlgoNextKMDConfig {
  if (!env.NEXT_PUBLIC_KMD_SERVER) {
    throw new Error(
      "Attempt to get default kmd configuration without specifying NEXT_PUBLIC_KMD_SERVER in the environment variables"
    );
  }

  return {
    server: env.NEXT_PUBLIC_KMD_SERVER,
    port: env.NEXT_PUBLIC_KMD_PORT,
    token: env.NEXT_PUBLIC_KMD_TOKEN,
    wallet: env.NEXT_PUBLIC_KMD_WALLET,
    password: env.NEXT_PUBLIC_KMD_PASSWORD,
  };
}
