# Example Terraform variables file for Pineal Agent Cloud Run deployment
# Copy this file to terraform.tfvars and update the values

# Required variables
project_id   = "your-gcp-project-id"
github_owner = "your-github-username"
github_repo  = "pineal-agent"

# Optional variables (with defaults)
region           = "asia-northeast1"
service_name     = "pineal-agent"
github_branch    = "main"
memory          = "1Gi"
cpu             = "1"
min_instances   = 0
max_instances   = 10
timeout         = 300

# Environment variables for your application
environment_variables = {
  # Add your environment variables here
  # Example:
  # NODE_ENV = "production"
  # API_KEY = "your-api-key"
  # DATABASE_URL = "your-database-url"
}

# Security settings
enable_public_access = true

# Custom domain (optional)
# custom_domain = "your-domain.com"
# ssl_certificate_name = "your-ssl-certificate"

