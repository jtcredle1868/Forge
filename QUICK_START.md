# The Forge - Quick Start Guide

Get up and running with The Forge in 5 minutes.

## Prerequisite Checklist

- [ ] Node.js 20 installed (`node --version`)
- [ ] PostgreSQL 15 running (`psql --version`)
- [ ] Git configured

## 5-Minute Setup

### 1. **Clone and Install** (2 min)
```bash
git clone [YourRepo] the-forge
cd the-forge
npm install
```

### 2. **Configure Environment** (1 min)
```bash
cp .env.example .env.local
```

Edit `.env.local`:
- Set `DATABASE_URL` to your PostgreSQL connection string
- Get `ANTHROPIC_API_KEY` from https://console.anthropic.com
- (Optional) Get OAuth keys from Google Cloud Console

**Minimal .env.local:**
```
DATABASE_URL="postgresql://localhost/the_forge"
NEXTAUTH_SECRET="dev-secret-change-in-prod"
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..."
```

### 3. **Initialize Database** (1 min)
```bash
npx prisma migrate dev --name init
```

### 4. **Start Development** (1 min)
```bash
npm run dev
```

Open http://localhost:3000

---

## What's Ready to Use

✅ **Database** - Prisma schema with all models  
✅ **API Layer** - tRPC routers (projects, documents, coaching, etc.)  
✅ **Components** - UI component library started  
✅ **Pages** - Landing page, dashboard, projects list  
✅ **Styling** - Tailwind CSS configured  
✅ **CI/CD** - GitHub Actions workflows  

## What Needs Work

⏳ **Authentication** - NextAuth setup (blocking most features!)  
⏳ **Rich Text Editor** - TipTap integration  
⏳ **Coaching UI** - Full coaching interaction interface  
⏳ **Integrations** - Stripe, Google Drive, Postmark  

---

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run lint` | Check code quality |
| `npm run type-check` | TypeScript validation |
| `npm run test` | Run tests |
| `npx prisma studio` | Browse database GUI |
| `npx prisma migrate dev` | Create migrations |

---

## Important Files

| File | Purpose |
|------|---------|
| `.env.example` | Environment variables template |
| `prisma/schema.prisma` | Database schema |
| `FORGE_FDD.md` | Complete specification |
| `IMPLEMENTATION_GUIDE.md` | What's done/not done |
| `src/server/routers/` | API endpoint definitions |

---

## Next: Implementing Authentication

The most critical missing piece. To implement it:

1. Create `src/app/api/auth/[...nextauth]/route.ts`
2. Set up NextAuth.js with Google provider
3. Create login/register pages
4. Add auth middleware for protected routes

See `IMPLEMENTATION_GUIDE.md` for detailed steps.

---

## Troubleshooting

### Port 3000 in use?
```bash
lsof -i :3000  # Find what's using it
kill -9 [PID]  # Kill the process
```

### Database connection error?
```bash
# Check PostgreSQL is running
psql -U postgres -d postgres

# Verify DATABASE_URL in .env.local
echo $DATABASE_URL
```

### Prisma client out of sync?
```bash
npx prisma generate
npm run dev
```

### Type errors?
```bash
npm run type-check
```

---

## Architecture Quick Reference

```
User Request
  ↓
Next.js Page/API
  ↓
tRPC Procedure (in src/server/routers/)
  ↓
Prisma Client
  ↓
PostgreSQL Database
```

All type-safe end-to-end with TypeScript.

---

Need more details? Read:
- `README_FORGE.md` - Complete documentation
- `FORGE_FDD.md` - Full specification
- `IMPLEMENTATION_GUIDE.md` - What's left to build
