variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }
variable "db_password" {
  type      = string
  sensitive = true
}

resource "aws_rds_cluster" "aurora" {
  cluster_identifier      = "virteex-aurora-${var.environment}"
  engine                  = "aurora-postgresql"
  engine_version          = "15.3"
  availability_zones      = ["us-east-1a", "us-east-1b"]
  database_name           = "virteex"
  master_username         = "postgres"
  master_password         = var.db_password
  backup_retention_period = 5
  preferred_backup_window = "07:00-09:00"
  skip_final_snapshot     = true

  db_subnet_group_name    = aws_db_subnet_group.default.name
}

resource "aws_rds_cluster_instance" "cluster_instances" {
  count              = 2
  identifier         = "virteex-aurora-${var.environment}-${count.index}"
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = "db.r5.large"
  engine             = aws_rds_cluster.aurora.engine
  engine_version     = aws_rds_cluster.aurora.engine_version
}

resource "aws_db_subnet_group" "default" {
  name       = "virteex-db-subnet-${var.environment}"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "Virteex DB subnet group"
  }
}
