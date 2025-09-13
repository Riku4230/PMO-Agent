import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Milestone Proposer Tool
 * プロジェクトの期間、性質、ゴールに基づいて、複数の標準的なマイルストーンパターンを提案
 */
export const milestoneProposerTool = createTool({
  id: 'milestone-proposer',
  description: 'プロジェクトの期間、性質、ゴールに基づいて、複数の標準的なマイルストーンパターンを提案する',
  inputSchema: z.object({
    project_duration: z.string().describe('プロジェクトの想定期間'),
    project_type: z.string().describe('プロジェクトの種類（例: システム開発、業務改革、新規事業）'),
    project_goal: z.string().describe('プロジェクトの目標'),
    constraints: z.string().optional().describe('制約条件（予算、リソース、期限など）'),
  }),
  outputSchema: z.object({
    recommended_pattern: z.object({
      name: z.string(),
      description: z.string(),
      milestones: z.array(z.object({
        name: z.string(),
        timing: z.string(),
        deliverables: z.array(z.string()),
        criteria: z.string(),
      })),
      advantages: z.array(z.string()),
      disadvantages: z.array(z.string()),
    }).describe('推奨マイルストーンパターン'),
    alternative_patterns: z.array(z.object({
      name: z.string(),
      description: z.string(),
      milestones: z.array(z.object({
        name: z.string(),
        timing: z.string(),
        deliverables: z.array(z.string()),
        criteria: z.string(),
      })),
      advantages: z.array(z.string()),
      disadvantages: z.array(z.string()),
      when_to_use: z.string(),
    })).describe('代替マイルストーンパターン'),
    selection_rationale: z.string().describe('推奨パターン選定の理由'),
  }),
  execute: async ({ context }) => {
    const prompt = `
あなたは経験豊富なPMOエキスパートです。以下のプロジェクト情報を基に、最適なマイルストーンパターンを提案してください。

## プロジェクト情報
- 期間: ${context.project_duration}
- 種類: ${context.project_type}
- 目標: ${context.project_goal}
${context.constraints ? `- 制約: ${context.constraints}` : ''}

## 分析タスク

1. **推奨パターンの提案（recommended_pattern）**
   プロジェクトの特性に最も適したマイルストーンパターンを1つ提案し、以下を含める：
   - パターン名と説明
   - 各マイルストーンの名称、タイミング、成果物、成功基準
   - このパターンの利点と欠点

2. **代替パターンの提示（alternative_patterns）**
   異なるアプローチの代替パターンを2-3個提示し、それぞれについて：
   - パターンの特徴と適用場面
   - 各マイルストーンの詳細
   - 利点と欠点
   - どのような場合に選択すべきか

3. **選定理由の説明（selection_rationale）**
   推奨パターンを選んだ理由を、プロジェクトの特性と照らし合わせて説明

## マイルストーンパターンの例
- ウォーターフォール型: 順次的なフェーズ進行
- アジャイル型: イテレーティブな開発サイクル
- ハイブリッド型: 計画フェーズ＋反復開発
- ステージゲート型: 各フェーズ終了時に承認ゲート
- インクリメンタル型: 段階的な機能リリース

## 出力形式
JSON形式で出力してください。
`;

    try {
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new Error("OPENAI_API_KEYが設定されていません。");
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-nano',
          messages: [
            {
              role: 'system',
              content: 'あなたはプロジェクト管理のエキスパートで、様々な業界やプロジェクトタイプに適したマイルストーン設計の豊富な経験があります。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI APIからの応答エラー: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      return {
        recommended_pattern: result.recommended_pattern || {
          name: '',
          description: '',
          milestones: [],
          advantages: [],
          disadvantages: [],
        },
        alternative_patterns: result.alternative_patterns || [],
        selection_rationale: result.selection_rationale || '',
      };
    } catch (error) {
      console.error('Error proposing milestones:', error);
      throw new Error('Failed to propose milestones');
    }
  },
});