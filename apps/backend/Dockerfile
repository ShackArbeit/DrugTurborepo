# =========================
# 1. base：安裝 pnpm（只用在 build，不進 production）
# =========================
FROM node:20-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.12.2 --activate

# =========================
# 2. deps：安裝 monorepo 依賴
# =========================
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

# =========================
# 3. build：turbo build backend
# =========================
FROM deps AS build
WORKDIR /app

RUN pnpm turbo run build --filter backend...

# =========================
# 4. prod：真正要跑在 VPS 上的後端 image
# =========================
FROM node:20-alpine AS prod

# ⚠️ 這裡改成 backend 的目錄，讓 process.cwd() = /app/apps/backend
WORKDIR /app/apps/backend

ENV NODE_ENV=production
ENV PORT=3001  

# 拷貝編譯後的 NestJS 程式到 ./dist
COPY --from=build /app/apps/backend/dist ./dist

# 拷貝 root node_modules（留在 /app 下）
COPY --from=deps /app/node_modules /app/node_modules

# 拷貝 backend 專用的 node_modules
COPY --from=deps /app/apps/backend/node_modules ./node_modules

# backend 自己的 package.json（有些工具會讀）
COPY apps/backend/package.json ./package.json

EXPOSE 3001

# 從目前 WORKDIR (/app/apps/backend) 執行 dist/main.js
CMD ["node", "dist/main.js"]
