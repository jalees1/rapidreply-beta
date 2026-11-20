import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { hashPassword } from "@/lib/password";
import { ensureWorkspaceForUser } from "@/lib/workspace";
import { isEmailAllowedToSignIn } from "@/lib/env";
import { signIn } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { getCampaignTemplate } from "@/lib/templates/campaign-templates";
import { DemoNotice } from "@/components/demo-notice";
import BrandLogo from "@/components/brand-logo";
import { isPublicDemoHost } from "@/lib/env";

const GITHUB_URL = "https://github.com/diwenne/openreply";
const SETUP_DOCS_URL = `${GITHUB_URL}/blob/main/docs/setup.md`;

export async function generateMetadata() {
  const { t } = await getI18n();
  return {
    title: "Login - Rapid Reply",
    description: t("Sign in to manage Instagram comment-to-DM campaigns."),
  };
}

function safeCallback(value: string | undefined, fallback: string) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; template?: string; mode?: string; error?: string }>;
}) {
  const { t } = await getI18n();
  if (await isPublicDemoHost()) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <BrandLogo className="mx-auto h-9 w-auto" priority />
          <div className="panel rounded p-8 mt-8 shadow-black/40">
            <h2 className="text-lg font-semibold text-foreground">{t("Sign-in is off on this demo")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t("This is the public demo — it doesn’t create real accounts or send DMs. To use Rapid Reply for real, clone it and run your own instance with your own Meta app and domain.")}</p>
            <a href={SETUP_DOCS_URL} target="_blank" rel="noreferrer" className="rr-button-primary mt-6 inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white">
              {t("Clone it yourself")} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  const params = await searchParams;
  const mode = params.mode === "signup" ? "signup" : "login";
  const selectedTemplate = getCampaignTemplate(params.template);
  const templateCallbackUrl = selectedTemplate ? `/campaigns/new?template=${selectedTemplate.slug}` : null;
  const callbackUrl = safeCallback(params.callbackUrl, templateCallbackUrl ?? "/dashboard");
  const errorMessage = params.error === "invalid" ? "Invalid email or password."
    : params.error === "exists" ? "An account already exists. Sign in or use the password setup option for a verified account."
    : params.error === "password" ? "Use a password with at least 10 characters."
    : params.error === "blocked" ? "This email address is not allowed to sign in."
    : params.error === "setup" ? "Could not create your account. Please try again."
    : null;

  async function login(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const destination = safeCallback(String(formData.get("callbackUrl") ?? ""), "/dashboard");
    try {
      await signIn("credentials", { email, password, redirectTo: destination });
    } catch (error) {
      if (error instanceof AuthError) redirect(`/login?error=invalid&callbackUrl=${encodeURIComponent(destination)}`);
      throw error;
    }
  }

  async function signup(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "").trim().slice(0, 100);
    const destination = safeCallback(String(formData.get("callbackUrl") ?? ""), "/dashboard");
    if (password.length < 10) redirect(`/login?mode=signup&error=password&callbackUrl=${encodeURIComponent(destination)}`);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect("/login?mode=signup&error=setup");
    if (!isEmailAllowedToSignIn(email)) redirect("/login?mode=signup&error=blocked");

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing?.passwordHash) redirect("/login?error=exists");
      if (existing && !existing.emailVerified) redirect("/login?error=exists");

      const passwordHash = await hashPassword(password);
      const user = existing
        ? await prisma.user.update({ where: { id: existing.id }, data: { passwordHash, name: name || existing.name } })
        : await prisma.user.create({ data: { email, name: name || null, passwordHash } });
      if (existing) {
        await ensureWorkspaceForUser(user.id, user.email);
      } else {
        await prisma.workspace.create({
          data: {
            name: `${email.split("@")[0]}'s workspace`,
            ownerId: user.id,
            members: { create: { userId: user.id, role: "OWNER" } },
          },
        });
      }
      await signIn("credentials", { email, password, redirectTo: destination });
    } catch (error) {
      // Next.js redirects are thrown control-flow exceptions and must pass through.
      if (error && typeof error === "object" && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) throw error;
      console.error("[signup] account creation failed", {
        name: error instanceof Error ? error.name : "UnknownError",
        code: error && typeof error === "object" && "code" in error ? error.code : undefined,
      });
      if (error instanceof AuthError) redirect(`/login?error=setup&callbackUrl=${encodeURIComponent(destination)}`);
      redirect(`/login?mode=signup&error=setup&callbackUrl=${encodeURIComponent(destination)}`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BrandLogo className="mx-auto h-9 w-auto" priority />
          <p className="text-muted text-sm leading-relaxed mt-2">
            {selectedTemplate ? t("Sign in to use the {name} template.", { name: selectedTemplate.title }) : "Sign in to manage your Instagram campaigns."}
          </p>
        </div>
        <DemoNotice variant="panel" />
        <div className="panel rounded p-8 shadow-black/40">
          {selectedTemplate && <div className="mb-5 border border-accent/20 bg-accent/10 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-accent">Template selected</p><p className="mt-2 text-sm font-semibold text-foreground">{selectedTemplate.title}</p></div>}
          <h2 className="text-lg font-semibold mb-5">{mode === "signup" ? "Create your account" : "Sign in"}</h2>
          {errorMessage && <p role="alert" className="mb-4 rounded border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{errorMessage}</p>}
          <form action={mode === "signup" ? signup : login} className="space-y-5">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            {mode === "signup" && <div className="space-y-2"><label htmlFor="name" className="block text-sm font-medium text-foreground">Name</label><input id="name" name="name" autoComplete="name" maxLength={100} className="w-full px-4 py-3 rounded bg-surface border border-border text-sm text-foreground" /></div>}
            <div className="space-y-2"><label htmlFor="email" className="block text-sm font-medium text-foreground">{t("Work email")}</label><input id="email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" className="w-full px-4 py-3 rounded bg-surface border border-border text-sm text-foreground placeholder:text-zinc-500 focus:border-accent/40 focus:outline-none transition-colors" /></div>
            <div className="space-y-2"><label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label><input id="password" name="password" type="password" required minLength={mode === "signup" ? 10 : 1} autoComplete={mode === "signup" ? "new-password" : "current-password"} className="w-full px-4 py-3 rounded bg-surface border border-border text-sm text-foreground" />{mode === "signup" && <p className="text-xs text-muted">Use at least 10 characters.</p>}</div>
            <button type="submit" className="rr-button-primary w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white">{mode === "signup" ? "Create account" : "Sign in"}</button>
          </form>
          <p className="mt-5 text-center text-sm text-muted">{mode === "signup" ? "Already have an account?" : "New to Rapid Reply?"} <a className="text-accent hover:underline" href={`/login?mode=${mode === "signup" ? "login" : "signup"}${callbackUrl !== "/dashboard" ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}>{mode === "signup" ? "Sign in" : "Create an account"}</a></p>
        </div>
      </div>
    </div>
  );
}
