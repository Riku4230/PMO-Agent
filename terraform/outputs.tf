# Outputs for Pineal Agent Cloud Run deployment

output "service_url" {
  description = "The URL of the deployed Cloud Run service"
  value       = google_cloud_run_v2_service.pineal_agent.uri
}

output "service_name" {
  description = "The name of the Cloud Run service"
  value       = google_cloud_run_v2_service.pineal_agent.name
}

output "service_location" {
  description = "The location of the Cloud Run service"
  value       = google_cloud_run_v2_service.pineal_agent.location
}

output "artifact_registry_repository" {
  description = "The Artifact Registry repository for container images"
  value       = google_artifact_registry_repository.pineal_agent_repo.name
}

output "artifact_registry_url" {
  description = "The URL of the Artifact Registry repository"
  value       = google_artifact_registry_repository.pineal_agent_repo.location
}

output "cloud_build_trigger_id" {
  description = "The ID of the Cloud Build trigger"
  value       = google_cloudbuild_trigger.pineal_agent_trigger.id
}

output "cloud_build_service_account_email" {
  description = "The email of the Cloud Build service account"
  value       = google_service_account.cloud_build_sa.email
}

output "container_image_url" {
  description = "The full URL of the container image"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.pineal_agent_repo.repository_id}/${var.service_name}:latest"
}

output "deployment_commands" {
  description = "Useful commands for deployment and management"
  value = {
    build_and_push = "gcloud builds submit --config cloudbuild.yaml"
    deploy_service = "gcloud run deploy ${var.service_name} --image ${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.pineal_agent_repo.repository_id}/${var.service_name}:latest --region ${var.region}"
    view_logs = "gcloud run services logs read ${var.service_name} --region ${var.region}"
    get_service_info = "gcloud run services describe ${var.service_name} --region ${var.region}"
  }
}

