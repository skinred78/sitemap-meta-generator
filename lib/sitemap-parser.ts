import { XMLParser } from 'fast-xml-parser';

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
}

export async function parseSitemap(xmlContent: string): Promise<string[]> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  const result = parser.parse(xmlContent);

  // Handle urlset (standard sitemap)
  if (result.urlset && result.urlset.url) {
    const urls = Array.isArray(result.urlset.url)
      ? result.urlset.url
      : [result.urlset.url];

    return urls.map((url: any) => url.loc).filter(Boolean);
  }

  throw new Error('Invalid sitemap format');
}
