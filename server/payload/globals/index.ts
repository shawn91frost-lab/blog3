/**
 * Payload CMS Globals
 * Global configuration singletons for site-wide settings and navigation
 */

export const SiteSettingsGlobal = {
  slug: 'site-settings',
  admin: {
    group: 'Globals',
  },
  fields: [
    { name: 'siteName', type: 'text', required: true, defaultValue: 'NexusBlog' },
    { name: 'siteDescription', type: 'textarea', required: true },
    { name: 'siteUrl', type: 'text', required: true },
    { name: 'logo', type: 'text' },
    { name: 'favicon', type: 'text' },
    { name: 'defaultSEOImage', type: 'text' },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text' },
    { name: 'address', type: 'text' },
    { name: 'copyrightText', type: 'text' },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        { name: 'twitter', type: 'text' },
        { name: 'github', type: 'text' },
        { name: 'linkedin', type: 'text' },
        { name: 'youtube', type: 'text' },
        { name: 'rss', type: 'text' },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      fields: [
        { name: 'googleAnalyticsId', type: 'text' },
        { name: 'googleSearchConsoleVerification', type: 'text' },
        { name: 'plausibleDomain', type: 'text' },
        { name: 'posthogKey', type: 'text' },
      ],
    },
  ],
};

export const HeaderGlobal = {
  slug: 'header',
  admin: {
    group: 'Globals',
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
};

export const FooterGlobal = {
  slug: 'footer',
  admin: {
    group: 'Globals',
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      fields: [
        { name: 'section', type: 'text', required: true },
        {
          name: 'links',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
};

export const SEODefaultsGlobal = {
  slug: 'seo-defaults',
  admin: {
    group: 'Globals',
  },
  fields: [
    { name: 'metaTitleTemplate', type: 'text', defaultValue: '%s | NexusBlog' },
    { name: 'defaultMetaDescription', type: 'textarea' },
    { name: 'ogImage', type: 'text' },
    { name: 'twitterHandle', type: 'text' },
  ],
};
