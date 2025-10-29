import { NextRequest, NextResponse } from 'next/server';
import pLimit from 'p-limit';
import { parseSitemap } from '@/lib/sitemap-parser';
import { fetchPageMeta } from '@/lib/url-fetcher';
import { improveJapaneseMeta } from '@/lib/meta-improver';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const limitParam = formData.get('limit') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read and parse sitemap
    const xmlContent = await file.text();
    const urls = await parseSitemap(xmlContent);

    if (urls.length === 0) {
      return NextResponse.json(
        { error: 'No URLs found in sitemap' },
        { status: 400 }
      );
    }

    // Get and validate limit
    let urlLimit = parseInt(limitParam) || urls.length;
    urlLimit = Math.max(1, Math.min(urlLimit, 10000)); // Clamp between 1 and 10000
    urlLimit = Math.min(urlLimit, urls.length); // Don't exceed available URLs

    const limitedUrls = urls.slice(0, urlLimit);

    // Process URLs with concurrency limit
    const limit = pLimit(5);
    const results = await Promise.all(
      limitedUrls.map((url) =>
        limit(async () => {
          try {
            // Fetch page meta
            const pageMeta = await fetchPageMeta(url);

            if (pageMeta.error) {
              return {
                url,
                title: 'エラー',
                description: `取得失敗: ${pageMeta.error}`,
                titleCharCount: 0,
                descriptionCharCount: 0,
                error: pageMeta.error,
              };
            }

            // Improve meta with LLM
            const improved = await improveJapaneseMeta(
              url,
              pageMeta.title,
              pageMeta.description
            );

            return {
              url,
              title: improved.title,
              description: improved.description,
              titleCharCount: improved.titleCharCount,
              descriptionCharCount: improved.descriptionCharCount,
              compliance: improved.compliance,
              model: improved.model,
              retryCount: improved.retryCount,
            };
          } catch (error: any) {
            return {
              url,
              title: 'エラー',
              description: `処理失敗: ${error.message}`,
              titleCharCount: 0,
              descriptionCharCount: 0,
              error: error.message,
            };
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      totalUrls: urls.length,
      processedUrls: limitedUrls.length,
      results,
    });
  } catch (error: any) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Processing failed' },
      { status: 500 }
    );
  }
}
