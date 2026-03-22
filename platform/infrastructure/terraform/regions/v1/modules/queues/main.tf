variable "environment" { type = string }
variable "region" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "sovereignty_mode" { type = string }
variable "data_residency_boundary" { type = string }

provider "aws" {
  region = var.region
}

module "msk" {
  source      = "../../../../modules/msk"
  environment = "${var.environment}-${var.region}-v1"
  vpc_id      = var.vpc_id
  subnet_ids  = var.subnet_ids
}

output "bootstrap_brokers" {
  value = module.msk.bootstrap_brokers
}
