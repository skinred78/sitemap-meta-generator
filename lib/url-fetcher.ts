import axios from 'axios';
import * as cheerio from 'cheerio';

export interface PageMeta {
  url: string;
  title: string;
  description: string;
  error?: string;
}

export async function fetchPageMeta(url: string): Promise<PageMeta> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SitemapMetaGenerator/1.0)',
      },
    });

    const $ = cheerio.load(response.data);

    // Extract existing meta tags
    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || '';
    const description = $('meta[name="description"]').attr('content') ||
                       $('meta[property="og:description"]').attr('content') || '';

    return {
      url,
      title: title.trim(),
      description: description.trim(),
    };
  } catch (error: any) {
    return {
      url,
      title: '',
      description: '',
      error: error.message || 'Failed to fetch',
    };
  }
}
