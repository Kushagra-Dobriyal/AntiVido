# Project Structure

Here is the full file structure of the `APP` monorepo, broken down by folder logic and responsibilities.

### 🌳 The Root Directory (`APP/`)
This acts as the orchestrator for all the applications and packages inside.

```text
APP/
├── .turbo/               # Turborepo caching directory
├── node_modules/         # Root dependencies (hoisted by pnpm)
├── package.json          # Root package file (commands like build/dev)
├── pnpm-lock.yaml        # Lockfile managing exact versions for the entire monorepo
├── pnpm-workspace.yaml   # Configures pnpm to treat apps/ and packages/ as a monorepo
├── turbo.json            # Configures how tasks (build, lint, etc.) run and cache
└── README.md             
```

---

### 📱 Applications (`APP/apps/`)
This is where deployable projects live.

#### 1. `web/` (Next.js Frontend)
The main user-facing frontend application.

```text
apps/web/
├── app/                  # Next.js App Router (pages, layouts, API routes)
├── components/           # UI components specific to the web app
├── lib/                  # Utility functions and shared logic
├── public/               # Static assets (images, fonts, etc.)
├── components.json       # shadcn/ui configuration
├── next.config.js        # Next.js specific settings
├── postcss.config.mjs    # Tailwind/PostCSS configuration
├── tailwind.config.ts    # Tailwind styling tokens (if present)
├── tsconfig.json         # TypeScript config for the frontend
└── package.json          # Dependencies for the Next.js app
```

#### 2. `PulseQ/` (API / Backend)
This directory holds the backend service. It is now properly flattened as a direct workspace package.

```text
apps/PulseQ/
├── src/                  # Source code for the backend
├── scripts/              # Helper scripts
├── dist/                 # Compiled output
├── .env                  # Environment variables
├── tsconfig.json         # TypeScript config for the API
└── package.json          # Dependencies for the API
```

---

### 📦 Shared Packages (`APP/packages/`)
These are internal modules that the `apps` can import. Code placed here is reusable across multiple applications.

#### 1. `ui/` (Shared UI Library)
Contains React components that can be used anywhere (e.g., in `web`).

```text
packages/ui/
├── src/                  # Component source code (e.g., buttons, cards)
├── package.json          # Exports the UI components
├── eslint.config.mjs     # Linter rules specific to the UI library
└── tsconfig.json         # TypeScript config
```

#### 2. `eslint-config/` (Shared Linting Rules)
Standardizes code quality rules across all apps and packages.

```text
packages/eslint-config/
├── base.js               # Base ESLint rules for Node/Vanilla TS
├── next.js               # ESLint rules tailored for Next.js
├── react-internal.js     # ESLint rules for internal React packages
└── package.json          
```

#### 3. `typescript-config/` (Shared TS Settings)
Ensures strict TypeScript compilation rules are consistent everywhere.

```text
packages/typescript-config/
├── base.json             # Base TS rules
├── nextjs.json           # TS rules for the Next app
├── react-library.json    # TS rules for the UI package
└── package.json
```
