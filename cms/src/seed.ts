import payload from 'payload';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const SEED_CATEGORIES = [
  { name: 'Technology & Architecture', slug: 'technology', description: 'Enterprise backend architecture, microservices, and distributed cloud computing.' },
  { name: 'Cloud Infrastructure', slug: 'cloud', description: 'Container orchestration, Kubernetes, edge deployment, and resilient networks.' },
  { name: 'Web Development', slug: 'web-development', description: 'Modern frontend engineering, React performance patterns, and headless systems.' },
  { name: 'Databases & Storage', slug: 'databases', description: 'PostgreSQL indexing, query plan optimization, caching topologies, and replication.' },
  { name: 'Security & DevOps', slug: 'devops', description: 'Zero-trust architecture, automated CI/CD pipelines, and vulnerability mitigation.' },
];

const SEED_TAGS = [
  { name: 'PostgreSQL', slug: 'postgresql', description: 'Advanced relational database engine features.' },
  { name: 'NestJS', slug: 'nestjs', description: 'Enterprise TypeScript progressive framework.' },
  { name: 'Supabase', slug: 'supabase', description: 'Open source cloud Postgres platform.' },
  { name: 'Payload CMS', slug: 'payload-cms', description: 'Headless, developer-first TypeScript content management system.' },
  { name: 'Performance', slug: 'performance', description: 'Sub-millisecond latency optimization techniques.' },
  { name: 'Architecture', slug: 'architecture', description: 'Modular systems, domain-driven design, and microservices.' },
  { name: 'TypeScript', slug: 'typescript', description: 'Strict static type systems and compiler safety.' },
];

const SEED_PAGES = [
  {
    title: 'About NexusBlog',
    slug: 'about',
    content: `# About NexusBlog\n\nNexusBlog is a high-performance technical publishing platform built for enterprise software engineers, database architects, and infrastructure specialists.\n\nOur mission is to provide rigorous, peer-reviewed technical deep dives into distributed computing, PostgreSQL optimizations, modern headless CMS architecture, and reactive web applications.\n\nEvery article published on NexusBlog undergoes benchmark verification, ensuring that code samples and architectural recommendations are battle-tested for production environments.`,
    status: 'published',
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: `# Privacy Policy\n\nLast Updated: January 2026\n\nNexusBlog respects your personal privacy. We do not sell, rent, or monetize personal reader information.\n\n### Data Collection\nWe collect minimal analytics necessary to assess publication reach and prevent abuse. No third-party ad tracking scripts or invasive fingerprinting technologies are utilized on this domain.\n\n### Newsletter Subscription\nEmail addresses submitted through our newsletter form are solely utilized for sending architectural digests. You may unsubscribe at any time with one click.`,
    status: 'published',
  },
  {
    title: 'Terms of Service',
    slug: 'terms',
    content: `# Terms of Service\n\nAll architectural blueprints, sample repositories, and code implementations published on NexusBlog are licensed under the MIT License unless explicitly annotated otherwise.\n\nYou are free to adapt, modify, and incorporate these patterns into commercial and open-source applications with attribution.`,
    status: 'published',
  },
  {
    title: 'Engineering Services & Advisory',
    slug: 'services',
    content: `# Technical Consulting & Advisory\n\nOur editorial team and staff architects provide advisory services for enterprises modernizing legacy monolithic applications, migrating to PostgreSQL, and deploying modern headless Payload CMS topologies.\n\n### Core Competencies\n- PostgreSQL Query & Index Optimization\n- Headless CMS & Enterprise Jamstack Architecture\n- Microservices & NestJS Distributed Systems\n- Migration from Legacy WordPress to Structured Headless APIs\n\nContact us at advisory@nexusblog.dev for enterprise inquiries.`,
    status: 'published',
  },
];

async function seed() {
  console.log('🌱 Starting Payload CMS database seed...');

  await payload.init({
    secret: process.env.PAYLOAD_SECRET || 'development_secret_32_characters_minimum_sample',
    onInit: async () => {
      payload.logger.info('Payload initialized for seed.');
    },
  });

  try {
    // 1. Create or verify Default Admin User
    const existingAdmins = await payload.find({
      collection: 'users',
      where: { email: { equals: 'admin@nexusblog.dev' } },
    });

    let adminId = existingAdmins.docs[0]?.id;
    if (!adminId) {
      console.log('👤 Creating initial Administrator account: admin@nexusblog.dev');
      const admin = await payload.create({
        collection: 'users',
        data: {
          name: 'Chief Editor (Admin)',
          email: 'admin@nexusblog.dev',
          password: 'Password123!',
          role: 'admin',
          bio: 'Principal Systems Architect and Chief Editor at NexusBlog.',
          jobTitle: 'Principal Architect',
        } as any,
      });
      adminId = admin.id;
    }

    // 2. Seed Categories
    console.log('📁 Seeding Categories...');
    const categoryMap: Record<string, string> = {};
    for (const cat of SEED_CATEGORIES) {
      const existing = await payload.find({
        collection: 'categories',
        where: { slug: { equals: cat.slug } },
      });
      if (existing.docs.length > 0) {
        categoryMap[cat.slug] = existing.docs[0].id.toString();
      } else {
        const created = await payload.create({
          collection: 'categories',
          data: cat,
        });
        categoryMap[cat.slug] = created.id.toString();
      }
    }

    // 3. Seed Tags
    console.log('🏷️ Seeding Tags...');
    const tagMap: Record<string, string> = {};
    for (const tag of SEED_TAGS) {
      const existing = await payload.find({
        collection: 'tags',
        where: { slug: { equals: tag.slug } },
      });
      if (existing.docs.length > 0) {
        tagMap[tag.slug] = existing.docs[0].id.toString();
      } else {
        const created = await payload.create({
          collection: 'tags',
          data: tag,
        });
        tagMap[tag.slug] = created.id.toString();
      }
    }

    // 4. Seed Pages
    console.log('📄 Seeding Pages...');
    for (const p of SEED_PAGES) {
      const existing = await payload.find({
        collection: 'pages',
        where: { slug: { equals: p.slug } },
      });
      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'pages',
          data: {
            title: p.title,
            slug: p.slug,
            content: p.content,
            status: p.status,
            publishedAt: new Date().toISOString(),
          } as any,
        });
      }
    }

    // 5. Update Site Settings Global
    console.log('⚙️ Updating SiteSettings Global...');
    await payload.updateGlobal({
      slug: 'site-settings',
      data: {
        siteName: 'NexusBlog',
        siteDescription: 'Engineering journal covering distributed systems, PostgreSQL optimization, NestJS, and headless Payload CMS architecture.',
        siteUrl: 'https://nexusblog.dev',
        contactEmail: 'contact@nexusblog.dev',
        socialLinks: {
          twitter: 'https://twitter.com/nexusblog',
          github: 'https://github.com/shawn91frost-lab/blog3',
          linkedin: 'https://linkedin.com/company/nexusblog',
        },
      } as any,
    });

    console.log('✅ Seed completed successfully! All initial content is available in PostgreSQL.');
  } catch (error) {
    console.error('❌ Seed encountered an error:', error);
  } finally {
    process.exit(0);
  }
}

seed();
