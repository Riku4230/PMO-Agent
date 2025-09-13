import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Meeting Designer Tool
 * プロジェクトのフェーズとニーズに応じた効率的な会議体を設計
 */
export const meetingDesignerTool = createTool({
  id: 'meeting-designer',
  description: '定例会やレビュー会議の目的、推奨参加者、適切な頻度を提案し、効率的な会議体を設計する',
  inputSchema: z.object({
    project_phase: z.string().describe('プロジェクトの現在のフェーズ（立ち上げ、計画、実行、終結など）'),
    project_duration: z.string().describe('プロジェクト期間'),
    team_size: z.number().describe('チームの規模'),
    stakeholders: z.array(z.string()).optional().describe('主要ステークホルダーのリスト'),
    communication_challenges: z.array(z.string()).optional().describe('コミュニケーション上の課題'),
    meeting_preferences: z.object({
      max_duration: z.number().optional().describe('最大会議時間（分）'),
      preferred_days: z.array(z.string()).optional().describe('優先曜日'),
      remote_friendly: z.boolean().optional().describe('リモート会議対応'),
    }).optional().describe('会議の希望条件'),
  }),
  outputSchema: z.object({
    meeting_structure: z.array(z.object({
      meeting_type: z.string().describe('会議の種類'),
      purpose: z.string().describe('会議の目的'),
      frequency: z.string().describe('開催頻度'),
      duration: z.number().describe('推奨時間（分）'),
      participants: z.object({
        required: z.array(z.string()).describe('必須参加者'),
        optional: z.array(z.string()).describe('任意参加者'),
        facilitator: z.string().describe('ファシリテーター'),
      }).describe('参加者'),
      agenda_template: z.array(z.object({
        topic: z.string(),
        time_allocation: z.number(),
        owner: z.string(),
      })).describe('標準アジェンダ'),
      deliverables: z.array(z.string()).describe('会議の成果物'),
      success_metrics: z.array(z.string()).describe('効果測定指標'),
      tools_required: z.array(z.string()).describe('必要なツール・設備'),
    })).describe('会議体設計'),
    communication_plan: z.object({
      channels: z.array(z.object({
        channel: z.string(),
        purpose: z.string(),
        frequency: z.string(),
      })).describe('コミュニケーションチャネル'),
      escalation_path: z.array(z.string()).describe('エスカレーションパス'),
      reporting_structure: z.string().describe('報告体系'),
    }).describe('コミュニケーション計画'),
    meeting_calendar: z.array(z.object({
      week: z.number(),
      meetings: z.array(z.object({
        type: z.string(),
        day: z.string(),
        time: z.string(),
      })),
    })).describe('最初の4週間の会議カレンダー案'),
    efficiency_tips: z.array(z.string()).describe('会議効率化のヒント'),
  }),
  execute: async ({ context }) => {
    const prompt = `
あなたは経験豊富なPMOエキスパートです。以下の情報を基に、効率的な会議体とコミュニケーション計画を設計してください。

## プロジェクト情報
- フェーズ: ${context.project_phase}
- 期間: ${context.project_duration}
- チーム規模: ${context.team_size}人
${context.stakeholders ? `- 主要ステークホルダー: ${context.stakeholders.join(', ')}` : ''}
${context.communication_challenges ? `- コミュニケーション課題: ${context.communication_challenges.join(', ')}` : ''}

${context.meeting_preferences ? `## 会議の希望条件
- 最大時間: ${context.meeting_preferences.max_duration || 60}分
- 優先曜日: ${context.meeting_preferences.preferred_days?.join(', ') || '指定なし'}
- リモート対応: ${context.meeting_preferences.remote_friendly ? '必要' : '不要'}` : ''}

## 設計タスク

1. **会議体の設計（meeting_structure）**
   プロジェクトフェーズに応じた会議体を設計：
   - 各会議の種類、目的、頻度、推奨時間
   - 必須/任意参加者とファシリテーター
   - 標準アジェンダテンプレート
   - 会議の成果物と効果測定指標
   - 必要なツール・設備

   考慮すべき会議タイプ：
   - キックオフ会議
   - 定例進捗会議
   - ステアリングコミッティ
   - 技術レビュー会議
   - リスクレビュー会議
   - 振り返り会議
   - ステークホルダー報告会

2. **コミュニケーション計画（communication_plan）**
   - 使用するコミュニケーションチャネル
   - エスカレーションパス
   - 報告体系

3. **会議カレンダー案（meeting_calendar）**
   最初の4週間の具体的な会議スケジュール案

4. **効率化のヒント（efficiency_tips）**
   会議を効率的に運営するための具体的なアドバイス

## 注意事項
- プロジェクトフェーズに応じた適切な会議頻度を設定
- 参加者の時間を最大限有効活用
- ${context.meeting_preferences?.remote_friendly ? 'リモート参加者への配慮を含める' : ''}
- ${context.communication_challenges ? 'コミュニケーション課題に対する対策を含める' : ''}

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
              content: 'あなたは効果的な会議設計とコミュニケーション計画のスペシャリストです。プロジェクトの成功に必要な会議体を最小限かつ最大効果で設計できます。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
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
        meeting_structure: result.meeting_structure || [],
        communication_plan: result.communication_plan || {
          channels: [],
          escalation_path: [],
          reporting_structure: '',
        },
        meeting_calendar: result.meeting_calendar || [],
        efficiency_tips: result.efficiency_tips || [],
      };
    } catch (error) {
      console.error('Error designing meetings:', error);
      throw new Error('Failed to design meeting structure');
    }
  },
});