# Docker Windows EIO Error Fix Guide

## The Problem
EIO (Input/Output) errors occur when Docker on Windows tries to watch files. This is a known limitation of Docker Desktop on Windows.

## Solution 1: Use WSL2 Backend (RECOMMENDED)

1. Open Docker Desktop
2. Go to Settings → General
3. Enable "Use WSL 2 based engine"
4. Click "Apply & Restart"
5. Restart your containers:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Solution 2: Run Development Servers Outside Docker

### For API:
```bash
cd cine_stories
npm install  # or yarn install
npm run start:dev
```

### For Client:
```bash
cd apps/client
npm install
npm run dev
```

Keep only the database and other services in Docker:
```bash
docker-compose up db redis minio rabbitmq
```

## Solution 3: Use Docker with WSL2 Integration

1. Install WSL2 if not already installed
2. Move your project to WSL2 filesystem:
   ```bash
   # In WSL2
   cd ~
   mkdir projects
   # Copy your project here or clone it
   ```
3. Run docker-compose from WSL2

## Current Configuration

The following optimizations have been applied:
- Polling mode enabled for file watchers
- Faster polling intervals (500ms)
- More aggressive ignore patterns
- Removed volume mount consistency flags

If errors persist, use Solution 1 (WSL2) or Solution 2 (run outside Docker).

