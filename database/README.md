# Database Migrations

This directory contains SQL migration scripts for the PixelTrivia Supabase database.

## Structure

```
database/
  schema.sql              -- Full schema reference (for new setups)
  seed.sql                -- Sample question data (90+ questions)
  migrations/
    001_initial_schema.sql -- Initial tables, indexes, RLS, functions
```

## Running Migrations

### Option 1: Supabase SQL Editor (manual)

1. Open your Supabase project dashboard
2. Navigate to SQL Editor
3. Run migration files in order (001, 002, ...)
4. Run `seed.sql` to populate sample data

### Option 2: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Push schema
supabase db push

# Reset and seed (development only)
supabase db reset
```

### Option 3: Direct connection

```bash
psql "postgresql://postgres:PASSWORD@HOST:5432/postgres" -f database/migrations/001_initial_schema.sql
psql "postgresql://postgres:PASSWORD@HOST:5432/postgres" -f database/seed.sql
```

## Creating New Migrations

1. Create a new file: `migrations/NNN_description.sql`
2. Use sequential numbering (002, 003, ...)
3. Wrap in `BEGIN; ... COMMIT;` for transactional safety
4. Add `IF NOT EXISTS` / `IF EXISTS` guards for idempotency
5. Update `schema.sql` to reflect the final state

## Seed Data

The `seed.sql` file contains 90+ sample trivia questions across 12 categories:

| Category | Count |
|----------|-------|
| Geography | 10 |
| Science | 12 |
| History | 8 |
| Art | 3 |
| Literature | 3 |
| Mathematics | 6 |
| Animals | 6 |
| Music | 4 |
| Sports | 4 |
| Food | 4 |
| Colors & Shapes | 3 |
| Technology | 5 |

## Environment Variables

Required for database access:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
