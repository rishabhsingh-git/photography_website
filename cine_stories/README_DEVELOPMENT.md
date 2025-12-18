# Development Setup Guide

## Running the Application

### Option 1: All Services in Docker (Recommended for Linux/Mac)

```bash
docker-compose up -d
```

### Option 2: Hybrid Setup (Recommended for Windows)

Due to Windows Docker file system limitations (EIO errors), run the client and API outside Docker:

#### Step 1: Start Infrastructure Services in Docker
```bash
docker-compose up -d db redis minio rabbitmq
```

#### Step 2: Run API Locally
```bash
cd cine_stories
npm install  # or yarn install
npm run start:dev
```

#### Step 3: Run Client Locally
```bash
cd apps/client
npm install
npm run dev
```

## Environment Variables

### API (.env in cine_stories/)
```env
DATABASE_URL=postgres://cine_stories:cine_stories@localhost:5432/cine_stories
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minio
S3_SECRET_KEY=miniosecret
S3_BUCKET=photo-bucket
S3_PUBLIC_URL=http://localhost:9000
JWT_SECRET=dev-secret
JWT_REFRESH_SECRET=dev-refresh-secret
SESSION_SECRET=dev-session
FRONTEND_URL=http://localhost:5173
```

### Client (.env in apps/client/)
```env
VITE_API_URL=http://localhost:3000/api
```

## Fixing Windows Docker EIO Errors

If you encounter EIO errors on Windows:

1. **Enable WSL2 Backend** (Best Solution):
   - Docker Desktop → Settings → General
   - Enable "Use WSL 2 based engine"
   - Restart Docker Desktop

2. **Run Dev Servers Outside Docker** (Current Setup):
   - Keep only infrastructure (db, redis, etc.) in Docker
   - Run API and Client locally

3. **Use WSL2 Directly**:
   - Install WSL2
   - Move project to WSL2 filesystem
   - Run docker-compose from WSL2

## Services

- **API**: http://localhost:3000
- **Client**: http://localhost:5173
- **Database**: localhost:5432
- **Redis**: localhost:6379
- **MinIO**: http://localhost:9000
- **RabbitMQ Management**: http://localhost:15672

## Database Migrations

```bash
cd cine_stories
npm run migration:run
npm run seed:admin
```

