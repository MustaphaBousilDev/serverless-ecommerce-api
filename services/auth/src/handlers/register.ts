import { APIGatewayProxyHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { successResponse, errorResponse } from '../utils/response';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;

export const handler: APIGatewayProxyHandler = async (event) => {
    try {
      const {
        email, password, name, phoneNumber
      }  = JSON.parse(event.body || '{}')

      //Validation
      if(!email || !password || !name){
        return errorResponse(400, 'Email, password, and name are required')
      }

      const userAttributes = [
        { Name: 'email', Value: email },
        { Name: 'name' , Value: name }
      ]
      if(phoneNumber){
        userAttributes.push({
            Name: 'phone_number', Value: phoneNumber
        })
      }

      //Register User
      const command = new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: userAttributes
      })

      const response = await cognitoClient.send(command);
      return successResponse(201, {
        message: 'User registered successfully. Please check your email for verification code.',
        userId: response.UserSub,
        userConfirmed: response.UserConfirmed,
      })
    } catch(error) {
        console.error('Registration error', error)
        return errorResponse(400, 'Registration failed', error)
    }
}