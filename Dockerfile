# ── Stage 1: 构建前端 ────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# 先只复制 package 文件，利用 Docker 层缓存
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# 复制前端源码并构建，输出到 /app/backend/public
COPY frontend/ ./
RUN npm run build

# ── Stage 2: 生产镜像（仅 backend + 构建产物）────────────────
FROM node:20-alpine AS production

WORKDIR /app/backend

# 先只复制 package 文件
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# 复制后端源码
COPY backend/src/ ./src/

# 从 Stage 1 复制前端构建产物到 backend/public
COPY --from=frontend-builder /app/backend/public ./public

# Cloud Run 注入 PORT 环境变量，默认 8080
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "src/index.js"]
