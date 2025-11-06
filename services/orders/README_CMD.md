Event-driven microservices architecture using AWS Lambda, DynamoDB, EventBridge, and SQS.

---- node --version
---- npm --version
---- aws --version
---- aws configure



##--------------- Development Commands
npm install
npm run clean 
npm run build 
npm run watch 
npm run lint
npm run format

##--------------- Testing Commands 
for location: Location: services/orders/
npm test
npm test -- --watch
npm test -- --coverage
### **Run Specific Test Types**
npm test tests/unit
npm test tests/integration
npm run test:e2e
npm run test:e2e:watch

### **Run Specific Test Files**
npm test Order.test.ts
# Test with pattern matching
npm test -- --testNamePattern="should create order"
# Run tests for specific use case
npm test CreateOrderUseCase.test.ts
# Run DynamoDB integration tests
npm test DynamoDBOrderRepository.integration
### **Test Coverage**
# Generate coverage report
npm test -- --coverage
# View coverage in browser
open coverage/lcov-report/index.html
# Coverage with specific threshold
npm test -- --coverage --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80}}'
```

## 🚀 Deployment Commands
### **Deploy Event Infrastructure (First Time)*
# Deploy EventBridge + SQS
sam build
sam deploy --guided
   # Parameters:
        # - Stack Name: events-infrastructure-stack
        # - Region: us-east-1
        # - Environment: dev
        # - Confirm changes: N
        # - Allow IAM role creation: Y
        # - Save arguments to config: Y
### **Deploy Orders Service**
# Build
npm run build
# Deploy (first time with --guided)
sam deploy --guided
# Deploy (subsequent times)
sam deploy
# Deploy to specific environment
sam deploy --parameter-overrides Environment=prod


## 📊 AWS Monitoring Commands
### **CloudWatch Logs**

# Watch Create Order Lambda logs (real-time)
aws logs tail /aws/lambda/dev-create-order --follow

# Watch Update Order Status logs
aws logs tail /aws/lambda/dev-update-order-status --follow

# Watch Delete Order logs
aws logs tail /aws/lambda/dev-delete-order --follow

# Watch Get Order logs
aws logs tail /aws/lambda/dev-get-order --follow

# Watch List Orders logs
aws logs tail /aws/lambda/dev-list-orders --follow

# Watch multiple logs at once
aws logs tail /aws/lambda/dev-create-order \
             /aws/lambda/dev-update-order-status \
             --follow


# Filter logs by pattern
aws logs tail /aws/lambda/dev-create-order --follow --filter-pattern "ERROR"

# Filter for event publishing
aws logs tail /aws/lambda/dev-create-order --follow --filter-pattern "Published"

# View logs from specific time
aws logs tail /aws/lambda/dev-create-order --since 1h

# View logs from specific time range
aws logs tail /aws/lambda/dev-create-order --since 2h --until 1h
```

### **List All Log Groups**
```bash
# List all Lambda log groups
aws logs describe-log-groups --query 'logGroups[].logGroupName'

# List order-related log groups
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/dev-" \
  --query 'logGroups[].logGroupName'


## 📨 SQS Queue Commands

### **Check Queue Status**
```bash
# Get Invoice Queue message count
aws sqs get-queue-attributes \
  --queue-url $(aws sqs get-queue-url --queue-name dev-invoice-generator-queue --query 'QueueUrl' --output text) \
  --attribute-names ApproximateNumberOfMessages,ApproximateNumberOfMessagesNotVisible \
  --query 'Attributes'

# Get Email Queue message count
aws sqs get-queue-attributes \
  --queue-url $(aws sqs get-queue-url --queue-name dev-email-notifier-queue --query 'QueueUrl' --output text) \
  --attribute-names ApproximateNumberOfMessages \
  --query 'Attributes.ApproximateNumberOfMessages'

# Check Dead Letter Queue
aws sqs get-queue-attributes \
  --queue-url $(aws sqs get-queue-url --queue-name dev-invoice-generator-dlq --query 'QueueUrl' --output text) \
  --attribute-names ApproximateNumberOfMessages \
  --query 'Attributes.ApproximateNumberOfMessages'
```

### **Read Messages from Queue**
```bash
# Peek at message (doesn't delete)
aws sqs receive-message \
  --queue-url $(aws sqs get-queue-url --queue-name dev-invoice-generator-queue --query 'QueueUrl' --output text) \
  --max-number-of-messages 1

