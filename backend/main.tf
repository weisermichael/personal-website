# S3 Bucket
resource "aws_s3_bucket" "cloudresume" {
#   bucket = "cloudresume"
}

resource "aws_s3_bucket_policy" "site" {
    bucket = aws_s3_bucket.cloudresume.id
    
    policy = jsonencode({
        "Version": "2008-10-17",
        "Id": "PolicyForCloudFrontPrivateContent",
        "Statement": [
            {
                "Sid": "AllowCloudFrontServicePrincipal",
                "Effect": "Allow",
                "Principal": {
                    "Service": "cloudfront.amazonaws.com"
                },
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::terraform-20260121211640470400000001/*",
                "Condition": {
                    "StringEquals": {
                      "AWS:SourceArn": "arn:aws:cloudfront::155635440669:distribution/EQ0V6SRROYR12"
                    }
                }
            }
        ]
      })
}

##################################################################################################################

data "aws_acm_certificate" "cloudresume_cert" {
  domain   = "*.weiser.me"
  statuses = ["ISSUED"]
  region = "us-east-1"
}

##################################################################################################################

# CloudFront Distribution
resource "aws_cloudfront_distribution" "cloudresume_distribution" {
  origin {
    domain_name = aws_s3_bucket.cloudresume.bucket_regional_domain_name
    origin_id   = "S3-cloudresume-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.cloudresume_oac.id

    # s3_origin_config {
    #     origin_access_identity = aws_cloudfront_origin_access_identity.cloudresume_oai.cloudfront_access_identity_path
    # }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CloudResume Distribution"
  default_root_object = "index.html"

  aliases = ["resume.weiser.me"]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-cloudresume-origin"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.cloudresume_cert.arn
    ssl_support_method  = "sni-only"
  }
}

resource "aws_cloudfront_origin_access_control" "cloudresume_oac" {
  name                              = "cloudresume-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

##################################################################################################################

# DynamoDB Table
resource "aws_dynamodb_table" "cloud_resume_visitor_count" {
    name         = "cloud_resume_visitor_count"
    billing_mode = "PAY_PER_REQUEST"
    hash_key     = "id"

    attribute {
        name = "id"
        type = "S"
    }
}

# DynamoDB Table Item
resource "aws_dynamodb_table_item" "initial_visitor_count" {
    table_name = aws_dynamodb_table.cloud_resume_visitor_count.name
    hash_key   = aws_dynamodb_table.cloud_resume_visitor_count.hash_key

    item = jsonencode({
        "id"    = {"S" = "1"},
        "views" = {"N" = "0"}
    })
}

##################################################################################################################
# Lambda Function
resource "aws_lambda_function" "viewCounter" {
    function_name = "viewCounter"
    role          = aws_iam_role.lambda_iam.arn
    source_code_hash = data.archive_file.zip.output_base64sha256
    filename      = data.archive_file.zip.output_path
    runtime       = "python3.14"
    handler       = "viewCounter.lambda_handler"
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_iam" {
    name = "lambda_iam_role"

    assume_role_policy = jsonencode({
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "Service": "lambda.amazonaws.com"
          },
          "Action": "sts:AssumeRole"
        }
      ]
    })
}

# IAM Policy for Lambda to access DynamoDB
resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
    name = "lambda_dynamodb_policy"
    role = aws_iam_role.lambda_iam.id

    policy = jsonencode({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "dynamodb:GetItem",
                    "dynamodb:PutItem",
                    "dynamodb:UpdateItem"
                ],
                "Resource": aws_dynamodb_table.cloud_resume_visitor_count.arn
            },
            {
                "Effect": "Allow",
                "Action": [
                    "logs:CreateLogGroup",
                    "logs:CreateLogStream",
                    "logs:PutLogEvents"
                ],
                "Resource": "arn:aws:logs:*:*:*"
            }
        ]
    })
}

# Lambda Function URL
resource "aws_lambda_function_url" "viewCounter_url" {
    function_name = aws_lambda_function.viewCounter.function_name
    authorization_type = "NONE"
    cors {
        allow_origins = ["*"]
        allow_methods = ["*"]
    }
}

# Zip Archive for Lambda
data "archive_file" "zip" {
    type        = "zip"
    source_file = "${path.module}/lambda/viewCounter.py"
    output_path = "${path.module}/packedlambda.zip"
}

##################################################################################################################

data "cloudflare_zones" "domain" {
    name = var.site_domain
}

resource "cloudflare_dns_record" "cloudresume_cname" {
    zone_id = data.cloudflare_zones.domain.result[0].id
    name = var.subdomain
    type    = "CNAME"
    ttl     = 1
    proxied = false
    content = aws_cloudfront_distribution.cloudresume_distribution.domain_name
}

###################################################################################################################

variable "cloudflare_email" {
  description = "Cloudflare account email"
  type        = string
  sensitive   = true
}

variable "cloudflare_api_key" {
  description = "Cloudflare API key"
  type        = string
  sensitive   = true
}

variable "site_domain" {
  description = "The domain for the site"
  type        = string
}

variable "subdomain" {
  description = "The subdomain for the site"
  type        = string
}

###################################################################################################################
# Outputs

output "lambda_function_url" {
  description = "The URL endpoint for the Lambda function"
  value       = aws_lambda_function_url.viewCounter_url.function_url
}