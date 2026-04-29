# Mia — AI Assistant Platform

Built by **Ronzoro**. Mia is a production-ready AI assistant covering cybersecurity, geopolitics, human behavior, fraud protection, world news, and business strategy.

## Stack

| Layer    | Technology                                        |
|----------|---------------------------------------------------|
| Frontend | Next.js 14 (App Router), Tailwind CSS             |
| Backend  | Node.js + Express, SSE streaming                  |
| AI       | Anthropic Claude (claude-sonnet-4-6)             |
| Database | Supabase (PostgreSQL)                             |
| Auth     | Google OAuth 2.0 + JWT                            |
| Voice    | Web Speech API (built into the browser)           |

## Quick Start

### 1. Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- An [Anthropic API key](https://console.anthropic.com)
- A [Google OAuth client ID](https://console.cloud.google.com) (Web application type)

### 2. Database

In your Supabase project, open the **SQL Editor** and run:

```
config/supabase-schema.sql
```

### 3. Environment variables

```bash
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

Fill in both files with your real keys. The root `.env.example` lists every variable you need.

### 4. Install & run

```bash
# Backend
cd backend
npm install
npm run dev        # starts on :4000

# Frontend (new terminal)
cd frontend
npm install
npm run dev        # starts on :3000
```

Open [http://localhost:3000](http://localhost:3000) — sign in with Google and start chatting.

## Docker

```bash
cp .env.example .env   # fill in your keys
docker compose up --build
```

Frontend → [http://localhost:3000](http://localhost:3000)  
Backend  → [http://localhost:4000](http://localhost:4000)

## Project structure

```
mia/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express entry point
│   │   ├── middleware/           # JWT auth middleware
│   │   ├── routes/               # auth, chat, user
│   │   ├── services/             # AI, Supabase, Auth
│   │   └── utils/                # logger
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js App Router pages
│   │   ├── components/           # UI components
│   │   ├── hooks/                # useAuth, useChat
│   │   └── styles/               # Tailwind globals
│   └── package.json
├── config/
│   └── supabase-schema.sql       # Database schema
├── .github/workflows/deploy.yml  # CI/CD
├── docker-compose.yml
└── .env.example
```

## Features

- Streaming AI responses with real-time SSE
- Voice input via Web Speech API (Chrome/Edge)
- Persistent conversation history
- Google OAuth authentication
- Collapsible sidebar with conversation management
- Fully responsive dark UI

## Deployment

Set the `GOOGLE_CLIENT_ID` secret in your GitHub repo settings — the CI pipeline will build and validate on every push to `main`. For production hosting, deploy the backend to any Node.js host (Railway, Render, Fly.io) and the frontend to Vercel.
