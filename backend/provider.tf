terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">4.9.0"
    }
  }
}

provider "aws" {
  region  = "us-west-2"
  profile = "default"
  # access_key = var.aws_access_key
  # secret_key = var.aws_secret_key
}