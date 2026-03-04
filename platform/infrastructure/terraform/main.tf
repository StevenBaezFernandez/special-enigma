provider "aws" {
  alias  = "primary"
  region = var.primary_region
}

provider "aws" {
  alias  = "secondary"
  region = var.secondary_region
}

variable "primary_region" {
  default = "us-east-1"
}

variable "secondary_region" {
  default = "sa-east-1"
}

variable "environment" {
  default = "staging"
}

variable "db_password" {
  type      = string
  sensitive = true
}

module "vpc_primary" {
  providers = { aws = aws.primary }
  source      = "./modules/vpc"
  environment = var.environment
  vpc_cidr    = "10.0.0.0/16"
}

module "vpc_secondary" {
  providers = { aws = aws.secondary }
  source      = "./modules/vpc"
  environment = var.environment
  vpc_cidr    = "10.1.0.0/16"
}

module "eks_primary" {
  providers = { aws = aws.primary }
  source       = "./modules/eks"
  cluster_name = "virteex-eks-${var.environment}-primary"
  vpc_id       = module.vpc_primary.vpc_id
  subnet_ids   = module.vpc_primary.private_subnets
}

module "eks_secondary" {
  providers = { aws = aws.secondary }
  source       = "./modules/eks"
  cluster_name = "virteex-eks-${var.environment}-secondary"
  vpc_id       = module.vpc_secondary.vpc_id
  subnet_ids   = module.vpc_secondary.private_subnets
}

module "rds_primary" {
  providers = { aws = aws.primary }
  source      = "./modules/rds"
  environment = var.environment
  vpc_id      = module.vpc_primary.vpc_id
  subnet_ids  = module.vpc_primary.private_subnets
  db_password = var.db_password
}

module "rds_secondary" {
  providers = { aws = aws.secondary }
  source      = "./modules/rds"
  environment = var.environment
  vpc_id      = module.vpc_secondary.vpc_id
  subnet_ids  = module.vpc_secondary.private_subnets
  db_password = var.db_password
}

module "elasticache_primary" {
  providers = { aws = aws.primary }
  source      = "./modules/elasticache"
  environment = var.environment
  vpc_id      = module.vpc_primary.vpc_id
  subnet_ids  = module.vpc_primary.private_subnets
}

module "elasticache_secondary" {
  providers = { aws = aws.secondary }
  source      = "./modules/elasticache"
  environment = var.environment
  vpc_id      = module.vpc_secondary.vpc_id
  subnet_ids  = module.vpc_secondary.private_subnets
}

module "msk_primary" {
  providers = { aws = aws.primary }
  source      = "./modules/msk"
  environment = var.environment
  vpc_id      = module.vpc_primary.vpc_id
  subnet_ids  = module.vpc_primary.private_subnets
}

module "msk_secondary" {
  providers = { aws = aws.secondary }
  source      = "./modules/msk"
  environment = var.environment
  vpc_id      = module.vpc_secondary.vpc_id
  subnet_ids  = module.vpc_secondary.private_subnets
}

# Cross-Region Peering (Level 5)
resource "aws_vpc_peering_connection" "primary_secondary" {
  provider = aws.primary
  peer_vpc_id = module.vpc_secondary.vpc_id
  vpc_id      = module.vpc_primary.vpc_id
  peer_region = var.secondary_region
  auto_accept = false
}

resource "aws_vpc_peering_connection_accepter" "secondary" {
  provider = aws.secondary
  vpc_peering_connection_id = aws_vpc_peering_connection.primary_secondary.id
  auto_accept               = true
}
