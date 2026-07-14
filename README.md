# Aria — Monorepo Root

This folder contains the root-level config files for the full Aria monorepo.

## Repo layout (after placing all three zips)

```
aria/                          ← this folder's contents go here (root)
├── package.json               ← Turborepo workspace definition
├── turbo.json                 ← pipeline: dev, build, test, lint
├── tsconfig.json              ← base TS config extended by each app
├── .prettierrc
├── .gitignore
├── Makefile                   ← make install / make backend / make web / make mobile
├── README.md
│
├── .github/
│   └── workflows/
│       └── ci.yml             ← CI: backend tests + web tests + deploy on main
│
├── backend/                   ← contents of aria_backend.zip go here
│
├── apps/
│   ├── web/                   ← contents of aria_frontend.zip go here
│   └── mobile/                ← contents of aria_remaining/mobile go here
│
└── packages/                  ← already inside web/ and mobile/ for standalone use;
                                  at monorepo level they live here and are symlinked
                                  by npm workspaces
```

## First-time setup (monorepo mode)

```bash
npm install          # installs all workspaces via Turborepo
make db              # applies db/schema.sql (set DATABASE_URL first)
make backend         # uvicorn on :8000
make web             # Next.js on :3000
make mobile          # Expo dev server
```

## Running standalone (no Turborepo)

Each app folder is self-contained with its own `packages/` copy:
- `backend/`  → `pip install -r requirements.txt && uvicorn app.main:app --reload`
- `apps/web/` → `npm install && npm run dev`
- `apps/mobile/` → `npm install && npx expo start`
