# Smith-Heffa Enterprise Rollout

This repository now contains two frontends:

- `frontend/`: current production Vite frontend, already live on Vercel.
- `apps/web/`: progressive Next.js App Router enterprise shell for migration.

## Suggested rollout order

1. Keep `frontend/` as the production entrypoint until enterprise web is validated.
2. Link `apps/web/` to a separate Vercel project for preview and production.
3. Verify Google OAuth credentials and AI provider keys on the new Vercel project.
4. Run Prisma migrations before opening enterprise traffic.
5. Promote the Next.js app only after legal, audit, billing and monitoring acceptance.

## Required GitHub secrets

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_ENTERPRISE_WEB_PROJECT_ID`
- `VERCEL_VITE_FRONTEND_PROJECT_ID`

## Bootstrap commands

```bash
cat > apps/web/.env.local <<'EOF'
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/smith_heffa_enterprise?schema=public
PRISMA_DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/smith_heffa_enterprise?schema=public
POSTGRES_URL=postgresql://USER:PASSWORD@HOST:5432/smith_heffa_enterprise?schema=public
AUTH_SECRET=replace-with-a-strong-secret
NEXTAUTH_SECRET=replace-with-a-strong-secret
AUTH_TRUST_HOST=true
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_GITHUB_REPO=https://github.com/franzheffa/smith-heffa-deepfakedetection
NEXT_PUBLIC_DASHBOARD_URL=https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=DeepFake-Monitoring-Dashboard
NEXT_PUBLIC_VITE_FRONTEND_URL=https://frontend-buttertech-team.vercel.app
NEXT_PUBLIC_DETECTION_API_URL=https://zxnu88ex8e.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_PAYGATE_URL=https://smith-heffa-paygate.vercel.app
EOF
```

```bash
cat > apps/web/.env.production.local <<'EOF'
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/smith_heffa_enterprise?schema=public
PRISMA_DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/smith_heffa_enterprise?schema=public
POSTGRES_URL=postgresql://USER:PASSWORD@HOST:5432/smith_heffa_enterprise?schema=public
AUTH_SECRET=replace-with-a-strong-secret
NEXTAUTH_SECRET=replace-with-a-strong-secret
AUTH_TRUST_HOST=true
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_GITHUB_REPO=https://github.com/franzheffa/smith-heffa-deepfakedetection
NEXT_PUBLIC_DASHBOARD_URL=https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=DeepFake-Monitoring-Dashboard
NEXT_PUBLIC_VITE_FRONTEND_URL=https://frontend-buttertech-team.vercel.app
NEXT_PUBLIC_DETECTION_API_URL=https://zxnu88ex8e.execute-api.us-east-1.amazonaws.com/prod
NEXT_PUBLIC_PAYGATE_URL=https://smith-heffa-paygate.vercel.app
EOF
```
