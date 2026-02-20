variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "virteex-redis-${var.environment}"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  engine_version       = "7.0"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.default.name
}

resource "aws_elasticache_subnet_group" "default" {
  name       = "virteex-cache-subnet-${var.environment}"
  subnet_ids = var.subnet_ids
}
