# Privacy Policy — Impact Tracker

**Last updated:** May 2026

Impact Tracker ("we", "us", "our") is a GitHub App that analyzes open source repositories to measure their social impact. This privacy policy explains what data we collect, how we use it, and your rights.

---

## 1. What Data We Collect

### Data we DO collect:
- **Repository metadata:** Name, description, topics, primary language, star count, license (all publicly available via the GitHub API)
- **Contributor locations:** The free-text "location" field from public GitHub user profiles, used solely to compute geographic diversity scores
- **README content:** Used as input for AI-based sector classification; stored temporarily during analysis
- **Community profile data:** Presence of CONTRIBUTING.md, CODE_OF_CONDUCT.md, issue templates (boolean flags only)
- **Webhook event metadata:** Event type, timestamp, and repository association for push, pull_request, issues, and star events
- **GitHub OAuth tokens:** Used to authenticate your session; stored securely and never shared

### Data we DO NOT collect:
- **Private source code content:** We never read, store, or analyze your private code files
- **Private commit messages:** We do not access or store commit message content from private repositories
- **Personal email addresses:** We do not access or store contributor email addresses
- **Financial or billing data:** We do not collect any payment information
- **Browsing behavior:** We do not use tracking cookies, analytics pixels, or fingerprinting

---

## 2. How We Use Your Data

- **Sector classification:** README content and topics are sent to Google Gemini AI to classify the project's social impact sector. This is a one-time analysis per content change.
- **Impact scoring:** Contributor locations are resolved to country codes to compute geographic diversity scores.
- **Badge generation:** Scores are used to generate embeddable SVG badges.
- **Dashboard display:** Aggregated, non-personal data is displayed on public dashboards.

---

## 3. AI and Model Training

**Your data is NEVER used to train AI models.**

We use Google Gemini and OpenRouter APIs for classification only. These are stateless API calls — the providers do not retain your data for training. We do not fine-tune any models on repository data.

---

## 4. Data Retention

- **Active repositories:** Data is retained for as long as the GitHub App is installed on the repository.
- **After uninstallation:** All repository data, contributor data, and impact scores are automatically deleted within **90 days** of app uninstallation.
- **Webhook events:** Raw webhook payloads are retained for 30 days for debugging purposes, then permanently deleted.
- **OAuth tokens:** Session tokens are invalidated immediately upon logout and deleted within 24 hours.

---

## 5. Data Sharing

We do **not** sell, rent, or share your data with third parties, except:

- **Google Gemini API:** README excerpts (first 3,000 characters) and topic tags are sent to Google's API for classification. Google's data processing terms apply.
- **OpenRouter API:** Used as a fallback classification service. Same data as above.
- **Public dashboards:** Aggregated, non-personal data (country counts, not individual contributor identities) is displayed publicly.

---

## 6. Data Security

- All data is transmitted over HTTPS/TLS
- Database connections use encrypted channels
- GitHub App private keys are stored in environment vaults, never in source code
- Installation tokens auto-expire and are refreshed automatically
- Admin endpoints are protected by API key authentication

---

## 7. Your Rights

You have the right to:

- **Access:** Request a copy of all data we hold about your repositories
- **Correction:** Request correction of inaccurate country resolution data
- **Deletion:** Request immediate deletion of all your data by uninstalling the GitHub App and emailing us
- **Objection:** Object to processing by uninstalling the app at any time

---

## 8. How to Request Deletion

1. **Uninstall the GitHub App** from your repository or organization settings
2. **Email us** at privacy@impact-tracker.dev with subject "Data Deletion Request"
3. We will confirm deletion within 5 business days

---

## 9. Changes to This Policy

We may update this privacy policy from time to time. We will notify users of material changes by posting a notice in the GitHub App's README and updating the "Last updated" date above.

---

## 10. Contact

For privacy inquiries, data requests, or concerns:

- **Email:** privacy@impact-tracker.dev
- **GitHub:** Open an issue in the impact-tracker repository

---

This privacy policy is designed to comply with the GitHub Marketplace requirements and applicable data protection regulations.
