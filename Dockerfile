FROM node:20-bullseye-slim
#Enables pnpm
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

RUN apt-get update && apt-get install -y netcat-openbsd

WORKDIR /app
#paxi docker-compose.yml file ma fallback hunxa
ENV DATABASE_URL="postgresql://postgres:postgres@db:5432/job_placement?schema=public" 
# For caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./

COPY apps/backend/package.json ./apps/backend/package.json
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY apps/qdrant-service/package.json ./apps/qdrant-service/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/ui/package.json ./packages/ui/package.json

RUN pnpm install --frozen-lockfile

#copying everything
COPY . .

RUN pnpm --filter @repo/db exec prisma generate

EXPOSE 3000 3001

CMD sh -c "until nc -z db 5432; do echo 'Waiting for Postgres...'; sleep 2; done && pnpm --filter @repo/db exec prisma migrate deploy && pnpm --filter @repo/db run seed && pnpm dev"

