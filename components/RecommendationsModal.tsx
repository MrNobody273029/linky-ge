'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card } from '@/components/ui';
import { BRAND_SOURCES, BrandSource, SourceSite } from '@/lib/brandSources';

function normalize(s: string) {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function extractQueryFromUrl(productUrl: string) {
  try {
    const u = new URL(productUrl);

    const last = u.pathname.split('/').filter(Boolean).pop() || '';
    const cleaned = last.replace(/\.(html|htm|php)$/i, '');
    const decoded = decodeURIComponent(cleaned).replace(/[-_]+/g, ' ');
    const noIds = decoded.replace(/\b\d{3,}\b/g, '').replace(/\s+/g, ' ').trim();

    const junk = ['drugdet', 'product', 'item', 'detail', 'det', 'view', 'index'];
    const isJunk = junk.includes(normalize(noIds));

    if (noIds && !isJunk) return noIds;
    return productUrl;
  } catch {
    return productUrl;
  }
}

// Georgian unicode block: \u10A0-\u10FF
function stripGeorgian(text: string) {
  return text.replace(/[\u10A0-\u10FF]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractMl(text: string): string | null {
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*(ml|mL|ML|მლ)\b/);
  if (!m) return null;
  const n = m[1].replace(',', '.');
  return `${n} ml`;
}

function keepSearchSafe(text: string) {
  return text.replace(/[^a-zA-Z0-9\s.+-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function detectBrandFromText(text: string): BrandSource | null {
  const t = normalize(text);

  for (const key of Object.keys(BRAND_SOURCES)) {
    const b = BRAND_SOURCES[key];
    if (normalize(b.brand) && t.includes(normalize(b.brand))) return b;
  }

  for (const key of Object.keys(BRAND_SOURCES)) {
    const b = BRAND_SOURCES[key];
    for (const a of b.aliases || []) {
      if (a && t.includes(normalize(a))) return b;
    }
  }

  return null;
}

function googleSiteLink(site: string, query: string) {
  const q = `site:${site} "${query}"`;
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

function buildQueries(rawText: string, brandHit: BrandSource | null) {
  const ml = extractMl(rawText);

  const fullRaw = rawText.trim();

  const noKa = stripGeorgian(rawText);
  const cleaned = keepSearchSafe(noKa);

  const primary = cleaned.length >= 6 ? cleaned : keepSearchSafe(fullRaw);

  const brand = brandHit?.brand ?? null;
  const brandQuery = brand ? `${brand}${ml ? ` ${ml}` : ''}` : null;

  return { fullRaw, primary, brandQuery, ml };
}

const SITE_PRIORITY: string[] = [
  'easypara.fr',
  'cocooncenter.com',
  'santediscount.com',

  'farmae.it',
  'amicafarmacia.com',
  '1000farmacie.it',

  'shop-apotheke.com',
  'docmorris.de',
  'medpex.de',

  'dm.de',
  'rossmann.de',

  'mifarma.eu',
  'atida.com',
  'promofarma.com',

  'notino.com',
  'douglas.de'
];

function priorityIndex(domain: string) {
  const i = SITE_PRIORITY.indexOf(domain);
  return i === -1 ? 9999 : i;
}

function collectAllSitesFromDictionary(): SourceSite[] {
  const map = new Map<string, SourceSite>();

  for (const key of Object.keys(BRAND_SOURCES)) {
    const b = BRAND_SOURCES[key];
    const list = [...(b.primary || []), ...(b.backup || [])];

    for (const s of list) {
      const existing = map.get(s.site);
      if (!existing) map.set(s.site, s);
    }
  }

  const arr = Array.from(map.values());
  arr.sort((a, b) => {
    const da = priorityIndex(a.site);
    const db = priorityIndex(b.site);
    if (da !== db) return da - db;
    return a.site.localeCompare(b.site);
  });

  return arr;
}

function siteHomeUrl(site: string) {
  return `https://${site}/`;
}

function looksUselessQuery(q: string) {
  const n = normalize(q);
  if (!n) return true;
  if (n === 'drugdet') return true;
  if (n.length < 4) return true;
  return false;
}

type ParsedProduct = {
  ok: boolean;
  title?: string | null;
  brand?: string | null;
  query?: string | null;
  from?: 'url' | 'site';
  debug?: string[];
};

export function RecommendationsModal({
  locale,
  productUrl,
  onClose
}: {
  locale: string;
  productUrl: string;
  onClose: () => void;
}) {
  const title = locale === 'ka' ? 'რეკომენდაციები' : 'Recommendations';

  // 1) URL-based extraction
  const rawFromUrl = useMemo(() => extractQueryFromUrl(productUrl), [productUrl]);
  const urlBrandHit = useMemo(() => detectBrandFromText(rawFromUrl), [rawFromUrl]);

  // 2) Site parse if needed
  const [siteParsed, setSiteParsed] = useState<ParsedProduct | null>(null);
  const [parseLoading, setParseLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const need =
        !urlBrandHit ||
        looksUselessQuery(rawFromUrl) ||
        normalize(rawFromUrl).includes('http') ||
        normalize(rawFromUrl) === normalize(productUrl);

      if (!need) {
        setSiteParsed(null);
        return;
      }

      setParseLoading(true);
      try {
        const res = await fetch('/api/admin/parse-product', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ url: productUrl })
        });

        const j = (await res.json().catch(() => null)) as ParsedProduct | null;
        if (cancelled) return;
        setSiteParsed(j && typeof j === 'object' ? j : { ok: false });
      } catch {
        if (cancelled) return;
        setSiteParsed({ ok: false });
      } finally {
        if (!cancelled) setParseLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [productUrl, rawFromUrl, urlBrandHit]);

  // best raw text for matching/search queries
  const bestRawText = useMemo(() => {
    const candidate = siteParsed?.ok ? (siteParsed.query || siteParsed.title || siteParsed.brand) : null;
    const c = (candidate || '').trim();
    if (c && c.length >= 4) return c;
    return rawFromUrl;
  }, [rawFromUrl, siteParsed]);

  // dictionary match (brand)
  const finalBrandHit = useMemo(() => detectBrandFromText(bestRawText) || urlBrandHit, [bestRawText, urlBrandHit]);

  // build queries for "found" path
  const { fullRaw, primary, brandQuery } = useMemo(
    () => buildQueries(bestRawText, finalBrandHit),
    [bestRawText, finalBrandHit]
  );

  // Determine fallback/extraction display
  const extractedBrand = useMemo(() => (siteParsed?.ok ? (siteParsed.brand || '').trim() : ''), [siteParsed]);
  const extractedTitle = useMemo(() => (siteParsed?.ok ? (siteParsed.title || '').trim() : ''), [siteParsed]);
  const hasExtracted = !!(extractedBrand || extractedTitle);

  // BRAND FOUND => show google site links like before
  const sites = useMemo(() => {
    if (!finalBrandHit) return [];
    return [...finalBrandHit.primary, ...(finalBrandHit.backup || [])].slice(0, 8);
  }, [finalBrandHit]);

  const linksPrimary = useMemo(() => {
    if (!finalBrandHit) return [];
    return sites.map((s) => ({
      key: `${s.site}-primary`,
      site: s.site,
      label: s.label,
      url: googleSiteLink(s.site, primary)
    }));
  }, [finalBrandHit, primary, sites]);

  const linksBrand = useMemo(() => {
    if (!finalBrandHit || !brandQuery) return [];
    return sites.map((s) => ({
      key: `${s.site}-brand`,
      site: s.site,
      label: s.label,
      url: googleSiteLink(s.site, brandQuery)
    }));
  }, [finalBrandHit, brandQuery, sites]);

  // fallback dropdown (dictionary not found)
  const allSites = useMemo(() => collectAllSitesFromDictionary(), []);
  const [fallbackSite, setFallbackSite] = useState<string>('');
  const fallbackSelected = useMemo(() => allSites.find((x) => x.site === fallbackSite) ?? null, [allSites, fallbackSite]);
  const fallbackHome = fallbackSelected ? siteHomeUrl(fallbackSelected.site) : '';

  // "hard" not found = dictionary match missing
  const hardNotFound = !finalBrandHit;

  const subtitle = useMemo(() => {
    if (!hardNotFound) {
      return locale === 'ka'
        ? 'ბრენდის მიხედვით გირჩევ საიტებს და გაძლევს Google site: ძებნას.'
        : 'Chooses sites by brand and generates Google site-search links.';
    }

    if (parseLoading) {
      return locale === 'ka'
        ? 'ვცდილობთ ამ ლინკის საიტიდან ბრენდის/სახელის ამოღებას…'
        : 'Trying to extract brand/title from the site…';
    }

    if (hasExtracted) {
      return locale === 'ka'
        ? 'ბრენდი ლექსიკონში ვერ მოიძებნა, მაგრამ საიტიდან ამოვიღეთ ინფორმაცია.'
        : 'Brand not in dictionary, but we extracted info from the site.';
    }

    return locale === 'ka'
      ? 'ვერ ამოვიცანით ბრენდი — აირჩიე საიტი და შედი პირდაპირ.'
      : "We couldn't detect the brand — choose a site and open it directly.";
  }, [hardNotFound, locale, parseLoading, hasExtracted]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-2 md:items-center md:p-6"
      onClick={onClose}
    >
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <Card className="overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between border-b border-border p-4 md:p-5">
            <div className="min-w-0">
              <div className="text-lg font-black">{title}</div>
              <div className="mt-1 text-sm text-muted">{subtitle}</div>
            </div>

            <Button variant="secondary" onClick={onClose} className="shrink-0">
              {locale === 'ka' ? 'დახურვა' : 'Close'}
            </Button>
          </div>

          <div className="p-4 md:p-6 space-y-4">
            {/* Link card */}
            <div className="rounded-2xl border border-border bg-card/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-muted">{locale === 'ka' ? 'მომხმარებლის ლინკი' : 'User link'}</div>
                  <div className="mt-1 break-all text-sm font-semibold">{productUrl}</div>
                </div>
                <a
                  href={productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-card/60 px-4 text-sm font-semibold hover:bg-card/80"
                >
                  {locale === 'ka' ? 'გახსნა' : 'Open'}
                </a>
              </div>

              {/* tiny status */}
              {hardNotFound ? (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                  <span className={['inline-flex h-2 w-2 rounded-full', parseLoading ? 'bg-warning/80' : hasExtracted ? 'bg-success/80' : 'bg-warning/80'].join(' ')} />
                  <span>
                    {parseLoading
                      ? locale === 'ka'
                        ? 'საიტიდან ამოღება მიმდინარეობს…'
                        : 'Site extraction in progress…'
                      : hasExtracted
                        ? locale === 'ka'
                          ? 'საიტიდან ინფორმაცია ამოვიღეთ, მაგრამ ლექსიკონში ვერ მოიძებნა.'
                          : 'Extracted info, but not found in dictionary.'
                        : locale === 'ka'
                          ? 'საიტიდან ამოღება ვერ მოხერხდა ან ინფორმაცია არ იძებნება.'
                          : 'Could not extract or info not available.'}
                  </span>
                </div>
              ) : siteParsed?.ok ? (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted">
                  <span className="inline-flex h-2 w-2 rounded-full bg-success/80" />
                  <span>{locale === 'ka' ? 'ბონუსი: საიტიდან ამოღებული ტექსტიც გამოვიყენეთ.' : 'Bonus: used extracted site text.'}</span>
                </div>
              ) : null}
            </div>

            {/* =========================
                DICTIONARY NOT FOUND → show extracted brand/title (if any) + dropdown + open site
               ========================= */}
            {hardNotFound ? (
              <div className="rounded-2xl border border-border bg-card/30 p-4 space-y-3">
                {/* ✅ show extracted info (NO LINKS) */}
                {hasExtracted ? (
                  <div className="rounded-2xl border border-border bg-card/40 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-muted">{locale === 'ka' ? 'ამოღებული ინფორმაცია' : 'Extracted info'}</div>

                        {extractedBrand ? (
                          <div className="mt-2 text-sm">
                            <span className="text-xs font-semibold text-muted">{locale === 'ka' ? 'ბრენდი: ' : 'Brand: '}</span>
                            <span className="font-semibold">{extractedBrand}</span>
                          </div>
                        ) : null}

                        {extractedTitle ? (
                          <div className="mt-2 text-sm">
                            <span className="text-xs font-semibold text-muted">{locale === 'ka' ? 'პროდუქტი: ' : 'Product: '}</span>
                            <span className="font-semibold break-words">{extractedTitle}</span>
                          </div>
                        ) : null}
                      </div>

                      <span className="inline-flex w-fit rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                        {locale === 'ka' ? 'ამოღებულია' : 'Extracted'}
                      </span>
                    </div>

                    <div className="mt-3 text-xs text-muted">
                      {locale === 'ka'
                        ? 'შენიშვნა: ლექსიკონში ამ ბრენდის დამატების შემდეგ უკვე ავტომატურად გაჩვენებს რეკომენდაციებს/ძიების ლინკებს.'
                        : 'Note: add this brand to your dictionary to enable recommendations/links.'}
                    </div>
                  </div>
                ) : null}

                {/* dropdown + open site */}
                <div className="rounded-2xl border border-border bg-card/40 p-3">
                  <div className="text-xs font-semibold text-muted">{locale === 'ka' ? 'აირჩიე საიტი' : 'Choose a site'}</div>

                  <select
                    className="mt-2 h-12 w-full rounded-xl border border-border bg-card/70 px-4 text-sm outline-none"
                    value={fallbackSite}
                    onChange={(e) => setFallbackSite(e.target.value)}
                  >
                    <option value="">{locale === 'ka' ? 'აირჩიე საიტი…' : 'Select a site…'}</option>
                    {allSites.map((s) => (
                      <option key={s.site} value={s.site}>
                        {s.label} — {s.site}
                      </option>
                    ))}
                  </select>

                  <a
                    href={fallbackSelected ? fallbackHome : undefined}
                    target="_blank"
                    rel="noreferrer"
                    className={[
                      'mt-3 flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm font-semibold transition',
                      fallbackSelected
                        ? 'bg-success/15 text-success hover:bg-success/20'
                        : 'bg-card/20 text-muted pointer-events-none opacity-60'
                    ].join(' ')}
                  >
                    <span>{locale === 'ka' ? 'შედი საიტზე' : 'Open site'}</span>
                    <span className="text-xs">{fallbackSelected ? fallbackSelected.site : '—'}</span>
                  </a>
                </div>

                <div className="text-xs text-muted">
                  {locale === 'ka'
                    ? 'თუ ლინკი მხოლოდ ID-ითაა (მაგ: MatID=...), URL-დან ვერ ვიგებთ სახელს/ბრენდს. ამ შემთხვევაში უბრალოდ შედი საიტზე და ხელით მოძებნე.'
                    : 'If the link is ID-based (e.g. MatID=...), URL won’t contain brand/title. Open a site and search manually.'}
                </div>
              </div>
            ) : (
              <>
                {/* Brand found → old logic (with nicer UI) */}
                <div className="rounded-2xl border border-border bg-card/30 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-muted">{locale === 'ka' ? 'ბრენდი' : 'Brand'}</div>
                      <div className="mt-1 text-sm font-semibold">{`${finalBrandHit!.brand} (${finalBrandHit!.country})`}</div>

                      {siteParsed?.ok && siteParsed.title ? (
                        <div className="mt-1 text-xs text-muted line-clamp-2">
                          {locale === 'ka' ? 'საიტიდან: ' : 'From site: '}
                          <span className="font-semibold text-fg">{siteParsed.title}</span>
                        </div>
                      ) : null}
                    </div>

                    <span className="inline-flex w-fit rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                      {locale === 'ka' ? 'ნაპოვნია' : 'Detected'}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-card/40 p-3">
                      <div className="text-xs font-semibold text-muted">
                        {locale === 'ka' ? 'ძიების ტექსტი (გაწმენდილი)' : 'Query (cleaned)'}
                      </div>
                      <div className="mt-1 text-sm font-semibold break-words">{primary}</div>
                    </div>

                    <div className="rounded-2xl border border-border bg-card/40 p-3">
                      <div className="text-xs font-semibold text-muted">
                        {locale === 'ka' ? 'Fallback (სრული ტექსტი)' : 'Fallback (full text)'}
                      </div>
                      <div className="mt-1 text-sm font-semibold break-words">{fullRaw}</div>
                    </div>
                  </div>

                  {brandQuery ? (
                    <div className="mt-3 rounded-2xl border border-border bg-card/40 p-3">
                      <div className="text-xs font-semibold text-muted">
                        {locale === 'ka' ? 'ალტერნატივა: ბრენდი + ml' : 'Alternative: brand + ml'}
                      </div>
                      <div className="mt-1 text-sm font-semibold break-words">{brandQuery}</div>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-black">{locale === 'ka' ? 'ძიება საიტებზე' : 'Search on sites'}</div>
                      <div className="text-xs text-muted">{locale === 'ka' ? 'Google site:' : 'Google site:'}</div>
                    </div>

                    <div className="mt-2 space-y-2">
                      {linksPrimary.map((l) => (
                        <a
                          key={l.key}
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-center justify-between rounded-2xl border border-border bg-card/40 px-4 py-3 text-sm font-semibold hover:bg-card/60 transition"
                        >
                          <span className="truncate">{l.label}</span>
                          <span className="text-xs text-muted group-hover:text-fg">{l.site}</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  {linksBrand.length ? (
                    <div>
                      <div className="text-sm font-black">{locale === 'ka' ? 'ალტერნატივა (ბრენდი + ml)' : 'Alternative (brand + ml)'}</div>
                      <div className="mt-2 space-y-2">
                        {linksBrand.map((l) => (
                          <a
                            key={l.key}
                            href={l.url}
                            target="_blank"
                            rel="noreferrer"
                            className="group flex items-center justify-between rounded-2xl border border-border bg-card/40 px-4 py-3 text-sm font-semibold hover:bg-card/60 transition"
                          >
                            <span className="truncate">{l.label}</span>
                            <span className="text-xs text-muted group-hover:text-fg">{l.site}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </>
            )}

            <div className="rounded-2xl border border-border bg-card/20 p-3 text-xs text-muted">
              {locale === 'ka'
                ? 'თუ PSP/GPC/AVERSI ლინკში ბრენდი ქართულადაა და ვერ დაიჭირა — დაამატე aliases-ში ქართული ვარიანტიც.'
                : 'If the brand is in a local language and not detected, add that variant to aliases.'}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
