\# 🔥 RoastFactory API Documentation



\## Overview



RoastFactory uses WebSocket (Socket.io) for real-time communication between clients and server.



\*\*Base URL:\*\* `ws://localhost:4000` (development) | `wss://your-domain.com` (production)



---



\## WebSocket Events



\### Client → Server Events



\#### `battle:join\_queue`

Join the matchmaking queue.

```javascript

socket.emit('battle:join\_queue', {

&nbsp; userId: 'wallet\_address',

&nbsp; tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond',

&nbsp; mode: 'text' | 'voice'

});

```



\#### `battle:leave\_queue`

Leave the matchmaking queue.

```javascript

socket.emit('battle:leave\_queue');

```



\#### `battle:request\_state`

Request current battle state (used when reconnecting).

```javascript

socket.emit('battle:request\_state', {

&nbsp; battleId: 'uuid'

});

```



\#### `battle:submit\_roast`

Submit a roast for the current round.

```javascript

socket.emit('battle:submit\_roast', {

&nbsp; battleId: 'uuid',

&nbsp; round: 1,

&nbsp; roast: 'Your roast text here',

&nbsp; mode: 'text'

});

```



\#### `battle:emoji\_reaction`

Send an emoji reaction during battle.

```javascript

socket.emit('battle:emoji\_reaction', {

&nbsp; battleId: 'uuid',

&nbsp; emoji: '🔥'

});

```



---



\### Server → Client Events



\#### `battle:matched`

Emitted when a match is found.

```javascript

{

&nbsp; battleId: 'uuid',

&nbsp; opponent: { userId: 'wallet\_address' },

&nbsp; mode: 'text'

}

```



\#### `battle:round\_start`

Emitted when a new round begins.

```javascript

{

&nbsp; battleId: 'uuid',

&nbsp; round: 1,

&nbsp; prompt: 'Roast your opponent\\'s fashion sense',

&nbsp; duration: 30000

}

```



\#### `battle:opponent\_roast`

Emitted when opponent submits their roast.

```javascript

{

&nbsp; round: 1,

&nbsp; roast: 'Opponent\\'s roast text',

&nbsp; mode: 'text'

}

```



\#### `battle:round\_scored`

Emitted when AI finishes scoring a round.

```javascript

{

&nbsp; round: 1,

&nbsp; yourScore: 85,

&nbsp; yourBreakdown: 'Savagery: 8/10, Creativity: 9/10...',

&nbsp; opponentScore: 78,

&nbsp; opponentBreakdown: 'Savagery: 7/10, Creativity: 8/10...',

&nbsp; commentary: 'Player 1 delivered a devastating blow!',

&nbsp; winner: 'you' | 'opponent'

}

```



\#### `battle:ended`

Emitted when battle is complete.

```javascript

{

&nbsp; yourScore: 245,

&nbsp; opponentScore: 220,

&nbsp; result: 'win' | 'lose',

&nbsp; earnings: 3800,  // Positive for winner, negative for loser

&nbsp; prizePool: 4000

}

```



\#### `battle:opponent\_disconnected`

Emitted when opponent disconnects mid-battle.

```javascript

// No payload

```



---



\## REST Endpoints



\### `GET /health`

Health check endpoint.



\*\*Response:\*\*

```json

{

&nbsp; "status": "ok",

&nbsp; "connections": 5,

&nbsp; "activeBattles": 2,

&nbsp; "queuedPlayers": 3

}

```



---



\## Battle Tiers \& Prizes



| Tier | Entry Fee | Total Pool | Winner Prize | Platform Fee |

|------|-----------|------------|--------------|--------------|

| Bronze | 2,000 ROAST | 4,000 | 3,800 | 200 |

| Silver | 6,000 ROAST | 12,000 | 11,400 | 600 |

| Gold | 8,000 ROAST | 16,000 | 15,200 | 800 |

| Diamond | 10,000 ROAST | 20,000 | 19,000 | 1,000 |



---



\## AI Judging Criteria



Each roast is scored on:



1\. \*\*Savagery\*\* (0-10) - How brutal and cutting

2\. \*\*Creativity\*\* (0-10) - Originality and cleverness  

3\. \*\*Delivery\*\* (0-10) - Word choice and flow

4\. \*\*Relevance\*\* (0-10) - Staying on topic



\*\*Total Score:\*\* 0-100 per roast per round



---



\## Error Handling



All errors are logged server-side. Client receives appropriate WebSocket events for handling disconnections and failures gracefully.

