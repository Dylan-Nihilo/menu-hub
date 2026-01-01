# Repository Guidelines

## ⚠️ Development Priority

**Mobile App First** - 所有新功能开发、调试、测试数据添加都在 `mobile/` 目录进行。Web 端 (`src/`) 仅作为历史参考保留，不再维护。

**UI-First Design** - 这是一个 UI 优先的应用，设计质量是核心竞争力：
- 严格遵循黑白灰设计系统（#0a0a0a, #f5f5f5, #a3a3a3），不使用彩色
- 动画和交互反馈必须流畅自然，使用 `AnimatedPressable` 替代 `TouchableOpacity`
- 参考 `mobile/lib/theme.ts`（设计令牌）和 `mobile/lib/motion.ts`（动画规范）
- 任何 UI 修改前先理解现有设计语言，保持全局一致性

## Project Structure & Module Organization
- Next.js web app in `src/app` (`(auth)`, `(main)`, `api`); shared UI in `src/components`, hooks in `src/hooks`, utilities in `src/lib`, state in `src/stores`, and globals in `src/app/globals.css`.
- Assets in `public/`. Web Prisma schema/migrations in `prisma/`; Supabase SQL in `supabase/`.
- Mobile Expo app in `mobile/` (`app`, `components`, `assets`, `stores`). Express/Prisma API in `server/` (`src`, `prisma/`); install deps per package.
- Env sample `.env.example`; keep secrets in `.env.local`; never commit `*.db` or credentials.

## Build, Test, and Development Commands
- Web (root): `npm run dev`, `npm run lint`, `npm run build`, `npm run start`.
- Database (web): `npx prisma migrate dev --name <change>` or `npx prisma db push`; run the same inside `server/` for API schema.
- Mobile: from `mobile/`, `npm run start` or `npm run android` / `ios` / `web`.
- API: from `server/`, `npm run dev`; `npm run build && npm start` for production bundle.
- Docker: `docker-compose up -d` to run the published image with persistent `/data`.

## Coding Style & Naming Conventions
- TypeScript-first, Next 14 App Router; prefer server components, add `use client` only for state/animation.
- 2-space indentation; imports ordered external → aliases → relatives; favor named exports.
- Components PascalCase; hooks `useX`; Zustand stores `useXStore`. Tailwind utilities for styling with `clsx`/`tailwind-merge` for conditionals.

## Testing Guidelines
- No automated suite yet; always run `npm run lint` before pushing.
- If adding tests, use React Testing Library (web) and Playwright for flows; name files `*.test.tsx`/`*.spec.ts` near code or in `src/__tests__/`. For API, use supertest/vitest in `server/__tests__/`.
- When tests are absent, list manual QA steps in PRs (routes, payloads, creds).

## Commit & Pull Request Guidelines
- Use conventional commits as in history (`feat(mobile): ...`, `fix: ...`, `chore(server): ...`); keep messages imperative and scoped.
- PRs should state purpose, linked issues, screenshots/recordings for UI (web + mobile), schema/migration notes, and test/QA results; flag breaking changes or data backfills.
- Keep branches rebased; prefer small, focused changes.

## Security & Configuration Tips
- Keep secrets in `.env.local`; exclude `node_modules/`, uploads, and database files from commits.
- After Prisma schema edits, run `npx prisma generate` in the affected package (root and/or `server/`).
