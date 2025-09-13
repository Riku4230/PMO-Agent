# Google Cloud Run デプロイガイド

## 前提条件

1. **Google Cloud SDK のインストール**
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # または公式インストーラー
   # https://cloud.google.com/sdk/docs/install
   ```

2. **Google Cloud プロジェクトの設定**
   ```bash
   # プロジェクトIDを設定（実際のプロジェクトIDに置き換え）
   export PROJECT_ID="vertex-test-469212"
   gcloud config set project $PROJECT_ID
   
   # 認証
   gcloud auth login
   gcloud auth configure-docker
   ```

3. **必要なAPIの有効化**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

## デプロイ手順

### 方法1: npm スクリプトを使用（推奨）

```bash
# 初回デプロイ
npm run deploy

# ローカルでビルド済みの場合
npm run deploy:local
```

### 方法2: gcloud コマンドを直接実行

```bash
# ソースコードからビルド・デプロイ
gcloud builds submit --config cloudbuild.yaml

# ローカルでビルド済みの場合
gcloud builds submit --config cloudbuild.yaml --no-source
```

## 設定のカスタマイズ

### cloudbuild.yaml の主要設定

- **リージョン**: `asia-northeast1` (東京)
- **メモリ**: `1Gi`
- **CPU**: `1`
- **最小インスタンス**: `0` (コールドスタート対応)
- **最大インスタンス**: `10`
- **タイムアウト**: `300秒`

### 環境変数の設定

Cloud Run コンソールまたは gcloud コマンドで環境変数を設定：

```bash
gcloud run services update pineal-agent \
  --region=asia-northeast1 \
  --set-env-vars="NODE_ENV=production,API_KEY=your-api-key"
```

## トラブルシューティング

### よくある問題

1. **ビルドエラー**
   ```bash
   # ローカルでDockerビルドをテスト
   docker build -t test-image .
   docker run -p 3000:3000 test-image
   ```

2. **権限エラー**
   ```bash
   # 必要な権限を確認
   gcloud projects get-iam-policy $PROJECT_ID
   ```

3. **メモリ不足**
   - cloudbuild.yaml の `--memory` を `2Gi` に増加

### ログの確認

```bash
# Cloud Run のログを確認
gcloud run services logs read pineal-agent --region=asia-northeast1

# Cloud Build のログを確認
gcloud builds list --limit=5
```

## 本番環境での注意点

1. **環境変数の管理**
   - 機密情報は Google Secret Manager を使用
   - API キーは環境変数で管理

2. **ドメイン設定**
   ```bash
   # カスタムドメインのマッピング
   gcloud run domain-mappings create \
     --service=pineal-agent \
     --domain=your-domain.com \
     --region=asia-northeast1
   ```

3. **SSL証明書**
   - Cloud Run は自動でHTTPS対応
   - カスタムドメインも自動でSSL証明書を発行

## コスト最適化

- **最小インスタンス**: `0` に設定（コールドスタート許容）
- **CPU**: リクエスト時のみ課金
- **メモリ**: 使用量に応じて課金

## 監視とアラート

```bash
# メトリクスの確認
gcloud monitoring metrics list --filter="resource.type=cloud_run_revision"
```

## 更新・ロールバック

```bash
# 新しいバージョンのデプロイ
npm run deploy

# 前のバージョンに戻す
gcloud run services update-traffic pineal-agent \
  --to-revisions=pineal-agent-00001-abc=100 \
  --region=asia-northeast1
```
