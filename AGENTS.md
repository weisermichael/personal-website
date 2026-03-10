# AGENTS.md

Guidelines for AI coding agents working in this repository.

## Project Overview

Serverless personal resume website with:
- **Frontend**: Static HTML/CSS/JS hosted on S3 + CloudFront
- **Backend**: AWS Lambda + DynamoDB for visitor counter (Terraform-managed)

## Build/Lint/Test Commands

### Terraform (Backend Infrastructure)
All commands run from `backend/` directory:

```bash
cd backend

# Initialize (required after clone)
terraform init

# Validate configuration
terraform validate

# Preview changes
terraform plan

# Apply changes
terraform apply

# Get Lambda Function URL output
terraform output lambda_function_url
```

### Frontend Deployment
```bash
# Sync to S3
aws s3 sync frontend/ s3://YOUR-BUCKET-NAME --acl private --delete

# Invalidate CloudFront cache (if needed)
aws cloudfront create-invalidation --distribution-id DISTRIBUTION_ID --paths "/*"
```

### Testing
- No automated test framework configured
- Manual testing: Deploy frontend and verify visitor counter increments
- Lambda can be tested locally with AWS SAM or via AWS console

### Linting
- No linting tools currently configured
- Recommended: `terraform fmt` for Terraform, `ruff` for Python

## Code Style Guidelines

### Python (Lambda)
```python
# Imports at top, standard library first
import json
import boto3

# Client initialization outside handler for connection reuse
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('table_name')

# Handler signature
def lambda_handler(event, context):
    # Logic here
    return result
```

- Use snake_case for variables and functions
- Handler must be named `lambda_handler`
- Return simple values or JSON-serializable objects
- Initialize AWS clients outside handler for warm start reuse

### JavaScript (Frontend)
```javascript
// Use const/let, avoid var
const element = document.querySelector(".class");

// Async/await for fetch operations
async function fetchData() {
    let response = await fetch(url);
    let data = await response.json();
    return data;
}

// Single quotes for strings preferred
```

- Vanilla JavaScript only (no frameworks)
- Use async/await over .then() chains
- Keep scripts minimal and focused

### HTML/CSS
- Semantic HTML5 elements
- CSS classes use hyphen-case: `.counter-number`
- Inline styles only when necessary
- External stylesheets in `css/`, scripts in `js/`

### Terraform
```hcl
# Section headers with hash separators
####################################################################################################################

# Resource comments above block
resource "aws_s3_bucket" "name" {
  # Indent 2 spaces
}

# Variables with description and type
variable "example" {
  description = "Description here"
  type        = string
  sensitive   = true  # For secrets
}
```

- 2-space indentation
- Group related resources with comment separators
- Always include `description` for variables
- Mark sensitive variables with `sensitive = true`

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Terraform resources | snake_case | `cloud_resume_visitor_count` |
| AWS resources | lowercase, underscores | `viewCounter` (Lambda) |
| CSS classes | hyphen-case | `.counter-number` |
| JavaScript variables | camelCase | `updateCounter` |
| Python functions | snake_case | `lambda_handler` |

## Error Handling

### Python (Lambda)
```python
def lambda_handler(event, context):
    try:
        response = table.get_item(Key={'id': '1'})
        views = response['Item']['views']
    except KeyError:
        # Initialize if missing
        views = 0
    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}
    
    return views
```

### JavaScript
```javascript
async function updateCounter() {
    try {
        let response = await fetch(url);
        if (!response.ok) throw new Error('Network error');
        let data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch failed:', error);
    }
}
```

## File Structure

```
personal-website/
├── frontend/
│   ├── index.html          # Main HTML page
│   ├── css/style.css       # Stylesheet
│   └── js/script.js        # Visitor counter logic
├── backend/
│   ├── main.tf             # Main Terraform resources
│   ├── provider.tf         # Provider configuration
│   ├── terraform.auto.tfvars # Local secrets (gitignored)
│   └── lambda/
│       └── viewCounter.py  # Lambda function code
└── .github/workflows/
    └── CI.yaml             # Deployment pipeline
```

## Important Notes

1. **Lambda URL is NOT hardcoded** - injected during CI/CD via `sed`
2. **Terraform state contains secrets** - never commit `.tfstate` files
3. **Variables in `terraform.auto.tfvars`** - gitignored, contains API keys
4. **S3 bucket uses OAC** - CloudFront-only access, no public bucket policy
5. **Lambda runtime**: Python 3.14
6. **AWS Region**: us-west-2 (ACM cert in us-east-1 for CloudFront)

## Before Committing

1. Run `terraform fmt` in backend/ directory
2. Run `terraform validate` to check configuration
3. Never commit `.tfvars`, `.tfstate`, or `.zip` files
4. Do NOT include Claude as Co-Author in git commits
5. Verify Lambda URL placeholder remains in script.js (not hardcoded)
