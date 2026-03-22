variable "environment" { type = string }
variable "region" { type = string }
variable "cluster_name" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "sovereignty_mode" { type = string }
variable "availability_zone_count" { type = number }
variable "node_min_size" { type = number }
variable "node_desired_size" { type = number }
variable "node_max_size" { type = number }

provider "aws" {
  region = var.region
}

module "eks" {
  source       = "../../../../modules/eks"
  cluster_name = var.cluster_name
  vpc_id       = var.vpc_id
  subnet_ids   = var.subnet_ids
}

output "cluster_name" {
  value = var.cluster_name
}

output "nlb_arn" {
  value = module.eks.nlb_arn
}
