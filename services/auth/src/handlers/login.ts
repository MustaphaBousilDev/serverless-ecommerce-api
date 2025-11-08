import { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { successResponse, errorResponse } from '../utils/response';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
        const { email, password } = JSON.parse(event.body || '{}');
        if (!email || !password) {
            return errorResponse(400, 'Email and password are required');
        }
        const command = new InitiateAuthCommand({
            ClientId: CLIENT_ID,
            AuthFlow: 'USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password,
            }
        })
        const response = await cognitoClient.send(command);
        return successResponse(200, {
            message: 'Login successful',
            accessToken: response.AuthenticationResult?.AccessToken,
            idToken: response.AuthenticationResult?.IdToken,
            refreshToken: response.AuthenticationResult?.RefreshToken,
            expiresIn: response.AuthenticationResult?.ExpiresIn,
            tokenType: response.AuthenticationResult?.TokenType,
        })
    } catch(error) {
        console.error('Login error:', error);
        return errorResponse(
            401, 'Login failed. Invalid email or password.', error
        );
    }
}