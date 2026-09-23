import React, { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  ogImage?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  authorName?: string;
  jsonLd?: Record<string, any>;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  ogImage = '/src/assets/images/hero_nestjs_architecture_1790181779835.jpg',
  canonicalUrl,
  type = 'website',
  publishedTime,
  authorName,
  jsonLd,
}) => {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Helper to set or create meta tag
    const setMeta = (nameOrProperty: string, value: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${nameOrProperty}"]` : `meta[name="${nameOrProperty}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', nameOrProperty);
        } else {
          meta.setAttribute('name', nameOrProperty);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', value);
    };

    setMeta('description', description);
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', type, true);
    setMeta('og:image', ogImage, true);
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

    if (publishedTime) {
      setMeta('article:published_time', publishedTime, true);
    }
    if (authorName) {
      setMeta('article:author', authorName, true);
    }

    // Set canonical link
    if (canonicalUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', canonicalUrl);
    }

    // Structured Data JSON-LD
    let scriptTag = document.querySelector('#seo-json-ld') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'seo-json-ld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const defaultJsonLd = jsonLd || {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'BlogPosting' : 'WebSite',
      headline: title,
      description: description,
      image: ogImage,
      datePublished: publishedTime,
      author: authorName
        ? {
            '@type': 'Person',
            name: authorName,
          }
        : undefined,
    };

    scriptTag.textContent = JSON.stringify(defaultJsonLd);
  }, [title, description, ogImage, canonicalUrl, type, publishedTime, authorName, jsonLd]);

  return null;
};