# Receive and pretty print
aws sqs receive-message \
  --queue-url $(aws sqs get-queue-url --queue-name dev-invoice-generator-queue --query 'QueueUrl' --output text) \
  --max-number-of-messages 1 \
  | jq '.Messages[0].Body | fromjson'
```

### **Purge Queue (Delete All Messages)**
```bash
# ⚠️ WARNING: This deletes ALL messages!

# Purge Invoice Queue
aws sqs purge-queue \
  --queue-url $(aws sqs get-queue-url --queue-name dev-invoice-generator-queue --query 'QueueUrl' --output text)

# Purge Email Queue
aws sqs purge-queue \
  --queue-url $(aws sqs get-queue-url --queue-name dev-email-notifier-queue --query 'QueueUrl' --output text)
```

### **Send Test Message**
```bash
# Send test message to queue
aws sqs send-message \
  --queue-url $(aws sqs get-queue-url --queue-name dev-invoice-generator-queue --query 'QueueUrl' --output text) \
  --message-body '{"orderId":"test-123","userId":"user-456"}'
```

---

## 🎯 EventBridge Commands

### **List Event Buses**
```bash
# List all event buses
aws events list-event-buses

# Describe specific event bus
aws events describe-event-bus --name dev-orders-event-bus
```

### **List EventBridge Rules**
```bash
# List all rules
aws events list-rules --event-bus-name dev-orders-event-bus

# Describe specific rule
aws events describe-rule \
  --name dev-order-created-to-invoice \
  --event-bus-name dev-orders-event-bus
```

### **Test Event Publishing**
```bash
# Put test event
aws events put-events --entries '[
  {
    "Source": "orders.service",
    "DetailType": "OrderCreated",
    "Detail": "{\"orderId\":\"test-123\",\"userId\":\"user-456\",\"totalAmount\":99.99}",
    "EventBusName": "dev-orders-event-bus"
  }
]'
```

---

## 🗄️ DynamoDB Commands

### **Scan Orders Table**
```bash
# Get all orders
aws dynamodb scan --table-name dev-orders --max-items 10

# Get specific order by ID
aws dynamodb get-item \
  --table-name dev-orders \
  --key '{"orderId": {"S": "your-order-id"}}'

# Query orders by userId (using GSI)
aws dynamodb query \
  --table-name dev-orders \
  --index-name UserOrdersIndex \
  --key-condition-expression "userId = :userId" \
  --expression-attribute-values '{":userId":{"S":"user-123"}}'
```

### **Table Statistics**
```bash
# Get table description (item count, size, etc.)
aws dynamodb describe-table --table-name dev-orders \
  --query 'Table.[ItemCount,TableSizeBytes,TableStatus]'
```

---

## 🪣 S3 Commands

### **List Invoices Bucket**
```bash
# List all objects in invoices bucket
aws s3 ls s3://dev-orders-invoices-$(aws sts get-caller-identity --query Account --output text)/

# List invoices for specific user
aws s3 ls s3://dev-orders-invoices-$(aws sts get-caller-identity --query Account --output text)/user-123/

# Download invoice
aws s3 cp s3://dev-orders-invoices-YOUR-ACCOUNT-ID/user-123/invoice-abc123.pdf ./
```

---

## 🔍 API Testing Commands

### **Get API Endpoint**
```bash
# Get API URL from CloudFormation
aws cloudformation describe-stacks \
  --stack-name orders-service-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text
```

### **Test API Endpoints**
```bash
# Set API URL
export API_URL=https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/dev

# Create Order
curl -X POST $API_URL/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "items": [{
      "productId": "prod-001",
      "productName": "Test Product",
      "quantity": 1,
      "unitPrice": 99.99
    }],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "zipCode": "10001"
    }
  }'

# Get Order
curl $API_URL/orders/ORDER-ID

# List Orders by User
curl "$API_URL/orders?userId=user-123"

# Update Order Status
curl -X PUT $API_URL/orders/ORDER-ID/status \
  -H "Content-Type: application/json" \
  -d '{"status": "CONFIRMED"}'

# Delete Order
curl -X DELETE $API_URL/orders/ORDER-ID
```

---

## 🛠️ Troubleshooting Commands

### **Check Stack Status**
```bash
# Check orders service stack
aws cloudformation describe-stacks --stack-name orders-service-stack \
  --query 'Stacks[0].StackStatus'

