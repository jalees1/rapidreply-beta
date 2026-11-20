# Deploy Rapid Reply on Vercel

Rapid Reply uses three services in production:

| Service | Recommended host | Purpose |
| --- | --- | --- |
| Web app | Vercel | Dashboard, OAuth callback, Meta webhooks, and daily jobs. |
| Worker | Any always-on Node host | BullMQ delivery, retries, delayed DMs, and comment reconciliation. |
| Data | Managed PostgreSQL and Redis | Application data, queue, and rate limiting. |

## 1. Create production data services

Create a PostgreSQL database and a Redis instance reachable from both Vercel and the worker host. Copy their TLS connection strings. Do not use the local Docker URLs from `.env.example` in production.

## 2. Import the repository in Vercel

Import the GitHub repository as a Next.js project. The included `vercel.json` runs `npm run vercel-build`, which generates Prisma Client, applies committed migrations, and builds the app. It also schedules the token refresh, next-reel, and follower snapshot routes.

Vercel uses Node 22 from the `engines` field in `package.json`.

## 3. Add Vercel environment variables

Add these values to the **Production** environment before the first deployment:

```text
NEXTAUTH_URL=https://your-domain.example
NEXTAUTH_SECRET=<a random secret of at least 32 characters>
CRON_SECRET=<a separate random secret>
ENCRYPTION_KEY=<64 lowercase hexadecimal characters>
DATABASE_URL=<production PostgreSQL URL>
REDIS_URL=<production Redis URL>
INSTAGRAM_APP_ID=<Meta app ID>
INSTAGRAM_APP_SECRET=<Meta app secret>
FACEBOOK_APP_SECRET=<Meta app secret used for webhook signatures>
WEBHOOK_VERIFY_TOKEN=<a random verification token>
INSTAGRAM_REDIRECT_URI=https://your-domain.example/api/instagram/callback
META_GRAPH_API_VERSION=v25.0
```

Generate values locally without committing them:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use the result directly for `ENCRYPTION_KEY`. Generate separate values for `NEXTAUTH_SECRET`, `CRON_SECRET`, and `WEBHOOK_VERIFY_TOKEN`.

If your database provider supplies both a pooled URL and a direct URL, use the direct, migration-capable URL for `DATABASE_URL` during Vercel builds.

## 4. Run the delivery worker

Deploy the same repository to an always-on Node service such as Railway, Render, Fly.io, or a VPS. Configure the exact same environment variables as Vercel, then set the start command to:

```bash
npm run worker
```

The worker must remain online. It consumes webhook jobs from Redis, processes retries and delayed messages, and polls for comments missed by Meta webhooks.

## 5. Configure Meta after the first deployment

Use the production domain in Meta's Business Login settings:

```text
OAuth redirect URI: https://your-domain.example/api/instagram/callback
Webhook callback URL: https://your-domain.example/api/webhook
Verify token: the exact WEBHOOK_VERIFY_TOKEN from Vercel
```

The OAuth redirect URI is an exact match. Save the domain without a trailing slash and set the same URL in `INSTAGRAM_REDIRECT_URI`.

## 6. Verify the deployment

1. Open the Vercel URL and create an account.
2. Connect an Instagram account from **Settings**.
3. Verify the webhook in Meta, subscribe to comments and messages, then send Meta's test event.
4. Check that the worker logs show it consumed the queued job.
5. Create a paused test campaign, activate it, and comment its keyword from an eligible Instagram account.

Vercel cron requests authorize with `CRON_SECRET`. Keep it private and do not call the cron routes from a browser.
