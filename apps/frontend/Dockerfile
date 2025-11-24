# =========================
# 1. base：安裝 pnpm（只用在 build，不進 production）
# =========================
FROM node:20-alpine AS base
WORKDIR /app

# Next.js 在 Alpine 上常會用到 libc6-compat
RUN apk add --no-cache libc6-compat

# 建議固定 pnpm 版本，避免 latest 有一天破版
RUN corepack enable && corepack prepare pnpm@10.12.2 --activate


# =========================
# 2. deps：安裝 monorepo 依賴（包含 turbo、Next 等）
# =========================
FROM base AS deps
WORKDIR /app

# 根目錄設定檔
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./

# 帶入所有 apps / packages，讓 pnpm 知道整個 workspace
COPY apps ./apps
COPY packages ./packages

# 安裝整個 monorepo 的依賴
RUN pnpm install --frozen-lockfile


# =========================
# 3. build：從 deps 開始，用 turbo build frontend
# =========================
FROM deps AS build
WORKDIR /app

# 這裡不用再 COPY，因為 deps 已經有完整專案 + node_modules
RUN pnpm turbo run build --filter frontend...


# =========================
# 4. prod：真正要跑在 VPS 上的前端 image（Next standalone）
# =========================
FROM node:20-alpine AS prod
WORKDIR /app

# Next 官方建議在 Alpine 加這個
RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js 官方建議：用 .next/standalone + .next/static 部署
# .next/standalone 裡面已經包含 Node server + node_modules
COPY --from=build /app/apps/frontend/.next/standalone ./
COPY --from=build /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build /app/apps/frontend/public ./apps/frontend/public

EXPOSE 3000

# standalone 目錄裡會有 apps/frontend/server.js
CMD ["node", "apps/frontend/server.js"]
