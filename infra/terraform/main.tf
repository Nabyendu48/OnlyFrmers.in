terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.0"
    }
  }
}

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
    "cloudrun.googleapis.com",
    "sql-component.googleapis.com",
    "sqladmin.googleapis.com",
    "storage-component.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "vpcaccess.googleapis.com",
    "compute.googleapis.com",
    "iam.googleapis.com"
  ])

  service = each.value
  disable_on_destroy = false
}

# VPC Network
resource "google_compute_network" "main" {
  name                    = "onlyfarmers-vpc"
  auto_create_subnetworks = false
  depends_on             = [google_project_service.required_apis]
}

# Subnet for Cloud Run
resource "google_compute_subnetwork" "cloud_run" {
  name          = "onlyfarmers-cloudrun-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.main.id
  
  # Enable private Google access for Cloud Run
  private_ip_google_access = true
}

# Cloud SQL Instance
resource "google_sql_database_instance" "main" {
  name             = "onlyfarmers-db"
  database_version = "POSTGRES_14"
  region           = var.region
  depends_on       = [google_project_service.required_apis]

  settings {
    tier = "db-f1-micro" # Smallest instance for dev, change for prod
    
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.main.id
      require_ssl     = true
    }

    backup_configuration {
      enabled    = true
      start_time = "02:00"
    }
  }

  deletion_protection = false # Set to true in production
}

# Database
resource "google_sql_database" "main" {
  name     = "onlyfarmers"
  instance = google_sql_database_instance.main.name
}

# Database user
resource "google_sql_user" "main" {
  name     = "onlyfarmers_user"
  instance = google_sql_database_instance.main.name
  password = var.db_password
}

# Artifact Registry for Docker images
resource "google_artifact_registry_repository" "backend" {
  location      = var.region
  repository_id = "onlyfarmers-backend"
  description   = "Docker repository for OnlyFarmers backend"
  format        = "DOCKER"
  depends_on    = [google_project_service.required_apis]
}

# Cloud Storage bucket for media
resource "google_storage_bucket" "media" {
  name          = "onlyfarmers-media-${var.project_id}"
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }
}

# Secret Manager for sensitive data
resource "google_secret_manager_secret" "db_password" {
  secret_id = "db-password"
  depends_on = [google_project_service.required_apis]

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = var.db_password
}

# Service account for Cloud Run
resource "google_service_account" "cloud_run" {
  account_id   = "onlyfarmers-cloudrun-sa"
  display_name = "OnlyFarmers Cloud Run Service Account"
}

# IAM roles for service account
resource "google_project_iam_member" "cloud_run_sa_roles" {
  for_each = toset([
    "roles/secretmanager.secretAccessor",
    "roles/storage.objectViewer",
    "roles/storage.objectCreator"
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# Cloud Run service
resource "google_cloud_run_service" "backend" {
  name     = "onlyfarmers-backend"
  location = var.region
  depends_on = [google_project_service.required_apis]

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/onlyfarmers-backend:latest"
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "1Gi"
          }
        }

        env {
          name  = "DB_HOST"
          value = google_sql_database_instance.main.private_ip_address
        }

        env {
          name  = "DB_NAME"
          value = google_sql_database.database.name
        }

        env {
          name  = "DB_USERNAME"
          value = google_sql_user.user.name
        }

        env {
          name = "DB_PASSWORD"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.db_password.secret_id
              key  = "latest"
            }
          }
        }

        env {
          name  = "NODE_ENV"
          value = "production"
        }
      }

      service_account_name = google_service_account.cloud_run.email
    }

    metadata {
      annotations = {
        "run.googleapis.com/vpc-access-connector" = google_vpc_access_connector.connector.id
        "run.googleapis.com/vpc-access-egress"   = "private-ranges-only"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# VPC Connector for Cloud Run to access private resources
resource "google_vpc_access_connector" "connector" {
  name          = "onlyfarmers-vpc-connector"
  ip_cidr_range = "10.8.0.0/28"
  network       = google_compute_network.main.name
  region        = var.region
  depends_on    = [google_project_service.required_apis]
}

# Outputs
output "cloud_run_url" {
  value = google_cloud_run_service.backend.status[0].url
}

output "database_connection_name" {
  value = google_sql_database_instance.main.connection_name
}

output "media_bucket" {
  value = google_storage_bucket.media.name
}

output "artifact_registry" {
  value = google_artifact_registry_repository.backend.name
}
