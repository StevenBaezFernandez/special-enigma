variable "environment" { type = string }
variable "region" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "availability_zones" { type = list(string) }
variable "db_password" {
  type      = string
  sensitive = true
}

resource "aws_rds_global_cluster" "global" {
  global_cluster_identifier = "virteex-global-${var.environment}"
  engine                    = "aurora-postgresql"
  engine_version            = "15.3"
  database_name             = "virteex"
  storage_encrypted         = true
}

resource "aws_rds_cluster" "aurora" {
  cluster_identifier      = "virteex-aurora-${var.environment}-${var.region}"
  engine                  = "aurora-postgresql"
  engine_version          = "15.3"
  global_cluster_identifier = aws_rds_global_cluster.global.id
  availability_zones      = var.availability_zones
  database_name           = "virteex"
  master_username         = "postgres"
  master_password         = var.db_password
  backup_retention_period = 30 # Enterprise requirement for 5/5
  preferred_backup_window = "07:00-09:00"
  skip_final_snapshot     = false
  final_snapshot_identifier = "virteex-aurora-${var.environment}-${var.region}-final-${formatdate("YYYYMMDDHHmmss", timestamp())}"

  db_subnet_group_name    = aws_db_subnet_group.default.name

  # Level 5: Real Multi-region Global Cluster Configuration
  tags = {
    Region      = var.region
    Environment = var.environment
    Service     = "virteex-erp"
    MultiRegion = "true"
    ManagedBy   = "Terraform"
  }
}

resource "aws_rds_cluster_instance" "cluster_instances" {
  count              = 2
  identifier         = "virteex-aurora-${var.environment}-${var.region}-${count.index}"
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = "db.r5.large"
  engine             = aws_rds_cluster.aurora.engine
  engine_version     = aws_rds_cluster.aurora.engine_version
}

resource "aws_db_subnet_group" "default" {
  name       = "virteex-db-subnet-${var.environment}-${var.region}"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "Virteex DB subnet group - ${var.region}"
  }
}
