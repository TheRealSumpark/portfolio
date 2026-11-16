// Restrict document previews to this site's assets; verification may use an issuer URL.
export function safeUrl(value, baseUrl, localOnly = false) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const base = new URL(baseUrl);
    const url = new URL(value, base);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    if (localOnly && url.origin !== base.origin) return null;
    return url.href;
  } catch { return null; }
}

export function formatDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}(?:-\d{2})?$/.test(value)) return '';
  const iso = value.length === 7 ? `${value}-01` : value;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) return '';
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}
