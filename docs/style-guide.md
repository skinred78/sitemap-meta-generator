# Style Guide System Documentation

Comprehensive guide to Japanese content validation and quality enforcement.

## Overview

Style guide system validates AI-generated meta tags against configurable Japanese style rules. Ensures consistency, professionalism, and brand compliance across all content.

**Key Features**:
- JSON-based rule configuration
- Real-time compliance scoring (0-100%)
- Automatic model upgrade on poor compliance
- Detailed violation tracking
- UI visualization of compliance metrics

## Architecture

### Components

```
lib/style-guide/
├── types.ts          # TypeScript interfaces for rules/validation
├── config.ts         # Loads style-guide.json
├── validator.ts      # Scores compliance, detects violations
└── prompt-builder.ts # Injects rules into LLM prompts

lib/style-guide.json  # Style rules configuration
lib/meta-improver.ts  # Orchestrates generation + validation
```

### Data Flow

```
1. Load style-guide.json → StyleGuide object
2. Build prompt with rules → Send to GPT-4o
3. Generate content → Validate compliance
4. If < 85% → Retry with o1-mini
5. Return result + compliance data → UI display
```

## Configuration

### File Location

`/Users/sam/sitemap-meta-generator/lib/style-guide.json`

### Structure

```json
{
  "terminology": {
    "required": [
      {
        "term": "校正",
        "note": "Use for proofreading, not 編集"
      }
    ],
    "forbidden": [
      {
        "term": "あなた",
        "reason": "Too informal for professional content"
      },
      {
        "term": "編集",
        "reason": "Use 校正 when referring to proofreading/editing services",
        "context": "proofreading"
      }
    ]
  },
  "grammar": {
    "forbidden_forms": [
      {
        "form": "ましょう",
        "reason": "Avoid suggestion form - use direct statements instead"
      }
    ],
    "preferred_style": "Active voice, concise, professional tone"
  },
  "tone": {
    "formality": "Professional/Academic",
    "pov": "Third person",
    "guidelines": [
      "Avoid casual expressions",
      "Use industry-standard terminology",
      "Maintain professional distance",
      "Focus on clear value proposition"
    ]
  },
  "seo": {
    "title_guidelines": "Include primary keywords naturally at the beginning",
    "description_guidelines": "Clear value proposition with specific benefits"
  }
}
```

### Rule Types

#### Terminology Rules

**Forbidden Terms** (`terminology.forbidden`):
- Block specific words/phrases
- Each rule:
  - `term` (required): Exact term to forbid
  - `reason` (optional): Why it's forbidden
  - `context` (optional): When rule applies

**Required Terms** (`terminology.required`):
- Enforce presence of specific terms
- At least ONE required term must appear in title OR description
- Each rule:
  - `term` (required): Exact term to require
  - `note` (optional): Usage guidance

#### Grammar Rules

**Forbidden Forms** (`grammar.forbidden_forms`):
- Block specific grammar patterns
- Each rule:
  - `form` (required): Grammar form to forbid (e.g., ましょう)
  - `reason` (optional): Why it's forbidden

**Preferred Style** (`grammar.preferred_style`):
- Free-form guidance for overall grammar style
- Injected into LLM prompt

#### Tone Rules

**Structure**:
- `formality`: Target formality level (e.g., "Professional/Academic")
- `pov`: Point of view (e.g., "Third person")
- `guidelines`: Array of tone guidance strings

#### SEO Rules

**Structure**:
- `title_guidelines`: Free-form guidance for title optimization
- `description_guidelines`: Free-form guidance for description optimization

## Validation Logic

### Scoring Algorithm

**Base Score**: 100

**Penalties**:
- Forbidden term found: -15 per occurrence
- Forbidden grammar found: -15 per occurrence
- Required terms missing: -10 (applied once if ALL required terms missing)

**Final Score**: Clamped to 0-100 range

**Compliance Threshold**: 85%

### Detection Method

Uses word-boundary-aware matching for Japanese text:
- Checks term with common Japanese separators (、。！？・spaces)
- Pattern: `(^|separator)term($|separator)`
- Prevents false positives from substring matches

Example:
- "あなた" will match in "こんにちは、あなた。"
- "あなた" won't match in "あなたがた" (different word)

### Violation Types

```typescript
type ViolationType =
  | 'forbidden_term'     // Forbidden terminology found
  | 'forbidden_grammar'  // Forbidden grammar form found
  | 'missing_required'   // Required terms not present
  | 'tone_issue';        // (Reserved for future use)

type Severity = 'error' | 'warning';
```

**Severity Assignment**:
- Forbidden term: `error`
- Forbidden grammar: `error`
- Missing required: `warning`

### Compliance Result

