# ---- base image，負責安裝 pnpm
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# ---- deps：安裝 monorepo 依賴，但只安裝 backend 相關的也可以
FROM base AS deps
WORKDIR /app

# 根目錄的設定檔
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./

# backend 自己的 package.json
COPY apps/backend/package.json ./apps/backend/package.json

# 如果 backend 依賴 packages/ 裡的共用程式碼，需要一起 copy
COPY packages ./packages

# 安裝依賴（只裝 backend 相關會更快）
RUN pnpm install --frozen-lockfile --filter backend...

# ---- build backend
FROM base AS build
WORKDIR /app

# 把整個 repo 拷進來，才能用 turbo build
COPY . .

RUN pnpm turbo run build --filter backend...

# ---- production image
FROM node:20-alpine AS prod
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# 從 build stage 拿編譯後的 js
COPY --from=build /app/apps/backend/dist ./apps/backend/dist

# 從 deps stage 拿已安裝好的 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY apps/backend/package.json ./apps/backend/package.json

EXPOSE 3001

CMD ["node", "apps/backend/dist/main.js"]



