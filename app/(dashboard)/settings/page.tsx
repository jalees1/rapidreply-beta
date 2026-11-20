"use client";

import LanguageSwitcher from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n/provider";
import { Suspense, useEffect, useState } from "react";
import type { AccountOption } from "@/components/account-select";
import { InstagramConnectNotice } from "@/components/instagram-connect-notice";

interface SettingsData {
  workspace: {
    name: string;
    dmsSentThisPeriod: number;
  };
  instagramAccount: {
    id: string;
    username: string;
    instagramId: string;
    tokenExpiresAt: string | null;
    webhookSubscribed: boolean;
  } | null;
  instagramAccounts: Array<
    AccountOption & {
      tokenExpiresAt: string | null;
      webhookSubscribed: boolean;
    }
  >;
}

interface WorkspaceMembersData {
  currentUserRole: "OWNER" | "ADMIN" | "MEMBER";
  members: Array<{
    id: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    createdAt: string;
    user: {
      id: string;
      email: string | null;
      name: string | null;
    };
  }>;
  invitations: Array<{
    id: string;
    email: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    inviteUrl: string;
    expiresAt: string;
  }>;
}

export default function SettingsPage() {
  const { t, label, locale } = useI18n();
  const [data, setData] = useState<SettingsData | null>(null);
  const [membersData, setMembersData] = useState<WorkspaceMembersData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [memberError, setMemberError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/stats").then((res) => res.json()),
      fetch("/api/workspace/members").then((res) => res.json()),
    ])
      .then(([statsPayload, membersPayload]) => {
        if (statsPayload.success) setData(statsPayload.data);
        if (membersPayload.success) setMembersData(membersPayload.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function refreshMembers() {
    const res = await fetch("/api/workspace/members");
    const payload = await res.json();
    if (payload.success) setMembersData(payload.data);
  }

  async function disconnectInstagram(instagramAccountId: string) {
    if (!confirm(t("Disconnect Instagram? Campaigns for this account will stop sending DMs."))) {
      return;
    }

    setBusy(`disconnect:${instagramAccountId}`);
    await fetch("/api/instagram/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instagramAccountId }),
    });
    window.location.reload();
  }

  async function refreshInstagram(instagramAccountId: string) {
    setConnectionError(null);
    setBusy(`refresh:${instagramAccountId}`);
    try {
      const response = await fetch("/api/instagram/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instagramAccountId }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        setConnectionError(payload.error ?? t("Could not refresh the Instagram connection."));
        return;
      }
      window.location.reload();
    } catch {
      setConnectionError(t("Could not refresh the Instagram connection."));
    } finally {
      setBusy(null);
    }
  }

  async function inviteMember(event: React.FormEvent) {
    event.preventDefault();
    setMemberError(null);
    setBusy("invite");
    const res = await fetch("/api/workspace/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    const payload = await res.json();
    if (payload.success) {
      setMembersData(payload.data);
      setInviteEmail("");
    } else {
      setMemberError(payload.error ?? t("Could not invite member"));
    }
    setBusy(null);
  }

  async function removeInvitation(invitationId: string) {
    setBusy(`invite:${invitationId}`);
    await fetch("/api/workspace/members", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invitationId }),
    });
    await refreshMembers();
    setBusy(null);
  }

  if (loading) {
    return <div className="panel rounded p-8 h-64" />;
  }

  const accounts = data?.instagramAccounts ?? [];
  const canManageMembers =
    membersData?.currentUserRole === "OWNER" ||
    membersData?.currentUserRole === "ADMIN";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Surfaces the ?instagram= code the OAuth routes redirect back with.
          Needs a Suspense boundary: useSearchParams in a prerendered client
          page fails the production build without one. */}
      <Suspense fallback={null}>
        <InstagramConnectNotice />
      </Suspense>

      <section className="panel rounded p-4 sm:p-6 space-y-3">
        <h2 className="text-base font-semibold">{t("Interface language")}</h2>
        <LanguageSwitcher />
        <p className="text-sm text-muted">{t("Saved in this browser. Campaign messages stay unchanged.")}</p>
      </section>

      <section className="panel rounded p-4 sm:p-6">
        <h2 className="text-base font-semibold mb-6">{t("Instagram Connection")}</h2>

        {connectionError && (
          <p role="alert" className="mb-4 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
            {connectionError}
          </p>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">{t("Status")}</p>
              <p className="text-xs text-muted mt-0.5">
                {t("Comment webhooks and private replies depend on this connection.")}
              </p>
            </div>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                accounts.length > 0
                  ? "bg-success/10 text-success"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {accounts.length > 0 ? t("Connected") : t("Not connected")}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 py-3 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">{t("Accounts")}</p>
              <p className="text-xs text-muted mt-0.5">
                {t(accounts.length === 1 ? "{count} connected Instagram profile" : "{count} connected Instagram profiles", { count: accounts.length })}
              </p>
            </div>
            <span className="text-sm text-muted">
              {accounts.length > 0 ? t("{count} connected", { count: accounts.length }) : t("None")}
            </span>
          </div>

          <div className="space-y-3 py-3">
            {accounts.length === 0 && (
              <p className="text-sm text-muted">
                {t("Connect an Instagram professional account to launch campaigns.")}
              </p>
            )}
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    @{account.username}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {t("Token expires")} {account.tokenExpiresAt
                      ? new Date(account.tokenExpiresAt).toLocaleDateString(locale)
                      : t("not available")} {" "}
                    · {account.webhookSubscribed ? t("Webhook ready") : t("Webhook pending")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => void refreshInstagram(account.id)}
                    disabled={busy === `refresh:${account.id}` || busy === `disconnect:${account.id}`}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
                  >
                    {busy === `refresh:${account.id}`
                      ? t("Refreshing...")
                      : t("Refresh connection")}
                  </button>
                  <button
                    onClick={() => disconnectInstagram(account.id)}
                    disabled={busy === `disconnect:${account.id}` || busy === `refresh:${account.id}`}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-error/20 px-4 py-2 text-sm font-medium text-error transition-all hover:border-error/40 hover:bg-error/10 disabled:opacity-50"
                  >
                    {busy === `disconnect:${account.id}`
                      ? t("Disconnecting...")
                      : t("Disconnect")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {accounts.length === 0 && (
          <div className="mt-6 border-t border-border pt-4">
            <a
              href="/api/instagram/connect"
              className="rr-button-primary inline-flex px-4 py-2 text-sm font-semibold text-white"
            >
              {t("Connect Instagram")}
            </a>
          </div>
        )}
      </section>

      <section className="panel rounded p-4 sm:p-6">
        <h2 className="text-base font-semibold mb-6">{t("Team")}</h2>
        <div className="space-y-3">
          {membersData?.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {member.user.name ?? member.user.email ?? t("Unknown member")}
                </p>
                <p className="text-xs text-muted">{member.user.email}</p>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted">
                {label(member.role)}
              </span>
            </div>
          ))}
        </div>

        {membersData?.invitations.length ? (
          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              {t("Pending invites")}
            </p>
            <div className="space-y-3">
              {membersData.invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {invitation.email}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {label(invitation.role)} · {invitation.inviteUrl}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        void navigator.clipboard?.writeText(invitation.inviteUrl)
                      }
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-border-hover hover:text-foreground"
                    >
                      {t("Copy")}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeInvitation(invitation.id)}
                      disabled={busy === `invite:${invitation.id}`}
                      className="rounded-lg border border-error/20 px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error/10 disabled:opacity-50"
                    >
                      {t("Revoke")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {canManageMembers && (
          <form
            onSubmit={inviteMember}
            className="mt-6 grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_140px_auto]"
          >
            <input
              type="email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="teammate@agency.com"
              className="rounded border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent/40"
              required
            />
            <select
              value={inviteRole}
              onChange={(event) =>
                setInviteRole(event.target.value as "ADMIN" | "MEMBER")
              }
              className="rounded border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent/40"
            >
              <option value="MEMBER">{t("Member")}</option>
              <option value="ADMIN">{t("Admin")}</option>
            </select>
            <button
              type="submit"
              disabled={busy === "invite"}
              className="rr-button-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy === "invite" ? t("Inviting...") : t("Invite")}
            </button>
            {memberError && (
              <p className="sm:col-span-3 text-sm text-error">{memberError}</p>
            )}
          </form>
        )}
      </section>

      <section className="panel rounded p-4 sm:p-6">
        <h2 className="text-base font-semibold mb-6">{t("Usage")}</h2>
        <div className="flex items-center justify-between gap-3 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {t("DMs sent this month")}
            </p>
            <p className="text-xs text-muted mt-0.5">
              {t("Self-hosted — no plan limits.")}
            </p>
          </div>
          <span className="text-sm font-semibold text-foreground">
            {data?.workspace.dmsSentThisPeriod ?? 0}
          </span>
        </div>
      </section>
    </div>
  );
}
