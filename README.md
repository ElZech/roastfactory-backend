\# 🔥 RoastFactory Backend



Real-time multiplayer roast battle backend built with Node.js, WebSockets, AI judging, and PostgreSQL.



\## 🚀 Features



\- \*\*Real-time WebSocket Communication\*\* - Socket.io for instant multiplayer battles

\- \*\*AI-Powered Judging\*\* - OpenAI GPT-4o-mini scores roasts on savagery, creativity, delivery, and relevance

\- \*\*PostgreSQL Database\*\* - Supabase for persistent storage of battles, rounds, and user stats

\- \*\*Redis Matchmaking\*\* - Upstash Redis for efficient player queuing by tier and mode

\- \*\*3-Round Battle System\*\* - Complete battle flow with scoring and winner determination

\- \*\*User Stats Tracking\*\* - Win/loss records, total battles, and leaderboards

\- \*\*Solana Integration Ready\*\* - Wallet-based authentication and rewards system



\## 🏗️ Architecture

```

┌─────────────┐      WebSocket      ┌──────────────┐

│   Frontend  │ ◄─────────────────► │  Socket.io   │

│  (Next.js)  │                     │    Server    │

└─────────────┘                     └──────┬───────┘

&nbsp;                                          │

&nbsp;                   ┌──────────────────────┼──────────────────────┐

&nbsp;                   │                      │                      │

&nbsp;             ┌─────▼─────┐         ┌─────▼─────┐         ┌─────▼─────┐

&nbsp;             │ PostgreSQL│         │   Redis   │         │  OpenAI   │

&nbsp;             │ (Supabase)│         │ (Upstash) │         │ GPT-4o-mini│

&nbsp;             └───────────┘         └───────────┘         └───────────┘

```



\## 📊 Database Schema



\### Tables

\- \*\*users\*\* - Wallet addresses, battle stats, earnings

\- \*\*battles\*\* - Match data, players, tier, mode, winner

\- \*\*rounds\*\* - Individual round data, roasts, scores, AI commentary

\- \*\*clips\*\* - Battle highlights (planned feature)



\## 🛠️ Tech Stack



\- \*\*Runtime:\*\* Node.js

\- \*\*WebSocket:\*\* Socket.io

\- \*\*Database:\*\* Supabase (PostgreSQL)

\- \*\*Cache/Queue:\*\* Upstash Redis

\- \*\*AI:\*\* OpenAI GPT-4o-mini

\- \*\*Blockchain:\*\* Solana (wallet integration)



\## 🚀 Getting Started



\### Prerequisites

```bash

Node.js 18+

npm or yarn

```



\### Installation



1\. Clone the repository

```bash

git clone https://github.com/ElZech/roastfactory-backend.git

cd roastfactory-backend

```



2\. Install dependencies

```bash

npm install

```



3\. Configure environment variables

```bash

cp .env.example .env

\# Add your API keys:

\# - SUPABASE\_URL

\# - SUPABASE\_ANON\_KEY

\# - UPSTASH\_REDIS\_REST\_URL

\# - UPSTASH\_REDIS\_REST\_TOKEN

\# - OPENAI\_API\_KEY

```



4\. Run the server

```bash

npm start

```



Server runs on `http://localhost:4000`



\## 📡 WebSocket Events



\### Client → Server

\- `battle:join\_queue` - Join matchmaking

\- `battle:leave\_queue` - Leave matchmaking

\- `battle:submit\_roast` - Submit roast for current round

\- `battle:request\_state` - Request current battle state

\- `battle:emoji\_reaction` - Send emoji reaction



\### Server → Client

\- `battle:matched` - Match found, battle starting

\- `battle:round\_start` - New round beginning

\- `battle:opponent\_roast` - Opponent submitted roast

\- `battle:round\_scored` - Round judged and scored

\- `battle:ended` - Battle complete, winner declared

\- `battle:opponent\_disconnected` - Opponent left



\## 🤖 AI Judging System



The AI judge evaluates roasts based on:



1\. \*\*Savagery\*\* - How brutal and cutting the roast is

2\. \*\*Creativity\*\* - Originality and cleverness

3\. \*\*Delivery\*\* - Word choice, flow, and impact

4\. \*\*Relevance\*\* - Staying on topic with the prompt



Each roast receives a score 0-100 and detailed breakdown.



\## 🎮 Battle Flow



1\. Players join matchmaking queue by tier (Bronze/Silver/Gold/Diamond)

2\. System matches 2 players with same tier and mode

3\. Battle begins with 3 rounds

4\. Each round: Prompt → Players roast (30s) → AI judges

5\. After 3 rounds: Winner determined by total score

6\. Stats updated in database



\## 📈 Performance



\- Sub-second matchmaking

\- Real-time score updates

\- Handles concurrent battles efficiently

\- Redis caching for optimal queue management



\## 🔐 Security



\- Row-level security on Supabase

\- Environment variable protection

\- CORS configuration

\- Rate limiting ready



\## 🚧 Roadmap



\- \[ ] Voice mode recording and transcription

\- \[ ] Clip generation system

\- \[ ] Tournament brackets

\- \[ ] Real $ROAST token rewards

\- \[ ] Mobile app support



\## 📄 License



MIT



\## 👨‍💻 Built By



ElZech - \[GitHub](https://github.com/ElZech)



---



\*\*Ready to get ROAST-ed you bun!\*\* 🤖

