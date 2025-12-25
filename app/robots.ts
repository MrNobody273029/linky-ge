import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/en', '/accepted', '/en/accepted'],
        disallow: [
          '/admin',
          '/en/admin',
          '/login',
          '/en/login',
          '/register',
          '/en/register',
          '/mypage',
          '/en/mypage',
          '/api',
          '/en/api',
        ],
      },
    ],
    sitemap: 'https://www.linky.ge/sitemap.xml',
  };
}
