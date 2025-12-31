# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (binds to 0.0.0.0 for mobile testing)
npm run build    # Production build
npm run lint     # ESLint
npx prisma generate          # Regenerate Prisma client after schema changes
npx prisma db push           # Push schema changes to database
npx prisma migrate dev       # Create migration (development)
```

**Docker deployment:**
```bash
docker-compose up -d --build  # Build and run container
```

## Architecture

### App Structure (Next.js 14 App Router)

```
src/app/
├── (auth)/          # Auth route group: login, register
├── (main)/          # Main app route group with BottomNav
│   ├── home/        # Daily menu view
│   ├── recipes/     # Recipe list and [id] detail page
│   ├── select/      # Recipe selection for menu
│   ├── shopping/    # AI-powered shopping list
│   ├── profile/     # User profile
│   └── settings/    # App settings
├── api/             # API routes
│   ├── ai/          # AI endpoints (recipe generation, shopping aggregation)
│   ├── auth/        # Login, register, logout
│   ├── menu/        # Daily menu CRUD
│   ├── recipes/     # Recipe CRUD
│   ├── shopping/    # Shopping list CRUD
│   └── upload/      # Image upload to public/uploads
└── pair/            # Couple pairing flow
```

### Key Patterns

**State Management:** Zustand store (`src/stores/authStore.ts`) with localStorage persistence. User data includes `coupleId` which scopes all data queries.

**Database:** Prisma with SQLite. All data is couple-scoped via `coupleId`. JSON fields store structured data:
- `Recipe.ingredients`: `[{name, amount}]`
- `Recipe.steps`: `[{content}]`

**AI Integration:** OpenAI-compatible API at `localhost:8045` using `claude-sonnet-4-5-thinking` model. Two endpoints:
- `/api/ai/recipe` - Generate recipe from dish name
- `/api/ai/shopping` - Aggregate ingredients from recipes into shopping list

**Design System:** Black/white/gray palette only. No colored status indicators. Uses Tailwind with custom design tokens in `src/lib/utils/design-tokens.ts`.

**Layout:** `AppLayout` component wraps main pages with `BottomNav`. Auth pages use separate layout without nav.

### Data Flow

1. User authenticates → stored in Zustand + localStorage
2. All API calls include `coupleId` from auth store
3. Shopping list: Today's menu recipes → AI aggregation → persisted items with type (memo/common/recipe)

### Component Organization

- `src/components/ui/` - Reusable UI primitives (Button, Toast, Dialog, Input)
- `src/components/layout/` - App shell components (AppLayout, BottomNav, Header)
- `src/components/providers/` - Context providers

### Important Files

- `src/lib/db.ts` - Prisma client singleton
- `src/components/ui/Toast.tsx` - Toast system with `useToast` hook
- `prisma/schema.prisma` - Database schema (SQLite)
