# Environment Setup Guide

This guide explains how to set up environment variables for development and production.

## Quick Start

### Development

1. Copy the development example file:
   ```bash
   cp env.development.example .env.development
   ```

2. Update values in `.env.development` as needed (defaults work for local dev)

3. Start development environment:
   ```bash
   docker-compose --env-file .env.development up
   ```

### Production

1. Copy the production example file:
   ```bash
   cp env.production.example .env.production
   ```

2. **IMPORTANT**: Update ALL values in `.env.production` with strong production secrets:
   - Generate strong JWT secrets: `openssl rand -base64 32`
   - Use strong database passwords
   - Update all API keys with production values
   - Update URLs to production domains

3. Start production environment:
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
   ```

## Environment Files

### `.env.development`
- Used for local development
- Contains default/development values
- Safe to use with default values for local testing

### `.env.production`
- Used for production deployments
- **MUST** contain strong, unique secrets
- Never commit this file to git (already in .gitignore)

## Docker Compose Files

### `docker-compose.yml` (Development)
- Default compose file for development
- Includes hot-reload, volume mounts, and development tools
- Uses watch mode for API

### `docker-compose.prod.yml` (Production)
- Optimized for production
- No volume mounts (uses baked images)
- Includes health checks and restart policies
- Runs built/compiled code

## Environment Variables

### Required for Production

All variables marked with `CHANGE_IN_PRODUCTION` must be updated:

- `JWT_SECRET` - Generate: `openssl rand -base64 32`
- `JWT_REFRESH_SECRET` - Generate: `openssl rand -base64 32`
- `SESSION_SECRET` - Generate: `openssl rand -base64 32`
- `POSTGRES_PASSWORD` - Strong database password
- `RAZORPAY_KEY_ID` - Production Razorpay key
- `RAZORPAY_KEY_SECRET` - Production Razorpay secret
- `GOOGLE_CLIENT_ID` - Production Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Production Google OAuth secret
- `S3_ACCESS_KEY` - Production S3/MinIO access key
- `S3_SECRET_KEY` - Production S3/MinIO secret key
- `MINIO_ACCESS_KEY` - Production MinIO access key
- `MINIO_SECRET_KEY` - Production MinIO secret key

### Optional Variables

These have sensible defaults but can be customized:

- `NODE_ENV` - `development` or `production`
- `NODE_OPTIONS` - Node.js memory options
- `FRONTEND_URL` - Frontend application URL
- `S3_ENDPOINT` - S3/MinIO endpoint URL
- `S3_BUCKET` - S3 bucket name
- `CHOKIDAR_USEPOLLING` - File watching (development only)

## Security Notes

1. **Never commit `.env.production`** - It's already in `.gitignore`
2. **Use strong secrets** - Minimum 32 characters for JWT secrets
3. **Rotate secrets regularly** - Especially after security incidents
4. **Use different secrets per environment** - Dev, staging, production
5. **Restrict access** - Only authorized personnel should have production secrets

## Generating Strong Secrets

```bash
# Generate a random secret (32 bytes, base64 encoded)
openssl rand -base64 32

# Generate multiple secrets at once
for i in {1..5}; do echo "Secret $i: $(openssl rand -base64 32)"; done
```

## Troubleshooting

### Environment variables not loading

1. Check file name matches: `.env.development` or `.env.production`
2. Verify `--env-file` flag is used correctly
3. Check for syntax errors (no spaces around `=`)
4. Ensure file is in the same directory as `docker-compose.yml`

### Production build fails

1. Ensure all required variables are set in `.env.production`
2. Check that production secrets are strong enough
3. Verify database connection strings are correct
4. Check S3/MinIO credentials are valid

