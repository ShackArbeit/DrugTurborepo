# ---- base image：負責裝 pnpm
FROM node:20-alpine AS base
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.12.2 --activate

# ---- deps：安裝整個 monorepo 依賴
FROM base AS deps
WORKDIR /app

# 根目錄設定檔
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./

# 把整個 apps、packages 先帶進來，讓 pnpm 可以看到 workspace
COPY apps ./apps
COPY packages ./packages

# 安裝 monorepo 所有依賴（包含 turbo）
RUN pnpm install --frozen-lockfile

# ---- build backend：從 deps 開始（這裡就有 node_modules + turbo）
FROM deps AS build
WORKDIR /app

RUN pnpm turbo run build --filter backend...

# ---- production image：真正會跑在 VPS 上的 image
FROM node:20-alpine AS prod
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# 拷貝編譯後的程式
COPY --from=build /app/apps/backend/dist ./apps/backend/dist

# 從 deps 帶入 node_modules（包含 backend 需要的依賴）
COPY --from=deps /app/node_modules ./node_modules

# backend 自己的 package.json（給 Nest / 其他工具用）
COPY apps/backend/package.json ./apps/backend/package.json

EXPOSE 3001

CMD ["node", "apps/backend/dist/main.js"]



