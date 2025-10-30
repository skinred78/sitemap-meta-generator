import { VertexAI } from '@google-cloud/vertexai';
import { loadStyleGuide } from './style-guide/config';
import { validateStyleCompliance } from './style-guide/validator';
import { buildStyleGuidePrompt } from './style-guide/prompt-builder';
import type { ImprovedMeta } from './style-guide/types';

// Lazy-load Vertex AI client to avoid initialization during build phase
// Uses Application Default Credentials (ADC) - no API key needed in production
let vertexAI: VertexAI | null = null;
function getVertexAI(): VertexAI {
  if (!vertexAI) {
    // Get project ID from environment or use the Firebase project
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || 'sitemap-meta-generator';
    const location = process.env.VERTEX_AI_LOCATION || 'asia-east1';

    vertexAI = new VertexAI({
      project: projectId,
      location: location,
    });
  }
  return vertexAI;
}

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

  const vertexai = getVertexAI();
  const generativeModel = vertexai.preview.getGenerativeModel({
    model: model,
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
    systemInstruction: {
      role: 'system',
      parts: [{
        text: 'You are an SEO expert specializing in Japanese content optimization. Follow the style guide rules strictly. Return your response as JSON with "title" and "description" fields.'
      }]
    }
  });

  const result = await generativeModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const response = result.response;
  const content = response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  // Parse JSON response
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    // If direct parse fails, try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  }

  return {
    title: parsed.title || existingTitle || 'タイトルなし',
    description: parsed.description || existingDescription || '説明なし',
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
    // gemini-1.5-flash: Fast and efficient for most tasks
    // gemini-1.5-pro: More powerful for better compliance
    const model = attempt === 1 ? 'gemini-1.5-flash' : 'gemini-1.5-pro';

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
      console.log(`[${url}] Retrying with gemini-1.5-pro for better compliance`);
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
      model: attempt === 1 ? 'gemini-1.5-flash (failed)' : 'gemini-1.5-pro (failed)',
      retryCount: attempt,
    };
  }
}
