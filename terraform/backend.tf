# Terraform Backend Configuration
# 本番環境では、Terraformの状態をリモートで管理することを推奨します

terraform {
  backend "gcs" {
    # バケット名を実際の値に変更してください
    bucket = "your-terraform-state-bucket"
    prefix = "pineal-agent/terraform.tfstate"
  }
}
