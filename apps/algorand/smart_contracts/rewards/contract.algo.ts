import {
  type Account,
  arc4,
  assert,
  type bytes,
  Contract,
  GlobalState,
  itxn,
  Txn,
  Uint64,
  type uint64,
  BoxMap, 
  gtxn,
  Box,
  Application,
} from "@algorandfoundation/algorand-typescript";
/**
 * GameRewards Smart Contract
 *
 * Manages milestone-based rewards for game achievements.
 * Users can claim ALGO rewards when they complete game milestones.
 */
export class GameRewards extends Contract {
  // Contract owner who can fund and manage the contract
  owner = GlobalState<Account>();

  // Admin who can verify milestone claims
  admin = GlobalState<Account>();

 
 
 
  // Total ALGO pool available for rewards
  totalPool = GlobalState<uint64>();

  // Total ALGO claimed by users
  totalClaimed = GlobalState<uint64>();

  // Whether contract is initialized
  initialized = GlobalState<boolean>();

  // Track claimed milestones: userId + milestoneId -> claimed amount
  // Using Box storage for flexible storage of user claims

  /**
   * Initialize the contract with owner and admin
   * Can only be called during contract creation
   */
  @arc4.abimethod({ allowActions: ["NoOp"], onCreate: "require" })
  init(owner: Account, admin: Account): void {
    this.owner.value = owner;
    this.admin.value = admin;
    this.totalPool.value = Uint64(0);
    this.totalClaimed.value = Uint64(0);
    this.initialized.value = true;
  }

  /**
   * Fund the rewards pool
   * Must be called with a payment transaction in group
   */
  @arc4.abimethod()
  fundPool(paymentAmount: uint64): void {
    assert(this.initialized.value, "Not initialized");

    // Verify payment transaction
    const payTxn = gtxn.PaymentTxn(Uint64(0));
    assert(payTxn.amount === paymentAmount, "Payment amount mismatch");

    this.totalPool.value += paymentAmount;
  }
  /**
   * Claim a milestone reward
   * Can only be called by admin after verifying milestone completion
   */
  @arc4.abimethod()
  claimReward(
    recipient: Account,
    milestoneId: bytes,
    rewardAmount: uint64
  ): void {
    assert(this.initialized.value, "Not initialized");
    assert(Txn.sender === this.admin.value, "Only admin can approve claims");
    assert(rewardAmount > Uint64(0), "Invalid reward amount");

    // Create unique key for this user + milestone
    const claimKey = this.createClaimKey(recipient, milestoneId);

    // Check if already claimed using Box storage
    const claimBox = Box<uint64>({ key: claimKey });
    assert(!claimBox.exists, "Reward already claimed");

    // Verify pool has enough balance
    assert(
      this.totalPool.value >= this.totalClaimed.value + rewardAmount,
      "Insufficient pool balance"
    );

    // Send reward to recipient
    itxn
      .payment({
        receiver: recipient,
        amount: rewardAmount,
        fee: 0,
      })
      .submit();

    // Record the claim in Box storage
    claimBox.value = rewardAmount;
    this.totalClaimed.value += rewardAmount;
  }

  /**
   * Check if a milestone has been claimed
   */
  @arc4.abimethod({ readonly: true })
  isClaimed(user: Account, milestoneId: bytes): boolean {
    const claimKey = this.createClaimKey(user, milestoneId);
    const claimBox = Box<uint64>({ key: claimKey });
    return claimBox.exists;
  }

  /**
   * Get claimed amount for a specific milestone
   */
  @arc4.abimethod({ readonly: true })
  getClaimedAmount(user: Account, milestoneId: bytes): uint64 {
    const claimKey = this.createClaimKey(user, milestoneId);
    const claimBox = Box<uint64>({ key: claimKey });
    return claimBox.exists ? claimBox.value : Uint64(0);
  }

  /**
   * Get total pool balance
   */
  @arc4.abimethod({ readonly: true })
  getTotalPool(): uint64 {
    return this.totalPool.value;
  }

  /**
   * Get total claimed amount
   */
  @arc4.abimethod({ readonly: true })
  getTotalClaimed(): uint64 {
    return this.totalClaimed.value;
  }

  /**
   * Get available pool balance
   */
  @arc4.abimethod({ readonly: true })
  getAvailableBalance(): uint64 {
    return this.totalPool.value - this.totalClaimed.value;
  }

  /**
   * Update admin (owner only)
   */
  @arc4.abimethod()
  updateAdmin(newAdmin: Account): void {
    assert(this.initialized.value, "Not initialized");
    assert(Txn.sender === this.owner.value, "Only owner can update admin");
    this.admin.value = newAdmin;
  }

  /**
   * Emergency withdraw (owner only)
   * Allows owner to recover funds if needed
   */
  @arc4.abimethod()
  emergencyWithdraw(amount: uint64): void {
    assert(this.initialized.value, "Not initialized");
    assert(Txn.sender === this.owner.value, "Only owner can withdraw");
    assert(
      this.totalPool.value >= this.totalClaimed.value + amount,
      "Insufficient available balance"
    );

    itxn
      .payment({
        receiver: this.owner.value,
        amount: amount,
        fee: 0,
      })
      .submit();

    this.totalPool.value -= amount;
  }

  /**
   * Helper: Create unique claim key from user address and milestone ID
   */
  private createClaimKey(user: Account, milestoneId: bytes): bytes {
    // Combine user address bytes with milestone ID
    return user.bytes.concat(milestoneId);
  }
}