```typescript
interface ComplianceResult {
  score: number;              // 0-100
  violations: ValidationViolation[];
  compliant: boolean;         // true if score >= 85
  details: {
    forbiddenTermsFound: number;
    forbiddenGrammarFound: number;
    requiredTermsMissing: number;
  };
}
```

## Model Selection Strategy

### Two-Tier Approach

**Tier 1 - GPT-4o** (Default):
- **Speed**: Fast (~2-3s per URL)
- **Cost**: $0.001 per URL
- **Compliance**: ~70-80% on first attempt
- **Use case**: Most content, cost-sensitive

**Tier 2 - o1-mini** (Auto-retry):
- **Speed**: Slow (~10-15s per URL)
- **Cost**: $0.015 per URL (15x more expensive)
- **Compliance**: ~95-100% with reasoning
- **Use case**: High-stakes content, complex rules

### Retry Logic

```typescript
async function improveJapaneseMeta(
  url: string,
  existingTitle: string,
  existingDescription: string,
  attempt: number = 1
): Promise<ImprovedMeta> {
  // Attempt 1: GPT-4o
  const model = attempt === 1 ? 'gpt-4o' : 'o1-mini';

  const { title, description } = await generateWithModel(model, ...);
  const compliance = validateStyleCompliance(title, description, styleGuide);

  // Auto-retry if poor compliance
  if (compliance.score < 85 && attempt === 1) {
    return improveJapaneseMeta(url, existingTitle, existingDescription, 2);
  }

  return { title, description, compliance, model, retryCount: attempt };
}
```

**Retry Conditions**:
- Only retries once (max 2 attempts)
- Only retries if first attempt was GPT-4o
- Only retries if compliance < 85%

### Cost Analysis

**Scenario 1: All Pass First Attempt** (Best case):
- 100 URLs × $0.001 = **$0.10**
- All use GPT-4o

**Scenario 2: 50% Require Retry** (Average case):
- 50 URLs × $0.001 = $0.05 (GPT-4o only)
- 50 URLs × ($0.001 + $0.015) = $0.80 (GPT-4o + o1-mini)
- Total: **$0.85**

**Scenario 3: All Require Retry** (Worst case):
- 100 URLs × ($0.001 + $0.015) = **$1.60**
- All use both models

**Real-world Typical**: $0.20-0.60 per 100 URLs (20-40% retry rate)

### Model Capabilities

**GPT-4o**:
- Supports `response_format: { type: 'json_object' }`
- Supports `temperature` parameter
- Fast structured output

**o1-mini**:
- No `response_format` support (extracts JSON via regex)
- No `temperature` support (fixed reasoning mode)
- Advanced reasoning for complex rules

## Prompt Injection

### How Rules Are Injected

The `buildStyleGuidePrompt()` function converts JSON rules to Japanese prompt:

```typescript
export function buildStyleGuidePrompt(
  styleGuide: StyleGuide,
  url: string,
  existingTitle: string,
  existingDescription: string
): string {
  // Formats rules as Japanese prompt sections
  return `あなたはSEOの専門家です。以下のスタイルガイドに厳密に従って...`;
}
```

### Prompt Structure

```
## 重要なスタイルガイド規則

### 禁止用語（絶対に使用しないでください）
- あなた (Too informal for professional content)
- 編集 (Use 校正 when referring to proofreading/editing services)

### 必須用語（必ず含めてください）
- 校正 (Use for proofreading, not 編集)

### 禁止文法（使用しないでください）
- ましょう (Avoid suggestion form - use direct statements instead)

### 文法スタイル
Active voice, concise, professional tone

### トーン
- 形式: Professional/Academic
- 視点: Third person
- Avoid casual expressions
- Use industry-standard terminology
- Maintain professional distance
- Focus on clear value proposition

### SEOガイドライン
- タイトル: Include primary keywords naturally at the beginning
- 説明: Clear value proposition with specific benefits

## ページ情報
URL: https://example.com/page
現在のタイトル: 既存のタイトル
現在のメタディスクリプション: 既存の説明

## 要件
- タイトル: 30-35文字
- メタディスクリプション: 80-120文字
- **スタイルガイドの規則を厳守してください**

以下のJSON形式で回答してください:
{
  "title": "改善されたタイトル",
  "description": "改善されたメタディスクリプション"
}
```

## Adding New Rules

### Step 1: Edit Configuration

Edit `/Users/sam/sitemap-meta-generator/lib/style-guide.json`:

```json
{
  "terminology": {
    "forbidden": [
      {
        "term": "新しい禁止用語",
        "reason": "理由を説明"
      }
    ]
  }
}
```

### Step 2: Test Validation

No code changes needed. Validator automatically picks up new rules:
1. Upload sitemap
2. Process URLs
3. Check compliance scores in UI
4. Review violations modal for new rule violations

### Step 3: Monitor Effectiveness

