# Terraform configuration for Pineal Agent Cloud Run deployment
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
}

# Configure the Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "container.googleapis.com"
  ])
  
  service                    = each.value
  disable_dependent_services = false
  disable_on_destroy         = false
}

# Create Artifact Registry repository for container images
resource "google_artifact_registry_repository" "pineal_agent_repo" {
  location      = var.region
  repository_id = "pineal-agent"
  description   = "Container repository for Pineal Agent application"
  format        = "DOCKER"

  depends_on = [google_project_service.required_apis]
}

# Create Cloud Build trigger for automatic deployments
resource "google_cloudbuild_trigger" "pineal_agent_trigger" {
  name        = "pineal-agent-deploy"
  description = "Deploy Pineal Agent to Cloud Run"
  
  github {
    owner = var.github_owner
    name  = var.github_repo
    push {
      branch = var.github_branch
    }
  }

  filename = "cloudbuild.yaml"

  substitutions = {
    _REGION     = var.region
    _SERVICE_NAME = var.service_name
    _MEMORY     = var.memory
    _CPU        = var.cpu
    _MIN_INSTANCES = var.min_instances
    _MAX_INSTANCES = var.max_instances
    _TIMEOUT    = var.timeout
  }

  depends_on = [google_project_service.required_apis]
}

# Create Cloud Run service
resource "google_cloud_run_v2_service" "pineal_agent" {
  name     = var.service_name
  location = var.region

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.pineal_agent_repo.repository_id}/${var.service_name}:latest"
      
      ports {
        container_port = 3000
      }

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "PORT"
        value = "3000"
      }

      env {
        name  = "HOSTNAME"
        value = "0.0.0.0"
      }

      # Add environment variables from variables
      dynamic "env" {
        for_each = var.environment_variables
        content {
          name  = env.key
          value = env.value
        }
      }
    }

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    timeout = "${var.timeout}s"
  }

  depends_on = [google_project_service.required_apis]
}

# Allow unauthenticated access to Cloud Run service
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.pineal_agent.location
  service  = google_cloud_run_v2_service.pineal_agent.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Create Cloud Build service account with necessary permissions
resource "google_service_account" "cloud_build_sa" {
  account_id   = "pineal-agent-build-sa"
  display_name = "Pineal Agent Cloud Build Service Account"
}

# Grant Cloud Build service account necessary permissions
resource "google_project_iam_member" "cloud_build_permissions" {
  for_each = toset([
    "roles/run.admin",
    "roles/artifactregistry.writer",
    "roles/iam.serviceAccountUser"
  ])
  
  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.cloud_build_sa.email}"
}

# Grant Cloud Build service account Cloud Build permissions
resource "google_project_iam_member" "cloud_build_sa_permissions" {
  project = var.project_id
  role    = "roles/cloudbuild.builds.builder"
  member  = "serviceAccount:${google_service_account.cloud_build_sa.email}"
}

