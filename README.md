# Rift State RP website

## Local development

Requires a supported Node.js version and npm.

```bash
npm install
cp .env.example .env
npm run dev
```

## Production

```bash
npm install
npm run build
npm start
```

Configure environment variables using `.env.example` as a checklist. Do not commit `.env`, API keys, OAuth secrets, bot tokens, or production database credentials.

**Hosting note:** this is a full-stack Express + Vite + SQLite app, not a static-only website. Cloudflare Pages' static uploader will not run `server.ts`, OAuth callbacks, sessions, or SQLite. Use a Node.js host/VPS behind your Cloudflare domain, or migrate the backend/database to Workers-compatible services before deploying to Workers.

See `DEPLOY_CLOUDFLARE_AR.md` for Arabic deployment and OAuth setup instructions.
