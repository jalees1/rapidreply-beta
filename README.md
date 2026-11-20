# Rapid Reply

Rapid Reply turns Instagram keyword comments and incoming DMs into reliable, personalized private replies through the official Meta API.

It includes campaign triggers, link buttons, delivery logs, reporting, workspaces, an Instagram inbox, and a background worker for rate-limited delivery.

## What it runs

- **Web app:** Next.js dashboard, Meta OAuth callback, webhook receiver, and API.
- **Worker:** BullMQ consumer for campaign delivery, retries, and comment reconciliation.
- **PostgreSQL:** users, workspaces, accounts, campaigns, events, and delivery history.
- **Redis:** BullMQ queue and rate limiting.

Run both the web app and worker. Receiving a webhook is not enough to send a DM: the worker performs the delivery.

## Quick start

1. Create a Meta app with Instagram Login and configure its OAuth redirect URI and webhook.
2. Copy `.env.example` to `.env` and fill in the secrets.
3. Start PostgreSQL and Redis.
4. Generate the Prisma client and apply migrations.
5. Start the web app and worker in separate terminals.

```bash
npm install
cp .env.example .env
docker-compose up -d
npm run db:generate
npm run db:migrate
npm run dev
```

In a second terminal:

```bash
npm run worker
```

Open `http://localhost:3000`, create an account with an email address and password, then connect Instagram in **Settings**.

## Meta connection

Rapid Reply uses the direct Meta integration only. In your Meta app, register the exact same callback URI that the application sends in the OAuth request:

```text
https://your-public-host/api/instagram/callback
```

For local work with ngrok, set both `NEXTAUTH_URL` and `INSTAGRAM_REDIRECT_URI` to the current HTTPS tunnel URL, then add these exact URLs in Meta:

```text
OAuth redirect URI: https://your-tunnel.ngrok-free.app/api/instagram/callback
Webhook callback URL: https://your-tunnel.ngrok-free.app/api/webhook
```

The redirect URI is an exact match. Scheme, hostname, path, trailing slash, and query string must match the value saved in Meta.

See [the setup guide](docs/setup.md) for the production configuration and [the stack guide](docs/stack.md) for runtime details.

## Deploy to Vercel

Deploy the web app to Vercel and run the BullMQ worker as a separate always-on Node service. Vercel handles the dashboard, OAuth callback, Meta webhooks, and scheduled routes; it cannot host the persistent worker that sends queued DMs.

Follow the [Vercel deployment guide](docs/deploy-vercel.md) before connecting your production Instagram app.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXTAUTH_URL` | Public application URL. |
| `NEXTAUTH_SECRET` | Auth.js signing secret for the JWT session. |
| `CRON_SECRET` | Secret for protected cron endpoints. |
| `ENCRYPTION_KEY` | 64-hex-character key that encrypts Instagram tokens. |
| `DATABASE_URL` | PostgreSQL connection string. |
| `REDIS_URL` | Redis connection string for BullMQ. |
| `INSTAGRAM_APP_ID` | Instagram Login app ID from Meta. |
| `INSTAGRAM_APP_SECRET` | Instagram Login app secret from Meta. |
| `FACEBOOK_APP_SECRET` | App secret used to verify webhook signatures. |
| `WEBHOOK_VERIFY_TOKEN` | Token entered in Meta when verifying the webhook. |
| `INSTAGRAM_REDIRECT_URI` | Optional explicit OAuth callback URI; must match Meta exactly. |

## License

MIT. See [LICENSE](LICENSE).
