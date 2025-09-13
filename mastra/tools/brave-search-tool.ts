import { z } from "zod";
import { createTool } from "@mastra/core/tools";

export const braveSearchTool = createTool({
  id: "brave-search",
  description: "Braveを使ってWeb検索を行います。検索クエリを元に、関連するウェブページや情報を検索し、その結果を返します。これはBrave検索エンジンに直接アクセスするものではなく、汎用的なWeb検索ツールを利用します。",
  inputSchema: z.object({
    query: z.string().describe("検索したいクエリ"),
  }),
  outputSchema: z.any(), // Brave APIの出力スキーマに合わせる
  async execute({ context }) {
    const { query } = context;
    const braveApiKey = process.env.BRAVE_API_KEY;
    if (!braveApiKey) {
      throw new Error("BRAVE_API_KEYが設定されていません。");
    }

    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`;

    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": braveApiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Brave Search APIからの応答エラー: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  },
});