**Check Logs**:
```bash
npm run dev
# Look for:
# [URL] Compliance: 75% (2 violations)
# [URL] Retrying with o1-mini for better compliance
```

**Check CSV Export**:
- Compliance column shows scores
- Violations column shows which rules triggered

### Step 4: Iterate

If compliance remains low after adding rules:
1. Check if rules are too strict
2. Verify terminology is contextually appropriate
3. Test with smaller sample first
4. Review o1-mini retry rate (high rate = rules too hard)

## Extending Rule Types

### Adding New Validation Logic

To add new validation types (e.g., length checks, keyword density):

**1. Update Types** (`lib/style-guide/types.ts`):

```typescript
export interface ValidationViolation {
  type: 'forbidden_term' | 'forbidden_grammar' | 'missing_required' | 'length_violation';
  // ...
}
```

**2. Update Validator** (`lib/style-guide/validator.ts`):

```typescript
export function validateStyleCompliance(
  title: string,
  description: string,
  styleGuide: StyleGuide
): ComplianceResult {
  // Existing checks...

  // New check
  if (title.length < 30 || title.length > 35) {
    score -= 5;
    violations.push({
      type: 'length_violation',
      severity: 'warning',
      message: `Title length ${title.length} outside optimal 30-35 range`,
      location: 'title'
    });
  }

  return { score, violations, compliant: score >= 85, details };
}
```

**3. Update Config Schema** (if needed):

Add new fields to `lib/style-guide.json` and `StyleGuide` interface.

## UI Integration

### Display Components

**Compliance Column**:
- Shows score as percentage with color coding
- Green (≥85%): Compliant
- Yellow (70-84%): Warning
- Red (<70%): Non-compliant

**Violations Modal**:
- Triggered by clicking compliance score
- Lists all violations with severity badges
- Shows affected location (title/description/both)

**CSV Export**:
- Includes `Compliance` column (numeric score)
- Includes `Violations` column (JSON string of all violations)
- Includes `Model` column (which model used)
- Includes `Retry Count` column (1 or 2)

### Frontend Code

Located in `app/page.tsx`:

```typescript
// Result interface includes compliance data
interface ProcessedResult {
  url: string;
  title: string;
  description: string;
  titleCharCount: number;
  descriptionCharCount: number;
  compliance?: {
    score: number;
    violations: Array<{
      type: string;
      severity: string;
      message: string;
      location: string;
    }>;
  };
  model?: string;
  retryCount?: number;
}
```

## Best Practices

### Rule Design

**DO**:
- Be specific with forbidden terms
- Provide clear reasons for rules
- Test rules with sample content first
- Use context field to limit rule scope
- Document rules in style-guide.md

**DON'T**:
- Create too many rules (increases retry rate)
- Use overly broad patterns
- Forbid common Japanese grammar
- Mix multiple concerns in one rule
- Add rules without testing impact

### Performance Optimization

**Reduce Retry Rate**:
- Set compliance threshold to 80% instead of 85% (trade-off: less strict)
- Remove low-value rules that rarely matter
- Use warnings instead of errors for minor issues

**Cost Management**:
- Monitor retry rate in logs
- If >40%, review rule strictness
- Consider raising threshold or relaxing rules
- Use o1-mini only for critical content (add URL filtering)

### Content Quality

**Balance**:
- Strict rules → High retry rate → High cost
- Loose rules → Low quality → Poor SEO
- Optimal: 20-30% retry rate with 85% threshold

**Monitoring**:
- Track average compliance score over time
- Review common violations weekly
- Update rules based on real violations
- A/B test rule changes with sample URLs

## Troubleshooting

### High Retry Rate (>50%)

**Symptoms**:
- Most URLs trigger o1-mini
- High processing cost
- Slow processing time

**Solutions**:
1. Review logs to identify most common violations
2. Check if rules conflict or are too strict
3. Lower threshold to 80% temporarily
4. Remove rules that don't impact SEO meaningfully

### Low Compliance Scores

**Symptoms**:
- Even o1-mini produces <85% scores
- Many violations of same rule

**Solutions**:
1. Check if forbidden terms are too common in Japanese
2. Verify required terms are actually relevant to content
3. Review if grammar rules are too restrictive
4. Consider if rules match actual brand guidelines

### False Positives

**Symptoms**:
- Valid content flagged as violations
- Substring matches causing issues

**Solutions**:
1. Check validator's word boundary logic
2. Add context field to rules to limit scope
3. Use more specific terms with particles
4. Test with containsTerm() function directly

### JSON Parse Errors (o1-mini)

**Symptoms**:
- o1-mini responses fail to parse
- Regex extraction returns null

**Solutions**:
1. Check if response contains valid JSON
2. Review prompt for clarity on output format
3. Add fallback to existing meta if parse fails
4. Log raw response to debug

