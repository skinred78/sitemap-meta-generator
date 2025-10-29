import { StyleGuide } from './types';
import styleGuideData from '../style-guide.json';

export function loadStyleGuide(): StyleGuide {
  return styleGuideData as StyleGuide;
}

export function getDefaultStyleGuide(): StyleGuide {
  // Fallback if JSON load fails
  return {
    terminology: {
      required: [
        { term: '校正', note: 'Use for proofreading' }
      ],
      forbidden: [
        { term: 'あなた', reason: 'Too informal' },
        { term: '編集', reason: 'Use 校正 for proofreading', context: 'proofreading' }
      ]
    },
    grammar: {
      forbidden_forms: [
        { form: 'ましょう', reason: 'Avoid suggestion form' }
      ],
      preferred_style: 'Active voice, concise, professional'
    },
    tone: {
      formality: 'Professional/Academic',
      pov: 'Third person',
      guidelines: [
        'Avoid casual expressions',
        'Use industry-standard terminology'
      ]
    },
    seo: {
      title_guidelines: 'Include primary keywords naturally',
      description_guidelines: 'Clear value proposition'
    }
  };
}
