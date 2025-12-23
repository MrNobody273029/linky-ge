import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function safeText(s: unknown) {
  return typeof s === 'string' ? s.trim() : '';
}

function decodeHtmlEntities(input: string) {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function pickMeta(html: string, attr: 'property' | 'name', key: string) {
  // very small + fast regex approach (good enough for MVP)
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    'i'
  );
  const m = html.match(re);
  return m?.[1] ? decodeHtmlEntities(m[1]) : '';
}

function pickTitle(html: string) {
  const m = html.match(/<title[^>]*>([^<]{2,300})<\/title>/i);
  return m?.[1] ? decodeHtmlEntities(m[1]) : '';
}

function extractJsonLdBlocks(html: string): any[] {
  const out: any[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null = null;
  while ((m = re.exec(html))) {
    const raw = (m[1] || '').trim();
    if (!raw) continue;
    try {
      // some sites include multiple JSON objects or invalid trailing commas; keep it simple
      const parsed = JSON.parse(raw);
      out.push(parsed);
    } catch {
      // ignore
    }
  }
  return out;
}

function findProductFromJsonLd(block: any): { title?: string; brand?: string } | null {
  if (!block) return null;

  // Sometimes array
  if (Array.isArray(block)) {
    for (const x of block) {
      const hit = findProductFromJsonLd(x);
      if (hit) return hit;
    }
    return null;
  }

  // Sometimes graph
  if (block['@graph'] && Array.isArray(block['@graph'])) {
    for (const x of block['@graph']) {
      const hit = findProductFromJsonLd(x);
      if (hit) return hit;
    }
  }

  const type = block['@type'];
  const isProduct = type === 'Product' || (Array.isArray(type) && type.includes('Product'));
  if (isProduct) {
    const name = safeText(block.name);
    const brand =
      safeText(block.brand?.name) || safeText(block.brand) || safeText(block.manufacturer?.name) || '';
    return { title: name || undefined, brand: brand || undefined };
  }

  return null;
}

function normalizeSpaces(s: string) {
  return s.replace(/\s+/g, ' ').trim();
}

function buildQuery(title: string, brand: string) {
  const t = normalizeSpaces(title);
  const b = normalizeSpaces(brand);

  // if brand not present but title includes it, ok
  if (b && t) return `${b} ${t}`;
  if (t) return t;
  if (b) return b;
  return '';
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const url = typeof body?.url === 'string' ? body.url : '';

  if (!url) return NextResponse.json({ ok: false }, { status: 400 });

  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Basic anti-SSRF guard: only http/https
  if (!['http:', 'https:'].includes(u.protocol)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        // helps some sites return proper HTML
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122 Safari/537.36',
        accept: 'text/html,application/xhtml+xml'
      },
      // keep it safe
      redirect: 'follow'
    });

    const ct = res.headers.get('content-type') || '';
    if (!res.ok) {
      return NextResponse.json({ ok: false, debug: [`fetch status ${res.status}`] }, { status: 200 });
    }
    if (!ct.toLowerCase().includes('text/html')) {
      // Some sites return html without header, still try:
      // but if it's clearly not html, stop.
      // We'll still attempt to read small portion.
    }

    const html = await res.text();

    // 1) Meta title fallbacks
    const ogTitle = pickMeta(html, 'property', 'og:title');
    const twTitle = pickMeta(html, 'name', 'twitter:title');
    const metaTitle = pickMeta(html, 'name', 'title');
    const titleTag = pickTitle(html);

    // 2) JSON-LD product
    const blocks = extractJsonLdBlocks(html);
    let jsonProduct: { title?: string; brand?: string } | null = null;
    for (const b of blocks) {
      const hit = findProductFromJsonLd(b);
      if (hit && (hit.title || hit.brand)) {
        jsonProduct = hit;
        break;
      }
    }

    const extractedTitle =
      safeText(jsonProduct?.title) ||
      safeText(ogTitle) ||
      safeText(twTitle) ||
      safeText(metaTitle) ||
      safeText(titleTag);

    const extractedBrand = safeText(jsonProduct?.brand);

    const query = buildQuery(extractedTitle, extractedBrand);

    return NextResponse.json(
      {
        ok: !!(extractedTitle || extractedBrand),
        title: extractedTitle || null,
        brand: extractedBrand || null,
        query: query || null,
        from: 'site'
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ ok: false, debug: [String(e?.message || e)] }, { status: 200 });
  }
}
