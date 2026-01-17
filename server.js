const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const { Redis } = require('@upstash/redis');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Initialize OpenAI client
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const httpServer = createServer(app);

// Configure CORS to allow frontend connection
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store active battles and matchmaking queue
const matchmakingQueue = [];
const activeBattles = new Map();

// Battle configuration
const BATTLE_CONFIG = {
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
      "Roast your opponent's future",
      "Roast your opponent's past mistakes"
    ]
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', connections: io.engine.clientsCount });
});

// Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    res.json({ 
      status: 'Database connected!', 
      tables: ['users', 'battles', 'rounds', 'clips']
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Database connection failed', 
      error: error.message 
    });
  }
});

// Test Redis connection
app.get('/test-redis', async (req, res) => {
  try {
    await redis.set('test_key', 'Redis is working!');
    const value = await redis.get('test_key');
    
    res.json({ 
      status: 'Redis connected!', 
      test: value,
      message: 'Matchmaking queue ready'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Redis connection failed', 
      error: error.message 
    });
  }
});

// Test OpenAI connection
app.get('/test-openai', async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a savage roast battle judge." },
        { role: "user", content: "Rate this roast: 'Your code is so bad, even HTML rejects it.' Give a score 1-100 and brief comment." }
      ],
      max_tokens: 100
    });
    
    res.json({ 
      status: 'OpenAI connected!', 
      response: completion.choices[0].message.content,
      message: 'AI judging ready'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'OpenAI connection failed', 
      error: error.message 
    });
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join matchmaking queue
  socket.on('battle:join_queue', (data) => {
    const { userId, tier, mode } = data;
    
    console.log(`User ${userId} joining ${tier} queue (${mode} mode)`);
    
    const player = {
      socketId: socket.id,
      userId,
      tier,
      mode,
      joinedAt: Date.now()
    };
    
    matchmakingQueue.push(player);
    tryMatchmaking(tier, mode);
  });

  // Leave matchmaking queue
  socket.on('battle:leave_queue', () => {
    const index = matchmakingQueue.findIndex(p => p.socketId === socket.id);
    if (index > -1) {
      matchmakingQueue.splice(index, 1);
      console.log('User left queue:', socket.id);
    }
  });

  // ⭐ NEW: Client requests current battle state
  socket.on('battle:request_state', ({ battleId }) => {
    console.log('📡 Client requesting state for battle:', battleId);
    
    const battle = activeBattles.get(battleId);
    
    if (!battle) {
      console.log('❌ Battle not found:', battleId);
      return;
    }

    const player = battle.players.find(p => p.socketId === socket.id);
    
    if (!player) {
      console.log('❌ Player not in this battle');
      return;
    }

    console.log('✅ Sending current round state to player');
    
    // Send current round info
    const prompts = BATTLE_CONFIG.ROAST_PROMPTS[battle.tier];
    const prompt = prompts[battle.currentRound - 1];
    
    socket.emit('battle:round_start', {
      battleId: battle.id,
      round: battle.currentRound,
      prompt: prompt,
      duration: 30000
    });
  });

  // Submit roast
  socket.on('battle:submit_roast', async (data) => {
    const { battleId, round, roast, mode } = data;
    const battle = activeBattles.get(battleId);

 console.log('📝 Roast received:', roast);
  console.log('📝 Roast length:', roast?.length);
    
    if (!battle) return;
    
    console.log(`Roast submitted in battle ${battleId}, round ${round}`);
    
    const opponent = battle.players.find(p => p.socketId !== socket.id);
    if (opponent) {
      io.to(opponent.socketId).emit('battle:opponent_roast', {
        round,
        roast,
        mode
      });
    }
    
    if (!battle.rounds[round]) {
      battle.rounds[round] = {};
    }
    
    const playerIndex = battle.players.findIndex(p => p.socketId === socket.id);
    battle.rounds[round][`player${playerIndex + 1}`] = {
      roast,
      submittedAt: Date.now()
    };
    
    const updateField = playerIndex === 0 ? 'player1_roast' : 'player2_roast';
    await supabase
      .from('rounds')
      .update({ [updateField]: roast })
      .eq('battle_id', battleId)
      .eq('round_number', round);
    
// Check if both players submitted
if (Object.keys(battle.rounds[round]).length === 2) {
  // Add scoring flag to prevent duplicates
  if (!battle.rounds[round].isScoring) {
    battle.rounds[round].isScoring = true;
    
    // Both submitted - score the round
    setTimeout(() => {
      scoreRound(battleId, round);
    }, 1000);
  }
}
});

  // Send emoji reaction
  socket.on('battle:emoji_reaction', (data) => {
    const { battleId, emoji } = data;
    const battle = activeBattles.get(battleId);
    
    if (!battle) return;
    
    battle.players.forEach(player => {
      io.to(player.socketId).emit('battle:emoji_received', {
        emoji,
        from: socket.id
      });
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const queueIndex = matchmakingQueue.findIndex(p => p.socketId === socket.id);
    if (queueIndex > -1) {
      matchmakingQueue.splice(queueIndex, 1);
    }
    
    activeBattles.forEach((battle, battleId) => {
      const playerIndex = battle.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex > -1) {
        const opponent = battle.players.find(p => p.socketId !== socket.id);
        if (opponent) {
          io.to(opponent.socketId).emit('battle:opponent_disconnected');
        }
        activeBattles.delete(battleId);
      }
    });
  });
});

