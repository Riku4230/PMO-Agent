// mastra/index.ts
import { Mastra } from "@mastra/core";
import { PostgresStore } from "@mastra/pg";
import { Memory } from "@mastra/memory";
import { pmoAgent } from "./agents/pmo-agent";

// Supabase PostgreSQL接続設定
const storage = new PostgresStore({
  connectionString: process.env.DATABASE_URL!,
  // オプション: スキーマ名を指定（デフォルトは 'public'）
  // schemaName: 'mastra'
});

// Memory設定（会話履歴とメモリ管理）
const memory = new Memory({
  storage: storage,
});

export const mastra = new Mastra({
  agents: { pmoAgent },
  storage: storage,
});