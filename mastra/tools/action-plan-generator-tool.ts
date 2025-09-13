import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Action Plan Generator Tool
 * プロジェクトゴールとマイルストーンに基づき、詳細なアクションプランとWBS構造を生成
 */
export const actionPlanGeneratorTool = createTool({
  id: 'action-plan-generator',
  description: 'プロジェクトゴールとマイルストーンに基づき、タスクを詳細なアクション項目に分解し、担当者の割り当てを提案する',
  inputSchema: z.object({
    project_goal: z.string().describe('プロジェクトの目標'),
    milestones: z.array(z.object({
      name: z.string(),
      deadline: z.string(),
    })).describe('設定されたマイルストーン'),
    team_members: z.array(z.string()).optional().describe('チームメンバーのリスト'),
    priority_areas: z.array(z.string()).optional().describe('優先度の高い領域'),
  }),
  outputSchema: z.object({
    wbs_structure: z.array(z.object({
      wbs_code: z.string().describe('WBSコード（例: 1.1.1）'),
      level: z.number().describe('階層レベル'),
      task_name: z.string().describe('タスク名'),
      description: z.string().describe('タスクの説明'),
      deliverables: z.array(z.string()).describe('成果物'),
      estimated_hours: z.number().describe('推定工数（時間）'),
      dependencies: z.array(z.string()).describe('依存関係のあるタスク'),
      milestone: z.string().describe('関連するマイルストーン'),
    })).describe('WBS構造'),
    action_items: z.array(z.object({
      id: z.string().describe('アクションID'),
      action: z.string().describe('具体的なアクション'),
      owner: z.string().describe('担当者'),
      start_date: z.string().describe('開始予定日'),
      due_date: z.string().describe('期限'),
      priority: z.enum(['critical', 'high', 'medium', 'low']).describe('優先度'),
      status: z.enum(['not_started', 'in_progress', 'completed', 'blocked']).describe('ステータス'),
      required_resources: z.array(z.string()).describe('必要なリソース'),
      acceptance_criteria: z.string().describe('完了基準'),
      wbs_reference: z.string().describe('対応するWBSコード'),
    })).describe('アクションアイテム'),
    critical_path: z.array(z.string()).describe('クリティカルパス上のタスク'),
    resource_allocation: z.array(z.object({
      resource: z.string(),
      allocation_percentage: z.number(),
      tasks: z.array(z.string()),
    })).describe('リソース配分計画'),
  }),
  execute: async ({ context }) => {
    const prompt = `
あなたは経験豊富なPMOエキスパートです。以下の情報を基に、詳細なWBS（Work Breakdown Structure）とアクションプランを作成してください。

## プロジェクト情報
### 目標
${context.project_goal}

### マイルストーン
${context.milestones.map((m, i) => `${i + 1}. ${m.name} - 期限: ${m.deadline}`).join('\n')}

${context.team_members ? `### チームメンバー
${context.team_members.join(', ')}` : ''}

${context.priority_areas ? `### 優先領域
${context.priority_areas.join(', ')}` : ''}

## 作成タスク

1. **WBS構造の作成（wbs_structure）**
   - プロジェクトを階層的に分解（最大3-4レベル）
   - 各タスクにWBSコード（例: 1.1.1）を付与
   - タスクの説明、成果物、推定工数を明記
   - 依存関係と関連マイルストーンを明確化

2. **アクションアイテムの生成（action_items）**
   - WBSの最下層タスクから具体的なアクション項目を生成
   - 各アクションに担当者、期限、優先度を設定
   - 完了基準と必要リソースを明記
   - 初期ステータスは"not_started"

3. **クリティカルパスの特定（critical_path）**
   - プロジェクト期間に直接影響するタスクのWBSコードをリストアップ

4. **リソース配分計画（resource_allocation）**
   - チームメンバーまたは役割ごとのタスク配分
   - 配分率（%）で負荷を表現

## 注意事項
- タスクは具体的かつ測定可能なものにする
- 依存関係を適切に設定してプロジェクトの流れを明確にする
- リソースの過負荷を避ける（配分率は100%を超えないように）
- ${context.priority_areas ? '優先領域に関連するタスクは高優先度に設定' : ''}

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
              content: 'あなたはWBS作成とプロジェクト計画のスペシャリストです。PMBOK準拠のWBS作成と、実行可能なアクションプランの策定に精通しています。'
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

      // 結果の検証とデフォルト値設定
      return {
        wbs_structure: Array.isArray(result.wbs_structure) ? result.wbs_structure : [],
        action_items: Array.isArray(result.action_items) ? result.action_items : [],
        critical_path: Array.isArray(result.critical_path) ? result.critical_path : [],
        resource_allocation: Array.isArray(result.resource_allocation) ? result.resource_allocation : [],
      };
    } catch (error) {
      console.error('Error generating action plan:', error);
      // より詳細なエラーメッセージを提供
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`アクションプラン生成に失敗しました: ${errorMessage}`);
    }
  },
});