// mastra/index.ts
import { Mastra } from "@mastra/core";
import { recruitmentAgent } from "./agents/recruitment-agent";

export const mastra = new Mastra({
  agents: { recruitmentAgent },
});