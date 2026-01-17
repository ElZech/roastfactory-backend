# 🔥 RoastFactory Backend

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.6-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://supabase.com/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=flat-square&logo=redis&logoColor=white)](https://upstash.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=flat-square&logo=openai&logoColor=white)](https://openai.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

> Real-time multiplayer roast battle backend with AI-powered judging

## 🎯 Overview

RoastFactory is a Web3 multiplayer game where players compete in real-time roast battles. This backend handles matchmaking, battle logic, AI judging, and persistent storage.

## ✨ Features

- **⚡ Real-time WebSocket Communication** - Socket.io for instant multiplayer battles
- **🤖 AI-Powered Judging** - GPT-4o-mini scores roasts on savagery, creativity, delivery, and relevance
- **🗄️ PostgreSQL Database** - Supabase for persistent storage of battles, rounds, and user stats
- **🚀 Redis Matchmaking** - Upstash Redis for efficient player queuing by tier
- **🎮 3-Round Battle System** - Complete battle flow with scoring and winner determination
- **📊 User Stats Tracking** - Win/loss records, total battles, and leaderboards
- **💰 Tiered Prize Pools** - Bronze, Silver, Gold, and Diamond tiers

## 🏗️ Architecture
```
┌─────────────┐      WebSocket      ┌──────────────┐
│   Frontend  │ ◄─────────────────► │  Socket.io   │
│  (Next.js)  │                     │    Server    │
└─────────────┘                     └──────┬───────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
              ┌─────▼─────┐         ┌─────▼─────┐         ┌─────▼─────┐
              │ PostgreSQL│         │   Redis   │         │  OpenAI   │
              │ (Supabase)│         │ (Upstash) │         │ GPT-4o-mini│
              └───────────┘         └───────────┘         └───────────┘
```

## 📁 Project Structure
```
roastfactory-backend/
├── src/
│   ├── config/
│   │   └── constants.js      # Battle tiers, prompts, configuration
│   ├── services/
│   │   ├── aiJudge.js        # OpenAI integration for scoring
│   │   └── database.js       # Supabase database operations
│   └── utils/
│       └── helpers.js        # Utility functions
├── docs/
│   ├── API.md                # WebSocket API documentation
│   ├── ARCHITECTURE.md       # System design documentation
│   └── DEPLOYMENT.md         # Deployment guide
├── server.js                 # Main server entry point
├── package.json
└── .env.example
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account
- Upstash Redis account
- OpenAI API key

### Installation
```bash
# Clone the repository
git clone https://github.com/ElZech/roastfactory-backend.git
cd roastfactory-backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev
```

### Environment Variables
```env
PORT=4000
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
OPENAI_API_KEY=your_openai_key
```

## 💰 Battle Tiers

| Tier | Entry Fee | Winner Prize | Platform Fee |
|------|-----------|--------------|--------------|
| 🥉 Bronze | 2,000 ROAST | 3,800 ROAST | 200 ROAST |
| 🥈 Silver | 6,000 ROAST | 11,400 ROAST | 600 ROAST |
| 🥇 Gold | 8,000 ROAST | 15,200 ROAST | 800 ROAST |
| 💎 Diamond | 10,000 ROAST | 19,000 ROAST | 1,000 ROAST |

## 🤖 AI Judging Criteria

Each roast is scored (0-100) based on:

| Criteria | Description |
|----------|-------------|
| **Savagery** | How brutal and cutting the roast is |
| **Creativity** | Originality and cleverness |
| **Delivery** | Word choice, flow, and impact |
| **Relevance** | Staying on topic with the prompt |

## 📡 WebSocket Events

### Client → Server
| Event | Description |
|-------|-------------|
| `battle:join_queue` | Join matchmaking queue |
| `battle:leave_queue` | Leave matchmaking queue |
| `battle:submit_roast` | Submit roast for current round |
| `battle:emoji_reaction` | Send emoji reaction |

### Server → Client
| Event | Description |
|-------|-------------|
| `battle:matched` | Match found, battle starting |
| `battle:round_start` | New round beginning |
| `battle:round_scored` | Round judged and scored |
| `battle:ended` | Battle complete, winner declared |

> 📚 See [docs/API.md](docs/API.md) for complete API documentation

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express** | HTTP server |
| **Socket.io** | WebSocket communication |
| **Supabase** | PostgreSQL database |
| **Upstash** | Redis for matchmaking |
| **OpenAI** | AI-powered judging |

## 📈 Performance

- ⚡ Sub-second matchmaking
- 🎯 Real-time score updates
- 🔄 Handles concurrent battles efficiently
- 💾 Redis caching for optimal queue management

## 🚧 Roadmap

- [ ] Voice mode with speech-to-text
- [ ] Tournament brackets
- [ ] Spectator mode
- [ ] Battle replays
- [ ] Real $ROAST token integration (Solana)

## 📄 Documentation

- [API Documentation](docs/API.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**ElZech** - [GitHub](https://github.com/ElZech)

---

<p align="center">
  <b>Built with 🔥 and mass shipping energy</b>
</p>

