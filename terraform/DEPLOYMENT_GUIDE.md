# Pineal Agent Cloud Run デプロイメントガイド

## 概要
このガイドでは、Terraformを使用してNext.js + MastraアプリケーションをGoogle Cloud Runにデプロイする方法を説明します。

## 前提条件

### 必要なツール
- [Terraform](https://www.terraform.io/downloads.html) (v1.0以上)
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)
- [Docker](https://docs.docker.com/get-docker/)
- [Node.js](https://nodejs.org/) (v20以上)

### Google Cloud プロジェクトの準備
1. Google Cloud プロジェクトを作成
2. 必要なAPIを有効化：
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable artifactregistry.googleapis.com
   gcloud services enable container.googleapis.com
   ```

### 認証設定
```bash
# Google Cloud にログイン
gcloud auth login

# アプリケーションのデフォルト認証情報を設定
gcloud auth application-default login

# プロジェクトを設定
gcloud config set project YOUR_PROJECT_ID
```

## デプロイメント手順

### 1. Terraform設定の準備

#### terraform.tfvarsファイルの作成
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

#### terraform.tfvarsの編集
```hcl
# 必須項目
project_id   = "your-gcp-project-id"
github_owner = "your-github-username"
github_repo  = "pineal-agent"

# オプション項目（必要に応じて変更）
region           = "asia-northeast1"
service_name     = "pineal-agent"
memory          = "1Gi"
cpu             = "1"
min_instances   = 0
max_instances   = 10
timeout         = 300

# 環境変数（アプリケーションに応じて設定）
environment_variables = {
  NODE_ENV = "production"
  # 他の環境変数をここに追加
}
```

### 2. Terraformの初期化と実行

```bash
# Terraformの初期化
terraform init

# 実行計画の確認
terraform plan

# リソースの作成
terraform apply
```

### 3. 初回デプロイ

Terraformでリソースを作成した後、初回のコンテナイメージをビルドしてデプロイします：

```bash
# プロジェクトルートに戻る
cd ..

# Cloud Buildを使用してビルドとデプロイ
gcloud builds submit --config cloudbuild.yaml
```

## 継続的デプロイメント

### GitHub連携の設定
1. GitHubリポジトリにCloud Buildアプリをインストール
2. リポジトリの設定で、Cloud Buildアプリに適切な権限を付与
3. mainブランチへのプッシュで自動デプロイが実行されます

### 手動デプロイ
```bash
# 最新のコードをビルドしてデプロイ
gcloud builds submit --config cloudbuild.yaml

# または、既存のイメージを使用してデプロイ
gcloud run deploy pineal-agent \
  --image asia-northeast1-docker.pkg.dev/YOUR_PROJECT_ID/pineal-agent/pineal-agent:latest \
  --region asia-northeast1
```

## 管理とモニタリング

### サービスの確認
```bash
# サービス情報の確認
gcloud run services describe pineal-agent --region asia-northeast1

# ログの確認
gcloud run services logs read pineal-agent --region asia-northeast1

# リアルタイムログの確認
gcloud run services logs tail pineal-agent --region asia-northeast1
```

### スケーリング設定の変更
```bash
# 最小インスタンス数を変更
gcloud run services update pineal-agent \
  --min-instances=1 \
  --region asia-northeast1

# 最大インスタンス数を変更
gcloud run services update pineal-agent \
  --max-instances=20 \
  --region asia-northeast1
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. ビルドエラー
```bash
# ビルドログの確認
gcloud builds log --stream

# ローカルでのDockerビルドテスト
docker build -t test-image .
docker run -p 3000:3000 test-image
```

#### 2. デプロイエラー
```bash
# サービス状態の確認
gcloud run services describe pineal-agent --region asia-northeast1

# 最新のリビジョンにロールバック
gcloud run services update-traffic pineal-agent \
  --to-revisions=REVISION_NAME=100 \
  --region asia-northeast1
```

#### 3. パフォーマンス問題
- Cloud Runのメトリクスを確認
- メモリとCPUの設定を調整
- 最小インスタンス数を設定してコールドスタートを回避

### ログとメトリクスの確認
```bash
# Cloud Consoleで以下を確認：
# - Cloud Run > サービス > pineal-agent
# - Cloud Build > 履歴
# - Cloud Logging > ログ
# - Cloud Monitoring > メトリクス
```

## セキュリティのベストプラクティス

### 1. 環境変数の管理
- 機密情報はGoogle Secret Managerを使用
- terraform.tfvarsファイルをGitにコミットしない

### 2. アクセス制御
```bash
# 認証が必要な場合
gcloud run services remove-iam-policy-binding pineal-agent \
  --member="allUsers" \
  --role="roles/run.invoker" \
  --region asia-northeast1

# 特定のユーザーにアクセス権を付与
gcloud run services add-iam-policy-binding pineal-agent \
  --member="user:user@example.com" \
  --role="roles/run.invoker" \
  --region asia-northeast1
```

### 3. ネットワークセキュリティ
- VPCコネクタを使用してプライベートネットワークに接続
- Cloud ArmorでDDoS保護を設定

## コスト最適化

### 1. リソース設定の最適化
- 必要に応じてメモリとCPUを調整
- 最小インスタンス数を適切に設定

### 2. 請求の監視
```bash
# コストレポートの確認
gcloud billing budgets list
```

## 更新とメンテナンス

### Terraform設定の更新
```bash
# 設定変更後の適用
terraform plan
terraform apply
```

### アプリケーションの更新
- GitHubにプッシュするだけで自動デプロイ
- または手動でCloud Buildを実行

## 参考資料
- [Cloud Run ドキュメント](https://cloud.google.com/run/docs)
- [Terraform Google Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud Build ドキュメント](https://cloud.google.com/build/docs)
- [Artifact Registry ドキュメント](https://cloud.google.com/artifact-registry/docs)
