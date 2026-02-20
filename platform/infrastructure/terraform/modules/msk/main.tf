variable "environment" { type = string }
variable "vpc_id" { type = string }
variable "subnet_ids" { type = list(string) }

resource "aws_msk_cluster" "main" {
  cluster_name           = "virteex-kafka-${var.environment}"
  kafka_version          = "3.4.0"
  number_of_broker_nodes = 2

  broker_node_group_info {
    instance_type = "kafka.t3.small"
    client_subnets = var.subnet_ids
    storage_info {
      ebs_storage_info {
        volume_size = 100
      }
    }
    security_groups = [aws_security_group.msk.id]
  }
}

resource "aws_security_group" "msk" {
  name        = "virteex-msk-sg-${var.environment}"
  description = "Security group for MSK"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 9092
    to_port     = 9092
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
}
