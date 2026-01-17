\# 🏗️ RoastFactory Architecture



\## System Overview

```

┌─────────────────┐        WebSocket        ┌──────────────────┐

│                 │ ◄─────────────────────► │                  │

│  Next.js        │                         │  Node.js         │

│  Frontend       │                         │  Backend         │

│  (Vercel)       │                         │  (Railway)       │

│                 │                         │                  │

└─────────────────┘                         └────────┬─────────┘

&nbsp;                                                    │

&nbsp;                   ┌────────────────────────────────┼────────────────────────────────┐

&nbsp;                   │                                │                                │

&nbsp;             ┌─────▼─────┐                   ┌──────▼──────┐                  ┌──────▼──────┐

&nbsp;             │           │                   │             │                  │             │

&nbsp;             │ Supabase  │                   │  Upstash    │                  │   OpenAI    │

&nbsp;             │ PostgreSQL│                   │   Redis     │                  │  GPT-4o-mini│

&nbsp;             │           │                   │             │                  │             │

&nbsp;             └───────────┘                   └─────────────┘                  └─────────────┘

&nbsp;                  │                                │                                │

&nbsp;             Persistent                      Matchmaking                       AI Judging

&nbsp;             Storage                          Queue                            \& Scoring

```



---



\## Component Breakdown



\### Frontend (Next.js 14)

\- \*\*Framework:\*\* Next.js with App Router

\- \*\*Styling:\*\* Tailwind CSS

\- \*\*State:\*\* React hooks + Socket.io client

\- \*\*Wallet:\*\* Solana Wallet Adapter

\- \*\*Hosting:\*\* Vercel



\### Backend (Node.js)

\- \*\*Framework:\*\* Express.js

\- \*\*WebSocket:\*\* Socket.io

\- \*\*Structure:\*\* Modular service architecture

\- \*\*Hosting:\*\* Railway



\### Database (Supabase)

\- \*\*Type:\*\* PostgreSQL

\- \*\*Tables:\*\* users, battles, rounds, clips

\- \*\*Security:\*\* Row-level security enabled

\- \*\*Auth:\*\* Wallet-based identification



\### Cache (Upstash Redis)

\- \*\*Purpose:\*\* Matchmaking queue management

\- \*\*Type:\*\* Serverless Redis

\- \*\*Latency:\*\* Sub-millisecond



\### AI (OpenAI)

\- \*\*Model:\*\* GPT-4o-mini

\- \*\*Purpose:\*\* Real-time roast judging

\- \*\*Response:\*\* JSON scoring + commentary



---



\## Data Flow



\### Battle Flow

```

1\. Player A joins queue

&nbsp;  └── Frontend → battle:join\_queue → Backend

&nbsp;  └── Backend adds to matchmakingQueue\[]



2\. Player B joins queue (same tier)

&nbsp;  └── Backend matches players

&nbsp;  └── Backend creates battle in DB

&nbsp;  └── Backend → battle:matched → Both clients



3\. Round starts

&nbsp;  └── Backend → battle:round\_start → Both clients

&nbsp;  └── 30-second timer begins



4\. Players submit roasts

&nbsp;  └── Frontend → battle:submit\_roast → Backend

&nbsp;  └── Backend stores in memory + DB



5\. AI judges round

&nbsp;  └── Backend → OpenAI API

&nbsp;  └── Receives JSON scores

&nbsp;  └── Backend → battle:round\_scored → Both clients



6\. Repeat for 3 rounds



7\. Battle ends

&nbsp;  └── Backend calculates winner

&nbsp;  └── Updates DB (battle, user stats)

&nbsp;  └── Backend → battle:ended → Both clients

```



---



\## Database Schema



\### users

| Column | Type | Description |

|--------|------|-------------|

| wallet\_address | VARCHAR | Primary key, Solana wallet |

| total\_battles | INT | Total battles played |

| total\_wins | INT | Total victories |

| total\_roast\_earned | INT | Lifetime earnings |

| created\_at | TIMESTAMP | Account creation |



\### battles

| Column | Type | Description |

|--------|------|-------------|

| id | UUID | Primary key |

| player1\_id | VARCHAR | Player 1 wallet |

| player2\_id | VARCHAR | Player 2 wallet |

| winner\_id | VARCHAR | Winner wallet |

| tier | VARCHAR | Bronze/Silver/Gold/Diamond |

| mode | VARCHAR | text/voice |

| prize\_pool | INT | Total prize pool |

| status | VARCHAR | active/completed |

| created\_at | TIMESTAMP | Battle start |

| ended\_at | TIMESTAMP | Battle end |



\### rounds

| Column | Type | Description |

|--------|------|-------------|

| id | UUID | Primary key |

| battle\_id | UUID | Foreign key to battles |

| round\_number | INT | 1, 2, or 3 |

| prompt | TEXT | Roast prompt |

| player1\_roast | TEXT | Player 1's roast |

| player2\_roast | TEXT | Player 2's roast |

| player1\_score | INT | AI score for P1 |

| player2\_score | INT | AI score for P2 |

| ai\_commentary | TEXT | AI judge commentary |



---



\## Security Considerations



1\. \*\*Environment Variables:\*\* All secrets in .env

2\. \*\*CORS:\*\* Restricted to frontend domain

3\. \*\*Rate Limiting:\*\* Planned for production

4\. \*\*Input Validation:\*\* Sanitize all user inputs

5\. \*\*Database RLS:\*\* Row-level security enabled

