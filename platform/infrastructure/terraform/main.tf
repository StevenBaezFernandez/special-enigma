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

variable "primary_az" {
    type = list(string)
    default = ["us-east-1a", "us-east-1b"]
}

variable "secondary_az" {
    type = list(string)
    default = ["sa-east-1a", "sa-east-1b"]
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
  source             = "./modules/rds"
  environment        = var.environment
  region             = var.primary_region
  vpc_id             = module.vpc_primary.vpc_id
  subnet_ids         = module.vpc_primary.private_subnets
  availability_zones = var.primary_az
  db_password        = var.db_password
}

module "rds_secondary" {
  providers = { aws = aws.secondary }
  source             = "./modules/rds"
  environment        = var.environment
  region             = var.secondary_region
  vpc_id             = module.vpc_secondary.vpc_id
  subnet_ids         = module.vpc_secondary.private_subnets
  availability_zones = var.secondary_az
  db_password        = var.db_password
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

# Global Traffic Plane (Level 5)
resource "aws_globalaccelerator_accelerator" "virteex" {
  name            = "virteex-global-traffic-plane"
  ip_address_type = "IPV4"
  enabled         = true
}

resource "aws_globalaccelerator_listener" "http" {
  accelerator_arn = aws_globalaccelerator_accelerator.virteex.id
  client_affinity = "SOURCE_IP"
  protocol        = "TCP"

  port_range {
    from_port = 80
    to_port   = 80
  }

  port_range {
    from_port = 443
    to_port   = 443
  }
}

resource "aws_globalaccelerator_endpoint_group" "primary" {
  listener_arn = aws_globalaccelerator_listener.http.id
  endpoint_group_region = var.primary_region

  endpoint_configuration {
    endpoint_id = module.eks_primary.nlb_arn # Assuming module exposes NLB ARN
    weight      = 100
  }
}

resource "aws_globalaccelerator_endpoint_group" "secondary" {
  listener_arn = aws_globalaccelerator_listener.http.id
  endpoint_group_region = var.secondary_region

  endpoint_configuration {
    endpoint_id = module.eks_secondary.nlb_arn
    weight      = 0 # Active-Passive configuration
  }
}
