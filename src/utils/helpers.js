const crypto = require('crypto');

/**
 * Generate a unique battle ID
 */
function generateBattleId() {
  return crypto.randomUUID();
}

/**
 * Calculate prize pool for a tier
 */
function calculatePrizes(tier, tierPrizes, platformFee) {
  const entryFee = tierPrizes[tier] || tierPrizes.Bronze;
  const totalPool = entryFee * 2;
  const fee = totalPool * platformFee;
  const winnerPrize = totalPool - fee;
  
  return {
    entryFee,
    totalPool,
    platformFee: fee,
    winnerPrize
  };
}

/**
 * Get random prompt for tier and round
 */
function getPromptForRound(tier, roundNumber, prompts) {
  const tierPrompts = prompts[tier] || prompts.Bronze;
  return tierPrompts[roundNumber - 1] || tierPrompts[0];
}

module.exports = {
  generateBattleId,
  calculatePrizes,
  getPromptForRound
};