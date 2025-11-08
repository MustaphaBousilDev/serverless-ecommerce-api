import { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, GetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { successResponse, errorResponse } from '../utils/response';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const accessToken = event.headers.Authorization?.replace('Bearer ', '');
        if (!accessToken) {
            return errorResponse(401, 'Access token is required');
        }
        const command = new GetUserCommand({
            AccessToken: accessToken,
        });
        const response = await cognitoClient.send(command);
        const attributes: any = {};
        response.UserAttributes?.forEach((attr) => {
           attributes[attr.Name!] = attr.Value;
        });
        return successResponse(200, {
            username: response.Username,
            email: attributes.email,
            emailVerified: attributes.email_verified === 'true',
            name: attributes.name,
            phoneNumber: attributes.phone_number,
            sub: attributes.sub,
        });
    } catch(error) {
        console.error('Get profile error:', error);
        return errorResponse(401, 'Failed to get user profile', error);
    }
}
