const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * Create a new battle in the database
 */
async function createBattle(battleData) {
  const { data, error } = await supabase
    .from('battles')
    .insert(battleData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Create a new round in the database
 */
async function createRound(roundData) {
  const { data, error } = await supabase
    .from('rounds')
    .insert(roundData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Update round with scores
 */
async function updateRoundScores(battleId, roundNumber, scores) {
  const { error } = await supabase
    .from('rounds')
    .update({
      player1_score: scores.roast1_score,
      player2_score: scores.roast2_score,
      ai_commentary: scores.commentary
    })
    .eq('battle_id', battleId)
    .eq('round_number', roundNumber);
  
  if (error) throw error;
}

/**
 * Update battle with winner
 */
async function completeBattle(battleId, winnerId) {
  const { error } = await supabase
    .from('battles')
    .update({
      winner_id: winnerId,
      status: 'completed',
      ended_at: new Date().toISOString()
    })
    .eq('id', battleId);
  
  if (error) throw error;
}

/**
 * Get all rounds for a battle
 */
async function getBattleRounds(battleId) {
  const { data, error } = await supabase
    .from('rounds')
    .select('player1_score, player2_score')
    .eq('battle_id', battleId);
  
  if (error) throw error;
  return data;
}

/**
 * Update user stats
 */
async function updateUserStats(walletAddress, isWinner) {
  const { data: userData } = await supabase
    .from('users')
    .select('total_battles, total_wins')
    .eq('wallet_address', walletAddress)
    .single();
  
  if (userData) {
    await supabase
      .from('users')
      .update({
        total_battles: (userData.total_battles || 0) + 1,
        total_wins: (userData.total_wins || 0) + (isWinner ? 1 : 0)
      })
      .eq('wallet_address', walletAddress);
  } else {
    await supabase
      .from('users')
      .insert({
        wallet_address: walletAddress,
        total_battles: 1,
        total_wins: isWinner ? 1 : 0,
        total_roast_earned: 0
      });
  }
}

module.exports = {
  createBattle,
  createRound,
  updateRoundScores,
  completeBattle,
  getBattleRounds,
  updateUserStats
};