# Game Rewards Smart Contract - Deployment Guide

## Overview

This guide walks you through deploying and configuring the GameRewards smart contract that handles milestone reward payouts in ALGO.

## Prerequisites

- Algorand node access (LocalNet, TestNet, or MainNet)
- AlgoKit installed
- Funded deployer account
- Admin account with mnemonic for signing reward claims

## Smart Contract Features

### Core Functionality

- **Secure Reward Pool**: Contract holds ALGO for distributing rewards
- **Admin-Controlled Claims**: Only admin can approve reward payouts
- **Duplicate Protection**: Each milestone can only be claimed once per user
- **Tracking**: Records all claimed rewards on-chain
- **Emergency Withdraw**: Owner can recover funds if needed

### Contract Methods

1. **init** - Initialize contract with owner and admin addresses
2. **fundPool** - Add ALGO to the rewards pool
3. **claimReward** - Admin approves and sends reward to user
4. **isClaimed** - Check if a milestone has been claimed
5. **getStats** - Get pool statistics (total, claimed, available)
6. **updateAdmin** - Owner can change admin address
7. **emergencyWithdraw** - Owner can recover funds

## Deployment Steps

### 1. Build the Contract

Navigate to the algorand directory and build:

```bash
cd apps/algorand
bun run build
```

This compiles the contract and generates TypeScript client code.

### 2. Set Up Environment Variables

Create or update your `.env` file in `apps/algorand`:

```bash
# Deployer account (has ALGOD access)
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_PORT=443
ALGOD_TOKEN=
INDEXER_SERVER=https://testnet-idx.algonode.cloud
INDEXER_PORT=443
INDEXER_TOKEN=

# Deployer account mnemonic (for funding contract)
DEPLOYER_MNEMONIC="your 25-word mnemonic phrase here"

# Optional: Custom funding amount (default 100 ALGO)
REWARD_POOL_FUNDING=100
```

### 3. Deploy the Contract

Deploy to your configured network:

```bash
# Deploy all contracts
bun run deploy

# Or deploy only rewards contract
bun run deploy rewards
```

The deployment script will:

1. Deploy the GameRewards contract
2. Fund it with 1 ALGO for minimum balance requirement
3. Initialize it with owner and admin addresses
4. Fund the rewards pool with configured amount (default 100 ALGO)
5. Print contract details and environment variables

### 4. Configure Backend Environment

Add the output environment variables to `apps/web/.env`:

```bash
# From deployment output
NEXT_PUBLIC_REWARDS_APP_ID="123456789"
NEXT_PUBLIC_REWARDS_APP_ADDRESS="CONTRACT_ADDRESS_HERE"

# Admin account mnemonic (for approving claims)
# ⚠️ KEEP THIS SECRET - Never commit to git
REWARDS_ADMIN_MNEMONIC="admin 25-word mnemonic phrase here"
```

### 5. Update Web App Environment Types

The environment variables are already configured in `apps/web/env.ts`.

### 6. Verify Deployment

Check contract status:

```bash
# Using AlgoKit
algokit explore

# Or check on AlgoExplorer
# TestNet: https://testnet.algoexplorer.io/application/{APP_ID}
# MainNet: https://algoexplorer.io/application/{APP_ID}
```

## Testing the Integration

### 1. Test Milestone Completion

1. Play games to complete milestones
2. Check `/rewards` page to see completed milestones
3. Connect your Algorand wallet

### 2. Test Reward Claim

1. Click "Claim" on a completed milestone
2. The backend will:
   - Verify milestone completion
   - Call smart contract as admin
   - Send ALGO to your wallet
   - Record claim in database

### 3. Verify Transaction

Check the transaction on AlgoExplorer using the returned txId.

## Managing the Contract

### Check Pool Balance

```typescript
import { GameRewardsClient } from "@/contracts/GameRewards";

const client = new GameRewardsClient(
  { resolveBy: "id", id: appId, sender: account },
  algod
);

const stats = await client.getStats({});
const [totalPool, totalClaimed, available] = stats.return;
console.log(`Available: ${Number(available) / 1_000_000} ALGO`);
```

### Add More Funds

```typescript
const composer = client.newGroup();

composer.addTransaction(
  await algorand.createTransaction.payment({
    amount: (50).algo(), // Add 50 ALGO
    sender: funderAddress,
    receiver: contractAddress,
  })
);

composer.fundPool({
  args: [BigInt(50_000_000)], // 50 ALGO in microAlgos
});

await composer.send();
```

### Update Admin

```typescript
await client.updateAdmin({
  newAdmin: "NEW_ADMIN_ADDRESS",
});
```

### Emergency Withdraw (Owner Only)

```typescript
await client.emergencyWithdraw({
  amount: BigInt(10_000_000), // 10 ALGO in microAlgos
});
```

## Security Best Practices

### Admin Mnemonic Security

**DO NOT:**

- ❌ Commit mnemonic to git
- ❌ Share mnemonic publicly
- ❌ Store in client-side code
- ❌ Log mnemonic in server logs

**DO:**

- ✅ Use environment variables
- ✅ Use secrets management (AWS Secrets Manager, Azure Key Vault, etc.)
- ✅ Rotate admin account periodically
- ✅ Use separate accounts for different environments

### Production Recommendations

1. **Use Dedicated Accounts**

   - Separate owner and admin accounts
   - Use hardware wallet for owner account
   - Admin account only for claim approvals

2. **Monitor Contract**

   - Set up alerts for low pool balance
   - Monitor claim patterns for fraud
   - Track total rewards distributed

3. **Rate Limiting**

   - Implement rate limits on claim endpoint
   - Prevent spam attacks
   - Log all claim attempts

4. **Backup Plan**
   - Keep emergency withdraw capability
   - Document recovery procedures
   - Test disaster recovery

## Troubleshooting

### "Insufficient pool balance"

- Check contract balance with `getStats()`
- Fund the pool using `fundPool()`

### "Only admin can approve claims"

- Verify REWARDS_ADMIN_MNEMONIC is correct
- Check admin address matches contract

### "Reward already claimed"

- Milestone was already claimed on-chain
- Check with `isClaimed()` method

### "Failed to send reward"

- Check admin account has ALGO for fees
- Verify contract has enough balance
- Check network connectivity

## Cost Estimates

### Deployment Costs (TestNet/MainNet)

- Contract deployment: ~0.1 ALGO
- Minimum balance requirement: 0.1 ALGO
- Per milestone claim: ~0.002 ALGO (inner txn fee)

### Ongoing Costs

- Claim approval transaction: 0.001 ALGO per claim
- Box storage (per unique user): ~0.0025 ALGO

## Monitoring and Maintenance

### Regular Checks

1. Monitor pool balance weekly
2. Review claim logs for anomalies
3. Verify database and contract state match
4. Check for failed transactions

### Refund Schedule

- Calculate average weekly rewards
- Maintain 4-8 weeks of reserves
- Set up automatic refund triggers

## Next Steps

1. ✅ Deploy contract to TestNet
2. ✅ Test full claim flow
3. ✅ Monitor for 1-2 weeks
4. ✅ Deploy to MainNet
5. ✅ Set up monitoring and alerts

## Support

For issues:

1. Check contract state with AlgoExplorer
2. Review server logs for errors
3. Verify environment configuration
4. Test on TestNet first

## Additional Resources

- [Algorand Developer Portal](https://developer.algorand.org/)
- [AlgoKit Documentation](https://developer.algorand.org/docs/get-started/algokit/)
- [Smart Contract Best Practices](https://developer.algorand.org/docs/get-details/dapps/smart-contracts/best-practices/)
