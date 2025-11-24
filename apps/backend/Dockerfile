# =========================
# 1. base：安裝 pnpm（只用在 build，不進 production）
# =========================
FROM node:20-alpine AS base
WORKDIR /app

# 建議用固定版本的 pnpm，避免 latest 有一天爆炸
RUN corepack enable && corepack prepare pnpm@10.12.2 --activate


# =========================
# 2. deps：安裝 monorepo 依賴
# =========================
FROM base AS deps
WORKDIR /app

# 根目錄設定檔（給 pnpm / turbo 用）
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./

# 把 apps、packages 帶進來，讓 pnpm 知道所有 workspace
COPY apps ./apps
COPY packages ./packages

# 安裝整個 monorepo 的依賴（這裡會順便裝 turbo、nestjs 等）
RUN pnpm install --frozen-lockfile


# =========================
# 3. build：從 deps 開始，用 turbo build backend
# =========================
FROM deps AS build
WORKDIR /app

# 這裡不用再 COPY，因為 deps 已經有完整專案 & node_modules
RUN pnpm turbo run build --filter backend...


# =========================
# 4. prod：真正要跑在 VPS 上的後端 image
# =========================
FROM node:20-alpine AS prod
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# 拷貝編譯後的 NestJS 程式
COPY --from=build /app/apps/backend/dist ./apps/backend/dist

# 拷貝 root node_modules（共用依賴）
COPY --from=deps /app/node_modules ./node_modules

# 再拷貝 backend 自己的 node_modules（pnpm 的 symlink 結構會在這裡）
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules

# backend 自己的 package.json（有時 Nest / 其他工具會讀）
COPY apps/backend/package.json ./apps/backend/package.json

EXPOSE 3001

CMD ["node", "apps/backend/dist/main.js"]