# Check events infrastructure stack
aws cloudformation describe-stacks --stack-name events-infrastructure-stack \
  --query 'Stacks[0].StackStatus'

# List all stacks
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE
```

### **View Stack Events (Deployment Issues)**
```bash
# View recent stack events
aws cloudformation describe-stack-events \
  --stack-name orders-service-stack \
  --max-items 20

# Watch stack events in real-time
aws cloudformation describe-stack-events \
  --stack-name orders-service-stack \
  --query 'StackEvents[0:5].[Timestamp,ResourceStatus,ResourceType,LogicalResourceId]' \
  --output table
```

### **Lambda Function Information**
```bash
# Get function configuration
aws lambda get-function --function-name dev-create-order

# Get function code location
aws lambda get-function --function-name dev-create-order \
  --query 'Code.Location' --output text

# Invoke function directly (for testing)
aws lambda invoke \
  --function-name dev-create-order \
  --payload '{"body": "{\"userId\":\"test\"}"}' \
  response.json
```

### **Check IAM Roles and Permissions**
```bash
# List Lambda execution roles
aws iam list-roles --query 'Roles[?contains(RoleName, `orders-service`)].RoleName'

# Get role policies
aws iam list-attached-role-policies \
  --role-name orders-service-stack-CreateOrderFunctionRole-XXXXX
```

### **CloudWatch Insights Queries**
```bash
# Find errors in last hour
aws logs start-query \
  --log-group-name /aws/lambda/dev-create-order \
  --start-time $(date -u -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc'
```

---

## 📈 Monitoring Script

**Create `monitor-queues.sh`:**
```bash
#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "📊 Monitoring Event-Driven Architecture..."

while true; do
    clear
    echo "⏰ $(date)"
    echo "================================"
    
    # Invoice Queue
    INVOICE_COUNT=$(aws sqs get-queue-attributes \
      --queue-url $(aws sqs get-queue-url --queue-name dev-invoice-generator-queue --query 'QueueUrl' --output text) \
      --attribute-names ApproximateNumberOfMessages \
      --query 'Attributes.ApproximateNumberOfMessages' --output text 2>/dev/null)
    
    echo -e "${GREEN}📦 Invoice Queue: ${INVOICE_COUNT} messages${NC}"
    
    # Email Queue
    EMAIL_COUNT=$(aws sqs get-queue-attributes \
      --queue-url $(aws sqs get-queue-url --queue-name dev-email-notifier-queue --query 'QueueUrl' --output text) \
      --attribute-names ApproximateNumberOfMessages \
      --query 'Attributes.ApproximateNumberOfMessages' --output text 2>/dev/null)
    
    echo -e "${GREEN}📧 Email Queue: ${EMAIL_COUNT} messages${NC}"
    
    # DLQs
    INVOICE_DLQ=$(aws sqs get-queue-attributes \
      --queue-url $(aws sqs get-queue-url --queue-name dev-invoice-generator-dlq --query 'QueueUrl' --output text) \
      --attribute-names ApproximateNumberOfMessages \
      --query 'Attributes.ApproximateNumberOfMessages' --output text 2>/dev/null)
    
    if [ "$INVOICE_DLQ" -gt 0 ]; then
        echo -e "${RED}⚠️  Invoice DLQ: ${INVOICE_DLQ} messages${NC}"
    fi
    
    echo ""
    echo "Press Ctrl+C to exit"
    sleep 5
done
```

**Make executable and run:**
```bash
chmod +x monitor-queues.sh
./monitor-queues.sh
```

---

## 🧹 Cleanup Commands

### **Delete All Resources**
```bash
# Delete Orders Service
aws cloudformation delete-stack --stack-name orders-service-stack

# Delete Events Infrastructure
aws cloudformation delete-stack --stack-name events-infrastructure-stack

# Delete Invoice Generator
aws cloudformation delete-stack --stack-name invoice-generator-stack

# Wait for deletion
aws cloudformation wait stack-delete-complete --stack-name orders-service-stack

# Empty and delete S3 bucket
aws s3 rm s3://dev-orders-invoices-YOUR-ACCOUNT-ID --recursive
aws s3 rb s3://dev-orders-invoices-YOUR-ACCOUNT-ID
```