import { decryptToken } from "@/lib/meta/oauth";

export type InstagramContext = { accessToken: string };

export type ProviderAccount = {
  accessToken: string;
};

export function hasInstagramCredentials(
  account: Pick<ProviderAccount, "accessToken">
) {
  return Boolean(account.accessToken);
}

export async function createInstagramContext(
  account: ProviderAccount
): Promise<InstagramContext> {
  return { accessToken: decryptToken(account.accessToken) };
}
