import type { Language } from './types.js';
import { DEFAULT_INSTRUCTION_EN, DEFAULT_INSTRUCTION_JA } from './default-instructions.js';

export type SystemPromptOptions = Readonly<{
  instruction?: string;
  factCheckEnabled?: boolean;
  asOf?: string;
}>;

type LanguagePrompts = Readonly<{
  buildSystemPrompt: (options: SystemPromptOptions) => string;
  buildUserPrompt: () => string;
}>;

const allPrompts: Record<Language, LanguagePrompts> = {
  ja: {
    buildSystemPrompt: ({ instruction, factCheckEnabled, asOf }) => {
      const instructions = (instruction || DEFAULT_INSTRUCTION_JA).trimEnd() + '\n';
      const factCheckNote =
        factCheckEnabled && asOf
          ? `\n追加ルール:\n- ファクトチェック結果で「contradicted」とされた内容のみを技術的誤りとして指摘してください。\n- ファクトチェック結果に基づく指摘には source.url を付けてください。\n- 「現在」「最新」などの表現を使う場合は ${asOf} 時点であることを明記してください。\n- 本文に存在する情報を「未記載」として指摘しないでください。\n`
          : '';

      return `${instructions}
レビュー結果は日本語で、以下のJSON構造で返してください：
- issues: 見つかった問題点の配列
  - severity: 深刻度
    - "error": 致命的な問題（修正必須）
    - "warning": 重要な問題（修正推奨）
    - "suggestion": 軽微な改善提案（任意）
  - message: 問題の説明
  - matchText: 問題箇所を含むテキスト片（10-50文字程度。完全一致できる固有のテキストを抜き出してください）
  - suggestion: 改善提案（オプション）

注意：
- 有効なJSONのみを返してください（前後に文章やMarkdownのコードブロック等を付けないでください）。
- lineNumberは不要です。matchTextのみを提供してください。
- 建設的で具体的なフィードバックを提供してください。
${factCheckNote}
`;
    },
    buildUserPrompt: () => '以下のテキストをレビューしてください：\n\n\n',
  },
  en: {
    buildSystemPrompt: ({ instruction, factCheckEnabled, asOf }) => {
      const instructions = (instruction || DEFAULT_INSTRUCTION_EN).trimEnd() + '\n';
      const factCheckNote =
        factCheckEnabled && asOf
          ? `\nAdditional rules:\n- Only report factual inaccuracies if they are contradicted in the fact-check results.\n- If an issue is based on fact-check results, include source.url.\n- If you use "current" or "latest", state it as of ${asOf}.\n- Do not claim something is missing when it appears in the content.\n`
          : '';

      return `${instructions}
Provide the review results in English with the following JSON structure:
- issues: Array of found issues
  - severity: Severity level
    - "error": Critical issues (Must fix)
    - "warning": Important issues (Should fix)
    - "suggestion": Minor suggestions (Nice to fix)
  - message: Issue description
  - matchText: Text snippet containing the issue (10-50 characters, extract unique text that can be exactly matched)
  - suggestion: Improvement suggestion (optional)

Note:
- Return valid JSON only (do not wrap in markdown code fences or add extra text).
- Do not provide lineNumber. Only provide matchText.
- Provide constructive and specific feedback.
${factCheckNote}
`;
    },
    buildUserPrompt: () => 'Please review the following text:\n\n\n',
  },
};

export function getLanguagePrompts(language: Language): LanguagePrompts {
  if (language in allPrompts) {
    return allPrompts[language];
  }
  throw new Error(`Unhandled language: ${language}`);
}
