export function resolveSiteUrl(siteUrl: string | undefined, vercelUrl: string | undefined): string {
  const configured = siteUrl?.trim();
  if (configured) {
    const url = new URL(configured);
    if (url.protocol !== "https:" && url.hostname !== "localhost") {
      throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS");
    }
    return url.toString().replace(/\/$/, "");
  }
  if (vercelUrl?.trim()) return `https://${vercelUrl.trim().replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  return "https://before-life.vercel.app";
}

export const siteUrl = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_URL);