// Matchmaking logic
async function tryMatchmaking(tier, mode) {
  console.log('🔍 tryMatchmaking called! Tier:', tier, 'Mode:', mode);
  
  const players = matchmakingQueue.filter(p => p.tier === tier && p.mode === mode);
  
  console.log('👥 Players in queue:', players.length);
  
  if (players.length >= 2) {
    const player1 = players[0];
    const player2 = players[1];
    
    matchmakingQueue.splice(matchmakingQueue.indexOf(player1), 1);
    matchmakingQueue.splice(matchmakingQueue.indexOf(player2), 1);
    
    const battleId = crypto.randomUUID();

    console.log('💾 Attempting to save battle to database...');
    console.log('Battle ID:', battleId);
    console.log('Player 1 ID:', player1.userId);
    console.log('Player 2 ID:', player2.userId);
    console.log('Tier:', tier);
    console.log('Mode:', mode);

    // Save battle to database
    const { data: dbBattleData, error: dbBattleError } = await supabase
      .from('battles')
      .insert({
        id: battleId,
        player1_id: player1.userId,
        player2_id: player2.userId,
        tier: tier,
        mode: mode,
        prize_pool: 0,
        status: 'active'
      })
      .select()
      .single();

    if (dbBattleError) {
      console.error('❌ FAILED to save battle:', dbBattleError);
      console.error('Error details:', JSON.stringify(dbBattleError, null, 2));
    } else {
      console.log('✅ Battle saved successfully to database!');
      console.log('Battle data:', dbBattleData);
    }

    // Create battle in memory
    const battle = {
      id: battleId,
      tier,
      mode,
      players: [player1, player2],
      rounds: {},
      currentRound: 1,
      startedAt: Date.now()
    };

    activeBattles.set(battleId, battle);
    
    console.log(`Match found! Battle ${battleId} created`);
    
    // Notify both players
    io.to(player1.socketId).emit('battle:matched', {
      battleId,
      opponent: { userId: player2.userId },
      mode
    });
    
    io.to(player2.socketId).emit('battle:matched', {
      battleId,
      opponent: { userId: player1.userId },
      mode
    });
    
    // Start first round after 3 seconds
    setTimeout(() => {
      startRound(battleId, 1);
    }, 3000);
  }
}

