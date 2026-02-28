# Functional Design Document (FDD)
## The Forge — MVP Release
**Product:** The Forge  
**Tagline:** *Where Perfect Prose Begins*  
**Version:** 1.0 MVP  
**Owner:** The Auditor's Forge  
**Last Updated:** 2026-02-25  
**Status:** Pre-Development  
**Companion Document:** `FORGE_RDD.md`

---

## 1. Document Purpose

This FDD translates the requirements defined in the RDD into specific functional designs: application architecture, module specifications, data models, API contracts, UI/UX flows, and AI system behavior. This document is the primary reference for Claude Code and all developers implementing the MVP.

---

## 2. Technology Stack

### 2.1 Recommended Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR/SSG flexibility, strong ecosystem, Vercel deploy path |
| UI Components | shadcn/ui + Tailwind CSS | Rapid, accessible component library |
| Rich Text Editor | TipTap (ProseMirror-based) | Extensible, headless, markdown-friendly |
| Backend API | Next.js API Routes + tRPC | Type-safe end-to-end, colocated with frontend |
| Database | PostgreSQL (via Supabase or Railway) | Relational integrity for document hierarchy |
| ORM | Prisma | Type-safe schema, migrations, Postgres support |
| Auth | NextAuth.js v5 | Google OAuth + credentials, JWT sessions |
| AI Engine | Anthropic Claude API (claude-sonnet-4-6) | Core coaching intelligence |
| Cloud Storage | Google Drive API v3 | User-authorized sync |
| Payments | Stripe (Subscriptions + Billing Portal) | Industry standard, webhook-ready |
| File Storage | Supabase Storage or AWS S3 | Manuscript imports, PDF exports |
| Email | Postmark | Transactional reliability |
| Deployment | Vercel (frontend) + Railway or Supabase (DB) | Fast iteration, reasonable cost at MVP scale |
| Monitoring | Sentry (errors) + Vercel Analytics | Error tracking, basic analytics |

### 2.2 Repository Structure

```
the-forge/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx        # Project list
│   │   │   │   └── [projectId]/
│   │   │   │       ├── page.tsx    # Project overview
│   │   │   │       └── write/
│   │   │   │           └── [documentId]/
│   │   │   │               └── page.tsx  # Manuscript editor
│   │   │   ├── settings/
│   │   │   └── billing/
│   │   └── api/
│   │       ├── trpc/
│   │       ├── auth/
│   │       ├── webhooks/
│   │       │   └── stripe/
│   │       └── integrations/
│   │           ├── google-drive/
│   │           └── refinery/
│   ├── components/
│   │   ├── editor/
│   │   │   ├── ForgeEditor.tsx
│   │   │   ├── EditorToolbar.tsx
│   │   │   ├── ChapterPanel.tsx
│   │   │   ├── WordCountBar.tsx
│   │   │   ├── FocusMode.tsx
│   │   │   └── VersionHistory.tsx
│   │   ├── coaching/
│   │   │   ├── CoachingPanel.tsx
│   │   │   ├── InlineSuggestion.tsx
│   │   │   ├── TemperatureCheck.tsx
│   │   │   └── CraftQA.tsx
│   │   ├── projects/
│   │   ├── settings/
│   │   ├── billing/
│   │   └── ui/                     # shadcn/ui components
│   ├── server/
│   │   ├── routers/
│   │   │   ├── auth.ts
│   │   │   ├── projects.ts
│   │   │   ├── documents.ts
│   │   │   ├── coaching.ts
│   │   │   ├── style.ts
│   │   │   ├── sync.ts
│   │   │   └── billing.ts
│   │   ├── services/
│   │   │   ├── aiCoachingService.ts
│   │   │   ├── googleDriveService.ts
│   │   │   ├── stripeService.ts
│   │   │   ├── exportService.ts
│   │   │   └── refineryService.ts
│   │   └── db.ts                   # Prisma client
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── constants.ts
│   │   ├── utils.ts
│   │   └── validations.ts
│   └── types/
│       └── index.ts
├── public/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── FORGE_RDD.md
├── FORGE_FDD.md
└── README.md
```

---

## 3. Data Model

