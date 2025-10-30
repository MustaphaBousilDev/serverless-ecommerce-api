import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { AWS_CONFIG } from './aws-config';


//create DynamoDB Client
const client = new DynamoDBClient({
    region: AWS_CONFIG.region,
    ...(AWS_CONFIG.endpoint) && { endpoint: AWS_CONFIG.endpoint } // For local testing
})

export const dynamoDBDocumentClient = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        removeUndefinedValues: true, //remove undefined value
        convertClassInstanceToMap: true, // Covert class instances to maps
    },
    unmarshallOptions: {
        wrapNumbers: false, // don't wrap numbers in { N: "123" } format
    }
})

export { client as dynamoDBClient}