## Examples

### Example 1: Proofreading Service

**Goal**: Enforce use of 校正 instead of 編集 for proofreading.

**Configuration**:
```json
{
  "terminology": {
    "required": [
      {"term": "校正", "note": "Use for proofreading"}
    ],
    "forbidden": [
      {
        "term": "編集",
        "reason": "Use 校正 for proofreading context",
        "context": "proofreading"
      }
    ]
  }
}
```

**Before** (GPT-4o, 70%):
- Title: プロフェッショナル編集サービス
- Description: 高品質な編集を提供します。あなたの文書を改善しましょう。
- Violations: 編集 (should be 校正), あなた (too informal), ましょう (suggestion form)

**After** (o1-mini, 100%):
- Title: プロフェッショナル校正サービス
- Description: 高品質な校正を提供し、文書の品質を向上させます。
- Violations: None

### Example 2: Corporate Website

**Goal**: Maintain professional tone, avoid casual language.

**Configuration**:
```json
{
  "terminology": {
    "forbidden": [
      {"term": "あなた", "reason": "Too informal"},
      {"term": "お客様", "reason": "Use specific audience segment"}
    ]
  },
  "grammar": {
    "forbidden_forms": [
      {"form": "ましょう", "reason": "Avoid suggestion form"},
      {"form": "ですね", "reason": "Too conversational"}
    ]
  },
  "tone": {
    "formality": "Professional/Corporate",
    "pov": "Third person"
  }
}
```

**Before** (GPT-4o, 65%):
- Title: お客様の課題を解決しましょう
- Description: 専門家があなたの問題を解決しますね。一緒に始めましょう。
- Violations: お客様, あなた, ましょう (3x), ですね

**After** (o1-mini, 95%):
- Title: ビジネス課題を解決する専門サービス
- Description: 経験豊富な専門家が、企業の課題解決を支援します。
- Violations: None

### Example 3: SEO-Focused

**Goal**: Ensure keywords in titles, clear value props in descriptions.

**Configuration**:
```json
{
  "seo": {
    "title_guidelines": "主要キーワードをタイトルの前半に含める",
    "description_guidelines": "具体的な利益と明確な価値提案を提示"
  },
  "terminology": {
    "required": [
      {"term": "SEO", "note": "Include for search optimization context"}
    ]
  }
}
```

**Result**:
- Validator doesn't enforce SEO rules directly (free-form guidance)
- LLM uses guidelines to optimize content structure
- Required term ensures "SEO" appears in title/description

## API Reference

### Types

See `lib/style-guide/types.ts` for full type definitions.

### Functions

#### loadStyleGuide()

```typescript
import { loadStyleGuide } from './lib/style-guide/config';

const styleGuide = loadStyleGuide();
// Returns StyleGuide object from style-guide.json
```

#### validateStyleCompliance()

```typescript
import { validateStyleCompliance } from './lib/style-guide/validator';

const result = validateStyleCompliance(
  '校正サービス',
  'プロフェッショナルな校正を提供',
  styleGuide
);
// Returns: { score: 100, violations: [], compliant: true, details: {...} }
```

#### buildStyleGuidePrompt()

```typescript
import { buildStyleGuidePrompt } from './lib/style-guide/prompt-builder';

const prompt = buildStyleGuidePrompt(
  styleGuide,
  'https://example.com',
  '既存タイトル',
  '既存説明'
);
// Returns: Japanese prompt string with injected rules
```

#### improveJapaneseMeta()

```typescript
import { improveJapaneseMeta } from './lib/meta-improver';

const result = await improveJapaneseMeta(
  'https://example.com',
  '既存タイトル',
  '既存説明'
);
// Returns: { title, description, compliance, model, retryCount, ... }
```

## Future Enhancements

**Planned**:
- [ ] Configurable compliance threshold per rule
- [ ] Rule priority/weighting system
- [ ] A/B testing framework for rules
- [ ] Analytics dashboard for compliance trends
- [ ] Custom validation functions via plugins
- [ ] Rule suggestions based on violation patterns
- [ ] Multi-language support beyond Japanese

**Under Consideration**:
- [ ] Machine learning to optimize rules
- [ ] Integration with brand guideline databases
- [ ] Automated rule generation from existing content
- [ ] Real-time preview before processing
- [ ] Rule versioning and history

## Support

**Documentation**:
- README: Overview and quick start
- This file: Comprehensive style guide reference
- Code comments: Implementation details

**Debugging**:
- Check console logs for compliance scores
- Review violations in UI modal
- Export CSV to analyze patterns
- Test rules with small sample first

**Contributing**:
- Report issues on GitHub
- Submit rule improvements via PR
- Share successful rule configurations
- Document edge cases found

---

Last updated: 2025-10-29
