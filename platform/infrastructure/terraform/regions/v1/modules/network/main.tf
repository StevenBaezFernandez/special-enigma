variable "environment" { type = string }
variable "region" { type = string }
variable "vpc_cidr" { type = string }
variable "sovereignty_mode" { type = string }
variable "data_residency_boundary" { type = string }
variable "compliance_tier" { type = string }

provider "aws" {
  region = var.region
}

module "vpc" {
  source      = "../../../../modules/vpc"
  environment = "${var.environment}-${var.region}-v1"
  vpc_cidr    = var.vpc_cidr
}

resource "aws_ec2_tag" "sovereignty_boundary" {
  resource_id = module.vpc.vpc_id
  key         = "DataResidencyBoundary"
  value       = var.data_residency_boundary
}

resource "aws_ec2_tag" "sovereignty_mode" {
  resource_id = module.vpc.vpc_id
  key         = "SovereigntyMode"
  value       = var.sovereignty_mode
}

resource "aws_ec2_tag" "compliance_tier" {
  resource_id = module.vpc.vpc_id
  key         = "ComplianceTier"
  value       = var.compliance_tier
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "private_subnets" {
  value = module.vpc.private_subnets
}
