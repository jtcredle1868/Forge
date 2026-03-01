# The Forge — Where Perfect Prose Begins

An AI-powered writing platform that provides personalized coaching and manuscript management for authors.

## Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout with TRPCReactProvider
│   ├── page.tsx                   # Landing page
│   ├── api/
│   │   └── trpc/[trpc]/route.ts   # tRPC handler
│   └── (dashboard)/
│       ├── layout.tsx             # Dashboard layout
│       ├── projects/
│       │   ├── page.tsx           # Projects list
│       │   ├── new/
│       │   │   └── page.tsx       # New project form
│       │   └── [projectId]/
│       │       ├── page.tsx       # Project detail
│       │       └── write/
│       │           └── [documentId]/page.tsx
│       ├── settings/
│       └── billing/
├── server/
│   ├── db.ts                      # Prisma client
│   ├── trpc.ts                    # tRPC setup
│   └── routers/
│       ├── _app.ts                # Root router
│       ├── projects.ts            # Projects CRUD
│       ├── documents.ts           # Documents management
│       ├── coaching.ts            # AI coaching
│       ├── style.ts               # Style profile
│       ├── sync.ts                # Google Drive sync
│       └── billing.ts             # Stripe integration
|   └── services/
│       └── aiCoachingService.ts   # Claude API integration
├── trpc/
│   └── react.tsx                  # Client-side tRPC setup
├── components/
│   ├── editor/
│   │   └── ForgeEditor.tsx        # Main editor component
│   ├── coaching/
│   │   └── CoachingPanel.tsx      # Coaching interface
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── auth.ts                    # Authentication utilities
│   ├── constants.ts               # App constants
│   ├── utils.ts                   # Utility functions
│   └── validations.ts             # Zod schemas
└── styles/
    └── globals.css                # Tailwind CSS

prisma/
├── schema.prisma                  # Database schema
└── migrations/                    # Database migrations

.github/workflows/
├── ci.yml                         # CI pipeline
└── deploy.yml                     # Deployment pipeline
```

## Technology Stack

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes + tRPC
- **Database**: PostgreSQL + Prisma
- **Authentication**: NextAuth.js
- **Rich Text**: TipTap
- **AI**: Anthropic Claude API
- **Payments**: Stripe
- **Cloud Storage**: Supabase Storage
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/theauditorsforge/the-forge.git
   cd the-forge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Update `.env.local` with your configuration.

4. **Initialize the database**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking
- `npm run test` - Run tests
- `npm run test:e2e` - Run E2E tests with Playwright
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Create and apply migrations
- `npm run prisma:studio` - Open Prisma Studio

### Database Migrations

Create a new migration after schema changes:
```bash
npx prisma migrate dev --name your_migration_name
```

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Watch mode
npm run test -- --watch
```

## API Routes (tRPC)

### Projects Router
- `projects.list()` - Get all user projects
- `projects.get(id)` - Get project with chapters/scenes
- `projects.create(input)` - Create new project
- `projects.update(id, input)` - Update project
- `projects.archive(id)` - Archive project
- `projects.delete(id)` - Delete project

### Documents Router
- `documents.get(sceneId)` - Get document content
- `documents.save(sceneId, content)` - Save document
- `documents.getVersions(documentId)` - Get version history
- `documents.restoreVersion(versionId)` - Restore version
- `documents.getWordCount(documentId)` - Get word count

### Coaching Router
- `coaching.analyzePassage(input)` - Get passage analysis
- `coaching.craftQA(input)` - Ask a craft question
- `coaching.temperatureCheck(chapterId)` - Check chapter metrics
- `coaching.getInteractions(projectId)` - Get interaction history
- `coaching.dismissInteraction(id)` - Dismiss feedback
- `coaching.acknowledgeInteraction(id)` - Acknowledge feedback

### Style Router
- `style.getProfile(projectId)` - Get style profile
- `style.upsertProfile(projectId, input)` - Update style settings
- `style.checkConsistency(input)` - Check style consistency

### Sync Router
- `sync.connectGoogleDrive(projectId, code)` - Connect to Google Drive
- `sync.syncNow(projectId)` - Trigger sync
- `sync.getSyncStatus(projectId)` - Get sync status
- `sync.disconnect(projectId)` - Disconnect Google Drive

### Billing Router
- `billing.getSubscription()` - Get user subscription
- `billing.createCheckoutSession(tier)` - Create Stripe checkout
- `billing.createPortalSession()` - Open billing portal
- `billing.getUsage()` - Get usage metrics

## AI Coaching Constraints

The AI coaching system operates under strict observation-only constraints:

> **You are a prose coach. Your role is to observe and comment on writing craft — you do NOT write prose, rewrite sentences, or generate story content.**

Key behaviors:
- Describe observed patterns and their effects
- Ask questions to promote critical thinking
- Reference specific craft principles
- Never rewrite or complete passages
- Always treat the author as the sole author

This constraint is injected into every Claude API call for coaching.

## Security Checklist

- [ ] All API routes protected by authentication
- [ ] Row-level authorization for all database queries
- [ ] Stripe webhooks verified with signature header
- [ ] Google OAuth tokens encrypted in database
- [ ] Rate limiting on coaching endpoints
- [ ] Input validation via Zod
- [ ] Manuscript content never logged in plaintext
- [ ] CORS configured appropriately
- [ ] CSP headers configured

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel console
3. Deploy button will trigger CI/CD
4. Database migrations run automatically on `main` push

### Manual Deployment

```bash
# Build application
npm run build

# Run migrations
npx prisma migrate deploy

# Start server
npm start
```

## Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## License

This project is proprietary. All rights reserved by The Auditor's Forge.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.
