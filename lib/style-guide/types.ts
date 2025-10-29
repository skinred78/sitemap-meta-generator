export interface StyleGuideRule {
  term?: string;
  form?: string;
  reason?: string;
  note?: string;
  context?: string;
  use_instead?: string;
  use_when?: string;
  do_not_use_when?: string;
}

export interface StyleGuide {
  brand_name?: {
    roman: string;
    katakana: string;
    usage_rules: {
      page_titles: string;
      meta_descriptions: string;
      all_subsequent_mentions?: string;
    };
    examples?: {
      title: string;
      description: string;
    };
  };
  brand_positioning?: {
    core_identity: string;
    north_star_message: string;
    what_we_are_not?: string[];
  };
  value_propositions?: {
    primary_pillars: Array<{
      pillar: string;
      english: string;
      message: string;
    }>;
    supporting_evidence?: string[];
  };
  service_terminology?: {
    core_proofreading_services?: {
      when_to_use: string;
      primary_keywords: string[];
      example_pages?: string[];
    };
    strategic_support_services?: {
      when_to_use: string;
      do_not_use: string[];
      use_instead: string[];
      example_pages?: string[];
    };
  };
  terminology: {
    required?: StyleGuideRule[];
    forbidden?: StyleGuideRule[];
    forbidden_always?: StyleGuideRule[];
    preferred_terms?: string[];
    conditional_use?: StyleGuideRule[];
  };
  grammar?: {
    forbidden_forms: StyleGuideRule[];
    preferred_style: string;
  };
  grammar_rules?: {
    forbidden_forms: (StyleGuideRule | string)[];
    preferred_style: string;
  };
  tone?: {
    formality: string;
    pov: string;
    guidelines: string[];
  };
  tone_guidelines?: {
    formality: string;
    voice: string;
    attributes: string[];
  };
  emotional_drivers?: {
    target_researcher_feelings: string[];
    messaging_approach: string;
  };
  seo?: {
    title_guidelines: string;
    description_guidelines: string;
    titles?: {
      character_range?: string;
      structure_proofreading?: string;
      structure_strategic?: string;
      primary_keywords_proofreading?: string[];
      primary_keywords_strategic?: string[];
    };
    descriptions?: {
      character_range?: string;
      structure?: string;
      must_include?: string[];
    };
  };
  seo_guidelines?: {
    titles: {
      character_limit: number;
      note?: string;
      structure_proofreading: string;
      structure_strategic: string;
    };
    descriptions: {
      character_limit_mobile_safe: number;
      character_limit_optimal: string;
      recommendation?: string;
      note?: string;
      must_include: string[];
      avoid?: string[];
      patterns?: Array<{
        pattern: string;
        structure: string;
        example: string;
        when_to_use: string;
      }>;
    };
    pattern_selection_guidance?: {
      rotate_patterns: string;
      match_intent: string;
      maximize_characters: string;
      front_load_keywords: string;
    };
  };
  key_value_propositions?: string[];
  examples_by_service_type?: {
    proofreading_services?: {
      good_titles?: string[];
      titles?: string[];
      good_descriptions?: string[];
      descriptions_varied?: Array<{
        pattern: string;
        text: string;
        chars: number;
      }>;
    };
    strategic_services?: {
      good_titles?: string[];
      titles?: string[];
      good_descriptions?: string[];
      descriptions_varied?: Array<{
        pattern: string;
        text: string;
        chars: number;
      }>;
      bad_examples?: Array<{
        bad: string;
        why: string;
        good: string;
      }>;
    };
  };
  decision_tree?: {
    question: string;
    if_proofreading?: {
      answer: string;
      use_keywords: string[];
      focus: string;
    };
    if_strategic?: {
      answer: string;
      do_not_use: string[];
      use_keywords: string[];
      focus: string;
    };
  };
}

export interface ValidationViolation {
  type: 'forbidden_term' | 'forbidden_grammar' | 'missing_required' | 'tone_issue';
  severity: 'error' | 'warning';
  message: string;
  term?: string;
  location: 'title' | 'description' | 'both';
}

export interface ComplianceResult {
  score: number; // 0-100
  violations: ValidationViolation[];
  compliant: boolean; // true if score >= 85
  details: {
    forbiddenTermsFound: number;
    forbiddenGrammarFound: number;
    requiredTermsMissing: number;
  };
}

export interface ImprovedMeta {
  title: string;
  description: string;
  titleCharCount: number;
  descriptionCharCount: number;
  compliance?: ComplianceResult;
  model?: string; // Which model was used
  retryCount?: number; // How many retries
}
