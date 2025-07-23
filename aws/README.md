# AWS Resources for Health Platform

This directory contains AWS infrastructure code and deployment scripts for the Health Platform application.

## Contents

### Lambda Functions

- **refresh-materialized-view**: A Lambda function that refreshes the materialized view in the database daily to maintain optimal query performance.
  - Location: `/lambda/refresh-materialized-view/`
  - Purpose: Ensures the `mat_food_search` materialized view is up-to-date for fast food searches

### CloudFormation Templates

- **refresh-materialized-view.yml**: Template for deploying the materialized view refresh infrastructure.
  - Location: `/cloudformation/refresh-materialized-view.yml`
  - Resources created:
    - Lambda function
    - EventBridge scheduled rule
    - IAM role and permissions
    - Lambda layer for PostgreSQL client

### Deployment Instructions

- **refresh-materialized-view-deployment.md**: Step-by-step instructions for deploying the materialized view refresh solution.
  - Location: `/refresh-materialized-view-deployment.md`
  - Includes both CloudFormation and manual deployment options

## Getting Started

1. Review the deployment instructions for the specific resource you want to deploy
2. Choose between CloudFormation (recommended) or manual deployment
3. Follow the step-by-step instructions
4. Verify the deployment by checking AWS resources and logs

## Security Considerations

- Database credentials are stored in Lambda environment variables in this example
- For production, consider using AWS Secrets Manager or Parameter Store
- Review and adjust IAM permissions to follow the principle of least privilege

## Maintenance

- Monitor CloudWatch Logs for Lambda function execution
- Set up CloudWatch Alarms for error notifications
- Adjust schedules as needed based on application usage patterns
