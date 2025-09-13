// mastra/index.ts
import { Mastra } from "@mastra/core";
import { pmoAgent } from "./agents/pmo-agent";

export const mastra = new Mastra({
  agents: { pmoAgent },
});