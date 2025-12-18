# Environment Configuration

## Quick Start

### Development
```bash
# 1. Copy development environment template
cp env.development.example .env.development

# 2. (Optional) Edit .env.development with your values

# 3. Start development environment
docker-compose --env-file .env.development up
# OR simply (uses defaults)
docker-compose up
```

### Production
```bash
# 1. Copy production environment template
cp env.production.example .env.production

# 2. REQUIRED: Edit .env.production with STRONG production secrets
# Generate secrets: openssl rand -base64 32

# 3. Start production environment
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## Files Created

✅ **env.development.example** - Development environment template
✅ **env.production.example** - Production environment template  
✅ **docker-compose.prod.yml** - Production Docker Compose configuration
✅ **apps/client/Dockerfile.prod** - Production client Dockerfile
✅ **ENV_SETUP.md** - Detailed setup guide

## Important Notes

- `.env.development` and `.env.production` are in `.gitignore` - never commit them!
- Always use strong secrets in production (minimum 32 characters)
- The example files (`*.example`) are safe to commit
- See `ENV_SETUP.md` for detailed instructions

