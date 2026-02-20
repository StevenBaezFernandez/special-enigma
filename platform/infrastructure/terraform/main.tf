provider "aws" {
  region = "us-east-1"
}

variable "environment" {
  default = "staging"
}

variable "db_password" {
  type      = string
  sensitive = true
}

module "vpc" {
  source      = "./modules/vpc"
  environment = var.environment
  vpc_cidr    = "10.0.0.0/16"
}

module "eks" {
  source       = "./modules/eks"
  cluster_name = "virteex-eks-${var.environment}"
  vpc_id       = module.vpc.vpc_id
  subnet_ids   = module.vpc.private_subnets
}

module "rds" {
  source      = "./modules/rds"
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnets
  db_password = var.db_password
}

module "elasticache" {
  source      = "./modules/elasticache"
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnets
}

module "msk" {
  source      = "./modules/msk"
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnets
}
