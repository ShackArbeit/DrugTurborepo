# 1. base：只負責安裝 pnpm（build 用，不會進到 runtime）
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
# 建議固定 pnpm 版本，不用 latest
RUN corepack enable && corepack prepare pnpm@latest --activate

# 2. deps：安裝 monorepo 依賴（盡量只複製 package.json 加快快取）
FROM base AS deps
WORKDIR /app

# 根目錄設定檔
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# 只先複製 frontend 的 package.json（以及它會用到的 packages 的 package.json）
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY packages ./packages

# 只安裝 frontend 相關依賴（會連帶抓到它需要的 shared packages）
RUN pnpm install --frozen-lockfile --filter frontend...

# 3. build frontend（需要完整原始碼）
FROM base AS build
WORKDIR /app

COPY . .
RUN pnpm turbo run build --filter frontend...

# 4. runtime：真正跑在 VPS 上的 image，只需要 Node + build 後結果
FROM node:20-alpine AS prod
WORKDIR /app
RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Next 官方建議：用 .next/standalone + .next/static 部署
COPY --from=build /app/apps/frontend/.next/standalone ./
COPY --from=build /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build /app/apps/frontend/public ./apps/frontend/public

EXPOSE 3000

# standalone 裡面會有 apps/frontend/server.js
CMD ["node", "apps/frontend/server.js"]
