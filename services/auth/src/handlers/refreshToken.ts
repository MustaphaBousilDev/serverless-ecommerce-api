import { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { successResponse, errorResponse } from '../utils/response';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const { refreshToken } = JSON.parse(event.body || '{}');
        if (!refreshToken) {
            return errorResponse(400, 'Refresh token is required');
        }
        const command = new InitiateAuthCommand({
            ClientId: CLIENT_ID,
            AuthFlow: 'REFRESH_TOKEN_AUTH',
            AuthParameters: {
                REFRESH_TOKEN: refreshToken,
            }
        })
        const response = await cognitoClient.send(command);
        return successResponse(200, {
            message: 'Token refreshed successfully',
            accessToken: response.AuthenticationResult?.AccessToken,
            idToken: response.AuthenticationResult?.IdToken,
            expiresIn: response.AuthenticationResult?.ExpiresIn,
            tokenType: response.AuthenticationResult?.TokenType,
        });
    } catch(error) {
        console.error('Refresh token error:', error);
        return errorResponse(401, 'Token refresh failed', error);
    }
}