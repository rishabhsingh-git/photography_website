# Docker Compose Environment File Selection Guide

This guide explains how Docker Compose picks environment files for development and production.

## How Docker Compose Loads Environment Variables

Docker Compose loads environment variables in this order (later values override earlier ones):

1. **Shell environment variables** (highest priority)
2. **`.env` file** in the same directory as `docker-compose.yml`
3. **`--env-file` flag** (explicitly specified file)
4. **Default values** in `docker-compose.yml` (lowest priority, using `${VAR:-default}` syntax)

## Development Setup

### Method 1: Using Default Values (Simplest)
```bash
# No .env file needed - uses defaults from docker-compose.yml
docker-compose up
```
**How it works:**
- Docker Compose reads `docker-compose.yml`
- Uses default values like `${JWT_SECRET:-dev-secret}`
- If `JWT_SECRET` is not set, it uses `dev-secret`

### Method 2: Using .env.development File (Recommended)
```bash
# Explicitly specify the development env file
docker-compose --env-file .env.development up
```
**How it works:**
- Docker Compose reads `.env.development` first
- Then reads `docker-compose.yml`
- Variables from `.env.development` override defaults in `docker-compose.yml`

### Method 3: Using Standard .env File
```bash
# Rename .env.development to .env
cp .env.development .env
docker-compose up
```
**How it works:**
- Docker Compose automatically looks for `.env` file
- No `--env-file` flag needed
- Variables from `.env` are loaded automatically

## Production Setup

### Using docker-compose.prod.yml with .env.production
```bash
# Use production compose file with production env file
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```
**How it works:**
1. `-f docker-compose.prod.yml` tells Docker Compose to use the production config
2. `--env-file .env.production` loads production environment variables
3. Variables from `.env.production` are used instead of defaults

## Examples

### Example 1: Development with Defaults

**Command:**
```bash
docker-compose up
```

**What happens:**
```yaml
# docker-compose.yml has:
environment:
  JWT_SECRET: ${JWT_SECRET:-dev-secret}  # Uses "dev-secret" if JWT_SECRET not set
  DATABASE_URL: ${DATABASE_URL:-postgres://cine_stories:cine_stories@db:5432/cine_stories}
```

**Result:** Uses all default development values from `docker-compose.yml`

---

### Example 2: Development with .env.development

**Command:**
```bash
docker-compose --env-file .env.development up
```

**What happens:**
1. Reads `.env.development`:
   ```
   JWT_SECRET=dev-secret-key-for-local-development-only
   DATABASE_URL=postgres://cine_stories:cine_stories@db:5432/cine_stories
   ```

2. Reads `docker-compose.yml`:
   ```yaml
   environment:
     JWT_SECRET: ${JWT_SECRET:-dev-secret}  # JWT_SECRET is already set, so uses value from .env.development
   ```

**Result:** Uses values from `.env.development` file

---

### Example 3: Production with .env.production

**Command:**
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

**What happens:**
1. Reads `.env.production`:
   ```
   NODE_ENV=production
   JWT_SECRET=super-strong-production-secret-xyz123
   DATABASE_URL=postgres://prod_user:strong_pass@db:5432/cine_stories
   ```

2. Reads `docker-compose.prod.yml`:
   ```yaml
   environment:
     NODE_ENV: ${NODE_ENV:-production}  # Uses "production" from .env.production
     JWT_SECRET: ${JWT_SECRET}  # Uses "super-strong-production-secret-xyz123" from .env.production
   ```

**Result:** Uses production values from `.env.production` file

---

## Variable Substitution Syntax

In `docker-compose.yml`, we use this syntax:

```yaml
environment:
  # ${VARIABLE_NAME:-default_value}
  # If VARIABLE_NAME is set, use it. Otherwise, use default_value
  
  JWT_SECRET: ${JWT_SECRET:-dev-secret}
  # ↑ If JWT_SECRET env var exists, use it. Otherwise use "dev-secret"
  
  DATABASE_URL: ${DATABASE_URL}
  # ↑ No default - must be set in .env file or shell
```

## Quick Reference

| Scenario | Command | Env File Used |
|----------|---------|---------------|
| Dev (defaults) | `docker-compose up` | None (uses defaults) |
| Dev (custom) | `docker-compose --env-file .env.development up` | `.env.development` |
| Dev (standard) | `docker-compose up` (with `.env` file) | `.env` |
| Production | `docker-compose -f docker-compose.prod.yml --env-file .env.production up -d` | `.env.production` |

## Important Notes

1. **`.env` file is auto-loaded** - If you have a `.env` file, Docker Compose loads it automatically
2. **`--env-file` overrides `.env`** - Explicit `--env-file` takes precedence
3. **Shell variables override all** - Environment variables in your shell have highest priority
4. **Default values are fallback** - `${VAR:-default}` syntax provides fallback values

## Security Reminder

- ✅ `.env.development` and `.env.production` are in `.gitignore`
- ✅ Example files (`*.example`) are safe to commit
- ❌ Never commit actual `.env` files with real secrets
- ⚠️ Always use strong secrets in production

## Troubleshooting

### Variables not loading?
```bash
# Check if file exists
ls -la .env.development

# Verify syntax (no spaces around =)
JWT_SECRET=value  # ✅ Correct
JWT_SECRET = value  # ❌ Wrong (spaces)

# Test loading
docker-compose --env-file .env.development config
```

### Which file is being used?
```bash
# See resolved configuration
docker-compose config

# See with specific env file
docker-compose --env-file .env.production config
```

