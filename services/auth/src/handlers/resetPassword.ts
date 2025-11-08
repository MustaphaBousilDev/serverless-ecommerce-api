import { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, ConfirmForgotPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { successResponse, errorResponse } from '../utils/response';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const { email, code, newPassword } = JSON.parse(event.body || '{}');
        if (!email || !code || !newPassword) {
           return errorResponse(400, 'Email, code, and new password are required');
        }
        const command = new ConfirmForgotPasswordCommand({
            ClientId: CLIENT_ID,
            Username: email,
            ConfirmationCode: code,
            Password: newPassword,
        });
        await cognitoClient.send(command);
        return successResponse(200, {
           message: 'Password reset successfully. You can now login with your new password.',
        });
    } catch(error) {
        console.error('Reset password error:', error);
        return errorResponse(400, 'Password reset failed', error);
    }
}