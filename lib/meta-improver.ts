import OpenAI from 'openai';
import { loadStyleGuide } from './style-guide/config';
import { validateStyleCompliance } from './style-guide/validator';
import { buildStyleGuidePrompt } from './style-guide/prompt-builder';
import type { ImprovedMeta } from './style-guide/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const styleGuide = loadStyleGuide();

// Export the type for backward compatibility
export type { ImprovedMeta };

async function generateWithModel(
  model: string,
  url: string,
  existingTitle: string,
  existingDescription: string
): Promise<{ title: string; description: string }> {
  const prompt = buildStyleGuidePrompt(
    styleGuide,
    url,
    existingTitle,
    existingDescription
  );

  // o1 models don't support response_format or temperature
  const isO1Model = model.startsWith('o1');

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are an SEO expert specializing in Japanese content optimization. Follow the style guide rules strictly.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    ...(isO1Model ? {} : {
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }),
  });

  const content = completion.choices[0].message.content || '{}';

  // For o1 models, extract JSON from response (may have additional text)
  let result;
  if (model.startsWith('o1')) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    result = JSON.parse(jsonMatch?.[0] || '{}');
  } else {
    result = JSON.parse(content);
  }

  return {
    title: result.title || existingTitle || 'タイトルなし',
    description: result.description || existingDescription || '説明なし',
  };
}

export async function improveJapaneseMeta(
  url: string,
  existingTitle: string,
  existingDescription: string,
  attempt: number = 1
): Promise<ImprovedMeta> {
  try {
    // Model selection based on attempt
    const model = attempt === 1 ? 'gpt-4o' : 'o1-mini';

    console.log(`[${url}] Attempt ${attempt} with ${model}`);

    // Generate content
    const { title, description } = await generateWithModel(
      model,
      url,
      existingTitle,
      existingDescription
    );

    // Validate compliance
    const compliance = validateStyleCompliance(title, description, styleGuide);

    console.log(`[${url}] Compliance: ${compliance.score}% (${compliance.violations.length} violations)`);

    // If compliance is poor and we haven't tried the better model yet, retry
    if (compliance.score < 85 && attempt === 1) {
      console.log(`[${url}] Retrying with o1-mini for better compliance`);
      return improveJapaneseMeta(url, existingTitle, existingDescription, 2);
    }

    // Return result with compliance data
    return {
      title,
      description,
      titleCharCount: title.length,
      descriptionCharCount: description.length,
      compliance,
      model,
      retryCount: attempt,
    };

  } catch (error: any) {
    console.error(`[${url}] Error in attempt ${attempt}:`, error.message);

    // If first attempt failed and it's a model error, don't retry
    // Just fall back to existing meta
    const title = existingTitle || 'タイトルなし';
    const description = existingDescription || '説明なし';

    // Create a failed compliance result
    const compliance = validateStyleCompliance(title, description, styleGuide);
    compliance.score = 0; // Override to 0 for error case

    return {
      title,
      description,
      titleCharCount: title.length,
      descriptionCharCount: description.length,
      compliance,
      model: attempt === 1 ? 'gpt-4o (failed)' : 'o1-mini (failed)',
      retryCount: attempt,
    };
  }
}
