// app/api/chat/route.ts
import { mastra } from "@/../mastra";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const agent = mastra.getAgent("pmoAgent"); 
  const result = await agent.streamVNext(messages, { format: 'aisdk' });
  return result.toUIMessageStreamResponse(); // assistant-ui と互換のストリーム応答
}
