# デプロイメントガイド

このドキュメントでは、PMOエージェントをCloud RunとVercelの両方にデプロイする方法を説明します。

## 前提条件

### 必要なアカウント
- [Google Cloud Platform](https://cloud.google.com/) アカウント
- [Vercel](https://vercel.com/) アカウント
- [Supabase](https://supabase.com/) アカウント
- [OpenAI](https://openai.com/) アカウント

### 必要なツール
- Node.js 18.0以上
- Google Cloud CLI (`gcloud`)
- Vercel CLI (`vercel`)

## 環境変数の設定

### 共通環境変数
```bash
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Database
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### Supabase設定
1. [Supabase](https://supabase.com)でプロジェクトを作成
2. Settings > Database から接続文字列を取得
3. `[YOUR-PASSWORD]`と`[YOUR-PROJECT-REF]`を実際の値に置き換え

## Cloud Run デプロイ

### 1. Google Cloud設定
```bash
# Google Cloud CLIのインストール
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# 認証とプロジェクト設定
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 必要なAPIの有効化
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### 2. Artifact Registry設定
```bash
# リポジトリ作成
gcloud artifacts repositories create cloud-run-source-deploy \
    --repository-format=docker \
    --location=asia-northeast1
```

### 3. デプロイ実行
```bash
# 依存関係のインストール
npm install

# Cloud Runにデプロイ
npm run deploy:cloudrun

# または、ローカルビルドでデプロイ（高速）
npm run deploy:cloudrun:local
```

### 4. 環境変数の設定（Cloud Run）
```bash
# デプロイ後の環境変数設定
gcloud run services update pmo-agent \
    --region=asia-northeast1 \
    --set-env-vars="DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres,OPENAI_API_KEY=your_openai_api_key"
```

## Vercel デプロイ

### 1. Vercel CLI設定
```bash
# Vercel CLIのインストール
npm install -g vercel

# Vercelにログイン
vercel login
```

### 2. 初回デプロイ
```bash
# プロジェクトのリンク
vercel

# 環境変数の設定
vercel env add DATABASE_URL
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. 本番デプロイ
```bash
# 本番環境にデプロイ
npm run deploy:vercel

# プレビュー環境にデプロイ
npm run deploy:vercel:preview
```

### 4. 環境変数の設定（Vercel Dashboard）
1. Vercel Dashboardにアクセス
2. プロジェクトを選択
3. Settings > Environment Variables
4. 以下の変数を追加：
   - `DATABASE_URL`: Supabase PostgreSQL接続文字列
   - `OPENAI_API_KEY`: OpenAI APIキー
   - `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトURL（オプション）
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase匿名キー（オプション）

## トラブルシューティング

### Cloud Run関連
- **ビルドエラー**: `gcloud builds log`でログを確認
- **接続エラー**: 環境変数の設定を確認
- **メモリ不足**: `cloudbuild.yaml`の`--memory`設定を調整

### Vercel関連
- **ビルドエラー**: Vercel DashboardのFunctionsログを確認
- **タイムアウト**: `vercel.json`の`maxDuration`を調整
- **環境変数エラー**: Dashboardで環境変数の設定を確認

### Supabase関連
- **接続エラー**: 接続文字列の形式を確認
- **権限エラー**: SupabaseのRLS（Row Level Security）設定を確認
- **タイムアウト**: Supabaseの接続プール設定を確認

## パフォーマンス最適化

### Cloud Run
- 最小インスタンス数を0に設定（コスト削減）
- 最大インスタンス数を適切に設定
- メモリとCPUの割り当てを最適化

### Vercel
- Edge Functionsの活用
- CDNキャッシュの設定
- 画像最適化の有効化

## セキュリティ考慮事項

### 環境変数
- 本番環境では必ず環境変数を使用
- 機密情報をコードにハードコードしない
- 定期的なAPIキーのローテーション

### データベース
- SupabaseのRLS（Row Level Security）を有効化
- 接続文字列の適切な管理
- 定期的なバックアップの設定

## 監視とログ

### Cloud Run
- Cloud Loggingでアプリケーションログを確認
- Cloud Monitoringでメトリクスを監視
- エラーアラートの設定

### Vercel
- Vercel Dashboardでデプロイメントログを確認
- Analyticsでパフォーマンスを監視
- エラー通知の設定
