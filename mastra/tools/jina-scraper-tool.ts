import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const jinaScraperTool = createTool({
  id: "jina-scraper",
  description: "Jina AI Scraperを使用して、指定されたURLのコンテンツをスクレイピングします。",
  inputSchema: z.object({
    url: z.string().describe("スクレイピングしたいウェブページのURL"),
  }),
  outputSchema: z.any(), // Jina AI Scraperの出力スキーマに合わせる
  async execute({ context }) {
    const { url } = context;
    const jinaApiKey = process.env.JINA_API_KEY;
    if (!jinaApiKey) {
      throw new Error("JINA_API_KEYが設定されていません。");
    }

    const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;

    const options = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jinaApiKey}`,
        'Accept': 'application/json' 
      }
    };

    try {
      const response = await fetch(jinaUrl, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Jina AI Scraperからの応答エラー: ${response.status} - ${errorText}`);
      }
      
      // Jina AIはJSONを返さない場合もあるので、text()で受け取り、必要に応じてパースする
      const data = await response.text(); 
      try {
        return JSON.parse(data); // JSONとしてパースできる場合はパース
      } catch (e) {
        return data; // JSONでない場合は生テキストを返す
      }
    } catch (error) {
      console.error("Jina AI Scraperツール実行中にエラーが発生しました:", error);
      throw error;
    }
  },
});
