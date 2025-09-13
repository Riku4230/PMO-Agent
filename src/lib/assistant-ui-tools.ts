// Assistant UIのツールマッピング設定
import {
  BraveSearchWidget,
  BraveSearchResult,
  JinaScraperWidget,
  JinaScraperResult,
  GoalSettingWidget,
  GoalSettingResult,
  ActionPlanGeneratorWidget,
  ActionPlanGeneratorResult,
  StakeholderIdentifierWidget,
  StakeholderIdentifierResult,
  RiskAnalyzerWidget,
  RiskAnalyzerResult,
  MilestoneProposerWidget,
  MilestoneProposerResult,
} from "@/components/assistant-ui/tool-widgets";

// Assistant UI用のツールマッピング設定
export const assistantUITools = {
  // Brave Search ツール
  "brave-search": {
    RenderInProgress: BraveSearchWidget,
    RenderResult: BraveSearchResult,
  },
  
  // Jina Scraper ツール
  "jina-scraper": {
    RenderInProgress: JinaScraperWidget,
    RenderResult: JinaScraperResult,
  },
  
  // Goal Setting Tool
  "goal-setting-assistant": {
    RenderInProgress: GoalSettingWidget,
    RenderResult: GoalSettingResult,
  },
  
  // Action Plan Generator Tool
  "action-plan-generator": {
    RenderInProgress: ActionPlanGeneratorWidget,
    RenderResult: ActionPlanGeneratorResult,
  },
  
  // Stakeholder Identifier Tool
  "stakeholder-identifier": {
    RenderInProgress: StakeholderIdentifierWidget,
    RenderResult: StakeholderIdentifierResult,
  },
  
  // Risk Analyzer Tool
  "risk-analyzer": {
    RenderInProgress: RiskAnalyzerWidget,
    RenderResult: RiskAnalyzerResult,
  },
  
  // Milestone Proposer Tool
  "milestone-proposer": {
    RenderInProgress: MilestoneProposerWidget,
    RenderResult: MilestoneProposerResult,
  },
};
