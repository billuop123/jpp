# Job Placement Platform

An AI-powered job placement platform connecting job seekers with employers, featuring intelligent matching, salary prediction, and interview preparation tools.

## Overview

This is a full-stack monorepo application built with modern web technologies, offering a comprehensive job search and recruitment solution with AI-enhanced features.

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS, NextAuth
- **Backend**: NestJS, Prisma, PostgreSQL
- **ML Service**: FastAPI, XGBoost
- **AI Integration**: OpenAI, Google Gemini, Vapi AI
- **Infrastructure**: Turborepo, Docker

## Key Features

### For Job Seekers
- Profile management with resume upload
- Job search and application tracking
- AI-powered salary prediction
- Resume tailoring for specific jobs (Premium)
- Mock interview practice with AI analysis (Premium)

### For Employers
- Company profile and job posting management
- Application review and candidate search
- Semantic search for finding candidates

### AI Capabilities
- Salary prediction using ML models
- Resume analysis and tailoring
- Voice-based mock interviews
- Intelligent job-candidate matching

## Project Structure

```
jpp/
├── apps/
│   ├── backend/              # NestJS API
│   ├── frontend/             # Next.js application
│   └── qdrant-service/       # Vector database service
├── packages/
│   ├── database/             # Prisma schema & client
│   ├── ui/                   # Shared components
│   └── eslint-config/        # Shared configs
└── fastapi_server/           # ML salary prediction service
```

## Getting Started

### Prerequisites
- Node.js >= 18
- pnpm 9.0.0
- PostgreSQL 16
- Python 3.11+ (for ML service)

### Installation

```bash
# Install dependencies
pnpm install

# Setup database
cd packages/database
pnpm db:generate
pnpm db:migrate

# Start development
cd ../..
pnpm dev
```



## Development

- Frontend runs on `http://localhost:3001`
- Backend runs on `http://localhost:3000`
- ML service runs on `http://localhost:8000`

## Environment Setup

Create `.env` files in:
- `apps/backend/` - API keys, database URL, JWT secret
- `apps/frontend/` - NextAuth config, API URL
- `packages/database/` - Database connection string

See `env-example` files in respective directories for required variables.

## License

UNLICENSED
