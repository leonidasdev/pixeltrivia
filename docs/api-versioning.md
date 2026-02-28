# API Versioning Strategy

> Last Updated: February 28, 2026

## Current Approach

PixelTrivia currently uses **unversioned API routes** served through Next.js App Router route handlers under `/api/`.

```
/api/quiz/quick      → POST — Quick quiz generation
/api/quiz/custom     → POST — Custom AI-powered quiz
/api/quiz/advanced   → POST — Advanced quiz with file uploads
/api/game/questions  → GET  — Fetch game questions by category
/api/room/create     → POST — Create a multiplayer room
/api/upload          → POST — Upload documents for question generation
```

All endpoints return a consistent JSON envelope:

```json
{
  "success": true | false,
  "data": { ... },
  "error": "string (on failure)",
  "code": "ERROR_CODE (on failure)",
  "meta": { "timestamp": "ISO-8601" }
}
```

## Versioning Plan

When breaking changes become necessary, PixelTrivia will adopt **URL-based versioning**:

```
/api/v1/quiz/quick
/api/v2/quiz/quick
```

### Why URL-based?

| Approach | Pros | Cons |
|----------|------|------|
| **URL path** (`/api/v1/`) | Simple, discoverable, cacheable | URL pollution |
| Header (`Accept-Version: v1`) | Clean URLs | Hidden, harder to test |
| Query param (`?version=1`) | Easy to add | Not RESTful, cache issues |

URL-based versioning aligns with Next.js App Router conventions — each version maps to a route group:

```
app/
  api/
    v1/
      quiz/
        quick/route.ts
    v2/
      quiz/
        quick/route.ts
```

### Migration Guidelines

1. **Additive changes** (new fields, new endpoints) do NOT require a version bump
2. **Breaking changes** require a new version:
   - Removing or renaming response fields
   - Changing request body schema
   - Altering error codes or HTTP status semantics
3. **Deprecation**: Old versions serve a `Sunset` header for 90 days before removal
4. **Default**: Unversioned routes (`/api/quiz/quick`) always point to the latest stable version

### Implementation Checklist (when needed)

```
[ ] Create app/api/v1/ route group mirroring current endpoints
[ ] Add version detection middleware in middleware.ts
[ ] Add Sunset header to deprecated versions
[ ] Update lib/apiFetch.ts to accept optional version parameter
[ ] Update client-side API modules (gameApi, quickQuizApi, etc.)
[ ] Document version differences in docs/api-reference.md
[ ] Add version negotiation tests
```

## Response Envelope Evolution

The current envelope is stable and extensible. Future fields will be added under `meta`:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-02-28T12:00:00Z",
    "version": "v1",
    "requestId": "req_abc123",
    "rateLimit": {
      "remaining": 95,
      "resetAt": "2026-02-28T12:01:00Z"
    }
  }
}
```

## Client Compatibility

The `lib/apiFetch.ts` utility provides a single point of control for all API calls. When versioning is introduced, the base URL can be configured once:

```typescript
// Future: lib/apiFetch.ts
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1'

export async function apiFetch<T>(
  url: string,
  options?: ApiFetchOptions
): Promise<ApiClientResponse<T>> {
  const versionedUrl = url.startsWith('/api/')
    ? url.replace('/api/', `/api/${API_VERSION}/`)
    : url
  // ... existing logic
}
```

## References

- [docs/api-reference.md](api-reference.md) — Full endpoint documentation
- [lib/apiFetch.ts](../lib/apiFetch.ts) — Client-side API fetch utility
- [lib/apiResponse.ts](../lib/apiResponse.ts) — Server-side response builders
