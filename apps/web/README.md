# Smith-Heffa Enterprise Web

Progressive Next.js App Router shell for the Smith-Heffa Deepfake Detection platform.

## Scope

- Keeps the current Vite production frontend intact.
- Introduces a migration-safe enterprise web surface in `apps/web`.
- Adds Prisma audit infrastructure and GitHub Actions workflows.

## Environment

Copy `.env.example` to `.env.local` and fill the values before local development.

## Commands

```bash
npm install
npm run prisma:generate
npm run dev
```
