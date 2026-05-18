# Smith-Heffa Enterprise Rollout

This repository now contains two frontends:

- `frontend/`: current production Vite frontend, already live on Vercel.
- `apps/web/`: progressive Next.js App Router enterprise shell for migration.

## Suggested rollout order

1. Keep `frontend/` as the production entrypoint until enterprise web is validated.
2. Link `apps/web/` to a separate Vercel project for preview and production.
3. Provision a PostgreSQL database and set `DATABASE_URL` for `apps/web/`.
4. Run Prisma migrations before opening enterprise traffic.
5. Promote the Next.js app only after legal, audit and monitoring acceptance.

## Required GitHub secrets

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_ENTERPRISE_WEB_PROJECT_ID`
- `VERCEL_VITE_FRONTEND_PROJECT_ID`

## Bootstrap commands

```bash
cat > apps/web/.env.local <<'EOF'
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/smith_heffa_enterprise?schema=public
NEXT_PUBLIC_GITHUB_REPO=https://github.com/franzheffa/smith-heffa-deepfakedetection
NEXT_PUBLIC_DASHBOARD_URL=https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=DeepFake-Monitoring-Dashboard
NEXT_PUBLIC_VITE_FRONTEND_URL=https://frontend-buttertech-team.vercel.app
EOF
```

```bash
cat > apps/web/.env.production.local <<'EOF'
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/smith_heffa_enterprise?schema=public
NEXT_PUBLIC_GITHUB_REPO=https://github.com/franzheffa/smith-heffa-deepfakedetection
NEXT_PUBLIC_DASHBOARD_URL=https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=DeepFake-Monitoring-Dashboard
NEXT_PUBLIC_VITE_FRONTEND_URL=https://frontend-buttertech-team.vercel.app
EOF
```
