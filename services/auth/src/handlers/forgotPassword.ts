import { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, ForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { successResponse, errorResponse } from '../utils/response';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;


export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const { email } = JSON.parse(event.body || '{}');
        if (!email) {
           return errorResponse(400, 'Email is required');
        }
        const command = new ForgotPasswordCommand({
           ClientId: CLIENT_ID,
           Username: email,
        });
        await cognitoClient.send(command);
        return successResponse(200, {
           message: 'Password reset code sent to your email. Please check your inbox.',
        });
    } catch(error) {
        console.error('Forgot password error:', error);
        return errorResponse(400, 'Failed to send password reset code', error);
    }
}