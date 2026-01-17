\# 🚀 RoastFactory Deployment Guide



\## Prerequisites



\- Node.js 18+

\- GitHub account

\- Railway account (backend hosting)

\- Vercel account (frontend hosting)

\- Supabase project (database)

\- Upstash account (Redis)

\- OpenAI API key



---



\## Backend Deployment (Railway)



\### Step 1: Push to GitHub

```bash

git add .

git commit -m "Ready for deployment"

git push origin main

```



\### Step 2: Deploy to Railway



1\. Go to \[railway.app](https://railway.app)

2\. Click "New Project"

3\. Select "Deploy from GitHub repo"

4\. Choose `roastfactory-backend`

5\. Railway auto-detects Node.js



\### Step 3: Add Environment Variables



In Railway dashboard, add:

```

PORT=4000

NODE\_ENV=production

FRONTEND\_URL=https://your-frontend.vercel.app

SUPABASE\_URL=your\_supabase\_url

SUPABASE\_ANON\_KEY=your\_supabase\_key

UPSTASH\_REDIS\_REST\_URL=your\_redis\_url

UPSTASH\_REDIS\_REST\_TOKEN=your\_redis\_token

OPENAI\_API\_KEY=your\_openai\_key

```



\### Step 4: Get Your Backend URL



Railway provides a URL like:

```

https://roastfactory-backend-production.up.railway.app

```



---



\## Frontend Deployment (Vercel)



\### Step 1: Push to GitHub

```bash

cd roastfactory-frontend

git add .

git commit -m "Ready for deployment"

git push origin main

```



\### Step 2: Deploy to Vercel



1\. Go to \[vercel.com](https://vercel.com)

2\. Click "New Project"

3\. Import `roastfactory-frontend` from GitHub

4\. Framework: Next.js (auto-detected)

5\. Click "Deploy"



\### Step 3: Add Environment Variables



In Vercel dashboard, add:

```

NEXT\_PUBLIC\_WS\_URL=wss://your-backend.railway.app

NEXT\_PUBLIC\_SOLANA\_RPC\_URL=https://api.mainnet-beta.solana.com

```



\### Step 4: Redeploy



After adding env vars, redeploy for changes to take effect.



---



\## Database Setup (Supabase)



\### Create Tables



Run this SQL in Supabase SQL Editor:

```sql

-- Users table

CREATE TABLE users (

&nbsp; wallet\_address VARCHAR PRIMARY KEY,

&nbsp; total\_battles INT DEFAULT 0,

&nbsp; total\_wins INT DEFAULT 0,

&nbsp; total\_roast\_earned INT DEFAULT 0,

&nbsp; created\_at TIMESTAMP DEFAULT NOW()

);



-- Battles table

CREATE TABLE battles (

&nbsp; id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp; player1\_id VARCHAR REFERENCES users(wallet\_address),

&nbsp; player2\_id VARCHAR REFERENCES users(wallet\_address),

&nbsp; winner\_id VARCHAR,

&nbsp; tier VARCHAR NOT NULL,

&nbsp; mode VARCHAR NOT NULL,

&nbsp; prize\_pool INT DEFAULT 0,

&nbsp; status VARCHAR DEFAULT 'active',

&nbsp; created\_at TIMESTAMP DEFAULT NOW(),

&nbsp; ended\_at TIMESTAMP

);



-- Rounds table

CREATE TABLE rounds (

&nbsp; id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp; battle\_id UUID REFERENCES battles(id),

&nbsp; round\_number INT NOT NULL,

&nbsp; prompt TEXT,

&nbsp; player1\_roast TEXT,

&nbsp; player2\_roast TEXT,

&nbsp; player1\_score INT,

&nbsp; player2\_score INT,

&nbsp; ai\_commentary TEXT,

&nbsp; created\_at TIMESTAMP DEFAULT NOW()

);



-- Clips table (future feature)

CREATE TABLE clips (

&nbsp; id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),

&nbsp; battle\_id UUID REFERENCES battles(id),

&nbsp; clip\_url TEXT,

&nbsp; views INT DEFAULT 0,

&nbsp; shares INT DEFAULT 0,

&nbsp; created\_at TIMESTAMP DEFAULT NOW()

);

```



\### Enable Row Level Security

```sql

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

ALTER TABLE battles ENABLE ROW LEVEL SECURITY;

ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;

ALTER TABLE clips ENABLE ROW LEVEL SECURITY;



-- Allow all operations for now (tighten in production)

CREATE POLICY "Allow all" ON users FOR ALL USING (true);

CREATE POLICY "Allow all" ON battles FOR ALL USING (true);

CREATE POLICY "Allow all" ON rounds FOR ALL USING (true);

CREATE POLICY "Allow all" ON clips FOR ALL USING (true);

```



---



\## Redis Setup (Upstash)



1\. Go to \[upstash.com](https://upstash.com)

2\. Create new Redis database

3\. Copy REST URL and Token

4\. Add to environment variables



---



\## Post-Deployment Checklist



\- \[ ] Backend health check: `https://your-backend.railway.app/health`

\- \[ ] Frontend loads correctly

\- \[ ] Wallet connection works

\- \[ ] Matchmaking finds opponents

\- \[ ] Battles complete successfully

\- \[ ] Scores save to database

\- \[ ] Winner declared correctly



---



\## Troubleshooting



\### WebSocket Connection Failed

\- Check CORS settings in backend

\- Verify FRONTEND\_URL env var

\- Ensure wss:// (not ws://) in production



\### Database Errors

\- Check Supabase URL and key

\- Verify tables exist

\- Check RLS policies



\### AI Judging Fails

\- Verify OpenAI API key

\- Check API rate limits

\- Review error logs in Railway



---



\## Monitoring



\### Railway Logs

```bash

railway logs

```



\### Vercel Logs

Available in Vercel dashboard under "Deployments"



\### Supabase Logs

Available in Supabase dashboard under "Logs"

