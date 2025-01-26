'use client'

import { siteConfig } from '@/config/site'

interface StorySchemaProps {
  title: string;
  content: string;
  author: {
    name: string;
    url?: string;
  };
  datePublished: string;
  url: string;
}

export function StorySchema({ title, content, author, datePublished, url }: StorySchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: content.slice(0, 200) + '...',
    author: {
      '@type': 'Person',
      name: author.name,
      url: author.url,
    },
    datePublished,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
} 