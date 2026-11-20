"use client";

/* eslint-disable @next/next/no-img-element */

/**
 * Post Picker
 *
 * Grid of Instagram post thumbnails, selectable.
 * Fetches from /api/instagram/posts.
 */

import { useI18n } from "@/lib/i18n/provider";
import { useEffect, useState } from "react";
import { readCache, writeCache } from "@/lib/client-cache";

const PAGE_SIZE = 60;

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: string;
  media_product_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp: string;
}

interface PostPickerProps {
  selectedPostId: string | null;
  instagramAccountId?: string | null;
  /** media ID -> active campaign name. These media cannot receive another active campaign. */
  activeCampaignMedia?: Record<string, string>;
  onSelect: (
    postId: string,
    postUrl?: string,
    thumbUrl?: string,
    caption?: string
  ) => void;
}

export default function PostPicker({
  selectedPostId,
  instagramAccountId,
  activeCampaignMedia,
  onSelect,
}: PostPickerProps) {
  const { t } = useI18n();
  const [limitations, setLimitations] = useState<string[]>([]);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  // The post currently hovered — its video (if it's a reel) plays a preview.
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // The grid loads the whole library (all=true). On accounts with hundreds of
  // posts, rendering every tile at once is enough to make mobile Safari drop
  // the page, so they are revealed in batches.
  const [shown, setShown] = useState(PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (instagramAccountId) {
      params.set("instagramAccountId", instagramAccountId);
    }
    // Load the full library so older posts/reels are selectable, not just the
    // most recent page.
    params.set("all", "true");

    // Show the cached library instantly (stale-while-revalidate), then refresh.
    const cacheKey = `ig-posts:${instagramAccountId ?? "default"}`;
    const cached = readCache<InstagramPost[]>(cacheKey, 15 * 60 * 1000);
    // Hydrating state from cache is a legitimate effect use here.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (cached.data) {
      setPosts(cached.data);
      setLoading(false);
    }
    /* eslint-enable react-hooks/set-state-in-effect */

    fetch(`/api/instagram/posts${params.size ? `?${params}` : ""}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          setPosts(data.data);
          setLimitations(data.limitations ?? []);
          writeCache(cacheKey, data.data);
        } else if (!cached.data) {
          setError(data.error ?? "Failed to load posts");
        }
      })
      .catch(() => {
        if (!cancelled && !cached.data) setError("Failed to load posts");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [instagramAccountId]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square rounded bg-surface" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted">{error === "Failed to load posts" ? t("Failed to load posts") : error}</p>
        <p className="text-xs text-zinc-500 mt-1">{t("Connect your Instagram account first")}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted">{t("No account media found")}</p>
      </div>
    );
  }

  const matching = query.trim()
    ? posts.filter((p) =>
        (p.caption ?? "").toLowerCase().includes(query.trim().toLowerCase())
      )
    : posts;

  const visible = matching.slice(0, shown);
  const remaining = matching.length - visible.length;

  return (
    <div className="space-y-2">
      {limitations.map(note => <p key={note} className="text-xs text-muted">{note}</p>)}
      <div className="flex items-center justify-between gap-2">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            // Back to one batch on every new search. Without this, a grid
            // expanded under an earlier query stays expanded once it is
            // cleared, which is the case this whole change exists to avoid.
            setShown(PAGE_SIZE);
          }}
          placeholder={t("Search account media by caption…")}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-zinc-500 focus:border-accent/40 focus:outline-none"
        />
        <span className="shrink-0 text-xs text-muted">{posts.length}</span>
      </div>
      {visible.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          {t("No media matches “")}{query}{t("”")}
        </p>
      ) : (
        <>
          {activeCampaignMedia && Object.keys(activeCampaignMedia).length > 0 && (
            <p className="flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-2 text-[11px] text-blue-800">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-700" />
              {t("Media with an active campaign is locked. Pause or delete that campaign to use it again.")}
            </p>
          )}
          {/* auto-rows-min + content-start keep each row at its natural height.
              Without them the rows share out max-h-64 instead of scrolling, and
              the square thumbnails flatten into strips. */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 auto-rows-min content-start overflow-y-auto p-1">
            {visible.map((post) => {
              const isSelected = selectedPostId === post.id;
              const activeCampaignName = activeCampaignMedia?.[post.id];
              const isClaimed = Boolean(activeCampaignName) && !isSelected;
              const isStory = post.media_product_type === "STORY";
              const isUnavailable = isClaimed || isStory;
              const thumb = post.thumbnail_url ?? post.media_url;
              const isVideo = post.media_type === "VIDEO";
              const mediaLabel = post.media_product_type === "STORY"
                ? t("Story")
                : post.media_product_type === "REELS"
                  ? t("Reel")
                  : post.media_type === "CAROUSEL_ALBUM"
                    ? t("Carousel")
                    : isVideo
                      ? t("Video")
                      : t("Post");
              const showVideo =
                isVideo && hoveredId === post.id && Boolean(post.media_url);
              return (
          <button
            key={post.id}
            type="button"
            onClick={() => {
              if (!isUnavailable) onSelect(post.id, post.permalink, thumb, post.caption);
            }}
            onMouseEnter={() => setHoveredId(post.id)}
            onMouseLeave={() =>
              setHoveredId((cur) => (cur === post.id ? null : cur))
            }
            aria-pressed={isSelected}
            aria-disabled={isUnavailable}
            disabled={isUnavailable}
            title={isClaimed && activeCampaignName ? t("Active campaign: {name}", { name: activeCampaignName }) : isStory ? t("Stories do not support comment triggers") : undefined}
            className={`
              relative aspect-square rounded overflow-hidden border-2 text-left
              ${
                isSelected
                  ? "border-accent"
                  : isUnavailable
                    ? "cursor-not-allowed border-slate-300 bg-slate-100"
                    : "border-border hover:border-border-hover"
              }
            `}
          >
            {thumb ? (
              <img
                src={thumb}
                alt={post.caption?.slice(0, 50) ?? t("Instagram post")}
                loading="lazy"
                decoding="async"
                className={`h-full w-full object-cover ${isUnavailable ? "opacity-30 grayscale" : ""}`}
              />
            ) : (
              <div className="w-full h-full bg-surface flex items-center justify-center">
                <span className="text-xs text-muted">{t("No image")}</span>
              </div>
            )}
            {showVideo && (
              <video
                src={post.media_url}
                poster={thumb}
                autoPlay
                muted
                loop
                playsInline
                preload="none"
                className={`absolute inset-0 h-full w-full object-cover ${
                  isUnavailable ? "opacity-60" : ""
                }`}
              />
            )}
            {isSelected && (
              <span className="absolute bottom-0 inset-x-0 bg-accent text-white text-xs py-1">
                {t("Selected")}
              </span>
            )}
            {isClaimed && (
              <span className="absolute inset-1 flex flex-col items-center justify-center rounded bg-slate-950/75 px-2 text-center text-white">
                <LockIcon />
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide">{t("Campaign active")}</span>
                <span className="mt-0.5 line-clamp-2 text-[10px] text-slate-200">{activeCampaignName}</span>
              </span>
            )}
            {isStory && (
              <span className="absolute left-1 top-1 rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {mediaLabel}
              </span>
            )}
            {!isStory && (
              <span className="absolute left-1 top-1 rounded bg-slate-950/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {mediaLabel}
              </span>
            )}
          </button>
              );
            })}
          </div>
          {remaining > 0 && (
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE_SIZE)}
              className="w-full rounded-lg border border-border py-2 text-sm text-muted hover:text-foreground"
            >
              {t("Show")} {Math.min(PAGE_SIZE, remaining)} {t("more")}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
