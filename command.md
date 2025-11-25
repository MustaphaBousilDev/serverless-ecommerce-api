# Get Endpoints of our services from awz

--> 
# Get Auth API URL
aws cloudformation describe-stacks \
  --stack-name auth-service-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`AuthApiUrl`].OutputValue' \
  --output text

--> output is endpoint of this API in this stack


# Get all Auth outputs (detailed)
aws cloudformation describe-stacks \
  --stack-name auth-service-stack \
  --query 'Stacks[0].Outputs' \
  --output table

--> output example

----------------------------------------------------------------------------------------------------------------------------------------------------------
|                                                                     DescribeStacks                                                                     |
+-----------------------------+-----------------------+-------------------+------------------------------------------------------------------------------+
|         Description         |      ExportName       |     OutputKey     |                                 OutputValue                                  |
+-----------------------------+-----------------------+-------------------+------------------------------------------------------------------------------+
|  Cognito User Pool Client ID|  dev-UserPoolClientId |  UserPoolClientId |  6iuka5uru9trm2i2836tebmrt7                                                  |
|  Cognito User Pool Domain   |                       |  UserPoolDomain   |  dev-ecommerce-009160059771                                                  |
|  Cognito User Pool ID       |  dev-UserPoolId       |  UserPoolId       |  us-east-1_KeadCBJoP                                                         |
|  Cognito Hosted UI Login URL|                       |  CognitoLoginUrl  |  https://dev-ecommerce-009160059771.auth.us-east-1.amazoncognito.com/login   |
|  Cognito User Pool ARN      |  dev-UserPoolArn      |  UserPoolArn      |  arn:aws:cognito-idp:us-east-1:009160059771:userpool/us-east-1_KeadCBJoP     |
|  Auth API Gateway URL       |  dev-AuthApiUrl       |  AuthApiUrl       |  https://5x3zsv87j7.execute-api.us-east-1.amazonaws.com/dev                  |
+-----------------------------+-----------------------+-------------------+------------------------------------------------------------------------------+


