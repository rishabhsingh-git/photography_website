# Environment File Examples & How Docker Compose Picks Them

## 📁 File Structure

```
cine_stories/
├── docker-compose.yml          # Development config
├── docker-compose.prod.yml     # Production config
├── .env.development            # Development env (gitignored)
├── .env.production             # Production env (gitignored)
├── env.development.example     # Development template (safe to commit)
└── env.production.example      # Production template (safe to commit)
```

## 🔄 How Docker Compose Loads Environment Variables

### Priority Order (Highest to Lowest):

1. **Shell Environment Variables** (export JWT_SECRET=value)
2. **`--env-file` flag** (docker-compose --env-file .env.development)
3. **`.env` file** (auto-loaded if exists)
4. **Default values in docker-compose.yml** (${VAR:-default})

## 📝 Example 1: Development with Defaults

### Command:
```bash
docker-compose up
```

### What Happens:

**Step 1:** Docker Compose reads `docker-compose.yml`:
```yaml
environment:
  JWT_SECRET: ${JWT_SECRET:-dev-secret}
  # ↑ Syntax: ${VARIABLE_NAME:-default_value}
  # If JWT_SECRET is not set, use "dev-secret"
```

**Step 2:** No `.env` file specified, so it uses defaults:
- `JWT_SECRET` = `dev-secret` (from default)
- `DATABASE_URL` = `postgres://cine_stories:cine_stories@db:5432/cine_stories` (from default)
- `NODE_ENV` = `development` (from default)

**Result:** ✅ Uses all default development values

---

## 📝 Example 2: Development with .env.development

### Command:
```bash
docker-compose --env-file .env.development up
```

### What Happens:

**Step 1:** Docker Compose reads `.env.development`:
```bash
# .env.development
JWT_SECRET=dev-secret-key-for-local-development-only
DATABASE_URL=postgres://cine_stories:cine_stories@db:5432/cine_stories
NODE_ENV=development
```

**Step 2:** Docker Compose reads `docker-compose.yml`:
```yaml
environment:
  JWT_SECRET: ${JWT_SECRET:-dev-secret}
  # ↑ JWT_SECRET is already set from .env.development
  # So it uses: "dev-secret-key-for-local-development-only"
```

**Result:** ✅ Uses values from `.env.development` file

---

## 📝 Example 3: Production with .env.production

### Command:
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### What Happens:

**Step 1:** `-f docker-compose.prod.yml` tells Docker to use production config

**Step 2:** Docker Compose reads `.env.production`:
```bash
# .env.production
NODE_ENV=production
JWT_SECRET=super-strong-production-secret-xyz123abc456
DATABASE_URL=postgres://prod_user:STRONG_PASSWORD@db:5432/cine_stories
FRONTEND_URL=https://yourdomain.com
```

**Step 3:** Docker Compose reads `docker-compose.prod.yml`:
```yaml
environment:
  NODE_ENV: ${NODE_ENV:-production}
  # ↑ Uses "production" from .env.production
  
  JWT_SECRET: ${JWT_SECRET}
  # ↑ Uses "super-strong-production-secret-xyz123abc456" from .env.production
```

**Result:** ✅ Uses production values from `.env.production` file

---

## 🎯 Variable Substitution Syntax Explained

### Syntax: `${VARIABLE_NAME:-default_value}`

```yaml
# Example 1: With default value
JWT_SECRET: ${JWT_SECRET:-dev-secret}
# If JWT_SECRET is set → use that value
# If JWT_SECRET is NOT set → use "dev-secret"

# Example 2: Without default (must be set)
DATABASE_URL: ${DATABASE_URL}
# If DATABASE_URL is set → use that value
# If DATABASE_URL is NOT set → empty string (may cause errors)
```

### Real Examples from docker-compose.yml:

```yaml
environment:
  # Has default - works even without .env file
  NODE_ENV: ${NODE_ENV:-development}
  
  # Has default - safe fallback
  JWT_SECRET: ${JWT_SECRET:-dev-secret}
  
  # Has default - uses localhost for dev
  FRONTEND_URL: ${FRONTEND_URL:-http://localhost:5173}
```

---

## 📊 Comparison Table

| Method | Command | Env File | Uses Defaults? |
|--------|---------|----------|----------------|
| **Dev (defaults)** | `docker-compose up` | None | ✅ Yes |
| **Dev (custom)** | `docker-compose --env-file .env.development up` | `.env.development` | ❌ No (uses file values) |
| **Dev (standard)** | `docker-compose up` (with `.env` file) | `.env` | ❌ No (uses file values) |
| **Production** | `docker-compose -f docker-compose.prod.yml --env-file .env.production up -d` | `.env.production` | ❌ No (uses file values) |

---

## 🔍 Step-by-Step: How Docker Compose Resolves Variables

### Scenario: Running `docker-compose --env-file .env.development up`

**Step 1:** Load `.env.development`
```
JWT_SECRET=my-custom-dev-secret
DATABASE_URL=postgres://user:pass@db:5432/db
```

**Step 2:** Read `docker-compose.yml`
```yaml
environment:
  JWT_SECRET: ${JWT_SECRET:-dev-secret}
  DATABASE_URL: ${DATABASE_URL:-postgres://cine_stories:cine_stories@db:5432/cine_stories}
```

**Step 3:** Resolve variables
- `JWT_SECRET`: Found in `.env.development` → Use `"my-custom-dev-secret"`
- `DATABASE_URL`: Found in `.env.development` → Use `"postgres://user:pass@db:5432/db"`

**Step 4:** Pass to container
```yaml
# Final environment in container:
JWT_SECRET=my-custom-dev-secret
DATABASE_URL=postgres://user:pass@db:5432/db
```

---

## 🛠️ Practical Examples

### Example A: Quick Development Start
```bash
# No setup needed - uses defaults
docker-compose up
```
**Uses:** All default values from `docker-compose.yml`

### Example B: Custom Development Setup
```bash
# 1. Create your custom dev env
cp env.development.example .env.development
# Edit .env.development with your values

# 2. Start with custom env
docker-compose --env-file .env.development up
```
**Uses:** Values from `.env.development` file

### Example C: Production Deployment
```bash
# 1. Create production env (with STRONG secrets!)
cp env.production.example .env.production
# Edit .env.production with production secrets

# 2. Deploy production
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```
**Uses:** Values from `.env.production` file

---

## 🔐 Security Notes

1. **`.env.development` and `.env.production` are gitignored** ✅
   - They won't be committed to git
   - Safe to store local/real secrets

2. **`env.*.example` files are safe to commit** ✅
   - They're templates with placeholder values
   - Team members can copy and customize

3. **Always use strong secrets in production** ⚠️
   - Generate with: `openssl rand -base64 32`
   - Minimum 32 characters for JWT secrets

---

## 🧪 Testing Which Variables Are Used

### See resolved configuration:
```bash
# Development
docker-compose config

# Development with custom env
docker-compose --env-file .env.development config

# Production
docker-compose -f docker-compose.prod.yml --env-file .env.production config
```

This shows the final resolved values that will be used!

---

## 📋 Quick Reference

```bash
# Development (defaults)
docker-compose up

# Development (custom env)
docker-compose --env-file .env.development up

# Production
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Check what will be used
docker-compose --env-file .env.development config | grep JWT_SECRET
```

