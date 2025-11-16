import { AlgorandClient } from "@algorandfoundation/algokit-utils";
import { consoleLogger } from "@algorandfoundation/algokit-utils/types/logging";
import { GameRewardsFactory } from "../artifacts/rewards/GameRewardsClient";

/**
 * Deploy and initialize the GameRewards smart contract
 *
 * This script:
 * 1. Deploys the GameRewards contract
 * 2. Initializes it with owner and admin
 * 3. Funds the contract with initial ALGO pool
 */
export async function deploy() {
  consoleLogger.info("=== Deploying GameRewards Contract ===");

  const algorand = AlgorandClient.fromEnvironment();
  const deployer = await algorand.account.fromEnvironment("DEPLOYER");

  const factory = algorand.client.getTypedAppFactory(GameRewardsFactory, {
    defaultSender: deployer.addr,
  });

  // Use deployer as both owner and admin initially
  const owner = deployer.addr;
  const admin = deployer.addr;

  // Deploy the contract with initialization
  const { appClient, result } = await factory.deploy({
    onUpdate: "append",
    onSchemaBreak: "append",
    createParams: {
      method: "init",
      args: [String(owner), String(admin)],
    },
  });

  // Fund the app account with minimum balance
  if (["create", "replace"].includes(result.operationPerformed)) {
    await algorand.send.payment({
      amount: (1).algo(), // Initial MBR
      sender: deployer.addr,
      receiver: appClient.appAddress,
    });
  }

  consoleLogger.info(
    `✅ Deployed GameRewards Contract: id=${appClient.appClient.appId} address=${appClient.appAddress}`
  );

  // Fund the rewards pool
  consoleLogger.info("\n💰 Funding rewards pool...");

  // Determine funding amount (default 0.5 ALGO for testing, can be configured)
  const fundingAlgo = process.env.REWARD_POOL_FUNDING
    ? Number(process.env.REWARD_POOL_FUNDING)
    : 100; // Default to 0.5 ALGO for testing

  const fundAmountMicroAlgo = fundingAlgo * 1_000_000;

  // Create atomic transaction group: payment + fundPool call
  const composer = appClient.newGroup();

  // Add payment transaction
  composer.addTransaction(
    await algorand.createTransaction.payment({
      amount: fundingAlgo.algo(),
      sender: deployer.addr,
      receiver: appClient.appAddress,
    })
  );

  // Add fundPool call
  composer.fundPool({
    args: [BigInt(fundAmountMicroAlgo)],
  });

  // Send the group
  const fundResult = await composer.send();

  consoleLogger.info(
    `✅ Successfully funded contract with ${fundingAlgo} ALGO`
  );
  consoleLogger.info(`   Transaction ID: ${fundResult.txIds[0]}`);

  // Get contract stats
  const totalPoolResult = await appClient.send.getTotalPool({ args: [] });
  const totalClaimedResult = await appClient.send.getTotalClaimed({ args: [] });

  const totalPool = totalPoolResult.return!;
  const totalClaimed = totalClaimedResult.return!;
  const available = totalPool - totalClaimed;

  consoleLogger.info("\n📊 Contract Statistics:");
  consoleLogger.info(`   Total Pool: ${Number(totalPool) / 1_000_000} ALGO`);
  consoleLogger.info(
    `   Total Claimed: ${Number(totalClaimed) / 1_000_000} ALGO`
  );
  consoleLogger.info(`   Available: ${Number(available) / 1_000_000} ALGO`);

  // Print environment variables for frontend
  consoleLogger.info("\n🔐 Environment Variables (add to .env):");
  consoleLogger.info(
    `NEXT_PUBLIC_REWARDS_APP_ID="${appClient.appClient.appId}"`
  );
  consoleLogger.info(
    `NEXT_PUBLIC_REWARDS_APP_ADDRESS="${appClient.appAddress}"`
  );
  consoleLogger.info(`REWARDS_ADMIN_ADDRESS="${admin}"`);

  consoleLogger.info("\n✨ Deployment complete!");

  return {
    name: "game-rewards",
    appId: appClient.appClient.appId,
    appAddress: appClient.appAddress,
  };
}
