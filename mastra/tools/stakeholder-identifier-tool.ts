import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Stakeholder Identifier Tool
 * プロジェクトのステークホルダーを特定し、役割・関心・影響度をマッピング
 */
export const stakeholderIdentifierTool = createTool({
  id: 'stakeholder-identifier',
  description: 'プロジェクトの内部・外部ステークホルダーを特定し、役割、関心、影響度をリストアップする',
  inputSchema: z.object({
    project_goal: z.string().describe('プロジェクトの目標'),
    project_scope: z.string().optional().describe('プロジェクトのスコープ'),
    key_activities: z.array(z.string()).describe('プロジェクトの主要活動'),
    organization_context: z.string().optional().describe('組織のコンテキスト情報'),
  }),
  outputSchema: z.object({
    stakeholder_map: z.array(z.object({
      name: z.string().describe('ステークホルダー名/役職'),
      category: z.enum(['sponsor', 'customer', 'team', 'vendor', 'regulator', 'other']).describe('ステークホルダーのカテゴリ'),
      role: z.string().describe('プロジェクトにおける役割'),
      interest: z.enum(['high', 'medium', 'low']).describe('プロジェクトへの関心度'),
      influence: z.enum(['high', 'medium', 'low']).describe('プロジェクトへの影響力'),
      expectations: z.array(z.string()).describe('期待事項'),
      communication_preference: z.string().describe('推奨コミュニケーション方法'),
    })).describe('ステークホルダーマップ'),
    engagement_strategy: z.array(z.object({
      stakeholder_group: z.string(),
      strategy: z.string(),
      frequency: z.string(),
      method: z.string(),
    })).describe('ステークホルダーエンゲージメント戦略'),
    raci_matrix: z.array(z.object({
      activity: z.string(),
      responsible: z.array(z.string()),
      accountable: z.string(),
      consulted: z.array(z.string()),
      informed: z.array(z.string()),
    })).describe('RACI責任分担マトリクス'),
  }),
  execute: async ({ context }) => {
    const prompt = `
あなたは経験豊富なPMOエキスパートです。以下のプロジェクト情報を基に、ステークホルダーを特定し、エンゲージメント戦略とRACIマトリクスを作成してください。

## プロジェクト情報
### 目標
${context.project_goal}

${context.project_scope ? `### スコープ
${context.project_scope}\n` : ''}

### 主要活動
${context.key_activities.map((activity, i) => `${i + 1}. ${activity}`).join('\n')}

${context.organization_context ? `### 組織コンテキスト
${context.organization_context}\n` : ''}

## 分析タスク

1. **ステークホルダーマップの作成（stakeholder_map）**
   プロジェクトに関与する内部・外部のステークホルダーを特定し、以下を分析：
   - 名前/役職
   - カテゴリ（sponsor/customer/team/vendor/regulator/other）
   - プロジェクトでの役割
   - 関心度（high/medium/low）
   - 影響力（high/medium/low）
   - 期待事項
   - 推奨コミュニケーション方法

2. **エンゲージメント戦略の策定（engagement_strategy）**
   関心度と影響力のマトリクスに基づいて、ステークホルダーグループごとの：
   - エンゲージメント戦略
   - コミュニケーション頻度
   - コミュニケーション方法

3. **RACIマトリクスの作成（raci_matrix）**
   主要なプロジェクト活動ごとに：
   - Responsible（実行責任者）
   - Accountable（説明責任者）
   - Consulted（相談先）
   - Informed（情報共有先）

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
              content: 'あなたはプロジェクト管理のスペシャリストで、ステークホルダーマネジメントとRACIマトリクスの作成に熟練しています。日本の企業文化を理解し、適切なステークホルダーを特定できます。'
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
      
      // 新しいOpenAI APIレスポンス形式に対応
      let content;
      
      if (data.output && data.output[0] && data.output[0].content) {
        // 新しいレスポンス形式 (gpt-4.1-2025-04-14)
        const textContent = data.output[0].content.find((c: any) => c.type === 'output_text');
        content = textContent ? textContent.text : null;
      } else if (data.choices && data.choices[0] && data.choices[0].message) {
        // 従来のレスポンス形式
        content = data.choices[0].message.content;
      } else {
        throw new Error('OpenAI APIからの無効なレスポンス構造');
      }

      if (!content) {
        throw new Error('レスポンスからコンテンツを取得できませんでした');
      }

      let result;
      
      // JSON解析（既にオブジェクトの場合はそのまま使用）
      if (typeof content === 'string') {
        try {
          result = JSON.parse(content);
        } catch (parseError) {
          console.error('JSON解析エラー:', parseError);
          console.error('受信したコンテンツ:', content);
          const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parse error';
          throw new Error(`JSON解析に失敗しました: ${errorMessage}`);
        }
      } else if (typeof content === 'object') {
        result = content;
      } else {
        throw new Error('予期しないコンテンツタイプ');
      }

      return {
        stakeholder_map: result.stakeholder_map || [],
        engagement_strategy: result.engagement_strategy || [],
        raci_matrix: result.raci_matrix || [],
      };
    } catch (error) {
      console.error('Error identifying stakeholders:', error);
      throw new Error('Failed to identify stakeholders');
    }
  },
});