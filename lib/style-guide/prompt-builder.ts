export function buildStyleGuidePrompt(
  styleGuide: any,
  url: string,
  existingTitle: string,
  existingDescription: string
): string {
  // Build brand positioning
  const brandPositioning = styleGuide.brand_positioning ? `
### ブランドポジショニング
- コアアイデンティティ: ${styleGuide.brand_positioning.core_identity}
- ノーススターメッセージ: ${styleGuide.brand_positioning.north_star_message}
- 私たちは以下ではありません:
${styleGuide.brand_positioning.what_we_are_not?.map((n: string) => `  - ${n}`).join('\n')}
` : '';

  // Build brand name rules
  const brandRules = styleGuide.brand_name ? `
### ブランド名の使用ルール
- ローマ字: ${styleGuide.brand_name.roman}
- カタカナ: ${styleGuide.brand_name.katakana}
- ページタイトル: ${styleGuide.brand_name.usage_rules.page_titles}
- メタディスクリプション: ${styleGuide.brand_name.usage_rules.meta_descriptions}
` : '';

  // Build value propositions with pillars
  const valueProps = styleGuide.value_propositions?.primary_pillars ? `
### 主要価値提案（4つの柱）

${styleGuide.value_propositions.primary_pillars.map((p: any, i: number) => `
**${i + 1}. ${p.pillar}**
英語: "${p.english}"
メッセージ: ${p.message}
`).join('\n')}

**支持証拠:**
${styleGuide.value_propositions.supporting_evidence?.map((e: string) => `- ${e}`).join('\n')}
` : '';

  // Build emotional drivers
  const emotionalDrivers = styleGuide.emotional_drivers ? `
### ターゲット研究者の感情的ニーズ
${styleGuide.emotional_drivers.target_researcher_feelings?.map((f: string) => `- ${f}`).join('\n')}

**メッセージングアプローチ:** ${styleGuide.emotional_drivers.messaging_approach}
` : '';

  // Build service terminology rules
  const serviceRules = styleGuide.service_terminology ? `
### サービス用語の重要な区別

**校正サービスページの場合:**
- 使用: ${styleGuide.service_terminology.core_proofreading_services?.primary_keywords?.join('、')}
- 対象: ${styleGuide.service_terminology.core_proofreading_services?.when_to_use}

**戦略的サポートサービスの場合:**
- 使用禁止: ${styleGuide.service_terminology.strategic_support_services?.do_not_use?.join('、')}
- 代わりに使用: ${styleGuide.service_terminology.strategic_support_services?.use_instead?.join('、')}
- 対象: ${styleGuide.service_terminology.strategic_support_services?.when_to_use}
` : '';

  // Build forbidden terms list
  const forbiddenTerms = styleGuide.terminology?.forbidden_always
    ?.map((f: any) => {
      const explanation = f.reason || f.use_instead;
      return `- ${f.term} (${explanation})`;
    })
    .join('\n') || '';

  // Build preferred terms
  const preferredTerms = styleGuide.terminology?.preferred_terms
    ?.map((t: string) => `- ${t}`)
    .join('\n') || '';

  // Build conditional use rules
  const conditionalRules = styleGuide.terminology?.conditional_use
    ?.map((c: any) => `- ${c.term}\n  使用可: ${c.use_when}\n  使用禁止: ${c.do_not_use_when}`)
    .join('\n') || '';

  // Build forbidden grammar
  const forbiddenGrammar = styleGuide.grammar_rules?.forbidden_forms
    ?.map((f: string) => `- ${f}`)
    .join('\n') || '';

  // Build tone guidelines
  const toneGuidelines = styleGuide.tone_guidelines?.attributes
    ?.map((g: string) => `- ${g}`)
    .join('\n') || '';

  // Build SEO title guidance
  const seoTitleGuidance = styleGuide.seo_guidelines?.titles ? `
### タイトル構造
- 最適文字数: ${styleGuide.seo_guidelines.titles.character_limit}文字
- 注意: ${styleGuide.seo_guidelines.titles.note}
- 校正サービス: ${styleGuide.seo_guidelines.titles.structure_proofreading}
- 戦略的サービス: ${styleGuide.seo_guidelines.titles.structure_strategic}
` : '';

  // Build SEO description patterns
  const descriptionPatterns = styleGuide.seo_guidelines?.descriptions?.patterns ? `
### メタディスクリプション パターン（8つの選択肢）

**文字数推奨:** ${styleGuide.seo_guidelines.descriptions.character_limit_optimal}文字（モバイル対応: 最初の${styleGuide.seo_guidelines.descriptions.character_limit_mobile_safe}文字に重要要素を配置）

${styleGuide.seo_guidelines.descriptions.patterns.map((p: any, i: number) => `
**パターン${i + 1}: ${p.pattern}**
- 構造: ${p.structure}
- 例: ${p.example}
- 使用タイミング: ${p.when_to_use}
`).join('\n')}

**パターン選択ガイダンス:**
- ${styleGuide.seo_guidelines.pattern_selection_guidance?.rotate_patterns}
- ${styleGuide.seo_guidelines.pattern_selection_guidance?.match_intent}
- ${styleGuide.seo_guidelines.pattern_selection_guidance?.maximize_characters}
- ${styleGuide.seo_guidelines.pattern_selection_guidance?.front_load_keywords}

**必須要素:**
${styleGuide.seo_guidelines.descriptions.must_include?.map((m: string) => `- ${m}`).join('\n')}

**避けるべき:**
${styleGuide.seo_guidelines.descriptions.avoid?.map((a: string) => `- ${a}`).join('\n')}
` : '';

  // Build examples with patterns
  const examples = styleGuide.examples_by_service_type ? `
### 実例

**校正サービスの例:**

タイトル:
${styleGuide.examples_by_service_type.proofreading_services?.titles?.map((t: string) => `- ${t}`).join('\n')}

ディスクリプション（パターン別）:
${styleGuide.examples_by_service_type.proofreading_services?.descriptions_varied?.map((d: any) => `- [${d.pattern}] ${d.text} (${d.chars}文字)`).join('\n')}

**戦略的サービスの例:**

タイトル:
${styleGuide.examples_by_service_type.strategic_services?.titles?.map((t: string) => `- ${t}`).join('\n')}

ディスクリプション（パターン別）:
${styleGuide.examples_by_service_type.strategic_services?.descriptions_varied?.map((d: any) => `- [${d.pattern}] ${d.text} (${d.chars}文字)`).join('\n')}
` : '';

  // Build decision tree
  const decisionTree = styleGuide.decision_tree ? `
### 判断基準

このページは何のサービスについてですか？

**校正サービスの場合:**
- キーワード: ${styleGuide.decision_tree.if_proofreading?.use_keywords?.join('、')}
- 焦点: ${styleGuide.decision_tree.if_proofreading?.focus}

**戦略的サービスの場合:**
- 使用禁止: ${styleGuide.decision_tree.if_strategic?.do_not_use?.join('、')}
- キーワード: ${styleGuide.decision_tree.if_strategic?.use_keywords?.join('、')}
- 焦点: ${styleGuide.decision_tree.if_strategic?.focus}
` : '';

  return `あなたはSEOの専門家です。以下のEdanzのスタイルガイドに厳密に従って、日本語のタイトルとメタディスクリプションを改善してください。

## Edanz スタイルガイド

${brandPositioning}

${brandRules}

${valueProps}

${emotionalDrivers}

${serviceRules}

### 絶対禁止用語
${forbiddenTerms}

${preferredTerms ? `### 推奨用語\n${preferredTerms}\n` : ''}

${conditionalRules ? `### 条件付き使用ルール\n${conditionalRules}\n` : ''}

### 禁止文法形式
${forbiddenGrammar}

### 文法スタイル
${styleGuide.grammar_rules?.preferred_style || ''}

### トーン
- 形式: ${styleGuide.tone_guidelines?.formality || ''}
- 視点: ${styleGuide.tone_guidelines?.voice || ''}
${toneGuidelines}

${seoTitleGuidance}

${descriptionPatterns}

${examples}

${decisionTree}

## ページ情報

URL: ${url}
現在のタイトル: ${existingTitle || 'なし'}
現在のメタディスクリプション: ${existingDescription || 'なし'}

## 指示

1. URLとコンテンツからページのサービスタイプを判断してください（校正サービス vs 戦略的サービス）
2. そのサービスタイプに適切なキーワードと用語を使用してください
3. 絶対禁止用語は決して使用しないでください
4. ブランド名は指定された形式で使用してください（タイトル: Edanz（エダンズ）、ディスクリプション: エダンズ）
5. 4つの価値提案の柱のいずれかを反映してください
6. ターゲット研究者の感情的ニーズに応えるメッセージングを使用してください
7. メタディスクリプションは8つのパターンから最適なものを選択してください
8. パターンの多様性を確保してください（ページごとに異なるパターンを使用）

## 要件

- タイトル: ${styleGuide.seo_guidelines?.titles?.character_limit || 30}文字以内（全角・半角ともに1文字としてカウント）
- メタディスクリプション: ${styleGuide.seo_guidelines?.descriptions?.character_limit_optimal || '100-120'}文字（全角・半角ともに1文字としてカウント）
- タイトルにEdanz（エダンズ）を含める
- ディスクリプションにエダンズ（カタカナ）を含める
- 主要キーワードをタイトルの前方に配置
- ディスクリプションの最初の80文字に重要要素を配置（モバイル表示対応）
- **スタイルガイドの全ての規則を厳守してください**

以下のJSON形式で回答してください:
{
  "title": "改善されたタイトル",
  "description": "改善されたメタディスクリプション"
}`;
}
