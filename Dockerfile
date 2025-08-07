# ------------ Build Stage 1

FROM node:23-alpine AS build
WORKDIR /app

RUN corepack enable

# Copy package.json and lockfile for dependency installation
COPY package.json pnpm-lock.yaml .npmrc ./

# Install all dependencies (including devDependencies for build)
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

# Copy the entire project
COPY . ./

# Build the project (client -> static, server -> dist)
RUN pnpm run build

# ------------ Production Stage

FROM node:23-alpine AS production
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built assets and dependencies from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/static ./static
COPY --from=build /app/content ./content
COPY --from=build /app/node_modules ./node_modules

# Environment variables (基础配置)
ENV NODE_ENV=production
ENV SERVER_HTTP_PORT=80
ENV HOST=0.0.0.0

EXPOSE 80

CMD ["node", "dist/server/main.js"]
