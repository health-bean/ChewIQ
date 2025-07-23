# Materialized View Refresh - AWS Deployment Instructions

This document provides instructions for deploying the AWS Lambda function that will refresh the materialized view daily.

## Option 1: Using AWS CloudFormation

### Prerequisites
- AWS CLI installed and configured with appropriate permissions
- Database credentials for the RDS instance

### Deployment Steps

1. **Create a pg module layer zip file**:
   ```bash
   mkdir -p /tmp/nodejs/node_modules
   cd /tmp/nodejs
   npm init -y
   npm install pg
   cd ..
   zip -r layer.zip nodejs
   ```

2. **Deploy the CloudFormation stack**:
   ```bash
   aws cloudformation create-stack \
     --stack-name refresh-materialized-view \
     --template-body file:///Users/byrne/Coding/health-platform/aws/cloudformation/refresh-materialized-view.yml \
     --parameters \
       ParameterKey=DBHost,ParameterValue=health-platform-dev-db.c5njva4wrrhe.us-east-1.rds.amazonaws.com \
       ParameterKey=DBName,ParameterValue=health_platform_dev \
       ParameterKey=DBUser,ParameterValue=healthadmin \
       ParameterKey=DBPassword,ParameterValue=MH67HxZFAAmVWzc6zldv0ZL6 \
       ParameterKey=ScheduleExpression,ParameterValue="cron(0 4 * * ? *)" \
     --capabilities CAPABILITY_IAM
   ```

3. **Monitor the stack creation**:
   ```bash
   aws cloudformation describe-stacks --stack-name refresh-materialized-view
   ```

## Option 2: Manual Setup via AWS Console

### Step 1: Create Lambda Layer for pg Module

1. Go to AWS Lambda console
2. Navigate to Layers in the left sidebar
3. Click "Create layer"
4. Enter "pg-layer" as the name
5. Create a zip file with the pg module:
   ```bash
   mkdir -p /tmp/nodejs/node_modules
   cd /tmp/nodejs
   npm init -y
   npm install pg
   cd ..
   zip -r layer.zip nodejs
   ```
6. Upload the zip file
7. Select Node.js 18.x as the compatible runtime
8. Click "Create"

### Step 2: Create Lambda Function

1. Go to AWS Lambda console
2. Click "Create function"
3. Select "Author from scratch"
4. Enter "refresh-materialized-view" as the function name
5. Select Node.js 18.x as the runtime
6. Under "Permissions", create a new role with basic Lambda permissions
7. Click "Create function"
8. In the function code editor, paste the code from `/Users/byrne/Coding/health-platform/aws/lambda/refresh-materialized-view/index.js`
9. Add the pg-layer to the function:
   - Go to "Layers" section
   - Click "Add a layer"
   - Select "Custom layers"
   - Select "pg-layer" and the appropriate version
   - Click "Add"
10. Add environment variables:
    - DB_HOST: health-platform-dev-db.c5njva4wrrhe.us-east-1.rds.amazonaws.com
    - DB_NAME: health_platform_dev
    - DB_USER: healthadmin
    - DB_PASSWORD: MH67HxZFAAmVWzc6zldv0ZL6
11. Under "Configuration", set the timeout to 30 seconds
12. Click "Save"

### Step 3: Create EventBridge Rule

1. Go to Amazon EventBridge console
2. Click "Create rule"
3. Enter "refresh-materialized-view-daily" as the name
4. Select "Schedule" as the rule type
5. Define the schedule pattern:
   - Fixed rate: 1 day
   - Or use cron expression: `0 4 * * ? *` (runs at 4:00 AM UTC daily)
6. Click "Next"
7. Select "AWS service" as the target type
8. Select "Lambda function" as the target
9. Select "refresh-materialized-view" as the function
10. Click "Next"
11. Configure tags if needed
12. Click "Next"
13. Review and click "Create rule"

## Testing the Setup

1. **Test the Lambda function manually**:
   - Go to the Lambda console
   - Select the "refresh-materialized-view" function
   - Click "Test"
   - Create a new test event with an empty JSON object `{}`
   - Click "Test"
   - Check the execution results and logs

2. **Verify in the database**:
   ```sql
   SELECT relname, last_refresh FROM pg_stat_user_tables WHERE relname = 'mat_food_search';
   ```

## Security Considerations

- The database password is stored in the Lambda environment variables. For production, consider using AWS Secrets Manager or Parameter Store.
- Ensure the Lambda function has the minimum required permissions.
- Consider using a VPC for the Lambda function to restrict network access.

## Maintenance

- Monitor the CloudWatch Logs for the Lambda function to ensure it's running successfully.
- Set up CloudWatch Alarms to notify you if the function fails.
- Consider adjusting the schedule based on your application's needs.
