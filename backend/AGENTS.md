# AGENTS.md - Backend

Guidelines for AI coding agents working on the backend infrastructure.

## Project Overview

Terraform-managed AWS infrastructure for the resume website. Includes Lambda function for visitor counting, DynamoDB for storage, S3 + CloudFront for frontend hosting, and Cloudflare DNS.

## Build/Lint/Test Commands

```bash
# Run from backend/ directory

# Initialize Terraform (required after clone)
terraform init

# Format configuration
terraform fmt

# Validate configuration
terraform validate

# Preview changes
terraform plan

# Apply changes
terraform apply

# Get Lambda Function URL
terraform output lambda_function_url
```

## Testing

- No automated tests configured
- Test Lambda locally with AWS SAM CLI or via AWS Console
- Manual test: Invoke Lambda URL directly and verify DynamoDB counter increments

## Code Style Guidelines

### Python (Lambda)
```python
# Imports at top, standard library first
import json
import boto3

# Initialize clients outside handler for warm start reuse
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('cloud_resume_visitor_count')

def lambda_handler(event, context):
    try:
        response = table.get_item(Key={'id': '1'})
        views = response['Item']['views']
        views = views + 1
        table.put_item(Item={'id': '1', 'views': views})
        return views
    except KeyError:
        return {"error": "Item not found"}
    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}
```

- snake_case for variables/functions
- Handler named `lambda_handler`
- Return simple values or JSON-serializable objects
- Initialize AWS clients outside handler

### Terraform
```hcl
# Section separators
####################################################################################################################

# Comments above resources
resource "aws_s3_bucket" "cloudresume" {
  # 2-space indentation
}

# Variables with descriptions
variable "example" {
  description = "Description here"
  type        = string
  sensitive   = true  # For secrets
}
```

- 2-space indentation (Python-style uses 4-space in main.tf blocks)
- Group related resources with `###...` separators
- Always include `description` for variables
- Mark sensitive variables with `sensitive = true`

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Terraform resources | snake_case | `cloud_resume_visitor_count` |
| AWS resources | camelCase | `viewCounter` |
| Python functions | snake_case | `lambda_handler` |
| DynamoDB tables | snake_case | `cloud_resume_visitor_count` |

## File Structure

```
backend/
├── main.tf              # Main resources (S3, CloudFront, DynamoDB, Lambda)
├── provider.tf          # Provider configuration
├── terraform.auto.tfvars # Secrets (gitignored)
├── lambda/
│   └── viewCounter.py   # Lambda function code
└── packedlambda.zip     # Build artifact (gitignored)
```

## Important Notes

1. **Never commit `.tfstate`, `.tfvars`, or `.zip` files** - contain secrets
2. **AWS Region**: `us-west-2` (ACM cert in `us-east-1` for CloudFront)
3. **Lambda runtime**: Python 3.14
4. **S3 bucket uses OAC** - CloudFront-only access
5. **Lambda URL is public** (`authorization_type = "NONE"`) with CORS enabled
6. Cloudflare DNS CNAME points to CloudFront distribution
7. DynamoDB uses on-demand billing (`PAY_PER_REQUEST`)
