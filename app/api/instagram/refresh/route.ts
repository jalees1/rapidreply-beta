import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { decryptToken, encryptToken } from "@/lib/meta/oauth";
import {
  refreshLongLivedToken,
  subscribeInstagramAccountToWebhooks,
} from "@/lib/meta/client";
import {
  canManageWorkspace,
  getCurrentWorkspaceContext,
} from "@/lib/workspace-access";

export const runtime = "nodejs";

/** Renew a connected Instagram account's long-lived token and re-subscribe it
 * to the events Rapid Reply needs for campaign delivery. */
export async function POST(request: NextRequest) {
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!canManageWorkspace(context.role)) {
    return NextResponse.json(
      { success: false, error: "Only owners and admins can refresh accounts" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const instagramAccountId =
    typeof body.instagramAccountId === "string" ? body.instagramAccountId : null;
  if (!instagramAccountId) {
    return NextResponse.json({ success: false, error: "Instagram account is required" }, { status: 400 });
  }

  const account = await prisma.instagramAccount.findFirst({
    where: { id: instagramAccountId, workspaceId: context.workspaceId },
    select: { id: true, instagramId: true, accessToken: true },
  });
  if (!account) {
    return NextResponse.json({ success: false, error: "Instagram account was not found" }, { status: 404 });
  }

  try {
    const currentToken = decryptToken(account.accessToken);
    const refreshed = await refreshLongLivedToken(currentToken);
    const expiresAt = new Date(Date.now() + refreshed.expiresIn * 1000);

    let webhookSubscribed = true;
    try {
      await subscribeInstagramAccountToWebhooks(account.instagramId, refreshed.accessToken);
    } catch (error) {
      webhookSubscribed = false;
      console.error("[instagram] webhook resubscribe failed after token refresh", error);
    }

    await prisma.instagramAccount.update({
      where: { id: account.id },
      data: {
        accessToken: encryptToken(refreshed.accessToken),
        tokenExpiresAt: expiresAt,
        webhookSubscribed,
      },
    });

    return NextResponse.json({
      success: true,
      data: { tokenExpiresAt: expiresAt.toISOString(), webhookSubscribed },
    });
  } catch (error) {
    console.error("[instagram] token refresh failed", error);
    return NextResponse.json(
      {
        success: false,
        error: "Could not refresh this Instagram connection. Reconnect it to continue.",
      },
      { status: 502 }
    );
  }
}