// Start a round
async function startRound(battleId, roundNumber) {
  const battle = activeBattles.get(battleId);
  if (!battle) return;
  
  const prompts = BATTLE_CONFIG.ROAST_PROMPTS[battle.tier];
  const prompt = prompts[roundNumber - 1];
  const roundDuration = 30000;
  
  console.log(`Starting round ${roundNumber} in battle ${battleId}`);
  
  // Save round to database
  const { error: roundError } = await supabase
    .from('rounds')
    .insert({
      battle_id: battleId,
      round_number: roundNumber,
      prompt: prompt
    });
  
  if (roundError) {
    console.error('Failed to create round in DB:', roundError);
  }
  
  // Notify all players
  battle.players.forEach(player => {
    io.to(player.socketId).emit('battle:round_start', {
      battleId: battle.id,
      round: roundNumber,
      prompt,
      duration: roundDuration
    });
  });
  
  // Auto-end round after duration
setTimeout(() => {
  const currentBattle = activeBattles.get(battleId);
  if (currentBattle && currentBattle.rounds[roundNumber]) {
    // Only score if not already scoring
    if (!currentBattle.rounds[roundNumber].isScoring) {
      currentBattle.rounds[roundNumber].isScoring = true;
      scoreRound(battleId, roundNumber);
    }
  }
}, roundDuration + 5000);
}

