// app/api/chat/route.ts
import { mastra } from "@/../mastra";

// PostgreSQL接続のためNode.jsランタイムを明示的に指定
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const agent = mastra.getAgent("pmoAgent"); 
    const result = await agent.streamVNext(messages, { format: 'aisdk' });
    return result.toUIMessageStreamResponse(); // assistant-ui と互換のストリーム応答
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
