"use client";

import { Loader2, Search, Globe, Target, Users, AlertTriangle, Calendar, CheckSquare, FileText } from "lucide-react";
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
    {/* 実行中の点滅表示 */}
    {isRunning && (
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <div className="flex gap-1">
          <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <span>処理中...</span>
      </div>
    )}
  </div>
);

// 汎用的なツール実行中ウィジェット
export const GenericToolRunningWidget = ({ toolName }: { toolName: string }) => (
  <div className="rounded-lg border bg-card p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-sm animate-pulse">実行中: {toolName}</h4>
        <p className="text-xs text-muted-foreground">ツールを実行しています...</p>
      </div>
    </div>
    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
      <div className="flex gap-1">
        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      <span>処理中...</span>
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

// Goal Setting Tool ウィジェット
export const GoalSettingWidget = ({ args }: { args: { discussion_points: string[], project_context?: string } }) => (
  <ProgressWidget
    icon={Target}
    title="プロジェクトゴール設定中"
    description="SMART原則に基づいてプロジェクトゴールとマイルストーンを設定しています..."
  />
);

// Goal Setting Tool 結果表示
export const GoalSettingResult = ({ result }: { result: unknown }) => {
  if (!result) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Target className="h-4 w-4" />
          <span>ゴール設定結果がありません</span>
        </div>
      </div>
    );
  }

  const data = result as any;
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-green-600" />
        <span className="font-medium text-sm">プロジェクトゴール設定完了</span>
      </div>
      
      {data.missing_points && data.missing_points.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2 text-orange-600">不足論点</h4>
          <ul className="text-xs space-y-1">
            {data.missing_points.map((point: string, index: number) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-orange-500">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.project_goal && (
        <div>
          <h4 className="font-medium text-sm mb-2">SMARTゴール</h4>
          <div className="space-y-2 text-xs">
            <div><span className="font-medium">Specific:</span> {data.project_goal.specific}</div>
            <div><span className="font-medium">Measurable:</span> {data.project_goal.measurable}</div>
            <div><span className="font-medium">Achievable:</span> {data.project_goal.achievable}</div>
            <div><span className="font-medium">Relevant:</span> {data.project_goal.relevant}</div>
            <div><span className="font-medium">Time-bound:</span> {data.project_goal.time_bound}</div>
          </div>
        </div>
      )}

      {data.milestones && data.milestones.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">マイルストーン</h4>
          <div className="space-y-2">
            {data.milestones.map((milestone: any, index: number) => (
              <div key={index} className="border-l-2 border-blue-200 pl-3">
                <div className="font-medium text-xs">{milestone.phase}</div>
                <div className="text-xs text-muted-foreground">{milestone.goal}</div>
                <div className="text-xs text-muted-foreground">期限: {milestone.deadline}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Action Plan Generator Tool ウィジェット
export const ActionPlanGeneratorWidget = ({ args }: { args: { project_goal: string, milestones: any[] } }) => (
  <ProgressWidget
    icon={CheckSquare}
    title="アクションプラン生成中"
    description="WBS構造とアクションアイテムを作成しています..."
  />
);

// Action Plan Generator Tool 結果表示
export const ActionPlanGeneratorResult = ({ result }: { result: unknown }) => {
  if (!result) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckSquare className="h-4 w-4" />
          <span>アクションプラン結果がありません</span>
        </div>
      </div>
    );
  }

  const data = result as any;
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <CheckSquare className="h-4 w-4 text-green-600" />
        <span className="font-medium text-sm">アクションプラン生成完了</span>
      </div>
      
      {data.wbs_structure && data.wbs_structure.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">WBS構造</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {data.wbs_structure.slice(0, 5).map((wbs: any, index: number) => (
              <div key={index} className="text-xs border-l-2 border-gray-200 pl-2">
                <span className="font-mono">{wbs.wbs_code}</span> {wbs.task_name}
                <div className="text-muted-foreground">{wbs.description}</div>
              </div>
            ))}
            {data.wbs_structure.length > 5 && (
              <div className="text-xs text-muted-foreground">...他{data.wbs_structure.length - 5}項目</div>
            )}
          </div>
        </div>
      )}

      {data.action_items && data.action_items.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">アクションアイテム</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {data.action_items.slice(0, 3).map((item: any, index: number) => (
              <div key={index} className="text-xs border rounded p-2">
                <div className="font-medium">{item.action}</div>
                <div className="text-muted-foreground">担当: {item.owner} | 期限: {item.due_date}</div>
                <div className="text-muted-foreground">優先度: {item.priority}</div>
              </div>
            ))}
            {data.action_items.length > 3 && (
              <div className="text-xs text-muted-foreground">...他{data.action_items.length - 3}項目</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Stakeholder Identifier Tool ウィジェット
export const StakeholderIdentifierWidget = ({ args }: { args: { project_goal: string, key_activities: string[] } }) => (
  <ProgressWidget
    icon={Users}
    title="ステークホルダー特定中"
    description="プロジェクトのステークホルダーを特定し、エンゲージメント戦略を策定しています..."
  />
);

// Stakeholder Identifier Tool 結果表示
export const StakeholderIdentifierResult = ({ result }: { result: unknown }) => {
  if (!result) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>ステークホルダー分析結果がありません</span>
        </div>
      </div>
    );
  }

  const data = result as any;
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-green-600" />
        <span className="font-medium text-sm">ステークホルダー分析完了</span>
      </div>
      
      {data.stakeholder_map && data.stakeholder_map.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">ステークホルダーマップ</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {data.stakeholder_map.map((stakeholder: any, index: number) => (
              <div key={index} className="text-xs border rounded p-2">
                <div className="font-medium">{stakeholder.name}</div>
                <div className="text-muted-foreground">
                  {stakeholder.category} | 関心度: {stakeholder.interest} | 影響力: {stakeholder.influence}
                </div>
                <div className="text-muted-foreground">{stakeholder.role}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.engagement_strategy && data.engagement_strategy.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">エンゲージメント戦略</h4>
          <div className="space-y-1">
            {data.engagement_strategy.map((strategy: any, index: number) => (
              <div key={index} className="text-xs border-l-2 border-blue-200 pl-2">
                <span className="font-medium">{strategy.stakeholder_group}:</span> {strategy.strategy}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Risk Analyzer Tool ウィジェット
export const RiskAnalyzerWidget = ({ args }: { args: { project_context: string, project_type: string } }) => (
  <ProgressWidget
    icon={AlertTriangle}
    title="リスク分析中"
    description="プロジェクトの潜在的リスクを分析し、対策を策定しています..."
  />
);

// Risk Analyzer Tool 結果表示
export const RiskAnalyzerResult = ({ result }: { result: unknown }) => {
  if (!result) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
          <span>リスク分析結果がありません</span>
        </div>
      </div>
    );
  }

  const data = result as any;
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-green-600" />
        <span className="font-medium text-sm">リスク分析完了</span>
      </div>
      
      {data.overall_risk_assessment && (
        <div>
          <h4 className="font-medium text-sm mb-2">全体リスク評価</h4>
          <div className="text-xs space-y-1">
            <div>プロジェクトリスクレベル: <span className="font-medium">{data.overall_risk_assessment.project_risk_level}</span></div>
            <div>成功確率: <span className="font-medium">{data.overall_risk_assessment.success_probability}%</span></div>
          </div>
        </div>
      )}

      {data.risk_matrix && (
        <div>
          <h4 className="font-medium text-sm mb-2">リスクマトリクス</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-red-50 p-2 rounded">
              <div className="font-medium text-red-800">重大リスク</div>
              <div>{data.risk_matrix.critical_risks?.length || 0}件</div>
            </div>
            <div className="bg-orange-50 p-2 rounded">
              <div className="font-medium text-orange-800">高リスク</div>
              <div>{data.risk_matrix.high_risks?.length || 0}件</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <div className="font-medium text-yellow-800">中リスク</div>
              <div>{data.risk_matrix.medium_risks?.length || 0}件</div>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="font-medium text-green-800">低リスク</div>
              <div>{data.risk_matrix.low_risks?.length || 0}件</div>
            </div>
          </div>
        </div>
      )}

      {data.risk_register && data.risk_register.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">主要リスク</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {data.risk_register.slice(0, 3).map((risk: any, index: number) => (
              <div key={index} className="text-xs border rounded p-2">
                <div className="font-medium">{risk.risk_description}</div>
                <div className="text-muted-foreground">
                  {risk.category} | 確率: {risk.probability} | 影響: {risk.impact} | スコア: {risk.risk_score}
                </div>
                <div className="text-muted-foreground">対策: {risk.response_strategy}</div>
              </div>
            ))}
            {data.risk_register.length > 3 && (
              <div className="text-xs text-muted-foreground">...他{data.risk_register.length - 3}リスク</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Milestone Proposer Tool ウィジェット
export const MilestoneProposerWidget = ({ args }: { args: { project_duration: string, project_type: string } }) => (
  <ProgressWidget
    icon={Calendar}
    title="マイルストーン提案中"
    description="プロジェクトに最適なマイルストーンパターンを提案しています..."
  />
);

// Milestone Proposer Tool 結果表示
export const MilestoneProposerResult = ({ result }: { result: unknown }) => {
  if (!result) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>マイルストーン提案結果がありません</span>
        </div>
      </div>
    );
  }

  const data = result as any;
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-green-600" />
        <span className="font-medium text-sm">マイルストーン提案完了</span>
      </div>
      
      {data.recommended_pattern && (
        <div>
          <h4 className="font-medium text-sm mb-2">推奨パターン: {data.recommended_pattern.name}</h4>
          <div className="text-xs text-muted-foreground mb-2">{data.recommended_pattern.description}</div>
          
          {data.recommended_pattern.milestones && data.recommended_pattern.milestones.length > 0 && (
            <div className="space-y-2">
              {data.recommended_pattern.milestones.map((milestone: any, index: number) => (
                <div key={index} className="text-xs border-l-2 border-blue-200 pl-2">
                  <div className="font-medium">{milestone.name}</div>
                  <div className="text-muted-foreground">タイミング: {milestone.timing}</div>
                  <div className="text-muted-foreground">基準: {milestone.criteria}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {data.alternative_patterns && data.alternative_patterns.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">代替パターン</h4>
          <div className="space-y-1">
            {data.alternative_patterns.map((pattern: any, index: number) => (
              <div key={index} className="text-xs border rounded p-2">
                <div className="font-medium">{pattern.name}</div>
                <div className="text-muted-foreground">{pattern.description}</div>
                <div className="text-muted-foreground">適用場面: {pattern.when_to_use}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.selection_rationale && (
        <div>
          <h4 className="font-medium text-sm mb-2">選定理由</h4>
          <div className="text-xs text-muted-foreground">{data.selection_rationale}</div>
        </div>
      )}
    </div>
  );
};
