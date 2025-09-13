"use client";

import { Loader2, Search, Globe, FileText, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

// 共通の進捗ウィジェットスタイル
const ProgressWidget = ({ 
  icon: Icon, 
  title, 
  description, 
  isRunning = true 
}: { 
  icon: React.ComponentType<{ className?: string }>; 
  title: string; 
  description: string; 
  isRunning?: boolean; 
}) => (
  <div className="rounded-lg border bg-card p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full",
        isRunning ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
      )}>
        {isRunning ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>
);

// Brave Search ツール用ウィジェット
export const BraveSearchWidget = ({ args }: { args: { query: string } }) => (
  <ProgressWidget
    icon={Search}
    title="Web検索中"
    description={`"${args.query}" を検索しています...`}
  />
);

// Brave Search 結果表示
export const BraveSearchResult = ({ result }: { result: unknown }) => {
  if (!result || !(result as any)?.web?.results) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>検索結果が見つかりませんでした</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Search className="h-4 w-4 text-green-600" />
        <span className="font-medium text-sm">検索完了</span>
        <span className="text-xs text-muted-foreground">
          {(result as any).web.results.length}件の結果
        </span>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {(result as any).web.results.slice(0, 3).map((item: any, index: number) => (
          <div key={index} className="border-l-2 border-blue-200 pl-3">
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {item.title}
            </a>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Jina Scraper ツール用ウィジェット
export const JinaScraperWidget = ({ args }: { args: { url: string } }) => (
  <ProgressWidget
    icon={Globe}
    title="ページスクレイピング中"
    description={`${args.url} の内容を取得しています...`}
  />
);

// Jina Scraper 結果表示
export const JinaScraperResult = ({ result }: { result: unknown }) => {
  if (!result) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Globe className="h-4 w-4" />
          <span>スクレイピング結果がありません</span>
        </div>
      </div>
    );
  }

  const content = typeof result === 'string' ? result : (result as any).content || JSON.stringify(result);
  const preview = content.length > 200 ? content.substring(0, 200) + '...' : content;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="h-4 w-4 text-green-600" />
        <span className="font-medium text-sm">スクレイピング完了</span>
      </div>
      <div className="bg-muted p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
        {preview}
      </div>
    </div>
  );
};

// Dify RAG ツール用ウィジェット
export const DifyRagWidget = ({ args }: { args: { query: string } }) => (
  <ProgressWidget
    icon={FileText}
    title="RAG検索中"
    description={`"${args.query}" について知識ベースから検索しています...`}
  />
);

// Dify RAG 結果表示
export const DifyRagResult = ({ result }: { result: unknown }) => {
  if (!result || !(result as any).answer) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>RAG検索結果がありません</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-green-600" />
        <span className="font-medium text-sm">RAG検索完了</span>
      </div>
      <div className="prose prose-sm max-w-none">
        <p className="text-sm">{(result as any).answer}</p>
        {(result as any).metadata && (
          <div className="mt-2 text-xs text-muted-foreground">
            <span>信頼度: {(result as any).metadata.usage?.total_tokens || 'N/A'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Job Position Analyzer ツール用ウィジェット
export const JobPositionAnalyzerWidget = ({ args: _args }: { args: { userInput: string } }) => (
  <ProgressWidget
    icon={Briefcase}
    title="職種分析中"
    description="スキルと経験に基づいて最適な職種を分析しています..."
  />
);

// Job Position Analyzer 結果表示
export const JobPositionAnalyzerResult = ({ result }: { result: unknown }) => {
  if (!result) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          <span>分析結果がありません</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Briefcase className="h-4 w-4 text-green-600" />
        <span className="font-medium text-sm">職種分析完了</span>
        <span className="text-xs text-muted-foreground">
          確信度: {Math.round(((result as any).confidence || 0) * 100)}%
        </span>
      </div>
      
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-sm mb-2">推奨職種: {(result as any).position}</h4>
          <p className="text-xs text-muted-foreground">{(result as any).position_description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h5 className="font-medium text-xs mb-1 text-red-600">必須要件</h5>
            <ul className="text-xs space-y-1">
              {(result as any).must_requirements?.map((req: string, index: number) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-red-500">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-xs mb-1 text-blue-600">希望要件</h5>
            <ul className="text-xs space-y-1">
              {(result as any).want_requirements?.map((req: string, index: number) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-blue-500">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div>
          <h5 className="font-medium text-xs mb-1">分析理由</h5>
          <p className="text-xs text-muted-foreground">{(result as any).reasoning}</p>
        </div>
      </div>
    </div>
  );
};
