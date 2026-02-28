# Requirements Definition Document (RDD)
## The Forge — MVP Release
**Product:** The Forge  
**Tagline:** *Where Perfect Prose Begins*  
**Version:** 1.0 MVP  
**Owner:** The Auditor's Forge  
**Last Updated:** 2026-02-25  
**Status:** Pre-Development

---

## 1. Purpose and Scope

### 1.1 Document Purpose
This RDD defines the functional, non-functional, and technical requirements for the Minimum Viable Product (MVP) release of The Forge — an AI-assisted prose writing application targeting high-volume creative and non-fiction authors. This document is intended to guide Claude Code and all development contributors throughout the MVP build cycle.

### 1.2 Product Overview
The Forge is the writing assistance application within the Master Prose Platform ecosystem. It provides authors with real-time prose guidance, structural suggestions, and style feedback without generating content on their behalf. The core brand principle is unwavering: **AI assists, never replaces. The human always writes.**

The Forge MVP targets the base tier (full functionality) for high-volume authors prior to academic module integration (scheduled +18 months post-base launch).

### 1.3 Scope of MVP
The MVP delivers a functional, deployable web application supporting:
- User account creation and project management
- Manuscript workspace with rich text editing
- AI-assisted prose coaching (suggestions, not generation)
- Basic style and clarity feedback engine
- Cloud storage integration (Google Drive primary)
- Integration readiness hooks for The Refinery (manuscript evaluation)

**Out of Scope for MVP:**
- Academic modules (Spark, Elevate, Apex, Collegiate)
- Forge Legal module
- Scrybe social network integration
- Mobile native application
- Offline mode
- Multi-language support

---

## 2. Stakeholders

