# Deployment Guide

This guide covers deploying PixelTrivia to production environments.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [CI/CD Pipeline](#cicd-pipeline)
- [Custom Domain](#custom-domain)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Overview

PixelTrivia is designed for deployment on **Vercel**, which provides:
- Zero-configuration Next.js deployment
- Automatic HTTPS and CDN
- Serverless functions for API routes
- Preview deployments for pull requests
- Edge functions support

**Architecture in Production:**
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel CDN    │────▶│  Vercel Edge    │────▶│    Supabase     │
│   (Frontend)    │     │   (API/SSR)     │     │   (Database)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │   OpenRouter    │
                        │   (AI API)      │
                        └─────────────────┘
```

---

## Prerequisites

Before deploying, ensure you have:

1. **GitHub Repository** - Code pushed to GitHub
2. **Vercel Account** - Free tier is sufficient for most use cases
3. **Supabase Project** - Database set up and schema applied
4. **OpenRouter Account** - API key for AI question generation

---

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure Project**
   - Framework Preset: `Next.js` (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `.next` (auto-detected)

3. **Add Environment Variables**
   - Add all required variables (see [Environment Variables](#environment-variables))
   - Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (first time - will prompt for project setup)
vercel

# Deploy to production
vercel --prod
```

### Build Settings

The project uses these default settings:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

---

## Environment Variables

### Required Variables

Add these in Vercel Dashboard under **Settings > Environment Variables**:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ...` |
| `OPENROUTER_API_KEY` | OpenRouter API key | `sk-or-v1-...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `INTERNAL_API_KEY` | Admin endpoint protection | - |
| `NEXT_PUBLIC_SITE_URL` | Production URL | Auto-detected |

### Environment Scopes

Configure variables for appropriate environments:

- **Production** - Live site
- **Preview** - PR preview deployments
- **Development** - Local development (use `.env.local`)

### Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Rotate keys periodically
- Use different keys for production vs preview

---

## Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note the project URL and keys

### 2. Apply Schema

1. Go to SQL Editor in Supabase Dashboard
2. Run the contents of `database/schema.sql`
3. Verify tables are created

### 3. Enable Row Level Security

The schema already includes RLS policies. Verify they're active:

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public';
```

### 4. Connection Pooling

For production, enable connection pooling:

1. Go to **Settings > Database**
2. Enable **Connection Pooling**
3. Use the pooler connection string for high-traffic scenarios

---

## CI/CD Pipeline

### GitHub Actions

The project includes a CI workflow at `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:ci
      - uses: codecov/codecov-action@v4

  build:
    needs: [lint, typecheck, test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

### Vercel Integration

Vercel automatically:
- Deploys on push to `main` branch
- Creates preview deployments for PRs
- Runs build checks before deployment

### Required GitHub Secrets

If using GitHub Actions for deployment:

```
VERCEL_TOKEN      - From Vercel account settings
VERCEL_ORG_ID     - From Vercel project settings
VERCEL_PROJECT_ID - From Vercel project settings
```

---

## Custom Domain

### Adding a Domain

1. Go to Vercel Dashboard > Project > Settings > Domains
2. Add your domain
3. Configure DNS records as instructed

### DNS Configuration

For apex domain (example.com):
```
Type: A
Name: @
Value: 76.76.21.21
```

For subdomain (www.example.com):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### SSL/HTTPS

Vercel automatically provisions SSL certificates via Let's Encrypt. No configuration needed.

---

## Monitoring

### Vercel Analytics

Enable in Vercel Dashboard:

1. Go to **Analytics** tab
2. Enable Web Analytics
3. View real-time metrics

### Error Tracking

Recommended: Add Sentry for error tracking

```bash
npm install @sentry/nextjs
```

Configure in `sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

### Health Checks

Create a health endpoint at `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
```

---

## Performance Optimization

### Caching Headers

Configure in `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=60, stale-while-revalidate' }
        ],
      },
    ];
  },
};
```

### Edge Functions

For latency-sensitive routes, use Edge Runtime:

```typescript
export const runtime = 'edge';

export async function GET() {
  // Fast edge execution
}
```

### Image Optimization

Use Next.js Image component for automatic optimization:

```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  width={200}
  height={200}
  alt="Logo"
  priority
/>
```

---

## Troubleshooting

### Build Failures

**TypeScript Errors:**
```bash
# Check types locally
npm run typecheck
```

**Missing Environment Variables:**
- Verify all required variables are set in Vercel
- Check variable names match exactly (case-sensitive)

**Dependency Issues:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Runtime Errors

**Supabase Connection:**
- Verify project is active (not paused)
- Check RLS policies aren't blocking requests
- Verify connection string is correct

**OpenRouter API:**
- Check API key is valid
- Verify account has credits
- Check rate limits

**500 Errors:**
- Check Vercel function logs
- Look for unhandled promise rejections
- Verify environment variables are set

### Viewing Logs

In Vercel Dashboard:
1. Go to **Deployments**
2. Select deployment
3. Click **Functions** tab
4. View real-time logs

---

## Rollback

### Quick Rollback

In Vercel Dashboard:
1. Go to **Deployments**
2. Find last working deployment
3. Click **...** > **Promote to Production**

### Via CLI

```bash
# List deployments
vercel ls

# Promote specific deployment
vercel promote <deployment-url>
```

---

## Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database schema applied
- [ ] RLS policies verified
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Error tracking configured
- [ ] Analytics enabled
- [ ] Health check endpoint working
- [ ] Build passes locally
- [ ] Tests pass
- [ ] Rate limits appropriate for expected traffic

---

*Last updated: February 27, 2026*
