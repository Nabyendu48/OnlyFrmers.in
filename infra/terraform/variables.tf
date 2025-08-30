variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "Google Cloud region"
  type        = string
  default     = "asia-south1" # Mumbai region
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod."
  }
}

variable "db_tier" {
  description = "Database machine tier"
  type        = string
  default     = "db-f1-micro"
  
  validation {
    condition     = contains(["db-f1-micro", "db-g1-small", "db-n1-standard-1", "db-n1-standard-2"], var.db_tier)
    error_message = "Database tier must be one of the allowed values."
  }
}

variable "cloud_run_memory" {
  description = "Cloud Run memory limit"
  type        = string
  default     = "1Gi"
  
  validation {
    condition     = contains(["512Mi", "1Gi", "2Gi", "4Gi"], var.cloud_run_memory)
    error_message = "Memory must be one of: 512Mi, 1Gi, 2Gi, 4Gi."
  }
}

variable "cloud_run_cpu" {
  description = "Cloud Run CPU limit"
  type        = string
  default     = "1000m"
  
  validation {
    condition     = contains(["250m", "500m", "1000m", "2000m"], var.cloud_run_cpu)
    error_message = "CPU must be one of: 250m, 500m, 1000m, 2000m."
  }
}

variable "max_instances" {
  description = "Maximum Cloud Run instances"
  type        = number
  default     = 10
  
  validation {
    condition     = var.max_instances >= 1 && var.max_instances <= 100
    error_message = "Max instances must be between 1 and 100."
  }
}
