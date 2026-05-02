# Impact Scoring Model

## Overview

The Impact Tracker computes a **0-100 impact score** across five dimensions. Each dimension evaluates a different aspect of a repository's real-world social contribution.

---

## Scoring Dimensions

| Dimension | Max Points | Weight |
|-----------|-----------|--------|
| Sector Relevance | 30 | 30% |
| Contributor Geography | 25 | 25% |
| First-Timer Onboarding | 20 | 20% |
| Documentation Accessibility | 15 | 15% |
| Community Health | 10 | 10% |

---

## 1. Sector Relevance (0-30 pts)

Classifies the repository into one of seven social impact sectors:

- **Health** — Healthcare, clinical, medical, patient care
- **Education** — Learning, schools, students, EdTech
- **Climate** — Environment, carbon, sustainability, renewable energy
- **Humanitarian** — Aid, refugees, disaster relief, NGOs
- **Civic Tech** — Government, democracy, voting, transparency
- **Accessibility** — Assistive tech, screen readers, WCAG, a11y
- **General Tech** — No clear social-impact alignment

### Calculation

```
Base score = 20 pts (for non-"General Tech" sectors)
SDG bonus  = min(avg_sdg_weight × num_sdg_goals × 2, 10)
Final      = min(base + bonus, 30) × confidence
```

### AI Classification

1. **Primary:** Google Gemini (gemini-2.0-flash)
2. **Fallback:** OpenRouter (Llama 3.1 8B)
3. **Last resort:** Rule-based keyword matching (confidence capped at 0.6)

Confidence threshold: classifications below 0.7 are penalized with a 0.7× multiplier.

---

## 2. Contributor Geography (0-25 pts)

Measures global inclusion by counting unique countries in the contributor base.

```
score = min(unique_countries / 15, 1.0) × 25
```

15+ unique countries = full score.

### Location Resolution (3-tier)

1. **Tier 1:** Direct country name or ISO code match
2. **Tier 2:** City lookup table (500+ major cities)
3. **Tier 3:** Unresolvable → "Unknown" (never guessed)

---

## 3. First-Timer Onboarding (0-20 pts)

Rewards repos that welcome new developers.

```
ratio = first_time_contributors / total_contributors
score = min(ratio / 0.5, 1.0) × 20
```

50%+ first-timers = full score.

---

## 4. Documentation Accessibility (0-15 pts)

| Check | Points |
|-------|--------|
| README.md > 500 characters | 5 |
| CONTRIBUTING.md exists | 5 |
| CODE_OF_CONDUCT.md exists | 5 |

Partial credit for short READMEs: `(length / 500) × 5`

---

## 5. Community Health (0-10 pts)

| Check | Points | Description |
|-------|--------|-------------|
| Profile Health | 4 | GitHub Health Percentage (License, Templates, etc.) |
| Response Time | 2 | Issue response time ≤ 48 hours |
| Merge Rate | 2 | PR merge rate ≥ 50% |
| Recent Activity | 2 | Active in the last 30 days |

Partial credit with linear decay is applied for response time, merge rate, and activity. Profile health is a direct ratio of the GitHub health percentage.

---

## SDG Weight Tuning

Default SDG weights can be adjusted at runtime via the admin API:

```
PATCH /api/admin/sdg-weights
Body: { "3": 1.3, "13": 1.2 }
```

Followed by a bulk re-score:

```
POST /api/admin/rescore-all
```

---

## Change Detection

To avoid unnecessary AI API calls, we compute a SHA-256 hash of `README + topics`. If the hash hasn't changed since the last analysis, we skip re-classification and only update the non-AI dimensions.
