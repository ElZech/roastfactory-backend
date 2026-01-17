// Battle Configuration
module.exports.BATTLE_CONFIG = {
  ROUND_DURATION: 30000, // 30 seconds
  ROUNDS_PER_BATTLE: 3,
  MATCHMAKING_TIMEOUT: 60000, // 1 minute
  
  TIER_PRIZES: {
    Bronze: 2000,
    Silver: 6000,
    Gold: 8000,
    Diamond: 10000
  },
  
  PLATFORM_FEE: 0.05, // 5%
  
  ROAST_PROMPTS: {
    Bronze: [
      "Roast your opponent's fashion sense",
      "Roast your opponent's gaming skills",
      "Roast your opponent's cooking abilities"
    ],
    Silver: [
      "Roast your opponent's music taste",
      "Roast your opponent's social media posts",
      "Roast your opponent's selfie game"
    ],
    Gold: [
      "Roast your opponent's dance moves",
      "Roast your opponent's pickup lines",
      "Roast your opponent's life choices"
    ],
    Diamond: [
      "Roast your opponent's entire existence",
      "Roast your opponent's future prospects",
      "Roast your opponent's past mistakes"
    ]
  }
};