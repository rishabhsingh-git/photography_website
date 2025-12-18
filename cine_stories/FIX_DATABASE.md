# Fix Database Issues

## Issues Found:
1. Admin user can't login - passwordHash might not be saved
2. Columns (name, phone, address, oauthId) missing in DBeaver

## Solution Steps:

### Step 1: Run Migration to Ensure All Columns Exist
```bash
cd cine_stories
docker-compose exec api npm run migration:run
```

### Step 2: Seed Admin User Inside Docker (Uses Same Database as API)
```bash
cd cine_stories
docker-compose exec api npm run seed:admin
```

### Step 3: Verify in Database
Check DBeaver - you should now see:
- `name` column
- `phone` column  
- `address` column
- `oauthId` column
- `passwordHash` column (with data)

### Step 4: Test Login
Try logging in with:
- Email: `rishabhsingh4554@gmail.com`
- Password: `Rishabh4554@`

## Why This Works:

- **Migration**: Ensures all columns exist in the database
- **Seed in Docker**: Uses the same database connection as the API (`db:5432`)
- **Verification**: Seed script now verifies passwordHash was saved

## Alternative: If synchronize isn't working

If columns still don't appear, you can manually add them in DBeaver:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauthId text;
```

