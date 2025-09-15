# PMOエージェント（プロジェクトマネジメントオフィス支援AI）

プロジェクト立ち上げフェーズを支援する経験豊富なPMOエキスパートAIエージェントです。キックオフから計画立案まで、そのまま使える高品質なアウトプットを自動生成します。

## 特徴

- **7ステップワークフロー**: プロジェクト立ち上げに必要な全工程を体系的に支援
- **そのまま使える成果物**: 会議アジェンダ、WBS、リスク登録簿など実用的なアウトプット
- **LLMベース**: OpenAI GPT-4を活用した高精度な分析と提案
- **柔軟な実行モード**: フル実行、カスタム選択、個別ツール利用が可能

## 主要機能

### コアワークフロー（7ステップ）
1. **インプット受付**: キックオフ議事録の解析と構造化
2. **論点整理とゴール設定**: SMART原則に基づく目標設定
3. **関係者特定**: ステークホルダー分析とRACIマトリクス作成
4. **マイルストーン提案**: 複数のパターンから最適案を提示
5. **アクションプラン生成**: WBSとアクション項目の詳細化
6. **会議体設計**: 効率的な会議構造の設計
7. **リスク洗い出し**: 包括的なリスク分析と対策提案

### 利用可能ツール
- ドキュメント解析ツール
- 目標設定支援ツール
- ステークホルダー特定ツール
- マイルストーン提案ツール
- アクションプラン生成ツール
- 会議設計ツール
- リスク分析ツール

## セットアップ

### 前提条件
- Node.js 18.0以上
- OpenAI APIキー

### インストール

```bash
git clone <repository-url>
cd pineal-agent-pmo
npm install
```

### 環境変数設定

`.env.local`ファイルを作成し、以下を設定：

```env
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key

# Supabase PostgreSQL Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Supabase API Configuration (optional)
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

### Supabase設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. プロジェクト設定からDatabase URLを取得
3. 上記の`[YOUR-PASSWORD]`と`[YOUR-PROJECT-REF]`を実際の値に置き換え

## デプロイメント

### Cloud Run デプロイ

```bash
# 依存関係のインストール
npm install

# Cloud Runにデプロイ
npm run deploy:cloudrun

# ローカルビルドでデプロイ（高速）
npm run deploy:cloudrun:local
```

**必要な環境変数（Cloud Run）**:
- `DATABASE_URL`: Supabase PostgreSQL接続文字列
- `OPENAI_API_KEY`: OpenAI APIキー

### Vercel デプロイ

```bash
# Vercel CLIのインストール
npm install -g vercel

# 初回デプロイ
vercel

# 本番デプロイ
npm run deploy:vercel

# プレビューデプロイ
npm run deploy:vercel:preview
```

**必要な環境変数（Vercel）**:
- `DATABASE_URL`: Supabase PostgreSQL接続文字列
- `OPENAI_API_KEY`: OpenAI APIキー
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトURL（オプション）
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase匿名キー（オプション）

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 使用方法

### 1. フルワークフロー実行

```javascript
import { pmoAgent } from './mastra/agents/pmo-agent';
import { pmoProjectSetupWorkflow } from './mastra/workflows/pmo-project-setup-workflow';

// フル7ステップ実行
const result = await pmoProjectSetupWorkflow.execute({
  mode: 'full',
  input_document: '議事録内容...',
  project_info: {
    name: 'ECサイト開発',
    type: 'システム開発',
    duration: '6ヶ月',
    team_size: 8
  }
});
```

### 2. カスタムワークフロー実行

```javascript
// 特定ステップのみ実行
const result = await pmoProjectSetupWorkflow.execute({
  mode: 'custom',
  skip_steps: ['document_analysis', 'meeting_design'],
  project_info: { /* ... */ }
});
```

### 3. 個別ツール利用

```javascript
import { documentParserTool } from './mastra/tools/document-parser-tool';

// 議事録分析のみ実行
const analysis = await documentParserTool.execute({
  context: {
    content: '議事録内容...',
    format: 'meeting_minutes',
    pmo_perspective: true
  }
});
```

## サンプル

`examples/pmo-kickoff-example.md`にテスト用のサンプルデータと使用例があります。

## 出力例

### プロジェクト憲章
- SMART目標設定
- ステークホルダーマップ
- WBS構造
- リスク登録簿

### 会議体設計
- 標準アジェンダテンプレート
- 参加者マトリクス
- コミュニケーション計画

### アクションプラン
- 詳細タスクリスト
- 責任者割り当て
- 期限設定
- 依存関係

## 技術スタック

- **フレームワーク**: Next.js 14
- **AIエージェント**: Mastra Core
- **LLM**: OpenAI GPT-4o-mini
- **データベース**: LibSQL
- **言語**: TypeScript
- **バリデーション**: Zod

## プロジェクト構造

```
mastra/
├── agents/
│   └── pmo-agent.ts          # メインエージェント
├── tools/
│   ├── document-parser-tool.ts
│   ├── goal-setting-tool.ts
│   ├── stakeholder-identifier-tool.ts
│   ├── milestone-proposer-tool.ts
│   ├── action-plan-generator-tool.ts
│   ├── meeting-designer-tool.ts
│   └── risk-analyzer-tool.ts
├── workflows/
│   └── pmo-project-setup-workflow.ts
└── index.ts
examples/
└── pmo-kickoff-example.md
```

## 貢献

プルリクエストや課題報告を歓迎します。開発に参加する場合は、以下の手順に従ってください：

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は`LICENSE`ファイルを参照してください。

## サポート

質問や問題がある場合は、GitHubのIssuesページで報告してください。
