"use client";

import AccountSelect, { type AccountOption } from "@/components/account-select";
import PostPicker from "@/components/post-picker";
import { useI18n } from "@/lib/i18n/provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CampaignMediaLock {
  id: string;
  name: string;
  postId: string | null;
  isActive: boolean;
  instagramAccountId: string;
}

export default function CampaignMediaPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [accountId, setAccountId] = useState("");
  const [activeCampaignMedia, setActiveCampaignMedia] = useState<Record<string, string>>({});
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((response) => response.json())
      .then((payload) => {
        if (!payload.success) return;
        const next = payload.data.instagramAccounts ?? [];
        setAccounts(next);
        setAccountId(payload.data.selectedInstagramAccountId ?? next[0]?.id ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!accountId) return;
    setSelectedMediaId(null);
    fetch(`/api/automations?instagramAccountId=${encodeURIComponent(accountId)}`, {
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((payload) => {
        if (!payload.success) return;
        const locks: Record<string, string> = {};
        for (const campaign of payload.data as CampaignMediaLock[]) {
          if (campaign.isActive && campaign.postId) locks[campaign.postId] = campaign.name;
        }
        setActiveCampaignMedia(locks);
      })
      .catch(() => setActiveCampaignMedia({}));
  }, [accountId]);

  if (loading) return <div className="panel h-72 rounded-xl" />;

  if (!accountId) {
    return (
      <div className="panel rounded-xl p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">{t("No Instagram account connected")}</h1>
        <p className="mt-2 text-sm text-muted">{t("Connect Instagram before selecting media for a campaign.")}</p>
        <a href="/settings" className="rr-button-primary mt-5 inline-flex px-4 py-2 text-sm font-semibold text-white">
          {t("Connect Instagram")}
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t("Media library")}</h1>
          <p className="mt-1 text-sm text-muted">
            {t("Select a post or reel to start a campaign. Media with an active campaign is locked.")}
          </p>
        </div>
        {accounts.length > 1 && (
          <AccountSelect accounts={accounts} value={accountId} onChange={setAccountId} includeAll={false} />
        )}
      </div>

      <section className="panel rounded-xl p-4 sm:p-6">
        <PostPicker
          selectedPostId={selectedMediaId}
          instagramAccountId={accountId}
          activeCampaignMedia={activeCampaignMedia}
          onSelect={(id) => setSelectedMediaId(id)}
        />
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          {selectedMediaId ? t("Media selected. Continue to configure its campaign.") : t("Choose an eligible post or reel to continue.")}
        </p>
        <button
          type="button"
          disabled={!selectedMediaId}
          onClick={() => router.push(`/campaigns/new?mediaId=${encodeURIComponent(selectedMediaId ?? "")}&instagramAccountId=${encodeURIComponent(accountId)}`)}
          className="rr-button-primary inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t("Start campaign")}
        </button>
      </div>
    </div>
  );
}
