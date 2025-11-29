import { APIGatewayProxyEvent } from 'aws-lambda';
import { UnauthorizedError } from '../../domain/errors/DomainErrors';

export interface AuthenticatedUser {
  email: string;
  sub: string;
  name?: string;
}

export function getUserFromEvent(event: APIGatewayProxyEvent): AuthenticatedUser | null {
  try {
    const claims = event.requestContext.authorizer?.claims;
    
    if (!claims) {
      console.warn('No claims found in request context');
      return null;
    }

    const email = claims.email || claims['cognito:username'];
    const sub = claims.sub;

    if (!email || !sub) {
      console.warn('Missing required claims (email or sub)');
      return null;
    }

    return {
      email,
      sub,
      name: claims.name,
    };
  } catch (error) {
    console.error('Error extracting user from token:', error);
    return null;
  }
}

export function requireAuth(event: APIGatewayProxyEvent): AuthenticatedUser {
  const user = getUserFromEvent(event);
  
  
  if (!user) {
    throw new UnauthorizedError('Missing authorization token');
  }

  return user;
}