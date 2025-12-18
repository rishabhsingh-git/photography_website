# Photo Backend (NestJS)

Production-ready starter for a photography platform. Provides modular services for media upload, search, notifications, payments (Razorpay), and observability with scalable infra defaults.

## Features
- S3-compatible upload + signed retrieval via adapter-driven storage
- Auth strategies: JWT, OAuth2 (Google/Facebook), session-capable guards, OTP hook
- Event-driven architecture with BullMQ/Redis; background workers for media/notifications
- Notification microservice integration (HTTP + queue)
- Payment gateway via Razorpay adapter (easily swappable)
- Postgres + TypeORM with indexing-ready entities; cursor pagination
- Caching (Redis), rate limiting, validation, helmet, CORS
- Logging via Pino, optional Prometheus metrics hook
- Docker Compose for Postgres, Redis, RabbitMQ, MinIO

## Getting Started
```bash
cd photo-backend
yarn install
cp .env.example .env
yarn start:dev
```

## Running locally with Docker
```bash
docker-compose up --build
```

## Environment
See `.env.example` for required vars (S3, JWT, Razorpay, OAuth).

## Testing
```bash
yarn test
yarn test:e2e
```

## Notes
- Heavy tasks run in BullMQ workers; add processors under `src/modules/worker`.
- Notification delivery is queued and relayed to an external microservice (`NOTIFICATION_BASE_URL`).
- Storage/Payment use adapters—implement new providers and swap in module DI.

