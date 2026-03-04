variable "environment" { type = string }
variable "region" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "availability_zones" { type = list(string) }
variable "sovereignty_mode" { type = string }
variable "data_residency_boundary" { type = string }
variable "compliance_tier" { type = string }
variable "db_password" {
  type      = string
  sensitive = true
}
variable "global_cluster_identifier" { type = string }
variable "is_primary" { type = bool }
variable "source_cluster_arn" {
  type    = string
  default = null
}

provider "aws" {
  region = var.region
}

module "rds" {
  source                    = "../../../modules/rds"
  environment               = "${var.environment}-v1"
  region                    = var.region
  vpc_id                    = var.vpc_id
  subnet_ids                = var.subnet_ids
  availability_zones        = var.availability_zones
  db_password               = var.db_password
  global_cluster_identifier = var.global_cluster_identifier
  is_primary                = var.is_primary
  source_cluster_arn        = var.source_cluster_arn
}

module "elasticache" {
  source      = "../../../modules/elasticache"
  environment = "${var.environment}-${var.region}-v1"
  vpc_id      = var.vpc_id
  subnet_ids  = var.subnet_ids
}

output "cluster_arn" {
  value = module.rds.cluster_arn
}

output "cluster_endpoint" {
  value = module.rds.cluster_endpoint
}
