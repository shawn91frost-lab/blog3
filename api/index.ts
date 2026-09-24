import express, { Request, Response, NextFunction } from 'express';

const app = express();

// Security Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// JSON Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 301 Redirect Middleware for legacy WordPress URLs
const WP_MIGRATION_REDIRECTS: Record<string, string> = {
  '/2024/05/building-production-ready-apis': '/blog/building-production-ready-apis-with-nestjs',
  '/2024/05/building-production-ready-apis/': '/blog/building-production-ready-apis-with-nestjs',
  '/2024/08/postgres-indexes-guide': '/blog/postgresql-performance-optimization-indexing',
  '/2024/08/postgres-indexes-guide/': '/blog/postgresql-performance-optimization-indexing',
  '/2024/11/supabase-introduction': '/blog/getting-started-with-supabase-cloud-postgres',
  '/2024/11/supabase-introduction/': '/blog/getting-started-with-supabase-cloud-postgres',
};

app.use((req: Request, res: Response, next: NextFunction) => {
  const pathWithoutQuery = req.path;
  if (WP_MIGRATION_REDIRECTS[pathWithoutQuery]) {
    res.redirect(301, WP_MIGRATION_REDIRECTS[pathWithoutQuery]);
    return;
  }
  next();
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      engine: 'NestJS / Express + Payload CMS Architecture (Vercel Serverless Function)',
      database: 'Supabase PostgreSQL',
      timestamp: new Date().toISOString(),
    },
  });
});

// Dynamic Robots.txt
app.get(['/robots.txt', '/api/robots.txt'], (req: Request, res: Response) => {
  const siteUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://nexusblog.dev');
  res.setHeader('Content-Type', 'text/plain');
  res.send(`# NexusBlog Robots Policy
User-agent: *
Allow: /
Allow: /blog
Allow: /blog/*
Allow: /category/*
Allow: /tag/*
Allow: /author/*
Allow: /about
Allow: /contact

# Disallow administrative and private API endpoints
Disallow: /admin
Disallow: /admin/*
Disallow: /api/private/
Disallow: /login

Sitemap: ${siteUrl}/sitemap.xml
`);
});

// Dynamic Sitemap.xml
app.get(['/sitemap.xml', '/api/sitemap.xml'], (req: Request, res: Response) => {
  const siteUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://nexusblog.dev');
  res.setHeader('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteUrl}/blog/building-production-ready-apis-with-nestjs</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteUrl}/blog/postgresql-performance-optimization-indexing</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${siteUrl}/blog/getting-started-with-supabase-cloud-postgres</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/blog/building-modern-applications-payload-cms</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/category/technology</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${siteUrl}/category/cloud</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${siteUrl}/category/web-development</loc>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${siteUrl}/author/sarah-chen</loc>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${siteUrl}/about</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${siteUrl}/contact</loc>
    <priority>0.5</priority>
  </url>
</urlset>`);
});

export default app;
