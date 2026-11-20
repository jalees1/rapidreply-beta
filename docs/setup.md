# Rapid Reply setup

Rapid Reply uses your own Meta app for Instagram Login, webhooks, and private-reply delivery. A working deployment runs the web app and the worker against the same PostgreSQL database, Redis instance, and encryption key.

## 1. Create the infrastructure

You need:

- An Instagram Business or Creator account.
- A Meta developer account and Business app.
- PostgreSQL and Redis.
- A public HTTPS URL for the web app and Meta callbacks.
- A long-running worker process.

Vercel works well for the Next.js web app. Railway, Render, Fly, or another always-on service works for the worker, PostgreSQL, and Redis.

## 2. Configure environment variables

Copy `.env.example` to `.env` for local development. In production, add the same variables to the web app and worker services where noted.

| Variable | Web | Worker | Notes |
| --- | --- | --- | --- |
| `NEXTAUTH_URL` | yes | yes | Public web URL, without a trailing slash. |
| `NEXTAUTH_SECRET` | yes | yes | Use `openssl rand -base64 32`. It signs JWT sessions. |
| `CRON_SECRET` | yes | optional | Use a different random value. |
| `ENCRYPTION_KEY` | yes | yes | Use `openssl rand -hex 32`. Keep it identical across both processes. |
| `DATABASE_URL` | yes | yes | The production PostgreSQL connection string. |
| `REDIS_URL` | yes | yes | Redis URL that supports BullMQ blocking commands. |
| `META_GRAPH_API_VERSION` | yes | yes | Example: `v25.0`. |
| `INSTAGRAM_APP_ID` | yes | yes | From your Meta app. |
| `INSTAGRAM_APP_SECRET` | yes | yes | From your Meta app. |
| `FACEBOOK_APP_SECRET` | yes | yes | Used to verify the webhook signature. |
| `WEBHOOK_VERIFY_TOKEN` | yes | yes | A random value copied to Meta webhook settings. |
| `INSTAGRAM_REDIRECT_URI` | yes | yes | Optional explicit callback URI. |

`ENCRYPTION_KEY` must be exactly 64 hexadecimal characters. Changing it makes existing encrypted Instagram tokens unreadable and requires reconnecting accounts.

## 3. Run migrations

Generate the Prisma client and apply database migrations before starting the app:

```bash
npm run db:generate
npm run db:migrate
```

For a hosted deployment, run the migration command once against the production database before or with the first web deployment. The worker should use `npm run db:generate` during its build and `npm run worker` as its start command.

## 4. Configure the Meta app

Create a **Business** app at [Meta for Developers](https://developers.facebook.com/apps), then add the Instagram Login and webhook products required by your account setup.

Use these exact values, replacing the host with your deployed Rapid Reply URL:

| Meta setting | Value |
| --- | --- |
| OAuth redirect URI | `https://your-domain.example/api/instagram/callback` |
| Deauthorize callback URL | `https://your-domain.example/api/instagram/callback` |
| Webhook callback URL | `https://your-domain.example/api/webhook` |
| Webhook verify token | The exact value of `WEBHOOK_VERIFY_TOKEN` |

Subscribe the webhook to the fields your campaigns use:

- `comments` for post and reel comment triggers.
- `messages` for DM and Story-reply triggers.
- `messaging_postbacks` for button taps.
- `message_reads` if you use read-state handling.

The OAuth callback must be byte-for-byte identical in three places:

1. `INSTAGRAM_REDIRECT_URI`, if you set it.
2. The redirect URI sent by Rapid Reply.
3. The redirect URI saved in Meta.

Do not add a query string. Keep the path as `/api/instagram/callback`. If Meta reports `Invalid redirect_uri`, copy the URI from the browser’s authorization request and compare it with the value saved in Meta.

## 5. Connect Instagram

1. Start the web app and sign in with an owner or admin account.
2. Open **Settings** and choose **Connect Instagram**.
3. Complete the Meta authorization flow.
4. Confirm the account appears in Settings and shows webhook status.

Rapid Reply exchanges the short-lived OAuth token, saves an encrypted long-lived token, and subscribes the connected Instagram account to webhooks.

## 6. Start both runtime processes

Start the web app:

```bash
npm run dev
```

Start the worker in a second terminal or service:

```bash
npm run worker
```

Check `/api/health` after deployment. The worker must be healthy before campaigns can deliver DMs.

## Local development with ngrok

Start the app and worker, then expose port 3000:

```bash
ngrok http 3000
```

Use the ngrok HTTPS URL in `.env`:

```dotenv
NEXTAUTH_URL=https://your-tunnel.ngrok-free.app
INSTAGRAM_REDIRECT_URI=https://your-tunnel.ngrok-free.app/api/instagram/callback
```

Add these same URLs in Meta:

```text
OAuth redirect URI: https://your-tunnel.ngrok-free.app/api/instagram/callback
Webhook callback URL: https://your-tunnel.ngrok-free.app/api/webhook
```

Free ngrok domains can change. When the domain changes, update `.env`, restart the web app and worker, then update both Meta settings before connecting an account.

## 7. Verify a campaign

1. Create an active campaign with a keyword such as `TEST`.
2. From a different Instagram account, comment `TEST` on the selected post or reel.
3. Check **DM Logs** for a `SENT` record.
4. If the message does not arrive, check **Diagnostics**, `/api/health`, `WebhookEvent`, and `OperationalEvent`.

For direct Meta delivery, your app must be in the state Meta requires for the connected Instagram account. Tester roles work during development; public customer connections need any relevant Meta App Review and Advanced Access approvals.

## JWT session settings

Rapid Reply uses Auth.js JWT sessions. Set the signing secret in `NEXTAUTH_SECRET`; do not create a second `JWT_SECRET` for the same session.

The session expiry is configured in [`lib/auth.ts`](../lib/auth.ts) as `maxAge: 60 * 60 * 24 * 7` (seven days). Change that value when your security policy calls for a different lifetime, then redeploy the web app. Existing sessions are signed with the current secret; rotating `NEXTAUTH_SECRET` signs all users out.
