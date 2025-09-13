import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Document Parser Tool
 * キックオフ会議議事録やその他のドキュメントから、構造化された情報を抽出
 * PMO視点でのタスク分解、WBS化、リスク整理も実行
 */
export const documentParserTool = createTool({
  id: 'document-parser',
  description: '議事録やドキュメントから主要論点、決定事項、アクションアイテム、関係者を抽出し、PMO視点でタスク分解・WBS化・リスク整理を行う',
  inputSchema: z.object({
    content: z.string().describe('解析対象のドキュメントコンテンツ'),
    format: z.enum(['text', 'markdown', 'meeting_minutes']).default('text').describe('ドキュメントの形式'),
    pmo_perspective: z.boolean().default(true).describe('PMO視点でのアウトプット（タスク分解、WBS化、リスク整理）が必要な場合にtrue'),
  }),
  outputSchema: z.object({
    key_points: z.array(z.string()).describe('主要論点のリスト'),
    decisions: z.array(z.string()).describe('決定事項のリスト'),
    action_items: z.array(z.object({
      task: z.string(),
      owner: z.string(),
      deadline: z.string(),
    })).describe('アクションアイテムのリスト'),
    stakeholders: z.array(z.object({
      name: z.string(),
      role: z.string(),
    })).describe('関係者のリスト'),
    wbs_structure: z.array(z.object({
      level: z.number(),
      task: z.string(),
      sub_tasks: z.array(z.string()),
    })).describe('WBS構造（PMO視点）'),
    risks: z.array(z.object({
      risk: z.string(),
      probability: z.enum(['低', '中', '高']),
      impact: z.enum(['低', '中', '高']),
      mitigation: z.string(),
    })).describe('識別されたリスク（PMO視点）'),
    missing_information: z.array(z.string()).describe('不足している情報'),
  }),
  execute: async ({ context }) => {
    const prompt = `
あなたは経験豊富なPMOエキスパートです。以下のドキュメントを分析し、プロジェクト立ち上げに必要な情報を構造化して抽出してください。

## 分析対象ドキュメント
${context.content}

## 抽出タスク
1. **主要論点（key_points）**: 議論された主要なトピックや論点を抽出
2. **決定事項（decisions）**: 明確に決定された事項を抽出
3. **アクションアイテム（action_items）**: タスク、担当者、期限を含むアクション項目を抽出
4. **ステークホルダー（stakeholders）**: 関係者の名前と役割を抽出
${context.pmo_perspective ? `
5. **WBS構造（wbs_structure）**: プロジェクトをWBS形式で構造化
6. **リスク（risks）**: 潜在的なリスクを識別し、発生確率と影響度を評価、対策も提案
7. **不足情報（missing_information）**: プロジェクト立ち上げに必要だが不足している情報を特定
` : ''}

## 出力形式
以下のJSON形式で出力してください：
{
  "key_points": ["論点1", "論点2", ...],
  "decisions": ["決定事項1", "決定事項2", ...],
  "action_items": [
    {
      "task": "タスク名",
      "owner": "担当者名",
      "deadline": "期限"
    }
  ],
  "stakeholders": [
    {
      "name": "名前/役職",
      "role": "プロジェクトでの役割"
    }
  ],
  "wbs_structure": [
    {
      "level": 1,
      "task": "主要タスク",
      "sub_tasks": ["サブタスク1", "サブタスク2"]
    }
  ],
  "risks": [
    {
      "risk": "リスク内容",
      "probability": "低/中/高",
      "impact": "低/中/高",
      "mitigation": "対策案"
    }
  ],
  "missing_information": ["不足情報1", "不足情報2", ...]
}

## 分析の観点
- プロジェクトの目的と成功基準は明確か
- 必要なリソースと体制は整っているか
- タイムラインとマイルストーンは適切か
- リスクと課題は網羅的に検討されているか
- ステークホルダーの期待値は明確か
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
              content: 'あなたは経験豊富なPMOエキスパートです。プロジェクト管理の専門知識を活かして、ドキュメントから重要な情報を抽出し、構造化してください。'
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

      // デフォルト値の設定
      return {
        key_points: result.key_points || [],
        decisions: result.decisions || [],
        action_items: result.action_items || [],
        stakeholders: result.stakeholders || [],
        wbs_structure: result.wbs_structure || [],
        risks: result.risks || [],
        missing_information: result.missing_information || [],
      };
    } catch (error) {
      console.error('Error parsing document:', error);
      throw new Error('Failed to parse document');
    }
  },
});