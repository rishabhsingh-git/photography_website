# Seeding Admin User

## Problem
The seed script needs to connect to the same database as the API. Since the API runs in Docker and connects to the database container, the seed script should also run in the same environment.

## Solution: Run seed inside Docker container

### Method 1: Using docker-compose exec (Recommended)
```bash
cd cine_stories
docker-compose exec api npm run seed:admin
```

This runs the seed script inside the API container, which has access to the same database as the API.

### Method 2: Using docker-compose run
```bash
cd cine_stories
docker-compose run --rm api npm run seed:admin
```

### Method 3: Direct command
```bash
cd cine_stories
docker-compose exec api sh -c "cd /usr/src/app && ts-node -r tsconfig-paths/register src/seeds/seed-admin.ts"
```

## Why this is needed

- **Host machine**: Connects to `localhost:5432` (if database is exposed)
- **Docker API container**: Connects to `db:5432` (Docker service name)
- These are the same database, but the connection strings differ
- Running the seed inside the container ensures it uses the same connection as the API

## Verify the seed worked

After seeding, check the API logs:
```bash
docker-compose logs api | grep -i "user\|seed\|admin"
```

Or test login in the frontend - it should work now!

