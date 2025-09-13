import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Risk Analyzer Tool
 * プロジェクトの潜在的リスクを網羅的に洗い出し、評価と対策を提案
 */
export const riskAnalyzerTool = createTool({
  id: 'risk-analyzer',
  description: 'プロジェクトに関連する潜在的リスクを網羅的に洗い出し、発生確率、影響度、推奨される対応策をリスト化する',
  inputSchema: z.object({
    project_context: z.string().describe('プロジェクトの現在の状況とコンテキスト'),
    project_type: z.string().describe('プロジェクトの種類'),
    project_phase: z.string().describe('現在のプロジェクトフェーズ'),
    identified_issues: z.array(z.string()).optional().describe('既に認識されている課題'),
    constraints: z.object({
      budget: z.string().optional(),
      timeline: z.string().optional(),
      resources: z.string().optional(),
      technical: z.string().optional(),
    }).optional().describe('プロジェクトの制約条件'),
  }),
  outputSchema: z.object({
    risk_register: z.array(z.object({
      risk_id: z.string().describe('リスクID'),
      category: z.enum(['technical', 'management', 'commercial', 'external', 'organizational']).describe('リスクカテゴリ'),
      risk_description: z.string().describe('リスクの詳細説明'),
      trigger_events: z.array(z.string()).describe('トリガーイベント'),
      probability: z.enum(['very_low', 'low', 'medium', 'high', 'very_high']).describe('発生確率'),
      impact: z.enum(['very_low', 'low', 'medium', 'high', 'very_high']).describe('影響度'),
      risk_score: z.number().describe('リスクスコア（1-25）'),
      affected_areas: z.array(z.string()).describe('影響を受ける領域'),
      response_strategy: z.enum(['avoid', 'transfer', 'mitigate', 'accept']).describe('対応戦略'),
      mitigation_actions: z.array(z.object({
        action: z.string(),
        owner: z.string(),
        deadline: z.string(),
        cost_estimate: z.string().optional(),
      })).describe('軽減策'),
      contingency_plan: z.string().describe('コンティンジェンシープラン'),
      residual_risk: z.string().describe('残存リスク'),
      monitoring_indicators: z.array(z.string()).describe('モニタリング指標'),
    })).describe('リスク登録簿'),
    risk_matrix: z.object({
      critical_risks: z.array(z.string()).describe('重大リスク（要即座対応）'),
      high_risks: z.array(z.string()).describe('高リスク（要対策）'),
      medium_risks: z.array(z.string()).describe('中リスク（要監視）'),
      low_risks: z.array(z.string()).describe('低リスク（受容可能）'),
    }).describe('リスクマトリクス'),
    risk_trends: z.array(z.object({
      trend: z.string(),
      implication: z.string(),
      recommended_action: z.string(),
    })).describe('リスクトレンドと推奨アクション'),
    overall_risk_assessment: z.object({
      project_risk_level: z.enum(['low', 'medium', 'high', 'critical']),
      key_concerns: z.array(z.string()),
      success_probability: z.number().describe('プロジェクト成功確率（%）'),
      recommendations: z.array(z.string()),
    }).describe('全体リスク評価'),
  }),
  execute: async ({ context }) => {
    const prompt = `
あなたは経験豊富なリスクマネジメントの専門家です。以下のプロジェクト情報を基に、包括的なリスク分析を実施してください。

## プロジェクト情報
### コンテキスト
${context.project_context}

### プロジェクトタイプ
${context.project_type}

### 現在のフェーズ
${context.project_phase}

${context.identified_issues ? `### 既知の課題
${context.identified_issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}` : ''}

${context.constraints ? `### 制約条件
${context.constraints.budget ? `- 予算: ${context.constraints.budget}` : ''}
${context.constraints.timeline ? `- 期限: ${context.constraints.timeline}` : ''}
${context.constraints.resources ? `- リソース: ${context.constraints.resources}` : ''}
${context.constraints.technical ? `- 技術: ${context.constraints.technical}` : ''}` : ''}

## 分析タスク

1. **リスク登録簿の作成（risk_register）**
   以下のカテゴリごとに潜在的リスクを特定：
   - Technical: 技術的リスク
   - Management: 管理上のリスク
   - Commercial: 商業的リスク
   - External: 外部要因リスク
   - Organizational: 組織的リスク

   各リスクについて以下を評価：
   - 発生確率（very_low/low/medium/high/very_high）
   - 影響度（very_low/low/medium/high/very_high）
   - リスクスコア（確率×影響度、1-25のスケール）
   - 対応戦略（avoid/transfer/mitigate/accept）
   - 具体的な軽減策
   - コンティンジェンシープラン
   - モニタリング指標

2. **リスクマトリクスの作成（risk_matrix）**
   リスクスコアに基づいて分類：
   - Critical（スコア20-25）: 即座の対応が必要
   - High（スコア15-19）: 対策が必要
   - Medium（スコア8-14）: 監視が必要
   - Low（スコア1-7）: 受容可能

3. **リスクトレンドの分析（risk_trends）**
   プロジェクトの進行に伴うリスクの変化傾向を予測

4. **全体リスク評価（overall_risk_assessment）**
   - プロジェクト全体のリスクレベル
   - 主要な懸念事項
   - プロジェクト成功確率の推定
   - 推奨事項

## 考慮すべき一般的なリスク領域
- スコープクリープ
- リソース不足
- 技術的複雑性
- ステークホルダーの期待値管理
- 変更管理
- 品質問題
- コミュニケーション不足
- 外部依存関係
- コンプライアンス/規制要件
- サイバーセキュリティ

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
              content: 'あなたはPMI-RMPの資格を持つリスクマネジメントの専門家です。PMBOK準拠のリスク管理プロセスに精通し、実践的なリスク対策を提案できます。'
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
        risk_register: result.risk_register || [],
        risk_matrix: result.risk_matrix || {
          critical_risks: [],
          high_risks: [],
          medium_risks: [],
          low_risks: [],
        },
        risk_trends: result.risk_trends || [],
        overall_risk_assessment: result.overall_risk_assessment || {
          project_risk_level: 'medium',
          key_concerns: [],
          success_probability: 70,
          recommendations: [],
        },
      };
    } catch (error) {
      console.error('Error analyzing risks:', error);
      throw new Error('Failed to analyze risks');
    }
  },
});