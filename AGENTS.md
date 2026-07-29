# AGENTS.md

Zero-backend task tracker — React 19, TypeScript 6, Vite 8. Persistence: `localStorage` (default) or File System Access API → `tasks.json` (optional). IndexedDB stores the FSAA directory handle. No server, no database, no API.

## Setup

```bash
npm install            # install all deps
npm run dev            # Vite HMR → http://localhost:5173 (ignores data/ in watch)
npm run build          # tsc -b && vite build → dist/
npm run preview        # serve production build
npm run deploy         # build + npx gh-pages -d dist -t → GitHub Pages
```

## Pre-commit

```bash
npx tsc -b && npx oxlint@latest
```

## Key conventions

- **Imports**: `verbatimModuleSyntax` — always `import type { X }` for type-only imports
- **No enums**: `erasableSyntaxOnly` — use `type`/`interface`; prefer `type` for unions, `interface` for extendable contracts
- **IDs**: `crypto.randomUUID()`
- **Dates**: ISO 8601 UTC strings (`new Date().toISOString()`)
- **Styles**: CSS Modules (`*.module.css`) per component; design tokens in `src/styles/tokens.css` (OKLCH)
- **Components**: Function components only, one per directory in `src/components/`
- **JSX**: react-jsx transform — no `import React from 'react'`

## Architecture

- Single `useTasks` hook (`src/hooks/useTasks.ts`) owns all state via `useState`
- All mutations flow through `src/services/storageService.ts` → writes to the **active** backend only (localStorage or FSAA, never both)
- FSAA wrapper: `src/services/fileService.ts` — IndexedDB handle store, read/write `tasks.json`
- `src/types/task.ts` — `Task`, `TaskFormData`, `TaskStats`, category/priority types and maps
- `src/utils/dates.ts` — `formatDate`, `isOverdue`, `daysUntil`
- No test framework. No env vars. No router (filters are local state).
- `data/` directory is a runtime FSAA target, not in `.gitignore`, ignored by Vite watch only
- CI: `.github/workflows/deploy.yml` — push to `main` → `npm ci`, `npm run build`, deploy-pages
- Vite config allows `.ngrok-free.dev` hosts for mobile testing
- `base: '/flloisee-task-tracker/'` for GitHub Pages subpath hosting
