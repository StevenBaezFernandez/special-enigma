terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

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


variable "source_cluster_arn_overrides" {
  description = "Optional source cluster ARNs for secondary regions"
  type        = map(string)
  default     = {}
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
    source_region_key       = optional(string)
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
      source_region_key       = "us-east-1"
    }
  }
}

provider "aws" {
  region = values(var.regions)[0].region
}

resource "aws_rds_global_cluster" "global" {
  global_cluster_identifier = "virteex-global-v1-${var.environment}"
  engine                    = "aurora-postgresql"
  engine_version            = "15.3"
  database_name             = "virteex"
  storage_encrypted         = true
}

module "regional_stack" {
  for_each = var.regions

  source = "./modules/network"

  environment             = var.environment
  region                  = each.value.region
  vpc_cidr                = each.value.vpc_cidr
  sovereignty_mode        = each.value.sovereignty_mode
  data_residency_boundary = each.value.data_residency_boundary
  compliance_tier         = each.value.compliance_tier
}

module "compute" {
  for_each = var.regions

  source = "./modules/compute"

  environment             = var.environment
  region                  = each.value.region
  sovereignty_mode        = each.value.sovereignty_mode
  cluster_name            = "virteex-eks-${var.environment}-${each.key}-v1"
  subnet_ids              = module.regional_stack[each.key].private_subnets
  vpc_id                  = module.regional_stack[each.key].vpc_id
  node_min_size           = 2
  node_desired_size       = 3
  node_max_size           = 6
  availability_zone_count = length(each.value.availability_zones)
}

module "data" {
  for_each = var.regions

  source = "./modules/data"

  environment               = var.environment
  region                    = each.value.region
  availability_zones        = each.value.availability_zones
  sovereignty_mode          = each.value.sovereignty_mode
  data_residency_boundary   = each.value.data_residency_boundary
  compliance_tier           = each.value.compliance_tier
  db_password               = var.db_password
  is_primary                = each.value.is_primary
  source_cluster_arn        = each.value.is_primary ? null : lookup(var.source_cluster_arn_overrides, each.key, null)
  global_cluster_identifier = aws_rds_global_cluster.global.id
  subnet_ids                = module.regional_stack[each.key].private_subnets
  vpc_id                    = module.regional_stack[each.key].vpc_id
}

module "queues" {
  for_each = var.regions

  source = "./modules/queues"

  environment             = var.environment
  region                  = each.value.region
  vpc_id                  = module.regional_stack[each.key].vpc_id
  subnet_ids              = module.regional_stack[each.key].private_subnets
  sovereignty_mode        = each.value.sovereignty_mode
  data_residency_boundary = each.value.data_residency_boundary
}

module "observability" {
  for_each = var.regions

  source = "./modules/observability"

  environment             = var.environment
  region                  = each.value.region
  sovereignty_mode        = each.value.sovereignty_mode
  data_residency_boundary = each.value.data_residency_boundary
  compliance_tier         = each.value.compliance_tier
}

output "regional_topology_v1" {
  value = {
    for key, region in var.regions : key => {
      sovereignty_mode        = region.sovereignty_mode
      data_residency_boundary = region.data_residency_boundary
      cluster_name            = module.compute[key].cluster_name
      db_endpoint             = module.data[key].cluster_endpoint
      queue_bootstrap_brokers = module.queues[key].bootstrap_brokers
      observability_group     = module.observability[key].log_group_name
    }
  }
}
