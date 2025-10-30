import { NextRequest, NextResponse } from 'next/server';
import { fetchPageMeta } from '@/lib/url-fetcher';
import { improveJapaneseMeta } from '@/lib/meta-improver';
import { validateURL } from '@/lib/url-validator';
import type { SingleURLRequest, SingleURLResponse } from '@/types/single-url';

export async function POST(request: NextRequest) {
  try {
    const body: SingleURLRequest = await request.json();
    const { url } = body;

    // Validate URL
    const validation = validateURL(url);
    if (!validation.isValid) {
      return NextResponse.json<SingleURLResponse>(
        {
          success: false,
          error: validation.error || 'Invalid URL',
        },
        { status: 400 }
      );
    }

    const normalizedUrl = validation.normalizedUrl!;

    console.log(`[Single URL] Processing: ${normalizedUrl}`);

    // Fetch existing meta tags
    let existingTitle = '';
    let existingDescription = '';

    try {
      const pageMeta = await fetchPageMeta(normalizedUrl);
      existingTitle = pageMeta.title;
      existingDescription = pageMeta.description;

      console.log(`[Single URL] Fetched existing meta - Title: ${existingTitle.substring(0, 50)}...`);
    } catch (fetchError: any) {
      console.error(`[Single URL] Failed to fetch page:`, fetchError.message);
      return NextResponse.json<SingleURLResponse>(
        {
          success: false,
          error: `Failed to fetch page: ${fetchError.message}`,
        },
        { status: 500 }
      );
    }

    // Generate improved meta tags
    try {
      const improved = await improveJapaneseMeta(
        normalizedUrl,
        existingTitle,
        existingDescription
      );

      console.log(
        `[Single URL] Generated meta - Compliance: ${improved.compliance?.score}% (${improved.model})`
      );

      return NextResponse.json<SingleURLResponse>({
        success: true,
        result: {
          url: normalizedUrl,
          title: improved.title,
          description: improved.description,
          titleCharCount: improved.titleCharCount,
          descriptionCharCount: improved.descriptionCharCount,
          compliance: improved.compliance!,
          model: improved.model || 'unknown',
          retryCount: improved.retryCount || 1,
          existingTitle,
          existingDescription,
        },
      });
    } catch (improveError: any) {
      console.error(`[Single URL] Failed to improve meta:`, improveError.message);
      return NextResponse.json<SingleURLResponse>(
        {
          success: false,
          error: `Failed to generate meta tags: ${improveError.message}`,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error(`[Single URL] Unexpected error:`, error);
    return NextResponse.json<SingleURLResponse>(
      {
        success: false,
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
