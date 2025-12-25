import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

const BASE_URL = 'https://www.linky.ge';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'daily', priority: 1, lastModified: new Date() },
    { url: `${BASE_URL}/en`, changeFrequency: 'daily', priority: 0.9, lastModified: new Date() },
    { url: `${BASE_URL}/accepted`, changeFrequency: 'daily', priority: 0.8, lastModified: new Date() },
    { url: `${BASE_URL}/en/accepted`, changeFrequency: 'daily', priority: 0.7, lastModified: new Date() },
  ];

  // აიღე ყველა accepted offer, რომლებსაც აქვთ offer და indexable არიან
  const rows = await prisma.request.findMany({
    where: {
      status: 'PAID_PARTIALLY',
      paymentStatus: 'PARTIAL',
      isRepeat: false,
      offer: { isNot: null },
    },
    select: {
      id: true,
      updatedAt: true,
      offer: { select: { productTitle: true } },
    },
    orderBy: { updatedAt: 'desc' },
    // სურვილის მიხედვით: limit რომ sitemap არ იყოს უზარმაზარი
    // take: 5000,
  });

const itemUrls: MetadataRoute.Sitemap = rows.flatMap((r) => {
  const title = r.offer?.productTitle ?? 'product';
  const slug = slugify(title);
  const idSlug = `${r.id}-${encodeURIComponent(slug)}`;

  return [
    {
      url: `${BASE_URL}/accepted/${idSlug}`,
      lastModified: r.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/en/accepted/${idSlug}`,
      lastModified: r.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];
});


return [...staticUrls, ...itemUrls];
}

function slugify(input: string) {
  const s = (input || '').trim().toLowerCase();
  const cleaned = s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return (cleaned || 'product').slice(0, 80);
}
