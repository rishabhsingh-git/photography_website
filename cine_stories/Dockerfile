# ---------- Builder ----------
  FROM node:20-alpine AS builder

  WORKDIR /usr/src/app
  
  COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
  
  RUN corepack enable && \
      if [ -f yarn.lock ]; then \
        yarn install --frozen-lockfile; \
      elif [ -f package-lock.json ]; then \
        npm ci; \
      elif [ -f pnpm-lock.yaml ]; then \
        pnpm install --frozen-lockfile; \
      else \
        npm install; \
      fi && \
      test -f node_modules/@nestjs/cli/bin/nest.js || (echo "ERROR: @nestjs/cli not installed" && exit 1)
  
  COPY . .
  
  RUN node node_modules/@nestjs/cli/bin/nest.js build
  
  # ---------- Runtime ----------
  FROM node:20-alpine
  
  WORKDIR /usr/src/app
  ENV NODE_ENV=production
  
  COPY --from=builder /usr/src/app/node_modules ./node_modules
  COPY --from=builder /usr/src/app/dist ./dist
  
  CMD ["node", "dist/main.js"]
  