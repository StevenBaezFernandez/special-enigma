variable "environment" { type = string }
variable "region" { type = string }
variable "sovereignty_mode" { type = string }
variable "data_residency_boundary" { type = string }
variable "compliance_tier" { type = string }

provider "aws" {
  region = var.region
}

resource "aws_cloudwatch_log_group" "regional" {
  name              = "/virteex/${var.environment}/${var.region}/platform"
  retention_in_days = var.compliance_tier == "lgpd" ? 365 : 90

  tags = {
    Region                = var.region
    SovereigntyMode       = var.sovereignty_mode
    DataResidencyBoundary = var.data_residency_boundary
    ComplianceTier        = var.compliance_tier
    Version               = "v1"
  }
}

resource "aws_cloudwatch_dashboard" "regional" {
  dashboard_name = "virteex-platform-${var.environment}-${var.region}-v1"
  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "text"
        x      = 0
        y      = 0
        width  = 24
        height = 3
        properties = {
          markdown = "# Virteex Regional Observability (${var.region})\\nSovereignty: ${var.sovereignty_mode} / Residency: ${var.data_residency_boundary}"
        }
      }
    ]
  })
}

output "log_group_name" {
  value = aws_cloudwatch_log_group.regional.name
}
