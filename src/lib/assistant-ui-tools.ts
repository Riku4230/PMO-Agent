// Assistant UIのツールマッピング設定
import {
  BraveSearchWidget,
  BraveSearchResult,
  JinaScraperWidget,
  JinaScraperResult,
  DifyRagWidget,
  DifyRagResult,
  JobPositionAnalyzerWidget,
  JobPositionAnalyzerResult,
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
  
  // Dify RAG ツール
  "dify-rag": {
    RenderInProgress: DifyRagWidget,
    RenderResult: DifyRagResult,
  },
  
  // Job Position Analyzer ツール
  "analyze-job-position": {
    RenderInProgress: JobPositionAnalyzerWidget,
    RenderResult: JobPositionAnalyzerResult,
  },
};
