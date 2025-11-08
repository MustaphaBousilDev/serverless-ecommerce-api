import { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { successResponse, errorResponse } from '../utils/response';


const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const { email, code } = JSON.parse(event.body || '{}');
        if (!email || !code) {
           return errorResponse(
            400, 'Email and confirmation code are required'
           );
        }
        const command = new ConfirmSignUpCommand({
            ClientId: CLIENT_ID,
            Username: email,
            ConfirmationCode: code,
        })
        await cognitoClient.send(command)
        return successResponse(200, {
            message: 'Email verified successfully . You can now login',
        })
    } catch(error) {
        console.error('Confirmation error:', error);
        return errorResponse(400, 'Verification failed', error);
    }
}