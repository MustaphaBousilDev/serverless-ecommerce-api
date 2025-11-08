import { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, GlobalSignOutCommand } from '@aws-sdk/client-cognito-identity-provider';
import { successResponse, errorResponse } from '../utils/response';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });


export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const accessToken = event.headers.Authorization?.replace('Bearer ', '');
        if (!accessToken) {
          return errorResponse(400, 'Access token is required');
        }
        const command = new GlobalSignOutCommand({
          AccessToken: accessToken,
        });
        await cognitoClient.send(command);
        return successResponse(200, {
          message: 'Logout successful. All tokens have been invalidated.',
        });
    } catch (error) {
        console.error('Logout error:', error);
        return errorResponse(400, 'Logout failed', error);
    }
}