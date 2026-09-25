// Server-only configuration. Local Turnstile test keys must never activate production.
export function getContactConfig() {
  const webhook = process.env.GOOGLE_APPS_SCRIPT_URL?.trim();
  const secret = process.env.GOOGLE_APPS_SCRIPT_SECRET?.trim();
  const captchaSecret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const usesTestKeys = [captchaSecret, siteKey].some(key => key && /^[123]x0+/.test(key));
  if (!webhook || !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(webhook) ||
      !secret || secret.length < 32 || !captchaSecret || !siteKey ||
      (process.env.NODE_ENV === 'production' && usesTestKeys)) return null;
  return {webhook, secret, captchaSecret};
}
