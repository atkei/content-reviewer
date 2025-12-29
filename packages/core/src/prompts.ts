import type { Language } from './types.js';
import { DEFAULT_INSTRUCTION_EN, DEFAULT_INSTRUCTION_JA } from './default-instructions.js';

export type SystemPromptOptions = Readonly<{
  instruction?: string;
}>;

type LanguagePrompts = Readonly<{
  buildSystemPrompt: (options: SystemPromptOptions) => string;
  buildUserPrompt: () => string;
}>;

const allPrompts: Record<Language, LanguagePrompts> = {
  ja: {
    buildSystemPrompt: ({ instruction }) => {
      const instructions = (instruction || DEFAULT_INSTRUCTION_JA).trimEnd() + '\n';

      return (
        `${instructions}
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
`
      );
    },
    buildUserPrompt: () => '以下のテキストをレビューしてください：\n\n\n',
  },
  en: {
    buildSystemPrompt: ({ instruction }) => {
      const instructions = (instruction || DEFAULT_INSTRUCTION_EN).trimEnd() + '\n';

      return (
        `${instructions}
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
`
      );
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
