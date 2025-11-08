import { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, ChangePasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { successResponse, errorResponse } from '../utils/response';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });


export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const accessToken = event.headers.Authorization?.replace('Bearer ', '');
        const { oldPassword, newPassword } = JSON.parse(event.body || '{}');

        if (!accessToken) {
           return errorResponse(401, 'Access token is required');
        }
        if (!oldPassword || !newPassword) {
           return errorResponse(400, 'Old password and new password are required');
        }
        const command = new ChangePasswordCommand({
            AccessToken: accessToken,
            PreviousPassword: oldPassword,
            ProposedPassword: newPassword,
        });
        await cognitoClient.send(command);
        return successResponse(200, {
           message: 'Password changed successfully',
        });
    } catch(error) {
        console.error('Change password error:', error);
        return errorResponse(400, 'Password change failed', error);
    }
}