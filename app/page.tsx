import type { Metadata } from "next";
import Link from "next/link";
import localFont from "next/font/local";
import BrandLogo from "@/components/brand-logo";
import { DemoNotice } from "@/components/demo-notice";
import "./landing.css";

const geist = localFont({
  src: "../public/fonts/geist-latin.woff2",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Rapid Reply - Instagram comment-to-DM automation",
  description:
    "Automate Instagram comment-to-DM campaigns with your Meta app, a reliable queue, and a complete delivery log.",
};

const features = [
  [
    "Keyword campaigns",
    "Match comments or DMs and send a personalized reply with your chosen message and link buttons.",
  ],
  [
    "Instagram inbox",
    "Read conversations and reply from one workspace while respecting Instagram messaging windows.",
  ],
  [
    "Reliable delivery",
    "Queue sends, rate-limit requests, retry temporary failures, and inspect every delivery in the log.",
  ],
  [
    "Campaign reporting",
    "See post engagement, follower history, sent DMs, and tracked link clicks for each connected account.",
  ],
];

export default function Home() {
  return (
    <div id="top" className={`or-landing ${geist.className}`}>
      <a className="or-skip" href="#main">
        Skip to content
      </a>
      <DemoNotice variant="banner" />
      <header className="or-header">
        <div className="or-container or-nav">
          <Link href="#top" className="block" aria-label="Rapid Reply home">
            <BrandLogo className="h-8 w-auto" priority />
          </Link>
          <nav aria-label="Main navigation">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#setup">Setup</a>
          </nav>
          <div className="or-nav-cta">
            <Link className="or-nav-signin" href="/login">
              Sign in
            </Link>
            <Link className="or-button or-button-small" href="/login">
              Get started <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="or-container or-hero">
          <div className="or-hero-copy">
            <p className="or-eyebrow">Instagram automation for teams</p>
            <h1>
              Turn Instagram comments
              <br />
              into conversations.
            </h1>
            <p className="or-lead">
              Rapid Reply responds when someone comments a campaign keyword,
              so your team can deliver the right message and link without
              manual follow-up.
            </p>
            <div className="or-actions">
              <Link className="or-button or-button-primary" href="/login">
                Create your workspace <span aria-hidden="true">↗</span>
              </Link>
              <a className="or-text-link" href="#how">
                See how it works <span aria-hidden="true">↓</span>
              </a>
            </div>
            <p className="or-hero-note">
              Connect with your official Meta app. Your campaigns and account
              data stay in your workspace.
            </p>
          </div>

          <figure className="or-preview" aria-label="Example Rapid Reply campaign">
            <div className="or-preview-top">
              <span className="or-wordmark">Rapid Reply</span>
              <span className="or-mono">Campaign active</span>
            </div>
            <div className="or-preview-body">
              <div className="or-preview-heading">
                <span className="or-avatar">R</span>
                <div>
                  <strong>Riverview studio</strong>
                  <span>@riverview.studio · Instagram</span>
                </div>
                <span className="or-active">Active</span>
              </div>
              <div className="or-post">
                <span className="or-mono">Campaign: New collection</span>
                <p>
                  Comment GUIDE below
                  <br />
                  and we’ll send the link.
                </p>
                <span>Keyword: GUIDE</span>
                <div className="or-post-lines" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <div className="or-match">
                <span aria-hidden="true">↓</span>
                <span>
                  Keyword <code>GUIDE</code> matched
                </span>
                <span className="or-match-line" />
                <span>Private reply</span>
              </div>
              <div className="or-message">
                <span className="or-mono">Rapid Reply → Maya</span>
                <p>Here’s the collection guide you requested.</p>
                <span className="or-message-link">View the collection ↗</span>
              </div>
              <div className="or-delivered">
                <span aria-hidden="true">✓</span> Sent through the official
                Instagram API
              </div>
            </div>
            <figcaption>
              Build the trigger, message, and links that fit your campaign.
            </figcaption>
          </figure>
        </section>

        <div className="or-container or-principles">
          <span>Official Instagram API</span>
          <span>Background queue</span>
          <span>Delivery logs</span>
          <span>Workspace access</span>
        </div>

        <div className="or-container">
          <div className="or-sheet">
            <section id="how" className="or-section or-how">
              <div>
                <h2>How it works</h2>
                <p>
                  Create a campaign for a post, reel, or incoming direct
                  message. Rapid Reply receives the Instagram event and sends
                  your reply through the connected Meta account.
                </p>
              </div>
              <ol className="or-steps">
                <li>
                  <span className="or-step-number">01</span>
                  <div>
                    <h3>Connect Instagram</h3>
                    <p>Authorize your Business or Creator account through Meta.</p>
                  </div>
                </li>
                <li>
                  <span className="or-step-number">02</span>
                  <div>
                    <h3>Build the campaign</h3>
                    <p>Choose a trigger, add keywords, and write the message.</p>
                  </div>
                </li>
                <li>
                  <span className="or-step-number">03</span>
                  <div>
                    <h3>Track every outcome</h3>
                    <p>Monitor delivery status, replies, and link performance.</p>
                  </div>
                </li>
              </ol>
            </section>

            <section id="features" className="or-section">
              <div className="or-section-intro">
                <h2>Everything your campaign needs</h2>
              </div>
              <div className="or-feature-grid">
                {features.map(([title, description]) => (
                  <article key={title}>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="or-technical">
              <div>
                <h2>
                  Built for dependable
                  <br />
                  campaign delivery.
                </h2>
                <p>
                  Rapid Reply stores webhooks immediately, processes delivery
                  work in a background queue, and keeps campaign data,
                  operational events, and delivery history in one place.
                </p>
              </div>
              <div className="or-runtime">
                <div>
                  <span className="or-mono">Web app</span>
                  <strong>Next.js + React</strong>
                  <span>Dashboard and incoming webhooks</span>
                </div>
                <div>
                  <span className="or-mono">Worker</span>
                  <strong>Node.js + BullMQ</strong>
                  <span>Queued and rate-limited delivery</span>
                </div>
                <div>
                  <span className="or-mono">Data</span>
                  <strong>PostgreSQL + Redis</strong>
                  <span>Campaigns, accounts, logs, and queue</span>
                </div>
              </div>
            </section>

            <section id="setup" className="or-section">
              <div className="or-section-intro">
                <h2>Connect your Meta app</h2>
                <p>
                  Configure your Meta app credentials, OAuth callback, and
                  webhook URL once. Then connect each Instagram Business or
                  Creator account from Settings.
                </p>
              </div>
              <div className="or-feature-grid">
                <article>
                  <h3>Instagram Login</h3>
                  <p>Authorize the account from Settings with your Meta app.</p>
                </article>
                <article>
                  <h3>Webhook delivery</h3>
                  <p>Subscribe to Instagram events so campaign triggers arrive immediately.</p>
                </article>
                <article>
                  <h3>Operational visibility</h3>
                  <p>Use diagnostics and delivery logs to investigate any failed event.</p>
                </article>
              </div>
            </section>

            <section className="or-section or-faq">
              <div>
                <h2>FAQ</h2>
              </div>
              <div>
                <details>
                  <summary>Which Instagram accounts can I connect?</summary>
                  <p>
                    Instagram Business and Creator accounts that are authorized
                    through the official Meta API.
                  </p>
                </details>
                <details>
                  <summary>How quickly do campaigns trigger?</summary>
                  <p>
                    Webhook events are persisted as they arrive and picked up by
                    the background worker for rate-limited delivery.
                  </p>
                </details>
                <details>
                  <summary>Can my team share a workspace?</summary>
                  <p>
                    Yes. Invite members in Settings and manage their workspace
                    roles from the dashboard.
                  </p>
                </details>
              </div>
            </section>
          </div>
        </div>

        <section className="or-container or-closing">
          <h2>Launch your next Instagram campaign</h2>
          <p>Connect Instagram, create a campaign, and let Rapid Reply handle delivery.</p>
          <div className="or-actions">
            <Link className="or-button or-button-primary" href="/login">
              Get started <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="or-footer">
        <div className="or-container">
          <div className="or-footer-top">
            <div>
              <Link href="/" className="block">
                <BrandLogo className="h-8 w-auto" />
              </Link>
              <p>Instagram comment-to-DM automation for focused teams.</p>
            </div>
            <nav aria-label="Footer navigation">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/data-deletion">Data deletion</Link>
            </nav>
          </div>
          <div className="or-footer-bottom">
            <span>Rapid Reply · Instagram automation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
