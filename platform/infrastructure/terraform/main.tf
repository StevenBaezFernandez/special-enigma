variable "environment" {
  type        = string
  description = "Deployment environment"
  default     = "staging"
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "Primary DB password used when region is primary"
}

variable "regions" {
  description = "Versioned regional topology with sovereignty controls"
  type = map(object({
    region                  = string
    vpc_cidr                = string
    availability_zones      = list(string)
    sovereignty_mode        = string
    data_residency_boundary = string
    compliance_tier         = string
    is_primary              = bool
  }))

  validation {
    condition = alltrue([
      for cfg in values(var.regions) : contains(["strict", "hybrid", "global"], cfg.sovereignty_mode)
    ])
    error_message = "sovereignty_mode must be one of: strict, hybrid, global."
  }

  validation {
    condition = alltrue([
      for cfg in values(var.regions) : length(cfg.availability_zones) >= 2
    ])
    error_message = "Each region must include at least two availability_zones for HA."
  }

  default = {
    us-east-1 = {
      region                  = "us-east-1"
      vpc_cidr                = "10.10.0.0/16"
      availability_zones      = ["us-east-1a", "us-east-1b", "us-east-1c"]
      sovereignty_mode        = "global"
      data_residency_boundary = "us"
      compliance_tier         = "soc2"
      is_primary              = true
    }
    sa-east-1 = {
      region                  = "sa-east-1"
      vpc_cidr                = "10.20.0.0/16"
      availability_zones      = ["sa-east-1a", "sa-east-1b", "sa-east-1c"]
      sovereignty_mode        = "strict"
      data_residency_boundary = "br"
      compliance_tier         = "lgpd"
      is_primary              = false
    }
    mx-central-1 = {
        region                  = "mx-central-1"
        vpc_cidr                = "10.30.0.0/16"
        availability_zones      = ["mx-central-1a", "mx-central-1b"]
        sovereignty_mode        = "strict"
        data_residency_boundary = "mx"
        compliance_tier         = "mx-fiscal"
        is_primary              = false
    }
    eu-central-1 = {
        region                  = "eu-central-1"
        vpc_cidr                = "10.40.0.0/16"
        availability_zones      = ["eu-central-1a", "eu-central-1b"]
        sovereignty_mode        = "strict"
        data_residency_boundary = "eu"
        compliance_tier         = "gdpr"
        is_primary              = false
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_rds_global_cluster" "global" {
  global_cluster_identifier = "virteex-global-${var.environment}"
  engine                    = "aurora-postgresql"
  engine_version            = "15.3"
  database_name             = "virteex"
  storage_encrypted         = true
}

module "vpc" {
  for_each = var.regions
  source      = "./modules/vpc"
  environment = var.environment
  vpc_cidr    = each.value.vpc_cidr
}

module "eks" {
  for_each = var.regions
  source       = "./modules/eks"
  cluster_name = "virteex-eks-${var.environment}-${each.key}"
  vpc_id       = module.vpc[each.key].vpc_id
  subnet_ids   = module.vpc[each.key].private_subnets
}

module "rds" {
  for_each = var.regions
  source             = "./modules/rds"
  environment        = var.environment
  region             = each.value.region
  vpc_id             = module.vpc[each.key].vpc_id
  subnet_ids         = module.vpc[each.key].private_subnets
  availability_zones = each.value.availability_zones
  db_password              = var.db_password
  global_cluster_identifier = aws_rds_global_cluster.global.id
  is_primary               = each.value.is_primary
}

module "elasticache" {
  for_each = var.regions
  source      = "./modules/elasticache"
  environment = var.environment
  vpc_id      = module.vpc[each.key].vpc_id
  subnet_ids  = module.vpc[each.key].private_subnets
}

module "msk" {
  for_each = var.regions
  source      = "./modules/msk"
  environment = var.environment
  vpc_id      = module.vpc[each.key].vpc_id
  subnet_ids  = module.vpc[each.key].private_subnets
}

# Cross-Region Peering & Routing
resource "aws_route53_zone" "virteex" {
  name = "virteex.erp"
}

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

resource "aws_globalaccelerator_endpoint_group" "regional" {
  for_each = var.regions
  listener_arn = aws_globalaccelerator_listener.http.id
  endpoint_group_region = each.value.region

  endpoint_configuration {
    endpoint_id = module.eks[each.key].nlb_arn
    weight      = each.value.is_primary ? 100 : 0
  }
}
