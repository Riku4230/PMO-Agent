import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const difyRagTool = createTool({
  id: "dify-rag",
  description: "Dify RAGアプリケーションのチャットメッセージエンドポイントを呼び出して、RAG機能を利用した回答を取得します。",
  inputSchema: z.object({
    query: z.string().describe("ユーザー入力/質問内容"),
  }),
  outputSchema: z.any(), // Dify APIの出力スキーマに合わせる
  async execute({ context }) {
    const { query } = context;
    const user = 'mastra-recruitment-agent'; // Mastraで固定のユーザー識別子
    const difyApiKey = process.env.DIFY_API_KEY;
    const difyBaseUrl = process.env.DIFY_BASE_URL || 'https://hiroto243.com/v1';

    if (!difyApiKey) {
      throw new Error("DIFY_API_KEYが設定されていません。");
    }

    const url = `${difyBaseUrl}/chat-messages`;

    const body: { query: string; user: string; response_mode: string; inputs: Record<string, any>; } = {
      query,
      user,
      response_mode: "blocking",
      inputs: {},
    };

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${difyApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
    };

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dify RAG APIからの応答エラー: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return data;

    } catch (error) {
      console.error("Dify RAGツール実行中にエラーが発生しました:", error);
      throw error;
    }
  },
});
