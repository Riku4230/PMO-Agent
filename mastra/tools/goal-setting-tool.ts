import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Goal Setting Assistant Tool
 * SMART原則に基づいたプロジェクトゴールと中間目標を生成
 * 主要論点と不足論点の整理も実行
 */
export const goalSettingTool = createTool({
  id: 'goal-setting-assistant',
  description: '主要論点と不足論点を整理し、SMART原則に基づいたプロジェクトゴールと中間目標を生成する',
  inputSchema: z.object({
    discussion_points: z.array(z.string()).describe('議論された主要論点'),
    project_context: z.string().optional().describe('プロジェクトのコンテキスト情報'),
    timeline: z.string().optional().describe('プロジェクトのタイムライン'),
  }),
  outputSchema: z.object({
    missing_points: z.array(z.string()).describe('不足している論点のリスト'),
    project_goal: z.object({
      specific: z.string().describe('具体的な目標'),
      measurable: z.string().describe('測定可能な指標'),
      achievable: z.string().describe('達成可能性の根拠'),
      relevant: z.string().describe('関連性・重要性'),
      time_bound: z.string().describe('期限設定'),
    }).describe('SMART原則に基づくプロジェクトゴール'),
    milestones: z.array(z.object({
      phase: z.string(),
      goal: z.string(),
      deadline: z.string(),
      success_criteria: z.string(),
    })).describe('中間目標・マイルストーン'),
    success_metrics: z.array(z.object({
      metric: z.string(),
      target: z.string(),
      measurement_method: z.string(),
    })).describe('成功指標とKPI'),
  }),
  execute: async ({ context }) => {
    const prompt = `
あなたは経験豊富なPMOエキスパートです。以下の情報を基に、SMART原則に従ったプロジェクトゴールとマイルストーンを設定してください。

## 議論された主要論点
${context.discussion_points.map((point, i) => `${i + 1}. ${point}`).join('\n')}

${context.project_context ? `## プロジェクトのコンテキスト
${context.project_context}\n` : ''}

${context.timeline ? `## タイムライン
${context.timeline}\n` : ''}

## 分析タスク

1. **不足論点の特定（missing_points）**
   プロジェクト立ち上げに通常必要とされる以下の論点が議論されているか確認し、不足を指摘：
   - ステークホルダーの期待値とエンゲージメント方法
   - リスク管理計画
   - 品質基準と検証方法
   - コミュニケーション計画
   - 変更管理プロセス
   - 予算とリソース計画
   - 成果物の定義
   - 意思決定プロセス

2. **SMARTゴールの設定（project_goal）**
   - Specific: 具体的で明確な目標を設定
   - Measurable: 定量的に測定可能な指標を設定
   - Achievable: 現実的に達成可能な目標であることを説明
   - Relevant: 組織の戦略や目的との関連性を明確化
   - Time-bound: 明確な期限を設定

3. **マイルストーンの設定（milestones）**
   - プロジェクトを適切なフェーズに分割
   - 各フェーズごとに明確な目標、期限、成功基準を設定

4. **成功指標の設定（success_metrics）**
   - プロジェクトの成功を測定するためのKPIを設定
   - 各指標に対して目標値と測定方法を明確化

## 出力形式
以下のJSON形式で出力してください：
{
  "missing_points": ["不足論点1", "不足論点2", ...],
  "project_goal": {
    "specific": "具体的な目標",
    "measurable": "測定可能な指標",
    "achievable": "達成可能性の根拠",
    "relevant": "関連性・重要性",
    "time_bound": "期限設定"
  },
  "milestones": [
    {
      "phase": "フェーズ名",
      "goal": "フェーズの目標",
      "deadline": "期限",
      "success_criteria": "成功基準"
    }
  ],
  "success_metrics": [
    {
      "metric": "指標名",
      "target": "目標値",
      "measurement_method": "測定方法"
    }
  ]
}
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
              content: 'あなたは経験豊富なPMOエキスパートで、SMART原則を熟知しています。プロジェクトの成功に必要な目標設定と計画立案の専門家です。'
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
        missing_points: result.missing_points || [],
        project_goal: result.project_goal || {
          specific: '',
          measurable: '',
          achievable: '',
          relevant: '',
          time_bound: '',
        },
        milestones: result.milestones || [],
        success_metrics: result.success_metrics || [],
      };
    } catch (error) {
      console.error('Error setting goals:', error);
      throw new Error('Failed to set project goals');
    }
  },
});