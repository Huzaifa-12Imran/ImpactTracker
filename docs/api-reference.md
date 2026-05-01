# API Reference

## Base URL

```
https://api.impact-tracker.dev   (production)
http://localhost:4000             (development)
```

---

## Public Endpoints

### Get Repository Score

```
GET /api/repos/:owner/:repo/score
```

Returns the current impact score for a repository.

**Response:**

```json
{
  "repository": {
    "owner": "facebook",
    "name": "react",
    "fullName": "facebook/react",
    "description": "The library for web and native user interfaces",
    "stars": 225000,
    "language": "JavaScript",
    "status": "COMPLETE",
    "statusMessage": null
  },
  "score": {
    "totalScore": 72.5,
    "dimensions": {
      "sectorRelevance": 18.2,
      "contributorGeography": 22.0,
      "firstTimerOnboarding": 14.5,
      "docsAccessibility": 12.0,
      "communityHealth": 5.8
    },
    "sector": "Education",
    "sectorConfidence": 0.82,
    "sdgGoals": [4, 9],
    "sectorKeywords": ["learning", "ui", "framework"],
    "contributorCountries": { "US": 45, "CN": 12, "DE": 8 },
    "firstTimerCount": 120,
    "totalContributors": 350,
    "lastAnalyzedAt": "2026-05-01T12:00:00.000Z"
  }
}
```

---

### Get Score History

```
GET /api/repos/:owner/:repo/history
```

Returns score history over time (up to 100 entries).

---

### Get Contributors

```
GET /api/repos/:owner/:repo/contributors
```

Returns contributor geography data.

---

### Get Analysis Status

```
GET /api/repos/:owner/:repo/status
```

Returns current analysis status. Poll this every 10 seconds from the dashboard during analysis.

**Status values:** `PENDING`, `IN_PROGRESS`, `COMPLETE`, `FAILED`

---

### Get Badge SVG

```
GET /api/badge/:owner/:repo.svg
GET /api/badge/:owner/:repo.svg?style=flat
GET /api/badge/:owner/:repo.svg?style=sdg
```

Returns a dynamic SVG badge. Cached for 1 hour.

**Styles:** `default`, `flat`, `sdg`

**Embed in README:**

```markdown
[![Impact Score](https://api.impact-tracker.dev/api/badge/owner/repo.svg)](https://impact-tracker.dev/repo/owner/repo)
```

---

## Authenticated Endpoints

### Trigger Analysis

```
POST /api/repos/:owner/:repo/analyze
```

Requires OAuth token. Triggers a manual re-analysis of the repository.

---

## Admin Endpoints

All admin endpoints require the `ADMIN_API_KEY` in the `Authorization` header.

### Update SDG Weights

```
PATCH /api/admin/sdg-weights
Authorization: Bearer <ADMIN_API_KEY>
Content-Type: application/json

{ "3": 1.3, "4": 1.3 }
```

### Get SDG Weights

```
GET /api/admin/sdg-weights
Authorization: Bearer <ADMIN_API_KEY>
```

### Re-score All Repositories

```
POST /api/admin/rescore-all
Authorization: Bearer <ADMIN_API_KEY>
```

---

## Webhooks

The app listens for the following GitHub webhook events:

| Event | Action | Behavior |
|-------|--------|----------|
| `installation` | `created` | Queue analysis for all repos |
| `installation` | `deleted` | Clean up installation record |
| `push` | — | Queue incremental re-analysis (5min debounce) |
| `pull_request` | `closed` (merged) | Update community health metrics |
| `issues` | `labeled` | Track "good first issue" labels |
| `star` | `created` | Update star count |

Webhook endpoint: `POST /api/webhooks/github`

All payloads are verified using HMAC-SHA256 signature validation.