### 3.1 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── AUTH ───────────────────────────────────────────────

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  emailVerified     DateTime?
  name              String?
  image             String?
  passwordHash      String?
  authProvider      String    @default("credentials")
  
  // Preferences
  genre             String?
  writingGoals      String?
  feedbackIntensity FeedbackIntensity @default(STANDARD)
  
  // Relations
  accounts          Account[]
  sessions          Session[]
  projects          Project[]
  aiInteractions    AIInteraction[]
  subscription      Subscription?
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ─── PROJECTS ───────────────────────────────────────────

model Project {
  id              String        @id @default(cuid())
  userId          String
  title           String
  genre           String?
  targetWordCount Int?
  status          ProjectStatus @default(DRAFTING)
  isArchived      Boolean       @default(false)
  
  styleProfile    StyleProfile?
  chapters        Chapter[]
  aiInteractions  AIInteraction[]
  googleDriveSync GoogleDriveSync?
  
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model Chapter {
  id          String   @id @default(cuid())
  projectId   String
  title       String
  orderIndex  Int
  
  scenes      Scene[]
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Scene {
  id          String   @id @default(cuid())
  chapterId   String
  title       String
  orderIndex  Int
  
  document    Document?
  chapter     Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Document {
  id          String            @id @default(cuid())
  sceneId     String            @unique
  content     Json              // TipTap JSON
  wordCount   Int               @default(0)
  
  versions    DocumentVersion[]
  annotations Annotation[]
  scene       Scene             @relation(fields: [sceneId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}

model DocumentVersion {
  id          String   @id @default(cuid())
  documentId  String
  content     Json
  wordCount   Int
  snapshot    String?  // label e.g. "Manual save"
  
  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
}

model Annotation {
  id          String   @id @default(cuid())
  documentId  String
  fromPos     Int
  toPos       Int
  note        String
  resolved    Boolean  @default(false)
  
  document    Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
}

// ─── STYLE PROFILE ──────────────────────────────────────

model StyleProfile {
  id           String   @id @default(cuid())
  projectId    String   @unique
  pov          POV      @default(THIRD_LIMITED)
  tense        Tense    @default(PAST)
  formality    Formality @default(LITERARY)
  customRules  Json?    // Array of {rule: string, example: string}
  
  project      Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  updatedAt    DateTime @updatedAt
}

// ─── AI INTERACTIONS ────────────────────────────────────

model AIInteraction {
  id            String              @id @default(cuid())
  userId        String
  projectId     String?
  documentId    String?
  requestType   AIRequestType
  requestText   String              @db.Text
  responseText  String              @db.Text
  feedbackIntensity FeedbackIntensity
  dismissed     Boolean             @default(false)
  acknowledged  Boolean             @default(false)
  flagged       Boolean             @default(false)
  
  user          User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  project       Project?            @relation(fields: [projectId], references: [id])
  
  createdAt     DateTime            @default(now())
}

// ─── SUBSCRIPTIONS ──────────────────────────────────────

model Subscription {
  id                   String             @id @default(cuid())
  userId               String             @unique
  stripeCustomerId     String             @unique
  stripeSubscriptionId String?            @unique
  tier                 SubscriptionTier   @default(FREE)
  status               SubscriptionStatus @default(ACTIVE)
  currentPeriodEnd     DateTime?
  
  user                 User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  updatedAt            DateTime           @updatedAt
}

// ─── INTEGRATIONS ───────────────────────────────────────

model GoogleDriveSync {
  id              String   @id @default(cuid())
  projectId       String   @unique
  driveFileId     String
  driveFolderId   String?
  lastSyncedAt    DateTime?
  syncStatus      SyncStatus @default(IDLE)
  
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

// ─── ENUMS ──────────────────────────────────────────────

enum ProjectStatus {
  DRAFTING
  REVISING
  COMPLETE
  ON_HOLD
}

enum POV {
  FIRST
  SECOND
  THIRD_LIMITED
  THIRD_OMNISCIENT
  MULTIPLE
}

enum Tense {
  PAST
  PRESENT
  MIXED
}

enum Formality {
  LITERARY
  COMMERCIAL
  GENRE
  EXPERIMENTAL
}

enum FeedbackIntensity {
  LIGHT_TOUCH
  STANDARD
  DEEP_DIVE
}

enum AIRequestType {
  PASSAGE_ANALYSIS
  CRAFT_QA
  TEMPERATURE_CHECK
  STYLE_CHECK
}

enum SubscriptionTier {
  FREE
  PRO
  STUDIO
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  TRIALING
}

enum SyncStatus {
  IDLE
  SYNCING
  ERROR
}
```

---

## 4. API Design (tRPC Routers)

### 4.1 Projects Router

```typescript
// Procedures
projects.list()           → Project[]
projects.get(id)          → Project (with chapters/scenes)
projects.create(input)    → Project
projects.update(id, input) → Project
projects.archive(id)      → Project
projects.delete(id)       → void
projects.import(file)     → Project  // .docx/.txt/.rtf
projects.export(id, format) → FileBlob
```

### 4.2 Documents Router

```typescript
documents.get(sceneId)                  → Document
documents.save(sceneId, content)        → Document
documents.getVersions(documentId)       → DocumentVersion[]
documents.restoreVersion(versionId)     → Document
documents.getWordCount(documentId)      → { total: number, session: number }
```

### 4.3 Coaching Router

```typescript
coaching.analyzePassage(input: {
  documentId: string,
  selectedText: string,        // 50–2000 words
  intensity: FeedbackIntensity,
  focusAreas: FocusArea[]
}) → CoachingResponse

coaching.craftQA(input: {
  projectId: string,
  question: string,
  context?: string             // optional surrounding passage
}) → CraftQAResponse

coaching.temperatureCheck(input: {
  chapterId: string
}) → TemperatureCheckReport

coaching.getInteractions(projectId) → AIInteraction[]
coaching.dismissInteraction(id)     → void
coaching.acknowledgeInteraction(id) → void
coaching.flagInteraction(id)        → void
```

### 4.4 Style Router

```typescript
style.getProfile(projectId)        → StyleProfile
style.upsertProfile(projectId, input) → StyleProfile
style.checkConsistency(input: {
  documentId: string,
  passage: string
}) → StyleConsistencyReport
```

### 4.5 Sync Router

```typescript
sync.connectGoogleDrive(projectId, driveAuthCode) → GoogleDriveSync
sync.syncNow(projectId)            → SyncResult
sync.getSyncStatus(projectId)      → GoogleDriveSync
sync.disconnect(projectId)         → void
```

### 4.6 Billing Router

```typescript
billing.getSubscription()          → Subscription
billing.createCheckoutSession(tier) → { url: string }
billing.createPortalSession()      → { url: string }
billing.getUsage()                 → UsageSummary
```

---

## 5. AI Coaching System Design

### 5.1 Core Principle Enforcement

The system prompt injected into every Anthropic API call for coaching must include the following constraint block. **This is non-negotiable and must not be omitted or overridden:**

```
You are a prose coach for The Forge writing platform. Your role is to observe and comment on writing craft — you do NOT write prose, rewrite sentences, or generate story content under any circumstances.

Your responses must:
- Describe what you observe in the text (patterns, tendencies, effects)
- Ask questions that help the author think about their choices
- Reference specific craft principles (sentence rhythm, show vs. tell, pacing, word economy)
- Never provide a rewritten version of any sentence or passage
- Never complete an unfinished passage or fill in missing content
- Treat the author as the sole author of all prose

If the author explicitly asks you to rewrite something, respond: "The Forge is designed to help you write better, not to write for you. Here's what I observe about this passage: [observation]"
```

### 5.2 Passage Analysis — Prompt Architecture

```typescript
// src/server/services/aiCoachingService.ts

interface PassageAnalysisInput {
  selectedText: string;
  projectContext: {
    genre: string;
    pov: string;
    tense: string;
    formality: string;
  };
  intensity: FeedbackIntensity;
  focusAreas: FocusArea[];
}

function buildPassageAnalysisPrompt(input: PassageAnalysisInput): string {
  const intensityInstructions = {
    LIGHT_TOUCH: "Identify 1-2 the most notable observations. Keep feedback brief and affirming.",
    STANDARD: "Identify 2-4 observations across the requested focus areas. Balance affirmation with constructive craft notes.",
    DEEP_DIVE: "Provide thorough analysis across all requested focus areas. Be specific about patterns and their effects on the reader experience."
  };

  return `
PASSAGE FOR ANALYSIS:
"""
${input.selectedText}
"""

PROJECT CONTEXT:
- Genre: ${input.projectContext.genre}
- POV: ${input.projectContext.pov}
- Tense: ${input.projectContext.tense}
- Style register: ${input.projectContext.formality}

FOCUS AREAS: ${input.focusAreas.join(', ') || 'General prose craft'}
INTENSITY: ${intensityInstructions[input.intensity]}

Provide your coaching observations. Structure your response as:
1. What you observe (2-3 sentences per focus area)
2. A craft question for the author to consider
3. One specific element this passage does well

Remember: observe only, never rewrite.
  `.trim();
}
```

### 5.3 Temperature Check — Metrics

The temperature check performs statistical analysis before invoking the AI for interpretation:

```typescript
interface TemperatureMetrics {
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  sentenceLengthVariance: number;    // standard deviation
  shortSentenceRatio: number;        // sentences < 8 words
  longSentenceRatio: number;         // sentences > 30 words
  passiveVoiceEstimate: number;      // regex-based percentage
  dialogueRatio: number;             // % of text in quotes
  paragraphCount: number;
  avgWordsPerParagraph: number;
  uniqueWordRatio: number;           // lexical diversity
}
```

The AI receives only the metrics (not the raw text) for a temperature check, then provides craft context around the patterns.

### 5.4 Rate Limiting

```typescript
// Middleware applied to all coaching router procedures
async function coachingRateLimit(userId: string, tier: SubscriptionTier) {
  const DAILY_LIMITS = {
    FREE: 50,
    PRO: Infinity,
    STUDIO: Infinity
  };
  
  const todayCount = await getAIInteractionCount(userId, 'today');
  if (todayCount >= DAILY_LIMITS[tier]) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Daily coaching limit reached. Upgrade to Pro for unlimited coaching.'
    });
  }
}
```

---

## 6. Editor Architecture

### 6.1 TipTap Configuration

The editor is built on TipTap with the following extensions:

```typescript
// src/components/editor/ForgeEditor.tsx

const editor = useEditor({
  extensions: [
    StarterKit,
    Highlight.configure({ multicolor: false }),
    Underline,
    Blockquote,
    CharacterCount,                    // word count
    ForgeCoachingExtension,            // custom: inline AI suggestion marks
    ForgeAnnotationExtension,          // custom: inline author notes
    Placeholder.configure({
      placeholder: 'Begin writing here...',
    }),
    // Custom mark for AI suggestion highlights
  ],
  content: initialContent,
  onUpdate: ({ editor }) => {
    debouncedAutoSave(editor.getJSON());
    updateWordCount(editor.storage.characterCount.words());
  },
});
```

### 6.2 Auto-Save Logic

```typescript
// Debounced auto-save: triggers 3s after last keystroke, max every 60s
const debouncedAutoSave = useDebouncedCallback(
  async (content: JSONContent) => {
    await trpc.documents.save.mutate({ sceneId, content });
    setLastSaved(new Date());
  },
  3000,
  { maxWait: 60000 }
);
```

### 6.3 Focus Mode
Focus mode applies a full-screen overlay that:
- Hides all panels, sidebars, toolbars
- Centers the editor at 65ch max-width
- Applies a gentle parchment or dark background (user preference)
- Keyboard shortcut: `Cmd/Ctrl + Shift + F`
- Exit: `Escape` or same shortcut

---

## 7. UI/UX Flows

### 7.1 Application Shell Layout

```
┌─────────────────────────────────────────────────────────┐
│  TOPNAV: The Forge logo | Project title | Save status | User menu │
├──────────┬──────────────────────────────┬───────────────┤
│ CHAPTER  │                              │  COACHING     │
│ PANEL    │    MANUSCRIPT EDITOR         │  PANEL        │
│          │                              │               │
│ ▾ Ch 1   │  [Rich text canvas]          │ [Analysis     │
│   Sc 1   │                              │  results,     │
│   Sc 2   │                              │  suggestions, │
│ ▾ Ch 2   │                              │  Q&A]         │
│   Sc 1   │                              │               │
│          │                              │               │
├──────────┴──────────────────────────────┴───────────────┤
│  STATUSBAR: Words: 4,203 | Session: 847 | Target: 80,000 | Synced ✓ │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Coaching Panel States

**Idle State:** Displays last 3 interactions as collapsed cards + a prompt: "Highlight a passage to request coaching."

**Active Analysis:** Shows a loading skeleton while the API call processes (<8s target).

**Results State:** Displays coaching observation cards with three action buttons per card: `Acknowledge ✓` | `Dismiss ✗` | `Flag for Later 🔖`

**Craft Q&A:** Free-form chat-style interface within the panel. Question box at bottom, responses appear as coaching cards above.

### 7.3 Onboarding Flow (New User)

```
Step 1: Welcome + Brand Promise
  "The Forge helps you write better. It never writes for you."
  
Step 2: Genre Selection (single select)
  Literary Fiction / Genre Fiction / Memoir / Creative Non-Fiction / Other

Step 3: Writing Goals (multi-select)
  Improve sentence variety / Strengthen pacing / Reduce passive voice / 
  Enhance dialogue / Better show-don't-tell / General craft improvement

Step 4: Feedback Preference
  Light Touch → Standard → Deep Dive (slider with description)

Step 5: Create First Project (or skip to dashboard)
```

### 7.4 Project Dashboard

Grid of project cards showing: title, genre, word count / target, status badge, last updated, sync status. Quick actions: Open, Archive, Export, Send to Refinery.

---

## 8. Google Drive Integration

### 8.1 Authorization Flow

1. User clicks "Connect Google Drive" in project settings
2. App initiates OAuth 2.0 flow with scopes: `drive.file` (create/modify files the app created)
3. On success, store `access_token` and `refresh_token` in `GoogleDriveSync` record
4. App creates a `The Forge` folder in Drive root if not exists
5. On each save, serialize project as JSON + plain text `.txt` to Drive folder

### 8.2 Sync Strategy

- **Trigger:** On every successful auto-save
- **Mechanism:** Compare local `updatedAt` timestamp with Drive file `modifiedTime`
- **Conflict resolution:** If Drive version is newer than local (user edited in Drive directly), surface conflict modal with side-by-side diff
- **Format written to Drive:** `{projectTitle}_forge.json` (full TipTap JSON) + `{projectTitle}.txt` (plain text for human readability)

---

## 9. Export Service

### 9.1 Supported Formats

| Format | Library | Notes |
|--------|---------|-------|
| .docx | `docx` npm package | Preserves basic formatting (bold, italic, block quotes) |
| .txt | Native | Plain text, chapter breaks as `---` |
| .pdf | `@react-pdf/renderer` | Formatted with basic typography |

### 9.2 Export Process

1. Aggregate all scenes in chapter order
2. Render TipTap JSON → target format
3. Trigger browser download
4. Log export event (format, word count, timestamp)

---

## 10. Refinery Integration Design

### 10.1 Send to Refinery

```typescript
// Action triggered from Project menu: "Send to Refinery for Evaluation"

interface RefinerySubmissionPayload {
  projectId: string;
  title: string;
  genre: string;
  wordCount: number;
  manuscriptText: string;   // plain text, full manuscript
  styleProfile: StyleProfile;
  userRefineryApiKey: string;  // from user settings
}

// POST to: https://api.refinery.masterproseplatform.com/v1/evaluate
// Response: { jobId: string, estimatedCompletion: string }
```

### 10.2 Results Display

When Refinery analysis is complete (webhook callback), a "Refinery Report" tab appears in the Coaching Panel showing the evaluation results in read-only format. This tab only renders if the user has a valid Refinery API key in settings.

---

## 11. Subscription Tiers

| Feature | Free | Pro ($19/mo) | Studio ($49/mo) |
|---------|------|--------------|-----------------|
| Projects | 2 | Unlimited | Unlimited |
| AI coaching requests/day | 50 | Unlimited | Unlimited |
| Version history | 10 snapshots | 30 snapshots | 90 snapshots |
| Google Drive sync | ✓ | ✓ | ✓ |
| Refinery integration | — | ✓ | ✓ |
| Export formats | .txt only | .docx, .txt, .pdf | All formats |
| Analytics dashboard | — | — | ✓ |
| Priority support | — | — | ✓ |

---

## 12. Environment Configuration

```bash
# .env.example

# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (Auth)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Google Drive (Storage Sync)
GOOGLE_DRIVE_CLIENT_ID="..."
GOOGLE_DRIVE_CLIENT_SECRET="..."

# Anthropic
ANTHROPIC_API_KEY="..."
ANTHROPIC_MODEL="claude-sonnet-4-6"
ANTHROPIC_MAX_TOKENS=2048

# Stripe
STRIPE_SECRET_KEY="..."
STRIPE_PUBLISHABLE_KEY="..."
STRIPE_WEBHOOK_SECRET="..."
STRIPE_PRICE_ID_PRO="..."
STRIPE_PRICE_ID_STUDIO="..."

# Email
POSTMARK_API_KEY="..."
FROM_EMAIL="noreply@theauditorsforge.com"

# Storage
STORAGE_BUCKET="..."

# Refinery
REFINERY_WEBHOOK_SECRET="..."
```

---

## 13. CI/CD Pipeline

### 13.1 GitHub Actions — CI (`ci.yml`)

Triggers: all pushes to `main` and all pull requests

```yaml
steps:
  - Checkout
  - Setup Node.js 20
  - Install dependencies (pnpm)
  - Run Prisma generate
  - TypeScript type check
  - ESLint
  - Unit tests (Jest/Vitest)
  - Integration tests (with test DB)
  - Build
```

### 13.2 GitHub Actions — Deploy (`deploy.yml`)

Triggers: push to `main` after CI passes

```yaml
steps:
  - Checkout
  - Vercel deploy (preview on PRs, production on main)
  - Run database migrations (prisma migrate deploy)
  - Smoke test production URL
```

---

## 14. Testing Strategy

### 14.1 Unit Tests
- AI prompt builder functions (ensure coach constraint block is always present)
- Temperature check metric calculations
- Word count utilities
- Export format renderers

### 14.2 Integration Tests
- tRPC router procedures against test database
- Stripe webhook handling
- Google Drive sync service

### 14.3 E2E Tests (Playwright)
Priority flows matching MVP acceptance criteria from RDD:
1. Registration → project creation → first coaching request
2. Manuscript import → chapter organization → export
3. Style profile setup → inconsistency flag
4. Google Drive connect → sync
5. Subscription upgrade via Stripe

---

## 15. Security Checklist for Implementation

- [ ] All API routes protected by authentication middleware
- [ ] User can only access their own projects/documents (row-level authorization in all DB queries)
- [ ] AI coaching routes validate passage belongs to authenticated user's project
- [ ] Stripe webhooks verified with `stripe-signature` header
- [ ] Google OAuth tokens stored encrypted, never exposed to client
- [ ] Rate limiting applied at coaching router level
- [ ] Input validation via Zod on all tRPC inputs
- [ ] Manuscript content never logged in plaintext in production logs
- [ ] CORS configured to allow only app domains
- [ ] CSP headers configured

---

## 16. Known Constraints and Development Notes

1. **TipTap JSON Storage:** Store rich text as TipTap JSON in a `Json` Prisma field. Do not store as HTML. This ensures portability and security.

2. **AI Observation-Only Constraint:** The system prompt coach constraint (Section 5.1) is the most critical product-defining behavior in the application. Any failure here breaks the core brand promise. Test this aggressively.

3. **Google Drive Scope:** Use `drive.file` scope only — not `drive` or `drive.readonly`. This ensures the app can only access files it created, not the user's entire Drive. This is a trust and security requirement.

4. **Passive Voice Detection:** Regex-based passive voice detection for temperature checks is approximate. Document this to users as an "estimate" not a count.

5. **Refinery Integration:** At MVP, treat Refinery as an external service. Do not build a tightly coupled dependency — use an API key and webhook pattern. Refinery may not be available at Forge launch.

6. **Version History Cleanup:** Implement a cron job to enforce the 30-version limit (Free/Pro) rolling window. Do not delete versions during an active write session.

---

## 17. Definition of Done

A feature is considered complete when:
- [ ] All acceptance criteria from the corresponding user story pass
- [ ] TypeScript compiles with no errors
- [ ] Unit tests written and passing
- [ ] Code reviewed and approved
- [ ] Deployed to staging and smoke tested
- [ ] Relevant documentation updated in this FDD if design changed

---

*Document controlled by The Auditor's Forge. Raise a pull request to propose changes to this document.*
