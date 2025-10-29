import { StyleGuide, ComplianceResult, ValidationViolation } from './types';

/**
 * Check if text contains a term with word boundaries (better than simple includes)
 * For Japanese, checks with common separators
 */
function containsTerm(text: string, term: string): boolean {
  // For Japanese text, check with common separators and boundaries
  const separators = '[、。！？\\s・]';
  const pattern = new RegExp(`(^|${separators})${term}($|${separators})`);
  return pattern.test(text);
}

export function validateStyleCompliance(
  title: string,
  description: string,
  styleGuide: StyleGuide
): ComplianceResult {
  const violations: ValidationViolation[] = [];
  let score = 100;

  const details = {
    forbiddenTermsFound: 0,
    forbiddenGrammarFound: 0,
    requiredTermsMissing: 0
  };

  // Check forbidden terms
  const forbiddenList = styleGuide.terminology.forbidden_always || styleGuide.terminology.forbidden || [];
  for (const forbidden of forbiddenList) {
    if (!forbidden.term) continue;

    const inTitle = containsTerm(title, forbidden.term);
    const inDescription = containsTerm(description, forbidden.term);

    if (inTitle || inDescription) {
      details.forbiddenTermsFound++;
      score -= 15; // Heavy penalty

      violations.push({
        type: 'forbidden_term',
        severity: 'error',
        message: `Forbidden term "${forbidden.term}": ${forbidden.reason}`,
        term: forbidden.term,
        location: inTitle && inDescription ? 'both' : inTitle ? 'title' : 'description'
      });
    }
  }

  // Check forbidden grammar forms
  const grammarRules = styleGuide.grammar_rules || styleGuide.grammar;
  const forbiddenForms = grammarRules?.forbidden_forms || [];
  for (const form of forbiddenForms) {
    if (!form && typeof form !== 'string') continue;
    const formText = typeof form === 'string' ? form : form.form;
    if (!formText) continue;

    const inTitle = containsTerm(title, formText);
    const inDescription = containsTerm(description, formText);

    if (inTitle || inDescription) {
      details.forbiddenGrammarFound++;
      score -= 15; // Heavy penalty

      const reason = typeof form === 'string' ? 'Use direct statements instead' : form.reason;
      violations.push({
        type: 'forbidden_grammar',
        severity: 'error',
        message: `Forbidden grammar "${formText}": ${reason}`,
        term: formText,
        location: inTitle && inDescription ? 'both' : inTitle ? 'title' : 'description'
      });
    }
  }

  // Check required terms (at least one should appear somewhere)
  const requiredTerms = (styleGuide.terminology.required || [])
    .filter(r => r.term)
    .map(r => r.term as string);

  if (requiredTerms.length > 0) {
    const hasAnyRequired = requiredTerms.some(term =>
      containsTerm(title, term) || containsTerm(description, term)
    );

    if (!hasAnyRequired) {
      details.requiredTermsMissing = requiredTerms.length;
      score -= 10; // Moderate penalty

      violations.push({
        type: 'missing_required',
        severity: 'warning',
        message: `Missing required terminology: ${requiredTerms.join(', ')}`,
        location: 'both'
      });
    }
  }

  // Clamp score to 0-100
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    violations,
    compliant: score >= 85,
    details
  };
}