// Score a round using AI
async function scoreRound(battleId, roundNumber) {
  const battle = activeBattles.get(battleId);
  if (!battle) return;
  
  const round = battle.rounds[roundNumber];
  
  console.log(`Scoring round ${roundNumber} in battle ${battleId} with AI...`);
  
  try {
    const roast1 = round.player1?.roast || "No roast submitted";
    const roast2 = round.player2?.roast || "No roast submitted";
    
    const roundData = await supabase
      .from('rounds')
      .select('prompt')
      .eq('battle_id', battleId)
      .eq('round_number', roundNumber)
      .single();
    
    const prompt = roundData?.data?.prompt || "General roast";
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are a brutal roast battle judge. Score each roast on:
- Savagery (how brutal/cutting)
- Creativity (originality)
- Delivery (flow and word choice)
- Relevance (staying on topic)

Respond ONLY with valid JSON in this exact format:
{
  "roast1_score": 75,
  "roast2_score": 82,
  "roast1_breakdown": "Savagery: 8/10, Creativity: 7/10, Delivery: 7/10, Relevance: 8/10",
  "roast2_breakdown": "Savagery: 9/10, Creativity: 8/10, Delivery: 8/10, Relevance: 8/10",
  "commentary": "Short savage comment about the round winner"
}`
        },
        { 
          role: "user", 
          content: `Prompt: "${prompt}"\n\nRoast 1: "${roast1}"\n\nRoast 2: "${roast2}"\n\nJudge these roasts and respond with JSON only.`
        }
      ],
      max_tokens: 300,
      temperature: 0.8
    });
    
    const aiResponse = completion.choices[0].message.content;
    console.log('AI Response:', aiResponse);
    
    let jsonStr = aiResponse.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '');
    }
    
    const scores = JSON.parse(jsonStr);
// Ensure there's always a winner (no ties)
if (scores.roast1_score === scores.roast2_score) {
  // Add random tiebreaker (1-5 points)
  const bonus = Math.floor(Math.random() * 5) + 1;
  scores.roast1_score += bonus;
  console.log(`Tie detected, added ${bonus} bonus to player 1`);
}
    
    await supabase
      .from('rounds')
      .update({
        player1_score: scores.roast1_score,
        player2_score: scores.roast2_score,
        ai_commentary: scores.commentary
      })
      .eq('battle_id', battleId)
      .eq('round_number', roundNumber);
    
    console.log(`Round ${roundNumber} scored:`, scores);
    
    battle.players.forEach((player, index) => {
      io.to(player.socketId).emit('battle:round_scored', {
        round: roundNumber,
        yourScore: scores[`roast${index + 1}_score`],
        yourBreakdown: scores[`roast${index + 1}_breakdown`],
        opponentScore: scores[`roast${index === 0 ? 2 : 1}_score`],
        opponentBreakdown: scores[`roast${index === 0 ? 2 : 1}_breakdown`],
        commentary: scores.commentary,
        winner: scores.roast1_score > scores.roast2_score ? 
          (index === 0 ? 'you' : 'opponent') : 
          (index === 1 ? 'you' : 'opponent')
      });
    });
    
    if (roundNumber < 3) {
      setTimeout(() => {
        startRound(battleId, roundNumber + 1);
      }, 8000);
    } else {
      setTimeout(() => {
        endBattle(battleId);
      }, 8000);
    }
    
  } catch (error) {
    console.error('AI scoring error:', error);
    
    const scores = {
      roast1_score: Math.floor(Math.random() * 50) + 50,
      roast2_score: Math.floor(Math.random() * 50) + 50
    };
    
    battle.players.forEach((player, index) => {
      io.to(player.socketId).emit('battle:round_scored', {
        round: roundNumber,
        yourScore: scores[`roast${index + 1}_score`],
        opponentScore: scores[`roast${index === 0 ? 2 : 1}_score`],
        commentary: "AI judging temporarily unavailable",
        winner: scores.roast1_score > scores.roast2_score ? 
          (index === 0 ? 'you' : 'opponent') : 
          (index === 1 ? 'you' : 'opponent')
      });
    });
    
    if (roundNumber < 3) {
      setTimeout(() => startRound(battleId, roundNumber + 1), 5000);
    } else {
      setTimeout(() => endBattle(battleId), 5000);
    }
  }
}

// End battle and save results
async function endBattle(battleId) {
  const battle = activeBattles.get(battleId);
  if (!battle) return;
  
  console.log(`Battle ${battleId} ended`);  // ✅ FIXED
  
  try {
    const { data: rounds, error } = await supabase
      .from('rounds')
      .select('player1_score, player2_score')
      .eq('battle_id', battleId);
    
    if (error) throw error;
    
    let player1Total = 0;
    let player2Total = 0;
    
    rounds.forEach(round => {
      player1Total += round.player1_score || 0;
      player2Total += round.player2_score || 0;
    });
    
    const winnerId = player1Total > player2Total ? 
      battle.players[0].userId : 
      battle.players[1].userId;
    
    await supabase
      .from('battles')
      .update({
        winner_id: winnerId,
        status: 'completed',
        ended_at: new Date().toISOString()
      })
      .eq('id', battleId);
    
    for (let i = 0; i < battle.players.length; i++) {
      const player = battle.players[i];
      const isWinner = player.userId === winnerId;
      
      const { data: userData } = await supabase
        .from('users')
        .select('total_battles, total_wins')
        .eq('wallet_address', player.userId)
        .single();
      
      if (userData) {
        await supabase
          .from('users')
          .update({
            total_battles: (userData.total_battles || 0) + 1,
            total_wins: (userData.total_wins || 0) + (isWinner ? 1 : 0)
          })
          .eq('wallet_address', player.userId);
      } else {
        await supabase
          .from('users')
          .insert({
            wallet_address: player.userId,
            total_battles: 1,
            total_wins: isWinner ? 1 : 0,
            total_roast_earned: 0
          });
      }
    }
    
    battle.players.forEach((player, index) => {
      const isWinner = player.userId === winnerId;
      const yourTotal = index === 0 ? player1Total : player2Total;
      const oppTotal = index === 0 ? player2Total : player1Total;
      
      // Dynamic prize pool based on tier
const tierPrizes = {
  Bronze: 2000,
  Silver: 6000,
  Gold: 8000,
  Diamond: 10000
};
      
      const entryFee = tierPrizes[battle.tier] || 100;
      const totalPool = entryFee * 2;
      const platformFee = totalPool * 0.05;
      const winnerPrize = totalPool - platformFee;
      
      io.to(player.socketId).emit('battle:ended', {
        yourScore: yourTotal,
        opponentScore: oppTotal,
        result: isWinner ? 'win' : 'lose',
        earnings: isWinner ? winnerPrize : -entryFee,
        prizePool: totalPool
      });
    });
    
    console.log(`Battle ${battleId} winner: ${winnerId}`);
    
  } catch (error) {
    console.error('Error ending battle:', error);
  }
  
  activeBattles.delete(battleId);
}  // ✅ CLOSES endBattle

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, () => {
  console.log(`🔥 RoastPush backend running on port ${PORT}`)
  console.log(`WebSocket server ready for connections`); 
});