| Role | Party | Responsibility |
|------|--------|----------------|
| Product Owner | Thomas (CEO, The Auditor's Forge) | Vision, acceptance criteria, prioritization |
| Lead Developer | Claude Code / Dev Team | Implementation |
| Alpha Users | High-volume authors, UGA faculty contacts | Feedback and validation |
| Platform Integrations | The Refinery API team | Hook compatibility |

---

## 3. Business Requirements

### BR-001 — Author-First Value Proposition
The Forge must demonstrably improve prose quality without generating prose. Every AI interaction must result in the human writing better, not in AI writing for them.

### BR-002 — Platform Ecosystem Readiness
The Forge MVP must be architecturally ready to integrate with:
- The Refinery (critique and evaluation engine)
- Guttenberg (self-publishing pipeline)
- Scrybe (social network for writers)
- Master Prose for Education (future academic modules)

### BR-003 — Monetization Foundation
The MVP must support the subscription licensing model with tiered access controls to enable Year 1 revenue generation ($285K target).

### BR-004 — Data Sovereignty
All user manuscripts and project data must be treated as confidential. The platform must not use manuscript content for model training without explicit, affirmative user consent.

---

## 4. User Requirements

### 4.1 User Personas

**Primary — The High-Volume Author**
- Writes 500–2,000+ words per session
- Works on novels, memoirs, long-form non-fiction
- Needs consistency checking, pacing feedback, and style coaching
- Not a programmer; expects consumer-grade UX

**Secondary — The Craft-Focused Writer**
- Works on literary fiction or creative non-fiction
- Highly sensitive to AI "voice bleed"
- Needs granular control over AI involvement level

**Tertiary — The Platform Evaluator (B2B)**
- Publishing house acquisitions editor, SBDC advisor, academic administrator
- Evaluating for institutional licensing
- Needs reporting, user management, and usage analytics

### 4.2 User Stories — Core

**Authentication & Onboarding**
- US-001: As a new user, I can register with email/password or OAuth (Google) so that I can access The Forge.
- US-002: As a returning user, I can log in and return to my projects exactly where I left off.
- US-003: As a new user, I am walked through an onboarding flow that establishes my genre, writing goals, and preferred feedback intensity.

**Project Management**
- US-004: As an author, I can create multiple writing projects, each with its own manuscript, notes, and settings.
- US-005: As an author, I can organize projects with titles, genres, target word counts, and status tags (drafting, revising, complete).
- US-006: As an author, I can archive or delete projects.
- US-007: As an author, I can import an existing manuscript via .docx, .txt, or .rtf upload.

**Manuscript Workspace**
- US-008: As an author, I can write in a clean, distraction-free rich text editor with chapter/scene organization.
- US-009: As an author, I can view my word count, session word count, and progress toward my target word count in real time.
- US-010: As an author, I can use a focus mode that hides all UI chrome except the writing canvas.
- US-011: As an author, I can add inline notes/comments to my manuscript without affecting the main text.
- US-012: As an author, my work is auto-saved at regular intervals and I can view version history.

**AI Prose Coaching**
- US-013: As an author, I can highlight a passage and request a prose coaching analysis that returns observations (not rewrites) about clarity, pacing, syntax variety, or word choice.
- US-014: As an author, I can ask the AI a specific craft question ("Is this sentence too passive?" "Does this paragraph have good rhythm?") and receive a coaching response.
- US-015: As an author, I can set my feedback preferences (e.g., aggressive/light touch, focus areas) and the AI will calibrate its responses accordingly.
- US-016: As an author, I can see AI suggestions inline with options to acknowledge, dismiss, or flag for later review — but never "accept and replace."
- US-017: As an author, I can request a "prose temperature check" on a chapter that returns a summary of observed patterns (sentence length distribution, passive voice frequency, dialogue ratio, etc.) without judgment scores.

**Style Consistency**
- US-018: As an author, I can define a style profile for my project (POV, tense, formality level, recurring stylistic choices) that The Forge uses as a reference.
- US-019: As an author, I receive flagged alerts when my prose appears inconsistent with my defined style profile.

**Cloud Storage**
- US-020: As an author, I can connect my Google Drive account and sync my projects automatically.
- US-021: As an author, I can export my manuscript at any time as .docx, .txt, or .pdf.

**Subscription & Access**
- US-022: As a user, I can view my current subscription tier and usage.
- US-023: As a user, I can upgrade, downgrade, or cancel my subscription from within the app.

---

## 5. Functional Requirements

### 5.1 Authentication & User Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | Email/password registration with email verification | Must Have |
| FR-AUTH-02 | Google OAuth 2.0 login | Must Have |
| FR-AUTH-03 | Password reset via email | Must Have |
| FR-AUTH-04 | JWT-based session management with refresh tokens | Must Have |
| FR-AUTH-05 | User profile: name, bio, genre preferences, writing goals | Should Have |
| FR-AUTH-06 | Account deletion with data export | Must Have |

### 5.2 Project Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PROJ-01 | CRUD operations for writing projects | Must Have |
| FR-PROJ-02 | Project metadata: title, genre, target word count, status | Must Have |
| FR-PROJ-03 | Chapter/scene hierarchy within project | Must Have |
| FR-PROJ-04 | Import .docx, .txt, .rtf manuscripts | Must Have |
| FR-PROJ-05 | Project duplication | Should Have |
| FR-PROJ-06 | Soft delete / archive with restore | Should Have |

### 5.3 Manuscript Editor

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-EDIT-01 | Rich text editor supporting bold, italic, underline, block quotes | Must Have |
| FR-EDIT-02 | Chapter and scene panel with drag-to-reorder | Must Have |
| FR-EDIT-03 | Real-time word count (total + session) | Must Have |
| FR-EDIT-04 | Auto-save every 60 seconds minimum | Must Have |
| FR-EDIT-05 | Manual save with version snapshot | Must Have |
| FR-EDIT-06 | Version history with diff view (last 30 versions) | Should Have |
| FR-EDIT-07 | Focus mode (distraction-free full-screen) | Must Have |
| FR-EDIT-08 | Inline comment/annotation layer | Should Have |
| FR-EDIT-09 | Find and replace | Must Have |
| FR-EDIT-10 | Export as .docx, .txt, .pdf | Must Have |
| FR-EDIT-11 | Dark mode support | Should Have |

### 5.4 AI Prose Coaching Engine

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AI-01 | Passage analysis on selected text (min 50 words, max 2,000 words) | Must Have |
| FR-AI-02 | Analysis dimensions: clarity, pacing, syntax variety, word choice, show vs. tell | Must Have |
| FR-AI-03 | Coaching response format: observations only, no rewrites | Must Have |
| FR-AI-04 | Craft Q&A: author submits a craft question, receives coaching answer | Must Have |
| FR-AI-05 | Prose temperature check: chapter-level statistical summary | Must Have |
| FR-AI-06 | Inline suggestion annotations (acknowledge / dismiss / flag) | Must Have |
| FR-AI-07 | Feedback intensity settings: Light Touch, Standard, Deep Dive | Must Have |
| FR-AI-08 | Focus area settings: up to 3 selectable from a defined taxonomy | Should Have |
| FR-AI-09 | Style profile consistency checking | Should Have |
| FR-AI-10 | Rate limiting: max 50 AI coaching requests per day (free tier), unlimited (paid) | Must Have |
| FR-AI-11 | AI interaction log per project (what was asked, what was observed, what author did) | Should Have |

### 5.5 Style Profile

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-STYLE-01 | Per-project style profile configuration: POV, tense, formality, custom rules | Must Have |
| FR-STYLE-02 | Inconsistency flagging engine comparing active prose to style profile | Should Have |
| FR-STYLE-03 | Style profile import/export as JSON | Could Have |

### 5.6 Cloud Storage

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CLOUD-01 | Google Drive OAuth integration for project sync | Must Have |
| FR-CLOUD-02 | Automatic sync on save | Must Have |
| FR-CLOUD-03 | Manual sync trigger | Must Have |
| FR-CLOUD-04 | Sync status indicator | Must Have |
| FR-CLOUD-05 | Conflict resolution UI (local vs. cloud version) | Should Have |

### 5.7 Subscription & Billing

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SUB-01 | Subscription tier management (Free, Pro, Studio) | Must Have |
| FR-SUB-02 | Stripe integration for payment processing | Must Have |
| FR-SUB-03 | Usage dashboard (AI calls, storage, projects) | Should Have |
| FR-SUB-04 | Upgrade/downgrade/cancel flows | Must Have |
| FR-SUB-05 | Invoice history and receipt download | Should Have |

### 5.8 Refinery Integration Hooks

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-REF-01 | "Send to Refinery" action available from project menu | Must Have |
| FR-REF-02 | Manuscript export in Refinery-compatible format (JSON + text bundle) | Must Have |
| FR-REF-03 | Refinery analysis results viewable in Forge (read-only panel) if Refinery licensed | Should Have |
| FR-REF-04 | API key field in user settings for Refinery token | Must Have |

---

## 6. Non-Functional Requirements

### 6.1 Performance
- NFR-PERF-01: Page load time < 2 seconds on standard broadband
- NFR-PERF-02: Editor keystroke latency < 50ms
- NFR-PERF-03: AI coaching response returned < 8 seconds for passages up to 1,000 words
- NFR-PERF-04: Auto-save operation must not interrupt typing (background async)

### 6.2 Reliability
- NFR-REL-01: 99.5% uptime SLA (MVP target)
- NFR-REL-02: Zero data loss on crash — all in-progress text buffered locally
- NFR-REL-03: Graceful degradation if AI service is unavailable (editor remains fully functional)

### 6.3 Security
- NFR-SEC-01: All data encrypted in transit (TLS 1.3+)
- NFR-SEC-02: All manuscript data encrypted at rest (AES-256)
- NFR-SEC-03: No manuscript content sent to third-party LLM providers without user opt-in confirmation
- NFR-SEC-04: OWASP Top 10 compliance
- NFR-SEC-05: SOC 2 Type I readiness by end of Year 1

### 6.4 Scalability
- NFR-SCALE-01: Architecture must support horizontal scaling to 10,000 concurrent users without re-architecture
- NFR-SCALE-02: Database schema must support multi-tenancy for institutional licensing (B2B)

### 6.5 Accessibility
- NFR-ACC-01: WCAG 2.1 AA compliance
- NFR-ACC-02: Full keyboard navigation in editor
- NFR-ACC-03: Screen reader compatibility for core workflows

### 6.6 Compatibility
- NFR-COMPAT-01: Support Chrome, Firefox, Safari, Edge (last 2 major versions)
- NFR-COMPAT-02: Responsive layout for tablet (iPad) — write-only mode acceptable

---

## 7. Data Requirements

### 7.1 Data Entities (Summary)
- **User**: id, email, name, auth_provider, subscription_tier, preferences, created_at
- **Project**: id, user_id, title, genre, target_word_count, status, style_profile_id, created_at, updated_at
- **Chapter**: id, project_id, title, order_index, created_at
- **Scene**: id, chapter_id, title, order_index, created_at
- **Document**: id, scene_id OR chapter_id, content (rich text JSON), word_count, version, created_at
- **DocumentVersion**: id, document_id, content_snapshot, word_count, created_at
- **StyleProfile**: id, project_id, pov, tense, formality, custom_rules (JSON)
- **AIInteraction**: id, user_id, project_id, document_id, request_type, request_text, response_text, created_at
- **Subscription**: id, user_id, stripe_customer_id, tier, status, current_period_end

### 7.2 Data Retention
- Manuscript content retained for 12 months after account deletion (then purged unless export requested)
- AI interaction logs retained 90 days
- Version history: 30 snapshots per document, rolling

---

## 8. Integration Requirements

| System | Integration Type | Priority |
|--------|-----------------|----------|
| Google OAuth | Auth provider | Must Have |
| Google Drive API | Cloud storage sync | Must Have |
| Stripe | Payment processing | Must Have |
| Anthropic Claude API | AI coaching engine | Must Have |
| The Refinery API | Manuscript evaluation (send/receive) | Should Have |
| Postmark / SendGrid | Transactional email | Must Have |

---

## 9. Compliance and Legal

- GDPR-ready data handling (user consent, right to erasure, data portability)
- CCPA acknowledgment in privacy policy
- Terms of Service must explicitly state: manuscript content is not used for model training without consent
- Accessibility statement (WCAG 2.1 AA)

---

## 10. Acceptance Criteria for MVP Release

The MVP is considered shippable when all Must Have functional requirements pass QA and the following user journeys are verified end-to-end:

1. **New User Registration → First Project → First AI Coaching Request**
2. **Import Manuscript → Chapter Organization → Export as .docx**
3. **Style Profile Setup → Writing Session → Inconsistency Flag Triggered**
4. **Google Drive Connect → Auto-Sync → Manual Export**
5. **Subscription Upgrade (Free → Pro) via Stripe**
6. **Send to Refinery → View Returned Analysis**

---

## 11. Glossary

| Term | Definition |
|------|-----------|
| The Forge | AI writing assistance application; "Where Perfect Prose Begins" |
| The Refinery | Manuscript evaluation application within the Master Prose Platform |
| Prose Coaching | AI-provided observations about writing craft without generating prose |
| Style Profile | Author-defined parameters for consistent prose style per project |
| Prose Temperature Check | Statistical summary of prose patterns at chapter level |
| Master Prose Platform | The full ecosystem: Forge, Refinery, Guttenberg, Scrybe, academic modules |

---

*Document controlled by The Auditor's Forge. For development questions, open an issue in the repository.*
